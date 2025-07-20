import { NextRequest, NextResponse } from 'next/server'
import { sign } from 'jsonwebtoken'
import { withErrorHandler } from '@/lib/errors'

// Use environment variables for secure credential storage
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-admin-jwt-secret-key'

async function adminLogin(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate credentials
    if (username !== ADMIN_CREDENTIALS.username || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = sign(
      { 
        username,
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      token,
      admin: {
        username,
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export const POST = withErrorHandler(adminLogin)
