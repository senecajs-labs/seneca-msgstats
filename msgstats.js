/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";


module.exports = function( options ) {
  var seneca = this;
  var plugin = 'msgstats';

  options = seneca.util.deepextend({
    pin: ''
  }, options);


  console.log(options)

  seneca.add({role: plugin, ping: true}, ping);

  function ping(args, done) {
    done(null, {now:Date.now()});
  };


  
  seneca.add({init:plugin},function(args,plugin_done){
    seneca.wrap(options.pin,function(args,done){
      var pattern = 'role:'+args.role+',cmd:'+args.cmd
      console.log('pattern:',pattern)

      // send it to influxdb as a "point"

      this.prior(args,done)
    })

    plugin_done()
  })



  return {name: plugin};
};
