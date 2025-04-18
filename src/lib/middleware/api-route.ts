import { NextRequest, NextResponse } from 'next/server'
import { ApiException } from '../types/api'
import { withProtectedApi, withPublicApi, withCustomRateLimit } from '.'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

interface RouteConfig {
  method: string
  auth: 'public' | 'protected'
  schema?: string
  rateLimit?: {
    windowSize: number
    maxRequests: number
  }
  roles?: string[]
}

let apiConfig: any = null

function loadApiConfig() {
  if (apiConfig) return apiConfig
  
  const configPath = path.join(process.cwd(), 'public/locales/en/api.yml')
  const fileContents = fs.readFileSync(configPath, 'utf8')
  apiConfig = yaml.load(fileContents)
  return apiConfig
}

function getRouteConfig(path: string, method: string): RouteConfig | null {
  const config = loadApiConfig()
  const [_, resource, ...rest] = path.split('/')
  const endpoints = config.routes[resource]?.endpoints
  
  if (!endpoints) return null
  
  // Find matching endpoint configuration
  for (const [key, endpoint] of Object.entries(endpoints)) {
    const endpointConfig = endpoint as RouteConfig
    if (endpointConfig.method === method) {
      return endpointConfig
    }
  }
  
  return null
}

export function createApiHandler(handler: (req: NextRequest) => Promise<Response>) {
  return async (req: NextRequest) => {
    const routeConfig = getRouteConfig(req.nextUrl.pathname, req.method)
    
    if (!routeConfig) {
      throw new ApiException('NOT_FOUND', 'Route not found', 404)
    }
    
    // Apply rate limiting if configured
    if (routeConfig.rateLimit) {
      return withCustomRateLimit(routeConfig.rateLimit)(handler)(req)
    }
    
    // Apply auth middleware based on configuration
    if (routeConfig.auth === 'protected') {
      return withProtectedApi(handler)(req)
    } else {
      return withPublicApi(handler)(req)
    }
  }
}

// Helper to validate request against schema
export function validateRequest(req: NextRequest, schema: any) {
  const data = req.method === 'GET' 
    ? Object.fromEntries(new URL(req.url).searchParams)
    : req.json()
    
  const validated = schema.safeParse(data)
  
  if (!validated.success) {
    throw new ApiException(
      'VALIDATION.ERROR',
      'Invalid request data',
      400,
      validated.error.issues
    )
  }
  
  return validated.data
}