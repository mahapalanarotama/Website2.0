import { useState } from "react";
import { GithubImageUploader } from "./GithubImageUploader";

interface Props {
  value: string;
  onChange: (url: string, githubPath?: string) => void;
  repo: string;
  branch?: string;
  path: string;
}

export default function ImageInputWithMode({ value, onChange, repo, branch = "main", path, addToGallery = false }: Props & { addToGallery?: boolean }) {
  const [mode, setMode] = useState<'link'|'github'>('link');

  // Perbaiki agar onChange selalu dua argumen
  const handleChange = (url: string, githubPath?: string) => {
    onChange(url, githubPath);
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        <button type="button" className={`px-3 py-1 rounded ${mode==='link'?'bg-green-600 text-white':'bg-gray-200'}`} onClick={()=>setMode('link')}>Link</button>
        <button type="button" className={`px-3 py-1 rounded ${mode==='github'?'bg-green-600 text-white':'bg-gray-200'}`} onClick={()=>setMode('github')}>Upload ke GitHub</button>
      </div>
      {mode==='link' ? (
        <input type="text" className="border rounded px-2 py-1 w-full" value={value} onChange={e=>handleChange(e.target.value, undefined)} placeholder="Paste link gambar di sini" />
      ) : (
        <GithubImageUploader repo={repo} branch={branch} path={path} onUpload={handleChange} addToGallery={addToGallery} />
      )}
      {value && (
        <div className="mt-2">
          <img src={value} alt="preview" className="max-h-40 rounded border" />
        </div>
      )}
    </div>
  );
}