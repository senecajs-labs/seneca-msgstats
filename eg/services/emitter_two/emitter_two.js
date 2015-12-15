'use strict'

var seneca = require('seneca')()
var msgstats = require('../../../msgstats.js')

seneca.use(msgstats, {
  pins: [{role: 'emitter', cmd: 'one'}, {role: 'emitter', cmd: 'two'}]
})

seneca.ready(function () {

  seneca.add({role: 'emitter', cmd: 'one'},
    function (msg, done) {
      console.log('role:emitter, cmd:one')
      done()
    })

  seneca.add({role: 'emitter', cmd: 'two'},
    function (msg, done) {
      console.log('role:emitter, cmd:two')
      done()
    })

  function emit () {
    seneca.act({role: 'emitter', cmd: 'one'})
    seneca.act({role: 'emitter', cmd: 'two'})
    setTimeout(emit, 1000 * Math.random())
  }

  emit()
})
