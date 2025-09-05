// Util untuk menghapus file di GitHub
export async function deleteGithubFile({ repo, path, branch = 'main', token }: { repo: string, path: string, branch?: string, token: string }) {
  // path: relative path to file in repo, e.g. 'Img/poster/filename.png'
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
  // Get SHA of file
  const getRes = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });
  if (!getRes.ok) return false;
  const fileData = await getRes.json();
  const sha = fileData.sha;
  // Delete file
  const delRes = await fetch(apiUrl, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: 'Delete poster image (auto by website)',
      sha,
      branch,
    }),
  });
  return delRes.ok;
}
