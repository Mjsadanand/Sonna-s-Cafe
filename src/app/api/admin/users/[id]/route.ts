import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/lib/services/admin.service'
import { auth } from '@clerk/nextjs/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: targetUserId } = await params
    const userDetails = await AdminService.getUserDetails(targetUserId)

    return NextResponse.json({
      success: true,
      data: userDetails
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    )
  }
}
