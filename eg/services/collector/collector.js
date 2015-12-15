'use strict'

var seneca = require('seneca')()
var msgstats = require('../../../msgstats.js')

seneca.use(msgstats, {
  collect: true
})
