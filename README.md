![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] message stats producer and collector

# seneca-msgstats
[![Gitter][gitter-badge]][gitter-url]

A producer and collector of stats for [Seneca.js][]. This module generates metrics on an interval emits
them over UDP. Can optionally be used as a collector micro-service with the ability to save metrics to
Influxdb. Collectors work over UDP and can handle messages from other services.

An example system with the nessecery docker configuration can be found in [/eg](./eg)

- __Version:__ 0.2.0
- __Tested on:__ Seneca 0.7, 0.8, 0.9
- __Node:__ 0.10, 0.12, 4
- __License:__ [MIT][]

## Install

```sh
npm install seneca
npm install seneca-msgstats
```

## Test
To run tests, simply use npm:

```sh
npm run test
```

#### Running Influxdb


### Quick example


```js
var seneca = require('seneca')()

// Set up a collector
seneca.use('msgstats', {
  collect: true,
  capture.msg: true, // true by default
  capture.mem: true, // false by default
})

// Set up a single pin emitter
seneca.use('msgstats', {
  pin: {role: 'foo', cmd: 'bar'}
})

// Using multiple pins with a single emitter
seneca.use('msgstats', {
  pins: [
    {role: 'foo', cmd: 'bar'},
    {role: 'bar', cmd: 'foo'}
]})
```

### Options

```js
{
  tag: seneca.options().tag,     // Tag stored stats
  pid: process.pid,              // Pid stored with stats
  pin: '',                       // The pin to listen for
  interval: 1000,                // Emit interval (1/sec)
  stats: {                       // Options for rolling-stats
    size: 1111,
    interval: 1000
  },
  capture: {                     // Turn on and off capture
    mem: true,                   // Capture mem stats
    msg: true                    // Capture msg stats
  },
  ratios: [],                    // Calculate ratios (unfinished)
  udp: {
    host:'localhost',            // UDP host to send / receive on
    port:40404                   // UDP port to send / receive on
  },
  influx:{
    host:'localhost',            // Host Influx listens on
    port:'8086',                 // Port Influx listens on
    username:'msgstats',         // Username for DB
    password:'msgstats',         // Password for DB
    database:'seneca_msgstats'   // Name of DB
  }
}
```


## Contributing
The [Senecajs org][] encourage open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.

## License
Copyright Richard Rodger and other contributors 2014 - 2016, Licensed under [MIT][].

[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[Seneca.js]: https://www.npmjs.com/package/seneca
[senecajs.org]: http://senecajs.org/
[github issue]: https://github.com/senecajs-labs/seneca-msgstats/issues
[@senecajs]: http://twitter.com/senecajs
