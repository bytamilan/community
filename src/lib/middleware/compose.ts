import { NextRequest } from 'next/server'

type Middleware = (
  req: NextRequest,
  handler: () => Promise<Response>
) => Promise<Response>

export function composeMiddleware(...middlewares: Middleware[]) {
  return (req: NextRequest, handler: () => Promise<Response>) => {
    return middlewares.reduceRight(
      (next, middleware) => () => middleware(req, next),
      handler
    )()
  }
}