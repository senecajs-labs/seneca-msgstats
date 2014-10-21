# seneca-msgstats

### Node.js Seneca Message Statistics

This module is a plugin for the [Seneca
framework](http://senecajs.org). It provides a message throughput statistics.

Current Version: 0.1.0

Tested on: Seneca 0.5.21, Node 0.10.31


### Quick example


```JavaScript
var seneca = require('seneca')();
seneca.use('msgstats');
```

## Install

```sh
npm install seneca
npm install seneca-msgstats
```

## Message Patterns

Foo.

   * `role:msgstats, cmd:foo` foo

Bar.

### Options

```JavaScript
seneca.use('msgstats', {
  foo:'bar'
});
```



## Test

```bash
mocha test/*.test.js
```

