'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (!message) {
      router.push('/sign-in');
    }
  }, [searchParams, router]);

  const message = searchParams.get('message') || 'Authentication failed';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Authentication Error
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {message}
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={() => router.push('/sign-in')}
              className="w-full bg-cyan-500 hover:bg-cyan-600"
            >
              Try Again
            </Button>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}



