"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function UserSync() {
  const { isSignedIn, user, isLoaded } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // Skip sync for admin routes (they use custom auth)
    if (pathname.startsWith('/admin')) {
      return;
    }

    async function syncUser() {
      if (isLoaded && isSignedIn && user) {
        try {
          console.log('Syncing user to database...');
          const response = await fetch('/api/user/sync', {
            method: 'GET',
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('User synced successfully:', data);
          } else {
            console.log('User sync failed:', response.status);
          }
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    }

    syncUser();
  }, [isLoaded, isSignedIn, user, pathname]);

  // This component doesn't render anything
  return null;
}
