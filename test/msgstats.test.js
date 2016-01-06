'use strict'

var Lab = require('lab')
var Seneca = require('seneca')
var MsgStats = require('../msgstats.js')
var Code = require('code')
var Dgram = require('dgram');

var lab = exports.lab = Lab.script()

var suite = lab.suite
var test = lab.test
var before = lab.before
var expect = Code.expect

Seneca.use(MsgStats, { collect: false })

var PORT = 40404;
var HOST = 'localhost';

suite('simple collector tests', function () {
  before({}, function (done) {
    Seneca().ready(function (err) {
      if (err) return process.exit(!console.error(err))
      done()
    })
  })

  test('simple emitter/single pin emitter', function (done) {
    var seneca = require('seneca')()

    seneca.use(MsgStats, {
      pins: [{
        role: 'emitter', cmd: 'one'
      }]
    })

    seneca.ready(function () {

      seneca.add({role: 'emitter', cmd: 'one'},
        function (msg, done) {
          console.log('role:emitter, cmd:one')
          done()
        })

      // create socket to listen on emitted messages
      var server = Dgram.createSocket('udp4');

      server.on('message', function (message, remote) {
        expect(message).to.exist()
        expect(message).to.be.an.buffer();
      });

      server.bind(PORT, HOST);

      function emit () {
        seneca.act({role: 'emitter', cmd: 'one'})
        setTimeout(done, 2000)
      }

      emit()
    })

  })
})
