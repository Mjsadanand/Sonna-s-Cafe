"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, Shield } from "lucide-react";
import Image from "next/image";

export function UserDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Please sign in to view your dashboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            {user.imageUrl && (
              <Image 
                src={user.imageUrl} 
                alt="Profile" 
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">
                Joined: {user.createdAt?.toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <Badge variant="secondary">
                {(user.publicMetadata?.role as string) || 'Customer'}
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <SignOutButton>
              <Button variant="outline" className="w-full sm:w-auto">
                Sign Out
              </Button>
            </SignOutButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
