# Varvara

Business Intelligence Platform built with React, TypeScript, and Supabase.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/mikael-gorsky/varvara.git
cd varvara
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment example and configure your Supabase credentials:
```bash
cp .env.example .env
```

4. Update `.env` with your Supabase project credentials from the [Supabase Dashboard](https://supabase.com/dashboard).

5. Start the development server:
```bash
npm run dev
```

## Netlify Deployment

### Option 1: Deploy via Netlify UI

1. Connect your GitHub repository to Netlify
2. Netlify will auto-detect the build settings from `netlify.toml`
3. Add environment variables in Netlify Dashboard > Site settings > Environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_SERVICE_ROLE_KEY`

### Option 2: Deploy via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for client-side access |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Service role key for admin operations |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
