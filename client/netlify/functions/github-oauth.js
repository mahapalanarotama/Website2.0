const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { code } = JSON.parse(event.body);
  const CLIENT_ID = 'Ov23lisoZfewJvG9HtHK'; // Ganti dengan client_id OAuth App Anda
  const CLIENT_SECRET = '7f90b5275811168370669968294f6f3199b5489b'; // Ganti dengan client_secret OAuth App Anda

  const res = await fetch('https://github.com/login/oauth/access_token', {
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
  const data = await res.json();
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
