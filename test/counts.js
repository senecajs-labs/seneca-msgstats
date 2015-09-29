
require('seneca')()
  .use('..',{pin:'a:1'})
  .add('a:1')
  .ready(function(){
    var s = this
    setInterval(function(){
      s.act('a:1')
    },300)
  })
