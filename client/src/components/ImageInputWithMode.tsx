import { useState } from "react";
import GithubImageUploader from "./GithubImageUploader";

interface Props {
  value: string;
  onChange: (url: string) => void;
  repo: string;
  branch?: string;
  path: string;
}

export default function ImageInputWithMode({ value, onChange, repo, branch = "main", path }: Props) {
  const [mode, setMode] = useState<'link'|'github'>('link');

  return (
    <div className="mb-4">
      <div className="flex gap-2 mb-2">
        <button type="button" className={`px-3 py-1 rounded ${mode==='link'?'bg-green-600 text-white':'bg-gray-200'}`} onClick={()=>setMode('link')}>Link</button>
        <button type="button" className={`px-3 py-1 rounded ${mode==='github'?'bg-green-600 text-white':'bg-gray-200'}`} onClick={()=>setMode('github')}>Upload ke GitHub</button>
      </div>
      {mode==='link' ? (
        <input type="text" className="border rounded px-2 py-1 w-full" value={value} onChange={e=>onChange(e.target.value)} placeholder="Paste link gambar di sini" />
      ) : (
        <GithubImageUploader repo={repo} branch={branch} path={path} />
      )}
      {value && (
        <div className="mt-2">
          <img src={value} alt="preview" className="max-h-40 rounded border" />
        </div>
      )}
    </div>
  );
}