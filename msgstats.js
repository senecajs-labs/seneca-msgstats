/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


module.exports = function( options ) {
  var seneca = this;
  var plugin = 'msgstats';

  options = seneca.util.deepextend({
  }, options);


  seneca.add({role: plugin, ping: true}, ping);


  function ping(args, done) {
    done(null, {now:Date.now()});
  };


  return {name: plugin};
};
