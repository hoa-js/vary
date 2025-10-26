## @hoajs/vary

Vary middleware for Hoa.

## Installation

```bash
$ npm i @hoajs/vary --save
```

## Quick Start

```js
import { Hoa } from 'hoa'
import { vary } from '@hoajs/vary'

const app = new Hoa()
app.extend(vary())

app.use(async (ctx, next) => {
  ctx.res.vary('Accept')
  ctx.res.body = 'Hello, Hoa!'
})

export default app
```

## Documentation

The documentation is available on [hoa-js.com](https://hoa-js.com/middleware/vary.html)

## Test (100% coverage)

```sh
$ npm test
```

## License

MIT
