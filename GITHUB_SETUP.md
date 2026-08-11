# GitHub Setup & Deployment Guide

## 🚀 Quick Setup for GitHub Pages

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
- [ ] Data saves to localStorage
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

1. Check browser localStorage (F12 → Application → Local Storage)
2. Ensure cookies are enabled
3. Try different browser or incognito mode

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

# Access from mobile on same network:
# http://YOUR_LOCAL_IP:8000/OPD2_Workforce_Management
```

## 🔐 Security Notes

- All data stored locally (no server)
- No external API calls
- Safe for hospital networks
- HTTPS enabled by default on GitHub Pages

## 📞 Support

For GitHub-specific issues:
- Check [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Review repository issues
- Contact GitHub Support

## 🎯 Next Steps

1. ✅ Deploy to GitHub Pages
2. ✅ Test on multiple devices
3. ✅ Share with team
4. ✅ Gather feedback
5. ✅ Plan improvements

---

**Ready to deploy? Start with Step 1 above!**

*Last Updated: August 11, 2026 · Version 3.0*
