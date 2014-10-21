
module.exports = function( options ){
  this.add('role:foo,cmd:red',function(args,done){
    done(null,{color:'red'})
  })
}


