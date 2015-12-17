'use strict'


var dgram = require('dgram')

var stats  = require('rolling-stats')
var influx = require('influx')

module.exports = function msgstats( options ) {
  var seneca = this
  var plugin = 'msgstats'

  options = seneca.util.deepextend({
    tag: seneca.options().tag,
    pid: process.pid,
    pin: '',
    interval:1000,
    stats:{
      size:1111,
      interval:1000
    },
    capture: {
      mem: true,
      msg: true
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
  }, options)


  var txrx      = options.txrx || make_udp_txrx()
  var aggregate = make_ratios( options.aggregate || make_influx_aggregate() )
  var counts    = stats.NamedStats( options.stats.size, options.stats.interval)
  var rstats    = stats.NamedStats( options.stats.size, options.stats.interval)


  seneca.add({init:plugin}, function(msg, done) {
    var seneca = this

    if( options.collect ) {
      txrx.receive( aggregate )
    }
    else {
      var pin  = options.pin || options.pins || null
      var pins = Array.isArray(pin) ? pin : [pin]

      pins.forEach(function(pin){
        seneca.sub(pin,function(msg){
          counts.point(1, msg.meta$.sub)
        })
      })

      start_transmit()
    }

    done()
  })


  function start_transmit() {
    setInterval(function(){
      var msg_stats = counts.calculate()
      var mem_stats = process.memoryUsage()

      txrx.transmit({
        pid: options.pid,
        tag: options.tag,
        when: Date.now(),
        msg_stats: msg_stats,
        mem_stats: mem_stats
      })
    },options.interval)
  }


  function make_udp_txrx() {
    var client = dgram.createSocket('udp4')

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


  function make_influx_aggregate (msg) {
    var client = influx(options.influx)

    return function (msg, ratios) {
      var series = {}

      if (options.capture.mem) {
        var stats = msg.mem_stats || {}
        series.mem_stats = []

        series.mem_stats.push([
          {available: stats.heapTotal, used: stats.heapUsed},
          {pid: msg.pid, tag: msg.tag}
        ])
      }

      if (options.capture.msg) {
        var stats = msg.msg_stats || {}
        series.msg_stats = []

        for(var pin in stats) {
          var count = stats[pin].sum
          pin = pin.replace(',', '_')

          var point = [
            {count: count},
            {pin: pin, pid: msg.pid, tag: msg.tag}
          ]

          series.msg_stats.push(point)
        }
      }

      if (Object.keys(ratios)) {
        for( var rn in ratios ) {
          var nice_rn = rn.replace(/[,~]/g,'_')
          
          var point = [
            {count: ratios[rn].sum},
            {pin: nice_rn, pid: msg.pid, tag: msg.tag}
          ]

          series.msg_stats.push(point)

        }
      }
      

      client.writeSeries(series, function (err) {
        if (err) {
          return seneca.log.error(err)
        }
      })

    }
  }

  function make_ratios( aggregate ) {
    return function( msg ) {

      if( options.ratios ) {

        var ratios = {}, z = {count:null}
        for( var i = 0; i < options.ratios.length; i++ ) {
          var ratio = options.ratios[i]
          
          var r0 = (msg.msg_stats[ratio[0]]||z).count
          var r1 = (msg.msg_stats[ratio[1]]||z).count

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
            //ratios[rn]=[[{r:r}]]
            ratios[rn]={sum:r}
          }
        }
      }

      aggregate( msg, ratios )
    }
  }
}
