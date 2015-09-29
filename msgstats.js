/* Copyright (c) 2014-2015 Richard Rodger, MIT License */
"use strict";


var dgram = require('dgram')

var stats  = require('rolling-stats')
var influx = require('influx')



module.exports = function msgstats( options ) {
  var seneca = this;
  var plugin = 'msgstats';

  options = seneca.util.deepextend({
    pin: '',
    interval:1000,
    stats:{
      size:1111,
      interval:1000
    }
  }, options);


  var txrx      = options.txrx || make_udp_txrx()
  var aggregate = options.aggregate || make_influx_aggregate()
  var counts    = stats.NamedStats( options.stats.size, options.stats.interval)

  
  seneca.add({init:plugin},function( msg, done ){
    var seneca = this

    if( options.collect ) {
      txrx.receive( aggregate )
    }
    else {
      var pin  = options.pin || options.pins || null
      var pins = Array.isArray(pin) ? pin : [pin]
    
      pins.forEach(function(pin){
        seneca.sub(pin,function(msg){
          counts.point(1,msg.meta$.pattern)
        })
      })

      start_transmit()
    }

    done()
  })

  
  function start_transmit() {
    setInterval(function(){
      var latest = counts.calculate()
      txrx.transmit({
        id:    seneca.id,
        when:  Date.now(),
        stats: latest
      })
    },options.interval)
  }


  function make_udp_txrx() {
    var client = dgram.createSocket('udp4');

    var udp_txrx = {
      transmit: function( msg ){
        var data = new Buffer(JSON.stringify(msg))
        client.send(
          data, 0, data.length, 43333, '127.0.0.1', 
          function(err) {
            if (err) console.log(err)
          })
      },

      receive: function( aggregate ){
        var server = dgram.createSocket('udp4')

        server.on('message', function( msg, remote ) {
          try {
            aggregate( JSON.parse(msg) )
          }
          catch(e){}
        })

        server.bind(43333,'127.0.0.1')
      }
    }

    return udp_txrx
  }


  function make_influx_aggregate( msg ) {
    var client = influx({
      host:'localhost',
      port:8086,
      username:'u0',
      password:'u0',
      database:'t0'
    })
    
    return function( msg ) {
      var stats = msg.stats || {}
      var series = {}
      for( var p in stats ) {
        series[p]=[[{c:stats[p].count}]]
      }
      client.writeSeries(series,function(err){
        if(err) return console.log(err)
      })
    }
  }

}

