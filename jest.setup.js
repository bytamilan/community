import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

// Mock yaml config file reading
jest.mock('fs', () => ({
  readFileSync: jest.fn(() => `
routes:
  posts:
    base: /api/posts
    endpoints:
      list:
        method: GET
        auth: public
      create:
        method: POST
        auth: protected
      getById:
        path: /:id
        method: GET
        auth: public
  `)
}))

// Mock Next.js Request and Response
global.Request = class Request {
  constructor(input, init = {}) {
    this.url = input.toString()
    this.method = init.method || 'GET'
    this.headers = new Headers(init.headers)
    this.body = init.body
  }
}

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || ''
    this.headers = new Headers(init.headers)
  }

  static json(data, init) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {})
      }
    })
  }

  json() {
    return Promise.resolve(JSON.parse(this.body))
  }
}

// Mock Headers API
global.Headers = class Headers {
  constructor(init = {}) {
    this._headers = new Map()
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value)
      })
    }
  }

  get(name) {
    return this._headers.get(name?.toLowerCase())
  }

  set(name, value) {
    this._headers.set(name?.toLowerCase(), value)
  }
}

// Mock URL API if needed
if (!global.URL) {
  global.URL = class URL {
    constructor(url, base) {
      const fullUrl = base ? new URL(url, base) : url
      this.href = fullUrl
      this.pathname = '/' + url.split('/').slice(3).join('/')
      this.searchParams = new URLSearchParams()
    }
  }
}

// Mock URLSearchParams if needed
if (!global.URLSearchParams) {
  global.URLSearchParams = class URLSearchParams {
    constructor(init) {
      this._params = new Map()
      if (typeof init === 'string') {
        init.split('&').forEach(pair => {
          const [key, value] = pair.split('=')
          this._params.set(key, value)
        })
      }
    }

    get(key) {
      return this._params.get(key)
    }

    set(key, value) {
      this._params.set(key, value)
    }

    entries() {
      return this._params.entries()
    }
  }
}

// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
})