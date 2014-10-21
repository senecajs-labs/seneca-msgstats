/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


var seneca = require('seneca')({log:'silent'});
seneca.use('..');

var assert = require('assert');

describe('msgstats', function() {

  it('happy',function(done){
    seneca.act('role:msgstats,ping:true',function(err,out){
      if(err) return done(err);

      assert.ok( out.now )
      done()
    })
  });

})
