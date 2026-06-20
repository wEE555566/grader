"use client";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  // Use a fallback to prevent the app from crashing in dev without an ID
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy-client-id-for-dev-only.apps.googleusercontent.com';

  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    console.warn('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID. Google login will not work, but the app will continue to run.');
  }
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
