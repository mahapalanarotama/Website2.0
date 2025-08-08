export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }
  const { code } = req.body;
  const CLIENT_ID = 'Ov23lisoZfewJvG9HtHK';
  const CLIENT_SECRET = '7f90b5275811168370669968294f6f3199b5489b';

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code
    })
  });
  const data = await response.json();
  res.status(200).json(data);
}
