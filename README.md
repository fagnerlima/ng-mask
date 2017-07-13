# Ng Mask
[![Build Status](https://travis-ci.org/fagnerlima/ng-mask.svg?branch=master)](https://travis-ci.org/fagnerlima/ng-mask)
[![codecov](https://codecov.io/gh/fagnerlima/ng-mask/branch/master/graph/badge.svg)](https://codecov.io/gh/fagnerlima/ng-mask)
[![npm version](https://badge.fury.io/js/@fagnerlima/ng-mask.svg)](http://badge.fury.io/js/@fagnerlima/ng-mask)
[![devDependency Status](https://david-dm.org/fagnerlima/ng-mask/dev-status.svg)](https://david-dm.org/fagnerlima/ng-mask?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/fagnerlima/ng-mask.svg)](https://github.com/fagnerlima/ng-mask/issues)
[![GitHub stars](https://img.shields.io/github/stars/fagnerlima/ng-mask.svg)](https://github.com/fagnerlima/ng-mask/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/fagnerlima/ng-mask/master/LICENSE)

## Demo
https://fagnerlima.github.io/ng-mask/

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#license)

## About

A jQueryMaskPlugin Adapter for Angular.

## Installation

Install through npm:
```
npm install --save @fagnerlima/ng-mask
```

Then include in your apps module:

```typescript
import { Component, NgModule } from '@angular/core';
import { NgMaskModule } from '@fagnerlima/ng-mask';

@NgModule({
  imports: [
    NgMaskModule.forRoot()
  ]
})
export class MyModule {}
```

Finally use in one of your apps components:
```typescript
import { Component } from '@angular/core';

@Component({
  template: '<hello-world></hello-world>'
})
export class MyComponent {}
```

You may also find it useful to view the [demo source](https://github.com/fagnerlima/ng-mask/blob/master/demo/demo.component.ts).

### Usage without a module bundler
```
<script src="node_modules/@fagnerlima/ng-mask/bundles/@fagnerlima/ng-mask.umd.js"></script>
<script>
    // everything is exported ng-mask namespace
</script>
```

## Documentation
All documentation is auto-generated from the source via [compodoc](https://compodoc.github.io/compodoc/) and can be viewed here:
https://fagnerlima.github.io/ng-mask/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and NPM
* Install local dev dependencies: `npm install` while current directory is this repo

### Development server
Run `npm start` to start a development server on port 8000 with auto reload + tests.

### Testing
Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release
* Bump the version in package.json (once the module hits 1.0 this will become automatic)
```bash
npm run release
```

## License

MIT
