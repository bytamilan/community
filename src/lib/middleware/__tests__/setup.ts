import { NextRequest, NextResponse } from 'next/server'

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInstanceOf(expected: any): R
    }
  }
}

// Extend Response global for testing
declare global {
  interface Response {
    json: (data: any) => Promise<any>
  }
}

// Mock implementation
global.Response = {
  ...global.Response,
  json: (data: any) => Promise.resolve(data)
} as any