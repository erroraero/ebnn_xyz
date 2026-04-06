# EBNN_CORE: Auth V2 Extension Protocol
> **Developer Edition: Protocol Modernization for the Sovereign Archive**

## 1. Overview
The **v2 Protocol** modernization replaces legacy authentication with a secure, high-entropy identity handshake using **Better Auth** and **GitHub OAuth**. This system ensures all metadata traces (guestbook posts) are cryptographically linked to verified identities.

---

## 2. Technical Stack & Dependencies
The following packages form the core of the v2 identity node:

```json
{
  "dependencies": {
    "better-auth": "^1.5.0",
    "drizzle-orm": "^0.45.0",
    "postgres": "^3.4.4",
    "@better-auth/next-js": "^1.0.0",
    "lucide-react": "^0.479.0",
    "framer-motion": "^12.4.10"
  },
  "devDependencies": {
    "drizzle-kit": "^0.30.5"
  }
}
```

---

## 3. Auth Architecture Diagram
```mermaid
sequenceDiagram
    participant User as Aspirant/User
    participant Frontend as Guestbook (Client)
    participant Portal as Identity Portal (v2)
    participant Server as Auth Node (Backend)
    participant Github as GitHub OAuth
    participant DB as Postgres (Supabase)

    User->>Frontend: Access /guestbook (Public View)
    User->>Frontend: Request Trace (Post)
    Frontend->>Portal: Redirect to /v2/oauth/social/Github/login
    User->>Portal: Start Handshake
    Portal->>Github: OAuth Request
    Github-->>Portal: Identity Verification
    Portal->>Server: Protocol Finalization
    Server->>DB: Sync User & Session
    Server-->>Frontend: Redirect Back (Authenticated)
    Frontend->>DB: Post Trace (Success)
```

---

## 4. Developer Core Implementation

### A. The Backend Hub (`src/lib/auth.ts`)
The central engine for identity mapping. Uses the Drizzle adapter to synchronize GitHub accounts with your database tables.

```typescript
export const auth = betterAuth({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: { ...schema }
    }),
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
    },
    session: { expiresIn: 60 * 60 }, // 1-hour secure pulses
});
```

### B. The Client Bridge (`src/lib/auth-client.ts`)
Reactive hooks for your React components.

```typescript
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
export const { useSession, signIn, signOut } = authClient;
```

### C. The Security Proxy (`src/proxy.ts`)
Replaces standard middleware to handle protocol redirection and Supabase session synchronization in one unified event loop.

---

## 5. Deployment Protocols (Vercel + Supabase)

### **Critical Networking: Port 6543**
When deploying to Vercel, direct connections to port `5432` will fail due to high-latency TCP handshakes. You **must** use the Supabase Transaction Pooler:

1.  **URL Template**: `postgresql://postgres.[ProjectID]:[Password]@aws-0-[Region].pooler.supabase.com:6543/postgres?pgbouncer=true`
2.  **Mode**: Transaction (Port 6543)
3.  **Variable**: `DATABASE_URL` in Vercel.

---

## 6. Challenges Faced & Logic Fixes

| Feature | Challenge | Fix Implemented |
| :--- | :--- | :--- |
| **Routing** | 404 on login segments | Purged fragmented folders and enforced `[provider]/[token]` structure. |
| **Static Build** | useSearchParams bailout | Wrapped the login portal components in `<Suspense>`. |
| **Diagnostics** | Blank 500 Responses | Created `/api/auth/health` to provide real-time connection telemetry. |

---

## 7. Diagnostic Health Node
Developers can monitor the protocol status by visiting:
**`https://www.ebnn.xyz/api/auth/health`**

It provides 5-point telemetry:
1.  **`DB_CONNECTION`**: Verifies Postgres TCP handshake.
2.  **`AUTH_TABLES`**: Confirms if the archivist has run `SCHEMA.sql`.
3.  **`GITHUB_CLIENT_ID`**: Validates OAuth configuration.
4.  **`NEXT_PUBLIC_APP_URL`**: Checks protocol base mapping.
5.  **`BETTER_AUTH_SECRET`**: Ensures encryption salt is present.

---

## 8. Logic Explanations

### **Backend Logic**
The system acts as a **Sovereign Gateway**. 
- It intercepts raw GitHub profile data, salts it, and stores it in the `user` table.
- It generates a cryptographically secure session string stored as a cookie, which is then verified in every `guestbook.ts` server action using `auth.api.getSession`.

### **Frontend Logic**
The UI uses **Identity Handshakes**.
- The `/guestbook` is public for archival viewing.
- The **Post** segment is a high-security enclosure. If `!session`, the UI replaces the input form with a **"Start Secure Handshake"** button, pushing the aspirant into the v3 identity portal.

---

## **Protocol Credits**
- **Sovereign Frontend Design & UX**: [@erroraero](https://github.com/erroraero)
- **Protocol Integration & Backend Architecture**: [avrxt](https://github.com/avrxt)
- **Database Frequency & Infrastructure**: [@ebnn](https://github.com/Ebnxyz)
