import { useEffect } from "react";
import { exchangeCodeForToken, getCodeFromCallbackUrl } from "@/lib/github-oauth";

export default function GithubOAuthCallback() {
  useEffect(() => {
    const code = getCodeFromCallbackUrl();
    if (code) {
      exchangeCodeForToken(code).then(() => {
        // Setelah token didapat, redirect ke halaman asal
        const redirectUrl = localStorage.getItem('github_oauth_redirect') || '/admin';
        window.location.replace(redirectUrl);
      });
    } else {
      window.location.replace("/");
    }
  }, []);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <span className="text-lg font-bold text-green-700">Memproses autentikasi GitHub...</span>
    </div>
  );
}
