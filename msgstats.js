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
    },
    ratios:[],
    udp:{
      host:'localhost',
      port:40404
    },
    influx:{
      host:'localhost',
      port:'8086',
      username:'msgstats',
      password:'msgstats',
      database:'seneca_msgstats'
    }
  }, options);


  var txrx      = options.txrx || make_udp_txrx()
  var aggregate = make_ratios( options.aggregate || make_influx_aggregate() )
  var counts    = stats.NamedStats( options.stats.size, options.stats.interval)
  var rstats    = stats.NamedStats( options.stats.size, options.stats.interval)

  
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
          counts.point(1,msg.meta$.sub)
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
          data, 0, data.length, options.udp.port, options.udp.host, 
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
          catch(e){
            console.log(e.stack)
          }
        })

        server.bind(options.udp.port,options.udp.host)
      }
    }

    return udp_txrx
  }


  function make_influx_aggregate( msg ) {
    var client = influx(options.influx)
    
    return function( msg, ratios ) {
      var stats = msg.stats || {}
      var series = {}
      for( var p in stats ) {
        series[p]=[[{c:stats[p].sum}]]
      }
      client.writeSeries(series,function(err){
        if(err) return console.log(err)
      })

      if( Object.keys(ratios) ) {
        client.writeSeries(ratios,function(err){
          if(err) return console.log(err)
        })
      }
    }
  }

  function make_ratios( aggregate ) {
    return function( msg ) {
      
      if( options.ratios ) {

        var ratios = {}, z = {sum:null}
        for( var i = 0; i < options.ratios.length; i++ ) {
          var ratio = options.ratios[i]
          
          var r0 = (msg.stats[ratio[0]]||z).sum
          var r1 = (msg.stats[ratio[1]]||z).sum

          if( null != r0 ) rstats.point(r0,ratio[0])
          if( null != r1 ) rstats.point(r1,ratio[1])
        }

        var rs = rstats.calculate()

        for( var i = 0; i < options.ratios.length; i++ ) {
          var ratio = options.ratios[i]

          var r = (rs[ratio[1]] && rs[ratio[1]].sum && rs[ratio[0]]) ? 
                rs[ratio[0]].sum / rs[ratio[1]].sum : 0


          if( !isNaN(r) ) {
            var rn = ratio[0]+'~'+ratio[1]
            rstats.point(r,rn)
            r = rstats.calculate()[rn].mean
            ratios[rn]=[[{r:r}]]
          }
        }
      }

      aggregate( msg, ratios )
    }
  }
}

