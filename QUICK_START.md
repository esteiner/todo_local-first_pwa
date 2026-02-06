# Quick Start Guide

## Deploy to GitHub Pages in 5 Minutes

### Step 1: Create GitHub Repository

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Local-first PWA Todo app"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Configure Base Path

Edit `.github/workflows/deploy.yml` line 48:

```yaml
# Change this line:
VITE_BASE_PATH: /todo_local-first_pwa/

# To match your repository name:
VITE_BASE_PATH: /YOUR_REPO_NAME/
```

Commit and push:
```bash
git add .github/workflows/deploy.yml
git commit -m "Update base path for deployment"
git push
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
4. That's it! No other configuration needed.

### Step 4: Wait for Deployment

- Go to the **Actions** tab in your repository
- Watch the "Deploy to GitHub Pages" workflow
- Takes about 1-2 minutes
- Once complete, your app is live! 🎉

### Step 5: Visit Your App

Your app will be available at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

## What Just Happened?

The GitHub Actions workflow automatically:
1. ✅ Installed dependencies
2. ✅ Ran all tests (33 tests)
3. ✅ Built the production bundle
4. ✅ Deployed to GitHub Pages
5. ✅ Made your PWA publicly accessible

## Using the App

1. **Add a task**: Type in the input field and press Enter
2. **Complete a task**: Click the checkbox
3. **Works offline**: Install as PWA from browser menu
4. **Optional sync**: Enter your Solid Pod URL to enable backup

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Updating Your App

Just push to the main branch:
```bash
git add .
git commit -m "Update: description of changes"
git push
```

GitHub Actions will automatically rebuild and redeploy!

## Troubleshooting

**404 Error**: Check that `VITE_BASE_PATH` matches your repository name exactly

**Tests failing**: Run `npm test -- --run` locally to debug

**Build errors**: Run `npm run build` locally to see the error

**Workflow not running**: Check that GitHub Actions is enabled in repository settings

## Features Included

✅ **Local-first** - Works immediately, no server needed
✅ **Offline PWA** - Service worker caches everything
✅ **CRDT sync** - Conflict-free data replication
✅ **RDF storage** - Semantic web data model
✅ **Solid Pod** - Optional self-hosted backend
✅ **Auto-deploy** - Push to main = instant deployment
✅ **TypeScript** - Full type safety
✅ **Tested** - 33 passing tests

## Next Steps

- Add your custom domain (see DEPLOYMENT.md)
- Customize the UI in `src/ui/`
- Add more features following onion architecture
- Share your app with the world!

---

**Need help?** Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed documentation.
