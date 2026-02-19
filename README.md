# Smart Bookmark App

A modern, full-stack bookmark manager built with Next.js and Supabase that lets users save and organize their favorite links with real-time synchronization.

**Built by:** Adnan Sameer Z

---

## Live Demo

- **Deployed App:** https://smart-bookmark-app-peach-kappa.vercel.app/
- **Demo Video:** https://youtu.be/dUbexBuq8WM
- **GitHub Repository:** https://github.com/AdnanSameer1724/smart-bookmark-app

---

## Features

- **Google OAuth Authentication** - Secure login with Google (no email/password required)
- **Add Bookmarks** - Save URLs with custom titles
- **Private Data** - Each user only sees their own bookmarks (Row Level Security)
- **Real-time Sync** - Changes appear instantly across all open tabs
- **Delete Bookmarks** - Remove unwanted bookmarks with one click
- **Responsive Design** - Clean, modern UI built with Tailwind CSS
- **URL Normalization** - Automatically adds `https://` to URLs
- **Deployed on Vercel** - Fast, reliable hosting with automatic deployments

---

##  Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router for server-side rendering
- **React 19** - UI library with hooks for state management
- **Tailwind CSS** - Utility-first CSS framework for styling

### Backend
- **Supabase** - Backend-as-a-Service providing:
  - **Authentication** - Google OAuth integration
  - **PostgreSQL Database** - Relational database for storing bookmarks
  - **Realtime** - WebSocket subscriptions for live updates
  - **Row Level Security** - Database-level access control

### Deployment
- **Vercel** - Platform for deploying Next.js applications
- **Git/GitHub** - Version control and collaboration

---

## Architecture

```
┌─────────────────┐
│  User Browser   │
└────────┬────────┘
         │
         ├─ React Components (Client-side)
         │  └─ Real-time subscriptions
         │
         v
┌─────────────────────────┐
│  Next.js App Router     │
│  (Server Components)    │
├─────────────────────────┤
│  - Server Actions       │
│  - Route Handlers       │
│  - Middleware (Auth)    │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│      Supabase           │
├─────────────────────────┤
│  - Google OAuth         │
│  - PostgreSQL DB        │
│  - Row Level Security   │
│  - Realtime (WebSockets)│
└─────────────────────────┘
```

---

##  Project Structure

```
smart-bookmark-app/
├── app/
│   ├── layout.js              # Root layout with global styles
│   ├── page.js                # Login page (Google OAuth)
│   ├── globals.css            # Tailwind CSS configuration
│   ├── dashboard/
│   │   └── page.js            # Main app (bookmarks dashboard)
│   └── auth/
│       └── callback/
│           └── route.js       # OAuth callback handler
├── components/
│   ├── BookmarkForm.js        # Form to add new bookmarks
│   ├── BookmarkList.js        # Display and manage bookmarks
│   └── Header.js              # Navigation bar with user info
├── lib/
│   └── supabase/
│       ├── client.js          # Browser-side Supabase client
│       └── server.js          # Server-side Supabase client
├── middleware.js              # Auth protection and redirects
├── .env.local                 # Environment variables (not in repo)
├── package.json               # Dependencies
└── README.md                  # This file
```

---

##  Database Schema

### `bookmarks` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key (auto-generated) |
| `user_id` | uuid | Foreign key to `auth.users` |
| `title` | text | Bookmark title |
| `url` | text | Bookmark URL |
| `created_at` | timestamptz | Timestamp (auto-generated) |

### Row Level Security Policies

```sql
-- Users can only view their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert bookmarks for themselves
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);
```

---

##  Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Google Cloud Platform account (for OAuth)
- A Vercel account (for deployment)

### 1. Clone the Repository

```bash
git clone https://github.com/AdnanSameer1724/smart-bookmark-app.git
cd smart-bookmark-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** and run:

```sql
-- Create the bookmarks table
CREATE TABLE bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;

-- Enable full row broadcasting for DELETE events
ALTER TABLE bookmarks REPLICA IDENTITY FULL;
```

3. Go to **Settings → API** and copy:
   - Project URL
   - `anon/public` key

### 4. Set Up Google OAuth

1. Go to https://console.cloud.google.com
2. Create a new project or select existing
3. Go to **APIs & Services → Credentials**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://YOUR_SUPABASE_PROJECT.supabase.co/auth/v1/callback
   ```
6. Copy **Client ID** and **Client Secret**
7. In Supabase Dashboard → **Authentication → Providers**, enable Google and paste credentials

### 5. Configure Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```
4. Click **Deploy**

### 3. Update OAuth Settings

After deployment, update:

**Google Cloud Console:**
- Add `https://your-app.vercel.app/auth/callback` to authorized redirect URIs

**Supabase Dashboard:**
- Set Site URL to `https://your-app.vercel.app`
- Add `https://your-app.vercel.app/auth/callback` to Redirect URLs

---

##  Problems Encountered and Solutions

### Problem 1: OAuth Redirect URI Mismatch

**Issue:** After clicking "Continue with Google", got a `redirect_uri_mismatch` error.

**Solution:** 
- Added the exact callback URL (`/auth/callback`) to both Google Cloud Console's "Authorized redirect URIs" AND Supabase's "Redirect URLs" list
- Made sure URLs matched exactly with no trailing slashes

### Problem 2: Supabase Cookies in Server Components

**Issue:** Server-side code couldn't read the user session.

**Solution:** 
- Switched from the regular Supabase client to `@supabase/ssr` package
- Used `createServerClient` for server components and `createBrowserClient` for client components
- Properly configured cookie handling in the server client

### Problem 3: Realtime Not Firing for INSERT Events

**Issue:** Adding bookmarks saved to the database but didn't trigger the real-time subscription.

**Solution:** 
- Ran `ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;` in Supabase SQL Editor
- Verified that Row Level Security policies were correctly configured

### Problem 4: Realtime DELETE Events Not Broadcasting

**Issue:** DELETE operations succeeded in the database but the real-time event wasn't received by subscribed clients.

**Solution:** 
- Added `ALTER TABLE bookmarks REPLICA IDENTITY FULL;` to enable full row data broadcasting
- This tells PostgreSQL to include all column values when broadcasting DELETE events
- Without this, Supabase Realtime can't see what was deleted and won't broadcast the event

### Problem 5: Row Level Security Blocking All Reads

**Issue:** After enabling RLS, no bookmarks showed up even for the logged-in user.

**Solution:** 
- Created explicit SELECT, INSERT, and DELETE policies using `auth.uid() = user_id`
- RLS blocks everything by default, so policies must be created to allow user access

### Problem 6: Production OAuth Redirecting to Localhost

**Issue:** After deploying to Vercel, Google OAuth redirected back to `localhost` instead of the production URL.

**Solution:** 
- Updated `NEXT_PUBLIC_SITE_URL` environment variable in Vercel
- Added production callback URL to Google Cloud Console
- Redeployed the application to load new environment variables

### Problem 7: URL Normalization

**Issue:** Users entered URLs without `https://`, which broke the links.

**Solution:** 
- Created a `normalizeUrl()` function that automatically adds `https://` if the protocol is missing
- Applied this function before saving bookmarks to the database

---

## Key Learnings

1. **Row Level Security is powerful** - It enforces data privacy at the database level, which is more secure than client-side checks
2. **Realtime requires proper configuration** - Both `REPLICA IDENTITY FULL` and RLS policies must be set correctly for DELETE events to work
3. **Environment variables are build-time** - In Next.js/Vercel, `NEXT_PUBLIC_*` variables are bundled at build time, so redeployment is needed after changes
4. **OAuth callback URLs must match exactly** - Even small differences (trailing slashes, http vs https) will cause authentication to fail
5. **Server Components vs Client Components** - Understanding when to use each is crucial for proper data fetching and authentication in Next.js App Router

---

## Features Breakdown

### Authentication Flow
1. User clicks "Continue with Google"
2. Server action redirects to Google OAuth
3. User authenticates with Google
4. Google redirects to `/auth/callback` with authorization code
5. Callback route exchanges code for session
6. User is redirected to `/dashboard`
7. Middleware protects dashboard route

### Realtime Synchronization
1. When component mounts, create a Supabase channel
2. Subscribe to INSERT and DELETE events on the `bookmarks` table
3. Filter events to only the current user's bookmarks
4. When an event is received, update React state
5. UI updates automatically without page refresh
6. Multiple browser tabs stay in sync via WebSocket connections

### Data Privacy
- Each bookmark has a `user_id` column
- RLS policies enforce that `user_id` must match `auth.uid()`
- Database automatically filters queries to only return user's own data
- Even with the anon key exposed, users can only access their own bookmarks

---

##  Performance Optimizations

- **Server-side rendering** - Initial page load shows data immediately
- **Optimistic UI updates** - Form clears instantly after submission
- **Efficient queries** - Only fetch user's bookmarks, ordered by creation date
- **Real-time instead of polling** - WebSocket connections are more efficient than repeated API calls
- **Static assets on Vercel CDN** - Fast global delivery

---

## Security Features

- **OAuth 2.0** - Industry-standard authentication protocol
- **No password storage** - Delegated to Google's secure infrastructure
- **Row Level Security** - Database-enforced access control
- **HTTPS only** - All traffic encrypted in production
- **Environment variables** - Sensitive keys never committed to Git
- **CSRF protection** - Built into Next.js Server Actions

---

## Future Improvements

- Add tags/categories for bookmarks
- Implement search and filter functionality
- Add bookmark editing capability
- Support for bookmark folders/collections
- Export bookmarks to JSON/CSV
- Import bookmarks from browsers
- Add bookmark previews (Open Graph)
- Share bookmark collections with other users
- Dark mode toggle

---

## License

This project is open source and available under the MIT License.

---

## Author

**Adnan Sameer Z**

- GitHub: [@AdnanSameer1724](https://github.com/AdnanSameer1724)
- Project Demo: [Watch on YouTube](https://youtu.be/dUbexBuq8WM)

---

## Acknowledgments

- Built as part of a full-stack development assignment
- Tech stack: Next.js, Supabase, Tailwind CSS
- Deployed on Vercel
- Special thanks to the Next.js and Supabase documentation

---

##  Support

If you encounter any issues or have questions:
1. Check the **Problems Encountered and Solutions** section above
2. Review the Supabase and Next.js documentation
3. Open an issue on GitHub

---

** If you found this project helpful, please consider giving it a star on GitHub!**