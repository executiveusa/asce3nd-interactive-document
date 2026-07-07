# ASC3ND COLLECTIVE — 90-Day Social Presence Builder
**Prepared by Macs Digital Media**

A bilingual (EN/ES) interactive strategy workbook with Supabase cloud sync, page-turn sound effects, and client management.

---

## Deploy in 10 minutes

### 1. Push to GitHub
```bash
cd asc3nd-app
git init && git add . && git commit -m "asc3nd workbook with supabase"
git remote add origin https://github.com/executiveusa/asce3nd-interactive-document.git
git push -u origin main
```

### 2. Create a Supabase project
1. Go to https://supabase.com → **New project**
2. Name it `macs-digital-media` (or whatever you want)
3. Choose a region close to you
4. Wait ~2 minutes for it to provision
5. Go to **Project Settings → Database** → copy the **Connection string** (or just the URL)
6. Go to **Project Settings → API** → copy the **anon public** key and the **service_role** key
7. Go to **SQL Editor** → paste the contents of `sql/schema.sql` → **Run**

### 3. Add environment variables to Vercel
| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://[your-project].supabase.co` |
| `SUPABASE_SERVICE_KEY` | `service_role` key (from Settings → API) |

### 4. Deploy
```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
cd asc3nd-app
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard:
1. Go to https://vercel.com → **Add New → Project**
2. Import `executiveusa/asce3nd-interactive-document`
3. Under **Environment Variables**, add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`
4. Click **Deploy**

---

## Adding a new client (for future projects)

```sql
INSERT INTO clients (name, slug, email, org_name, notes)
VALUES ('Client Name', 'client-slug', 'email@example.com', 'Org Name', 'Project notes');
```

Then create a workbook for them:
```sql
INSERT INTO workbooks (slug, name, client_id, created_by)
VALUES (
  'client-workbook-slug',
  'Client Workbook Name',
  (SELECT id FROM clients WHERE slug = 'client-slug'),
  'Macs Digital Media'
);
```

---

## How the shared workbook works

| Action | What happens |
|---|---|
| Open the app | Loads from browser storage or URL parameter `?w=slug` |
| Fill in fields | Auto-saves to browser every 0.9 seconds |
| Click **Share ↗** | Generates a unique slug, syncs to Supabase, gives you a URL |
| Share the URL | Client opens it, sees current state, edits sync back to cloud |
| Click **Export JSON** | Downloads full state as a `.json` file |
| Click **Import JSON** | Loads a previously saved file |
| Click **Print / PDF** | Browser print dialog, clean layout |

---

## The page-turn sound
No audio files needed. The sound is generated at runtime using the Web Audio API — a filtered noise burst with a pitch sweep that mimics paper. Works on all modern browsers; silently falls back if the browser blocks audio.

---

## Folder structure
```
asc3nd-app/
├── index.html          ← The full app (self-contained, logos embedded as base64)
├── api/
│   └── workbook.js     ← Vercel serverless function (save/load to Supabase REST API)
├── sql/
│   └── schema.sql      ← Run once in Supabase SQL Editor to create tables
├── package.json
├── vercel.json
└── README.md
```

---

## Client package (from Macs Digital Media)

The full offer, contract, and onboarding sequence is in `macs-asc3nd-client-package.md`:

- **Value stack:** $2,450 ($995 down + 3 payments of $485)
- **Includes:** 4 strategy sessions, bilingual workbook, 90-day content calendar, 30 caption bank, shot list, bio updates, strategy brief
- **Owns:** Everything — client owns all data, all strategies, no subscriptions
- **Delivery:** Sessions 1-2 (Weeks 1-2), Sessions 3-4 (Weeks 3-4), Content calendar (Weeks 5-6), Final (Weeks 7-8)

---

*Built for ASC3ND COLLECTIVE by Macs Digital Media*