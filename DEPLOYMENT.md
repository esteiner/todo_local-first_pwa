# Deployment Guide

## GitHub Pages Deployment

This project is configured to automatically deploy to GitHub Pages using GitHub Actions.

### Setup Instructions

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Local-first PWA Todo app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **Update the base path** (if needed):
   - Open `.github/workflows/deploy.yml`
   - Change `VITE_BASE_PATH: /todo_local-first_pwa/` to match your repository name:
     ```yaml
     VITE_BASE_PATH: /YOUR_REPO_NAME/
     ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Build and deployment":
     - Source: **GitHub Actions**
   - Save the settings

4. **Trigger deployment**:
   - The workflow will automatically run on every push to the `main` branch
   - Or manually trigger it from the **Actions** tab
   - After the first successful run, your app will be available at:
     `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

### Workflow Features

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

✅ Checks out the code
✅ Sets up Node.js 20
✅ Installs dependencies
✅ Runs all tests
✅ Builds the application for production
✅ Deploys to GitHub Pages

### Manual Deployment

If you prefer to deploy manually:

```bash
# Build with the correct base path
VITE_BASE_PATH=/YOUR_REPO_NAME/ npm run build

# The dist/ folder can now be deployed to any static hosting service
```

### Alternative Hosting Options

This is a static PWA and can be deployed to:

- **Vercel**: `vercel --prod`
- **Netlify**: Drag and drop the `dist/` folder
- **Cloudflare Pages**: Connect your GitHub repository
- **Firebase Hosting**: `firebase deploy`
- **Any static file server**: Serve the `dist/` directory

### Custom Domain

To use a custom domain with GitHub Pages:

1. Add a `CNAME` file to the `public/` directory:
   ```bash
   echo "yourdomain.com" > public/CNAME
   ```

2. Configure your domain's DNS:
   - Add a CNAME record pointing to `YOUR_USERNAME.github.io`
   - Or add A records pointing to GitHub's IPs (see GitHub docs)

3. In repository settings → Pages, enter your custom domain

### Troubleshooting

**404 errors on refresh:**
- This is a single-page app; if you get 404s on routes, add a 404.html that redirects to index.html
- GitHub Pages automatically handles this for the root domain

**Base path issues:**
- Ensure `VITE_BASE_PATH` matches your repository name
- Check that all asset paths in the built app are correct

**Build fails:**
- Check the Actions tab for error logs
- Ensure all tests pass locally: `npm test -- --run`
- Verify TypeScript compiles: `npm run type-check`

### Environment Variables

For local development, the base path is `/` (root).
For GitHub Pages, set `VITE_BASE_PATH=/repo-name/` in the workflow.

### Monitoring Deployments

- View deployment status in the **Actions** tab
- Each commit to `main` triggers a new deployment
- Deployment typically takes 1-2 minutes
- Check the **Environments** section for deployment history

## Offline Functionality

The PWA will work completely offline after the first visit:
- Service worker caches all assets
- IndexedDB stores all task data locally
- Solid Pod sync (if configured) only requires connection when syncing

Users can install the app on their device using the browser's "Add to Home Screen" option.
