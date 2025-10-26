import { Hoa } from 'hoa'
import { vary } from '../src/vary.js'

describe('ctx.res.vary(field)', () => {
  it('should be required', () => {
    const app = new Hoa()
    app.extend(vary())
    const ctx = app.createContext(new Request('https://example.com/'))
    expect(() => ctx.res.vary()).toThrow(/field.*required/i)
  })

  it('should accept string and set header', async () => {
    const app = new Hoa()
    app.extend(vary())
    app.use(async (ctx) => {
      ctx.res.vary('Origin')
      ctx.res.body = 'ok'
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.status).toBe(200)
    expect(res.headers.get('Vary')).toBe('Origin')
  })

  it('should accept array of strings', async () => {
    const app = new Hoa()
    app.extend(vary())
    app.use(async (ctx) => {
      ctx.res.vary(['Origin', 'User-Agent'])
      ctx.res.body = 'ok'
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.headers.get('Vary')).toBe('Origin, User-Agent')
  })

  it('should accept comma-separated string (Vary header format)', async () => {
    const app = new Hoa()
    app.extend(vary())
    app.use(async (ctx) => {
      ctx.res.vary('foo, bar')
      ctx.res.body = 'ok'
    })
    const res = await app.fetch(new Request('https://example.com/'))
    expect(res.headers.get('Vary')).toBe('foo, bar')
  })

  it('should not allow invalid header name with ":"', () => {
    const app = new Hoa()
    app.extend(vary())
    const ctx = app.createContext(new Request('https://example.com/'))
    expect(() => ctx.res.vary('invalid:header')).toThrow(/invalid header name/i)
  })

  it('should not allow invalid header name with space', () => {
    const app = new Hoa()
    app.extend(vary())
    const ctx = app.createContext(new Request('https://example.com/'))
    expect(() => ctx.res.vary('invalid header')).toThrow(/invalid header name/i)
  })

  describe('when no existing Vary', () => {
    it('should set single value', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.vary('Origin')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('Origin')
    })

    it('should set multiple values preserving case', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.vary(['ORIGIN', 'user-agent', 'AccepT'])
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('ORIGIN, user-agent, AccepT')
    })

    it('should not set Vary for empty array', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.vary([])
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBeNull()
    })
  })

  describe('when existing Vary', () => {
    it('should append value', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.set('Vary', 'Accept')
        ctx.res.vary('Origin')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('Accept, Origin')
    })

    it('should append multiple values without duplication', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.set('Vary', 'Accept')
        ctx.res.vary('Origin')
        ctx.res.vary('User-Agent')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('Accept, Origin, User-Agent')
    })

    it('should not duplicate existing value (case-insensitive)', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.set('Vary', 'Accept')
        ctx.res.vary('accEPT')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('Accept')
    })

    it('should preserve case when appending', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.set('Vary', 'AccepT')
        ctx.res.vary(['accEPT', 'ORIGIN'])
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('AccepT, ORIGIN')
    })

    it('should support existing Vary with multiple values', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.set('Vary', 'Accept, Accept-Encoding')
        ctx.res.vary('Origin')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('Accept, Accept-Encoding, Origin')
    })

    it('should handle array input against existing values', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.set('Vary', 'Accept, Accept-Encoding')
        ctx.res.vary(['origin', 'accept', 'accept-charset'])
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('Accept, Accept-Encoding, origin, accept-charset')
    })
  })

  describe('when Vary: *', () => {
    it('should set value to *', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.vary('*')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('*')
    })

    it('should keep * when appending more values', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.set('Vary', '*')
        ctx.res.vary(['Origin', 'User-Agent'])
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('*')
    })

    it('should replace bad existing header to *', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.set('Vary', 'Accept, Accept-Encoding, *')
        ctx.res.vary('Origin')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('*')
    })
  })

  describe('string parsing and whitespace', () => {
    it('should accept LWS around comma-separated values', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.vary('  Accept     ,     Origin    ')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('Accept, Origin')
    })

    it('should handle contained * in list', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.vary('Accept,*')
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('*')
    })

    it('should handle array containing *', async () => {
      const app = new Hoa()
      app.extend(vary())
      app.use(async (ctx) => {
        ctx.res.vary(['Origin', 'User-Agent', '*', 'Accept'])
        ctx.res.body = 'ok'
      })
      const res = await app.fetch(new Request('https://example.com/'))
      expect(res.headers.get('Vary')).toBe('*')
    })
  })
})
