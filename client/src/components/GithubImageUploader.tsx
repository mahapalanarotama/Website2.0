import React, { useState } from "react";
import { getGithubOAuthUrl, getCodeFromCallbackUrl, exchangeCodeForToken } from "@/lib/github-oauth";

interface GithubImageUploaderProps {
  onUpload: (url: string) => void;
  repo: string;
  branch?: string;
  path: string;
}

export default function GithubImageUploader({ onUpload, repo, branch = "main", path }: GithubImageUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const [authStep, setAuthStep] = useState<'idle'|'authing'|'done'>('idle');
  // Simpan halaman asal sebelum login OAuth
  React.useEffect(() => {
    if (!token) {
      localStorage.setItem('github_oauth_redirect', window.location.pathname + window.location.search);
    }
  }, []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleUpload = async () => {
    if (!file || !token) return;
    setUploading(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const filename = `${Date.now()}-${file.name}`;
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}/${filename}`;
        const res = await fetch(apiUrl, {
          method: "PUT",
          headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: `Upload image ${filename}`,
            content: base64,
            branch
          })
        });
        const data = await res.json();
        if (data.content && data.content.download_url) {
          const rawUrl = data.content.download_url.replace("https://github.com/", "https://raw.githubusercontent.com/").replace("/blob/", "/");
          onUpload(rawUrl);
        } else {
          setError("Gagal upload. Pastikan token dan repo benar.");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError("Upload gagal.");
      setUploading(false);
    }
  };

  // OAuth flow
  React.useEffect(() => {
    const code = getCodeFromCallbackUrl();
    if (code && !token) {
      setAuthStep('authing');
      exchangeCodeForToken(code).then(t => {
        setToken(t);
        setAuthStep('done');
        // Redirect ke halaman asal setelah auth
        const redirectUrl = localStorage.getItem('github_oauth_redirect') || '/admin';
        window.location.replace(redirectUrl);
      });
    }
  }, []);

  return (
    <div className="border p-4 rounded mb-2 bg-gray-50">
      <div className="mb-2">
        <label className="block font-semibold mb-1">GitHub OAuth</label>
        {token ? (
          <span className="text-green-600 font-bold">Terautentikasi!</span>
        ) : (
          <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700" onClick={()=>window.location.href=getGithubOAuthUrl()} disabled={authStep==='authing'}>
            Login dengan GitHub
          </button>
        )}
      </div>
      <div className="mb-2">
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>
      <button className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700" onClick={handleUpload} disabled={!file || !token || uploading}>
        {uploading ? "Uploading..." : "Upload ke GitHub"}
      </button>
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
}
