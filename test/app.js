

var seneca = require('seneca')()

seneca.use('..',{pin:{role:'foo',cmd:'*'}})
seneca.use('./foo')

seneca.ready(function(){

  function red(){
    seneca.act('role:foo,cmd:red')
    setTimeout(red,500*Math.random())
  }
  red()

})
