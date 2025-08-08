/**
 * Jika Netlify Functions gagal, Anda bisa migrasi ke Vercel Serverless Function:
 *
 * 1. Buat file api/github-oauth.js di project Vercel Anda:
 *
 * export default async function handler(req, res) {
 *   if (req.method !== 'POST') {
 *     res.status(405).end();
 *     return;
 *   }
 *   const { code } = req.body;
 *   const CLIENT_ID = 'YOUR_GITHUB_CLIENT_ID';
 *   const CLIENT_SECRET = 'YOUR_GITHUB_CLIENT_SECRET';
 *
 *   const response = await fetch('https://github.com/login/oauth/access_token', {
 *     method: 'POST',
 *     headers: {
 *       'Accept': 'application/json',
 *       'Content-Type': 'application/json'
 *     },
 *     body: JSON.stringify({
 *       client_id: CLIENT_ID,
 *       client_secret: CLIENT_SECRET,
 *       code
 *     })
 *   });
 *   const data = await response.json();
 *   res.status(200).json(data);
 * }
 *
 * 2. Deploy ke Vercel, endpoint: https://your-vercel-app.vercel.app/api/github-oauth
 * 3. Di frontend, ganti URL proxy ke endpoint Vercel.
 */
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
