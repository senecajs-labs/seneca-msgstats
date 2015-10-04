
require('seneca')()
  .use('..',{pin:['a:1','b:1']})
  .add('a:1')
  .add('b:1')
  .ready(function(){
    var s = this
    setInterval(function(){
      s.act('a:1')
      s.act('a:1')
    },30)

    setInterval(function(){
      s.act('b:1')
    },30)
  })
