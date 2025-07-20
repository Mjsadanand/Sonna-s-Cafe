import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export default async function DatabaseStatusPage() {
  try {
    // Get all users from the database
    const allUsers = await db.select().from(users);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
            Database Status - Users Table
          </h1>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Users in Database ({allUsers.length})
            </h2>
            
            {allUsers.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">
                No users found in the database. Sign up to create your first user!
              </p>
            ) : (
              <div className="space-y-4">
                {allUsers.map((user) => (
                  <div key={user.id} className="border dark:border-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Database ID:</p>
                        <code className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                          {user.id}
                        </code>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Clerk ID:</p>
                        <code className="text-xs bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                          {user.clerkId}
                        </code>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email:</p>
                        <p className="text-sm">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Name:</p>
                        <p className="text-sm">{user.firstName} {user.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Role:</p>
                        <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                          {user.role}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Created:</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.createdAt.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              How User Sync Works:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• When a user signs up via Clerk, they get a Clerk ID</li>
              <li>• Our app automatically syncs their data to our database</li>
              <li>• This happens when they visit protected pages or API routes</li>
              <li>• The sync function creates a database record with user details</li>
              <li>• Both Clerk and database IDs are stored for reference</li>
            </ul>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Database Error</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unable to connect to the database. Please check your connection.
          </p>
          <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left text-sm">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </div>
    );
  }
}
