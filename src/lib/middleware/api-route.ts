import { NextRequest, NextResponse } from 'next/server'
import { ApiException } from '../types/api'
import { withProtectedApi, withPublicApi, withCustomRateLimit } from '.'
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { z } from 'zod'

type ApiHandler = (req: NextRequest) => Promise<Response>

interface RateLimitConfig {
  windowSize: number
  maxRequests: number
}

interface RouteConfig {
  method: string
  auth: 'public' | 'protected'
  path?: string
  schema?: string
  rateLimit?: RateLimitConfig
  roles?: string[]
}

interface ApiEndpoint {
  [key: string]: RouteConfig
}

interface ApiRoute {
  base: string
  endpoints: ApiEndpoint
}

interface ApiConfig {
  routes: {
    [key: string]: ApiRoute
  }
  errors: {
    [category: string]: {
      [code: string]: string
    }
  }
}

let apiConfig: ApiConfig | null = null

function loadApiConfig(): ApiConfig {
  if (apiConfig) return apiConfig
  
  try {
    const configPath = path.join(process.cwd(), 'public/config/api.yml')
    const fileContents = fs.readFileSync(configPath, 'utf8')
    apiConfig = yaml.load(fileContents) as ApiConfig
    
    if (!apiConfig || !apiConfig.routes) {
      throw new Error('Invalid API configuration format')
    }
    
    return apiConfig
  } catch (error: any) {
    throw new Error(`Failed to load API configuration: ${error?.message || 'Unknown error'}`)
  }
}

function getRouteConfig(pathname: string, method: string): RouteConfig | null {
  const config = loadApiConfig()
  const [_, resource, ...rest] = pathname.split('/')
  const route = config.routes[resource]
  
  if (!route?.endpoints) return null
  
  const endpoint = Object.entries(route.endpoints).find(([_, config]) => {
    if (config.method !== method) return false
    
    if (config.path) {
      const pathParts = config.path.split('/')
      const urlParts = ['', ...rest]
      
      if (pathParts.length !== urlParts.length) return false
      
      return pathParts.every((part, i) => {
        if (part.startsWith(':')) return true
        return part === urlParts[i]
      })
    }
    
    return rest.length === 0
  })
  
  return endpoint ? endpoint[1] : null
}

export function createApiHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest) => {
    try {
      const routeConfig = getRouteConfig(req.nextUrl.pathname, req.method)
      
      if (!routeConfig) {
        throw new ApiException('NOT_FOUND', 'Route not found', 404)
      }
      
      // Apply rate limiting if configured
      if (routeConfig.rateLimit) {
        return withCustomRateLimit(routeConfig.rateLimit.windowSize, routeConfig.rateLimit.maxRequests)(handler)(req)
      }
      
      // Apply auth middleware based on configuration
      if (routeConfig.auth === 'protected') {
        const roles = routeConfig.roles || []
        return withProtectedApi(roles)(handler)(req)
      } else {
        return withPublicApi()(handler)(req)
      }
    } catch (error) {
      if (error instanceof ApiException) {
        throw error
      }
      if (error instanceof Error) {
        throw new ApiException('INTERNAL_ERROR', error.message, 500)
      }
      throw new ApiException('INTERNAL_ERROR', 'An unexpected error occurred', 500)
    }
  }
}

export async function validateRequest<T>(req: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  try {
    const data = req.method === 'GET' 
      ? Object.fromEntries(new URL(req.url).searchParams)
      : await req.json()
      
    const validated = await schema.safeParseAsync(data)
    
    if (!validated.success) {
      throw new ApiException(
        'VALIDATION_ERROR',
        'Invalid request data',
        400,
        validated.error.issues
      )
    }
    
    return validated.data
  } catch (error) {
    if (error instanceof ApiException) throw error
    throw new ApiException('VALIDATION_ERROR', 'Failed to parse request data', 400)
  }
}