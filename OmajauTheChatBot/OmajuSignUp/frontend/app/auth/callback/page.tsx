'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const error = searchParams.get('message');

    if (error) {
      console.error('OAuth error:', error); 
      router.push('/sign-in?error=' + encodeURIComponent(error));
      return;
    }

    if (token) {
      // For OAuth, we typically get both tokens in the response
      const refreshToken = searchParams.get('refreshToken') || token; // fallback to access token
      
      // Login with the tokens
      loginWithToken(token, refreshToken).then(() => {
        // Check if there's a return URL to redirect back to OmajuChat
        const returnUrl = searchParams.get('returnUrl') || 'http://localhost:3000';
        window.location.href = returnUrl;
      }).catch((error) => {
        console.error('OAuth login error:', error);
        router.push('/sign-in?error=' + encodeURIComponent('Failed to complete authentication'));
      });
    } else {
      router.push('/sign-in?error=' + encodeURIComponent('Authentication failed'));
    }
  }, [searchParams, router]);



  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Completing authentication...
        </h2>
        <p className="text-muted-foreground">
          Please wait while we complete your sign-in.
        </p>
      </div>
    </div>
  );
}
