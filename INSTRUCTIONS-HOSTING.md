# Hosting Signal Lost on signal.vuvko.net via Cloudflare

## Prerequisites

- Cloudflare account with `vuvko.net` already added as a zone
- Project files ready (index.html at root, plus js/, css/, assets/)

## Option A: Wrangler CLI (Recommended)

### One-time setup

```bash
npm install -g wrangler
wrangler login
```

### Deploy

From the project root (where `index.html` lives):

```bash
npx wrangler pages deploy .
```

First run prompts for a project name (e.g. `signal-lost`). The site goes live at `signal-lost.pages.dev`.

### Redeploy

```bash
npx wrangler pages deploy .
```

## Option B: Dashboard Upload

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages** > **Create** > **Pages** tab
3. Choose **Upload assets**
4. Enter project name: `signal-lost`
5. Drag and drop the project folder
6. Click **Deploy site**

## Option C: Git Integration (Auto-deploy on Push)

1. Push project to GitHub/GitLab
2. **Workers & Pages** > **Create** > **Pages** > **Import Git repository**
3. Configure build settings:
   - **Production branch:** `main`
   - **Build command:** `exit 0` (no build step)
   - **Build output directory:** `.`
4. **Save and Deploy** — every push to `main` auto-deploys

**Note:** If you start with Direct Upload (A/B), you can't switch to Git later without creating a new project.

## Setting Up signal.vuvko.net

**Do this through the Pages dashboard — don't manually add DNS records first.**

1. Go to **Workers & Pages** > click your project
2. Go to **Custom domains** tab
3. Click **Set up a domain**
4. Enter: `signal.vuvko.net`
5. Click **Continue** — since vuvko.net is already a Cloudflare zone, the CNAME record is created automatically
6. Wait a few minutes for activation (status shows "Active")
7. SSL/TLS is automatic — site served over HTTPS

The DNS record created:

| Type  | Name   | Content               | Proxy |
|-------|--------|-----------------------|-------|
| CNAME | signal | signal-lost.pages.dev | On    |

## Free Tier Limits

| Limit            | Value          |
|------------------|----------------|
| File size/asset  | 25 MB max      |
| Files per site   | 20,000 max     |
| Builds/month     | 500            |
| Bandwidth        | Unlimited      |
| Custom domains   | 100/project    |

With ~1,100 WAV files + UI assets + icons, you're well within the 20,000 file limit.

## Human Input Needed

- [ ] Choose deployment method (CLI, dashboard upload, or git integration)
- [ ] If git: push repo to GitHub/GitLab and connect
- [ ] Run initial deploy
- [ ] Add custom domain `signal.vuvko.net` in Pages settings
- [ ] Verify site loads at https://signal.vuvko.net
- [ ] Consider: exclude large asset folders (like the full 1,101 WAV pack) if not all used in-game, to keep deploy size small
