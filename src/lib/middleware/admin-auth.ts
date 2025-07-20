import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-admin-jwt-secret-key'

export interface AdminAuthRequest extends NextRequest {
  admin?: {
    username: string
    role: string
  }
}

export async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader?.startsWith('Bearer ')) {
      return false
    }

    const token = authHeader.substring(7)
    
    // Check if token exists and is not empty
    if (!token || token.trim() === '') {
      return false
    }

    const decoded = verify(token, JWT_SECRET) as { username: string; role: string; iat?: number; exp?: number }
    
    if (decoded.role !== 'admin') {
      return false
    }

    // Attach admin info to request (for future use)
    (request as AdminAuthRequest).admin = {
      username: decoded.username,
      role: decoded.role
    }

    return true
  } catch (error) {
    console.error('Admin token verification failed:', error)
    return false
  }
}

export function requireAdminAuth(handler: (request: NextRequest) => Promise<Response>): (request: NextRequest) => Promise<Response>
export function requireAdminAuth<T>(handler: (request: NextRequest, context: T) => Promise<Response>): (request: NextRequest, context: T) => Promise<Response>
export function requireAdminAuth<T>(handler: (request: NextRequest, context?: T) => Promise<Response>) {
  return async (request: NextRequest, context?: T): Promise<Response> => {
    const isAuthenticated = await verifyAdminToken(request)
    
    if (!isAuthenticated) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, context as T)
  }
}
