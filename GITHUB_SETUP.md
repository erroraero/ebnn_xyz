# GitHub OAuth Setup Guide for EBNN.XYZ

Follow these steps to connect your GitHub application and enable authentication on your guestbook.

## 1. Create a GitHub OAuth App
1. Go to your [GitHub Developer Settings](https://github.com/settings/developers).
2. Click **New OAuth App**.
3. **Application Name**: `EBNN-GUESTBOOK` (or your choice).
4. **Homepage URL**: `https://www.ebnn.xyz` (For local testing, use `http://localhost:3000`).
5. **Authorization callback URL**: `https://www.ebnn.xyz/api/auth/callback/github`
   - *Note*: Better Auth uses `/api/auth/callback/[provider]` by default.

## 2. Generate Credentials
1. Once created, copy the **Client ID**.
2. Click **Generate a new client secret** and copy the **Client Secret**.

## 3. Configure Environment Variables
Add the following to your `.env` or Vercel dashboard:

```env
# Better Auth Core
BETTER_AUTH_SECRET=your_32_character_random_string
NEXT_PUBLIC_APP_URL=https://www.ebnn.xyz

# GitHub OAuth
GITHUB_CLIENT_ID=your_client_id_from_step_2
GITHUB_CLIENT_SECRET=your_client_secret_from_step_2

# Database (Supabase)
DATABASE_URL=postgres://postgres:[PASSWORD]@[HOST]:5432/postgres
```

## 4. Register Redirect URI in Better Auth
Make sure your `src/lib/auth.ts` is configured as follows (already implemented):
```typescript
socialProviders: {
    github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
},
```

## 5. Deployment
- **Vercel**: Add the `.env` variables to your project settings.
- **Supabase**: Ensure you have run the `SCHEMA.sql` in the SQL Editor to create the `user`, `session`, and `account` tables.

---
**Security Note**: The session is set to expire in 1 hour as requested. The login token challenge on the portal expires in 3 minutes for additional protocol security.
