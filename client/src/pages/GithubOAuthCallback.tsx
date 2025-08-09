
import { useEffect } from "react";
import { exchangeCodeForToken, getCodeFromCallbackUrl } from "@/lib/github-oauth";

export default function GithubOAuthCallback() {
  useEffect(() => {
    const code = getCodeFromCallbackUrl();
    if (code) {
      exchangeCodeForToken(code).then((token) => {
        if (token) {
          // Redirect to original page
          const redirectUrl = localStorage.getItem('github_oauth_redirect') || '/admin';
          localStorage.removeItem('github_oauth_redirect');
          window.location.replace(redirectUrl);
        } else {
          // Authentication failed, redirect to admin
          window.location.replace('/admin');
        }
      });
    } else {
      // No code, redirect to home
      window.location.replace('/');
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">Processing GitHub authentication...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we complete the login process.</p>
      </div>
    </div>
  );
}
