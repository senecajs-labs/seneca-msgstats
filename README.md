![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] message stats producer and collector

# seneca-msgstats
[![Build Status][travis-badge]][travis-url]
[![Gitter][gitter-badge]][gitter-url]

A producer and collector of message stats for [Seneca.js][].

- __Version:__ 0.1.0
- __Tested on:__ Seneca 0.7
- __Node:__ 0.10, 0.12, 4
- __License:__ [MIT][]

## Install

```sh
npm install seneca
npm install seneca-msgstats
```

#### Running Influxdb
For simplicities sake, we provide a an npm command to spin up an influx container,

```
npm run db
```

You can also access the underlying shell script if you are consuming this module by
running,

```
sh ./node_modules/seneca-msgstats/misc/rundb.sh
```

__Please note:__

 - You must have docker installed and working in your terminal
 - This functionality will not work on windows as it requires sh :(
 - Each time you run this command it will delete your existing db and restart

### Quick example


```js
var seneca = require('seneca')()

// These are the default options
// if you do not pass any.
seneca.use('msgstats', {
  pin: '',
  collect: false,
  interval: 1000,
  stats:{
    size: 1111,
    interval: 1000
  },
  ratios: [],
  udp: {
    host: 'localhost',
    port: 40404
  },
  influx:{
    host: 'localhost',
    port: '8086',
    username: 'msgstats',
    password: 'msgstats',
    database: 'seneca_msgstats'
  }
})
```

## Contributing
The [Senecajs org][] encourage open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.

## License
Copyright Richard Rodger and other contributors 2015, Licensed under [MIT][].

[travis-badge]: https://travis-ci.org/rjrodger/seneca-msgstats.svg
[travis-url]: https://travis-ci.org/rjrodger/seneca-msgstats
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca

[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[Seneca.js]: https://www.npmjs.com/package/seneca
[senecajs.org]: http://senecajs.org/
[github issue]: https://github.com/rjrodger/seneca-msgstats/issues
[@senecajs]: http://twitter.com/senecajs
