import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { UserService } from '@/lib/services/user.service';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string | null;
    last_name?: string | null;
    phone_numbers?: Array<{ phone_number: string }>;
    public_metadata?: { role?: string };
  };
}

// GET method for testing webhook endpoint
export async function GET() {
  return NextResponse.json({
    message: 'Clerk webhook endpoint is active',
    timestamp: new Date().toISOString(),
    webhookSecretConfigured: !!webhookSecret,
    endpoint: '/api/webhooks/clerk',
    methods: ['POST'],
    note: 'This endpoint should be called by Clerk webhooks, not accessed directly'
  });
}

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: ClerkWebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;


  try {
    switch (eventType) {
      case 'user.created':

        // Transform Clerk webhook data to match our service format
        await UserService.syncUserFromClerk({
          id: evt.data.id,
          emailAddresses: evt.data.email_addresses?.map(e => ({ emailAddress: e.email_address })) || [],
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          phoneNumbers: evt.data.phone_numbers?.map(p => ({ phoneNumber: p.phone_number })),
          publicMetadata: evt.data.public_metadata,
        });
        break;

      case 'user.updated':

        // Transform Clerk webhook data to match our service format
        await UserService.syncUserFromClerk({
          id: evt.data.id,
          emailAddresses: evt.data.email_addresses?.map(e => ({ emailAddress: e.email_address })) || [],
          firstName: evt.data.first_name,
          lastName: evt.data.last_name,
          phoneNumbers: evt.data.phone_numbers?.map(p => ({ phoneNumber: p.phone_number })),
          publicMetadata: evt.data.public_metadata,
        });
        break;

      case 'user.deleted':

        if (evt.data.id) {
          await UserService.deleteUserByClerkId(evt.data.id);
        }
        break;

      default:

    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
