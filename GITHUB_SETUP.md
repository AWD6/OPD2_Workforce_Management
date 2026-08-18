# GitHub Setup & Deployment Guide

## 🚀 Quick Setup for GitHub Pages

> GitHub Pages can host only the static frontend. Before deploying, publish `server.js` on an HTTPS-accessible hospital server and set the repository variable `OPD2_API_BASE` under **Settings → Secrets and variables → Actions → Variables** to that server URL. The workflow will stop instead of deploying a frontend that is not connected to the central database.

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click **New repository**
3. Fill in:
   - **Repository name**: `OPD2_Workforce_Management`
   - **Description**: "Intelligent workforce planning system for OPD 2"
   - **Visibility**: Choose Public or Private
   - **Initialize**: Leave unchecked
4. Click **Create repository**

### Step 2: Upload Files

#### Option A: Using Git (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/OPD2_Workforce_Management.git
cd OPD2_Workforce_Management

# Copy all files from the ZIP into this directory
# Then:
git add .
git commit -m "Initial commit: CarePlan v3.0 - Turquoise Light Luxury Workforce Management System"
git push -u origin main
```

#### Option B: Direct Upload

1. Go to your repository
2. Click **Add file** → **Upload files**
3. Drag and drop all files from the ZIP
4. Click **Commit changes**

### Step 3: Enable GitHub Pages

1. Go to repository **Settings**
2. Click **Pages** (left sidebar)
3. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main` or `master`
   - **Folder**: Select `/ (root)`
4. Click **Save**

### Step 4: Access Your Site

Your site will be live at:
```
https://YOUR_USERNAME.github.io/OPD2_Workforce_Management
```

It may take a few minutes to deploy. Refresh the page if needed.

## 📋 File Structure for GitHub

```
OPD2_Workforce_Management/
├── index.html                    # Main application
├── style.css                     # Styling (Dark UI model converted to Turquoise Light Luxury)
├── script.js                     # Application logic
├── opd2-logo-transparent.png     # Hospital logo
├── README.md                     # Project documentation
├── CHANGES.md                    # Version history
├── GITHUB_SETUP.md              # This file
└── .nojekyll                    # GitHub Pages configuration
```

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site loads at `https://YOUR_USERNAME.github.io/OPD2_Workforce_Management`
- [ ] Turquoise sidebar and sky / off-white Light Luxury theme display correctly
- [ ] Logo appears in sidebar
- [ ] Buttons and inputs are interactive
- [ ] `/api/health` responds with `ok: true` from the central server
- [ ] Data written on one device is visible after opening the same server URL on a second device
- [ ] Responsive design works on iPhone, iPad, notebook, and laptop widths
- [ ] No console errors (F12 → Console)

## 🔧 Troubleshooting

### Site Not Loading

1. **Check branch name**: Ensure you're deploying from `main` or `master`
2. **Wait for deployment**: GitHub Pages can take 1-2 minutes
3. **Clear cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check repository settings**: Verify Pages is enabled

### Logo Not Showing

1. Ensure `opd2-logo-transparent.png` is in root directory
2. Check file name spelling (case-sensitive)
3. Verify file is not corrupted

### Data Not Persisting

1. Open `/api/health` on the same host and confirm that the server responds with `ok: true`.
2. Confirm that every device opens the URL served by `server.js`, or that `opd2-config.js` points to the same central API URL.
3. Check the server process log and confirm that `data/opd2.sqlite` is writable.
4. If the network was interrupted, allow the browser to reconnect before expecting another device to see the newest change.

### Styling Issues

1. Clear browser cache
2. Hard refresh page (Ctrl+Shift+R)
3. Check CSS file is loaded (F12 → Network)

## 🌐 Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter your domain
3. Click **Save**
4. Update DNS records (see GitHub instructions)

## 📱 Mobile Testing

Test on mobile devices:

```bash
# Find your local IP
ipconfig getifaddr en0  # macOS
hostname -I            # Linux

# Start the central server from the project directory:
# npm start
# Access from mobile on the same network:
# http://YOUR_LOCAL_IP:8787
```

## 🔐 Security Notes

- The normal operating mode stores state in the central server's SQLite database.
- No external API calls are required for the data layer.
- Restrict the server port to the hospital network and use HTTPS through the hospital reverse proxy for production.
- GitHub Pages hosts only static files; it does not run the central database server.

## 📞 Support

For GitHub-specific issues:
- Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Review repository issues
- Contact GitHub Support

## 🎯 Next Steps

1. ✅ Run `npm start` on the approved central server.
2. ✅ Open the server URL from multiple devices on the hospital network.
3. ✅ Test that a change made on one device is visible on a second device.
4. ✅ Back up `data/opd2.sqlite` using the hospital's normal backup process.
5. ✅ Share the central server URL with the approved team members.

---

**Ready to deploy? Start with Step 1 above!**

*Last Updated: August 11, 2026 · Version 3.0*


## 📄 Google Sheets Shared Database and Realtime Polling

GitHub Pages does not run a server process or SQLite. For the shared OPD2 schedule, use one Google Sheet and a Google Apps Script Web App.

1. Create one Google Sheet.
2. Open **Extensions → Apps Script**.
3. Copy `google-apps-script/Code.gs` into the editor. No code replacement is required.
4. Deploy as a Web App, execute as the spreadsheet owner, and allow access to anyone with the link.
5. Copy the deployed URL ending in `/exec`.
6. Add the repository variable `OPD2_SHEETS_API_URL` with that URL.
7. Run the GitHub Pages workflow again.

All staff use the same GitHub Pages URL. No `?edit=...` suffix is needed, and everyone can view and edit the shared workforce data.

The frontend polls the Apps Script endpoint about every 3.5 seconds. When anyone saves the workforce plan, open pages on other devices silently receive the new state and redraw the existing UI without navigation or a toast.
