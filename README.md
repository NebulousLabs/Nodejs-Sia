# [![Sia Logo](http://sia.tech/resources/img/svg/sia-green-logo.svg)](http://sia.tech/) Nodejs Wrapper

[![Build Status](https://travis-ci.org/NebulousLabs/Nodejs-Sia.svg?branch=master)](https://travis-ci.org/NebulousLabs/Nodejs-Sia)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![devDependency Status](https://david-dm.org/NebulousLabs/Nodejs-Sia/dev-status.svg)](https://david-dm.org/NebulousLabs/Nodejs-Sia#info=devDependencies)
[![dependencies Status](https://david-dm.org/NebulousLabs/Nodejs-Sia.svg)](https://david-dm.org/NebulousLabs/Nodejs-Sia#info=dependencies)
[![license:mit](https://img.shields.io/badge/license-mit-blue.svg)](https://opensource.org/licenses/MIT)

# A Highly Efficient Decentralized Storage Network

This is a [Nodejs](https://nodejs.org/) wrapper for
[Sia](https://github.com/NebulousLabs/Sia). Use it in your apps to easily
interact with the Sia storage network via function calls instead of manual http
requests.

## Prerequisites

- [node & npm (version 5.9.0+ recommended)](https://nodejs.org/download/)

## Installation

```
npm install sia.js
```

## Example Usage

```js
import { launch, connect } from 'sia.js'

// Using promises...
// connect to an already running Sia daemon on localhost:9980 and print its version
connect('localhost:9980')
  .then((siad) => {
    siad.call('/daemon/version').then((version) => console.log(version))
  })
  .catch((err) => {
    console.error(err)
  })

// Or ES7 async/await
async function printVersion() {
  try {
    const siad = await connect('localhost:9980')
    const version = await siad.call('/daemon/version')
    console.log('Siad has version: ' + version)
  } catch (e) {
    console.error(e)
  }
}
```

The call object passed as the first argument into call() are funneled directly
into the [`request`](https://github.com/request/request) library, so checkout
[their options](https://github.com/request/request#requestoptions-callback) to
see how to access the full functionality of [Sia's
API](https://github.com/NebulousLabs/Sia/blob/master/doc/API.md)

```js
Siad.call({
  url: '/consensus/block',
  method: 'GET',
  qs: {
    height: 0
  }
})
```

Should log something like:

```bash
null { block:
 { parentid: '0000000000000000000000000000000000000000000000000000000000000000',
   nonce: [ 0, 0, 0, 0, 0, 0, 0, 0 ],
   timestamp: 1433600000,
   minerpayouts: null,
   transactions: [ [Object] ] } }
```
