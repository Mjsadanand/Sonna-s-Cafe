import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/sync";

export default async function ProtectedPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  // Sync user to database
  const dbUser = await getCurrentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Protected Page
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          This page is only accessible to authenticated users.
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg space-y-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              <strong>Clerk User ID:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{userId}</code>
            </p>
            {dbUser && (
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Database User ID:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{dbUser.id}</code>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{dbUser.email}</code>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Name:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{dbUser.firstName} {dbUser.lastName}</code>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Role:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{dbUser.role}</code>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Created:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{dbUser.createdAt.toLocaleString()}</code>
                </p>
              </div>
            )}
            {!dbUser && (
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ User not found in database
              </p>
            )}
          </div>
          <SignOutButton>
            <Button variant="outline">
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
