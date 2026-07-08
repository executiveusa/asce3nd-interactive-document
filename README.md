# ASC3ND COLLECTIVE — 90-Day Social Presence Builder
**Prepared by Macs Digital Media**

A bilingual (EN/ES) interactive strategy workbook with page-turn sound effects. No database, no subscriptions, no lock-in — the client owns everything.

---

## How sharing works

Zero database. The entire workbook state is encoded into the share URL. Anyone with the link opens the exact same workbook. Recipients edit, save locally, and share a new link. No server storage, no accounts, no maintenance.

**The data lives in the URL. The client owns the URL. The client owns the data.**

---

## How to use

| Action | What happens |
|---|---|
| Open the app | Loads from browser storage |
| Fill in fields | Auto-saves every 0.9 seconds |
| Click **Share ↗** | Encodes state into URL → copy link |
| Share the URL | Recipient opens it → state loads from URL hash |
| Click **Export JSON** | Downloads full state as `.json` file |
| Click **Import JSON** | Loads a previously saved file |
| Click **Print / PDF** | Browser print dialog, clean layout |

---

## Deploy status

**Live at:** https://asc3nd-interactive-document.vercel.app

**GitHub:** https://github.com/executiveusa/asce3nd-interactive-document

---

## Folder structure
```
asc3nd-app/
├── index.html          ← The full app (self-contained, logos embedded as base64)
├── api/
│   └── workbook.js     ← Stub endpoint (no DB needed — state is in the URL)
├── sql/
│   └── schema.sql      ← Reference only (for future DB setup)
├── package.json
├── vercel.json
└── README.md
```

---

## Client package

The full offer, contract, and onboarding sequence is in `macs-asc3nd-client-package.md`:

- **Value stack:** $2,450 ($995 down + 3 payments of $485)
- **Includes:** 4 strategy sessions, bilingual workbook, 90-day content calendar, 30 caption bank, shot list, bio updates, strategy brief
- **Owns:** Everything — client owns all data, all strategies, no subscriptions
- **Delivery:** Sessions 1–2 (Weeks 1–2), Sessions 3–4 (Weeks 3–4), Content calendar (Weeks 5–6), Final (Weeks 7–8)

---

*Built for ASC3ND COLLECTIVE by Macs Digital Media*