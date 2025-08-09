
# GitHub OAuth Setup Guide

## Setup Steps

### 1. Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Your app name
   - **Homepage URL**: `https://mahapalanarotama.web.id`
   - **Authorization callback URL**: `https://mahapalanarotama.web.id/github-oauth-callback`

### 2. OAuth App Credentials
The following credentials are already configured in the code:
- **Client ID**: `Ov23lisoZfewJvG9HtHK`
- **Client Secret**: `7f90b5275811168370669968294f6f3199b5489b`

## How It Works

1. User clicks "Login with GitHub" button
2. User is redirected to GitHub for authentication
3. GitHub redirects back to `/github-oauth-callback` with an authorization code
4. The app exchanges the code for an access token via `/api/github-oauth`
5. Token is stored in a cookie and user is redirected back to admin page

## File Structure

- `/api/github-oauth.js` - Server endpoint for token exchange
- `/client/src/lib/github-oauth.ts` - Client-side OAuth utilities
- `/client/src/components/GithubImageUploader.tsx` - Main uploader component
- `/client/src/pages/GithubOAuthCallback.tsx` - OAuth callback handler

## Testing

1. Go to the admin page
2. Click "Login with GitHub"
3. Authorize the app on GitHub
4. You should be redirected back with "✓ Authenticated" status
5. Upload an image to test the functionality

## Troubleshooting

- Check browser console for detailed error messages
- Ensure OAuth app callback URL matches exactly
- Verify that the GitHub OAuth app is active and accessible
