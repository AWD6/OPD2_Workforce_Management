# CarePlan · OPD 2 Workforce Management

> **Intelligent workforce planning system for OPD 2 (Surgical Specialty Clinic)**  
> A modern, luxurious web application for managing daily staff readiness and patient demand forecasting

![Version](https://img.shields.io/badge/version-3.3-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## 🎯 Overview

CarePlan is a sophisticated workforce management system designed specifically for **OPD 2 (Surgical Specialty Clinic)** at Maharaj Nakorn Chiang Mai Hospital. It provides real-time insights into staff readiness and workload capacity, enabling data-driven decision-making for clinic operations.

### Key Features

- **📊 Daily Readiness Assessment**: Calculate workforce readiness based on 7-hour work shifts (08:00–16:00)
- **👥 Smart Staff Allocation**: Manage Nurse, PN, and HP staff assignments with leave and activity tracking
- **📈 Demand Forecasting**: Plan for patient volume across appointment, walk-in, and external channels
- **🎨 Luxury UI/UX**: Dark-theme interaction model preserved in a Turquoise / sky / off-white light theme with glassmorphism, dimensional shadows, hover elevation, and smooth micro-interactions
- **💾 Central Data Storage**: All devices read and write the same server-side SQLite database
- **📱 Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **🔄 Weekly Records**: Archive and review historical workforce plans

## 🚀 Getting Started

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/OPD2_Workforce_Management.git
   cd OPD2_Workforce_Management
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - No installation or build process required
   - Works offline after first load

3. **Start planning**
   - Select your week using the calendar picker
   - Enter patient demand forecasts
   - Manage staff availability and activities
   - Calculate readiness metrics

### GitHub Pages Deployment

This project is ready for GitHub Pages hosting:

1. Fork the repository
2. Go to **Settings** → **Pages**
3. Select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Your site will be live at `https://yourusername.github.io/OPD2_Workforce_Management`

## 📋 Features Explained

### Readiness Calculation

The system calculates daily workforce readiness using this formula:

```
Readiness (%) = (Patient Demand / Available Capacity) × 100

Where:
- Available Capacity = (Total Staff × 7 hours) - (Leave + Training + Float + Comp Hours)
- 7 hours = Full work shift (08:00–16:00 minus 1-hour break)
```

### Status Indicators

| Status | Range | Color | Meaning |
|--------|-------|-------|---------|
| **Appropriate** | 85–115% | 🟢 Green | Staff matches workload perfectly |
| **Excess Staff** | < 85% | 🟡 Yellow | More staff than required work |
| **Understaffed** | > 115% | 🔴 Red | More work than available staff |

### Staff Roles

- **Nurse**: Registered nurses (7 by default)
- **PN**: Practical nurses (2 by default)
- **HP**: Healthcare personnel (2 by default)

## 🎨 Design Highlights

### Modern Aesthetic
- **Light Hospital Theme**: Turquoise, sky blue, and white palette suitable for a clinical environment
- **Luxury Glassmorphism**: Frosted translucent layers with subtle highlights
- **Gradient Surfaces**: Soft turquoise and sky-blue transitions
- **Hover Elevation**: Cards, buttons, navigation, and inputs lift with refined shadows
- **Micro-interactions**: Sheen sweep, glow, icon tilt, and smooth cubic-bezier motion

### Interactive Elements
- Hover effects with elevation and glow
- Smooth transitions (0.3s cubic-bezier)
- Gradient buttons with shine effect
- Color-coded status badges
- Animated metric cards

## 📊 Data Management

### Central Database
The browser communicates with the OPD2 server API. The server stores all application state in one SQLite database file (`data/opd2.sqlite`), so staff using different computers, tablets, or phones see the same plans and records. The data groups are kept under the same stable keys:
- `careplan-staff-v2`: Staff configuration
- `careplan-weeks-v2`: Weekly plans
- `careplan-records-v2`: Historical records
- `careplan-schedules-v1`: Daily assignment schedules
- `careplan-monthly-codes-v1`: Monthly emergency codes
- `careplan-assignment-templates-v2`: Assignment templates

When the server first connects to a browser that has legacy local data, the application imports that data once into the empty central database. The UI and existing workflows remain unchanged.

### Reset Data
- Click "คืนค่าเริ่มต้น" (Reset) button to clear all data
- Returns to default staff configuration

### Export Records
- Save weekly records for archival
- View historical data with detailed breakdowns

## 🛠 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Server-side SQLite via the built-in HTTP API; localStorage is used only as a temporary migration/outage fallback
- **Fonts**: IBM Plex Sans Thai, Space Mono
- **Icons**: SVG (embedded)
- **Responsive**: CSS Grid & Flexbox

## 📱 Browser Support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Firefox | ✅ Full | Excellent |
| Safari | ✅ Full | macOS & iOS |
| Edge | ✅ Full | Chromium-based |
| IE 11 | ❌ Not supported | Use modern browser |

## 🎯 Usage Workflow

### 1. Configure Staff
- Set number of Nurses, PNs, and HPs
- This becomes your baseline for capacity calculations

### 2. Plan Patient Demand
- Enter forecasted patient numbers for each day
- Categories: Appointments, Walk-ins, External
- System calculates total demand automatically

### 3. Manage Availability
- Record staff on leave (by count)
- Log training/meeting hours
- Track float assignments
- Note compensatory hours

### 4. Calculate Readiness
- Click "คำนวณความพร้อม" (Calculate Readiness)
- System generates daily and weekly metrics
- Review color-coded status for each day

### 5. Review & Archive
- Save weekly plans as records
- Access historical data anytime
- Track trends over time

## 🔐 Privacy & Security

- **Central Server**: The shared database is hosted by the OPD2 server selected by the deployment team
- **No Tracking**: No analytics or telemetry is added by the data layer
- **Controlled Access**: The API accepts only the application state keys it manages
- **Local Fallback**: A temporary browser cache protects unsent edits during a network interruption; normal operation uses the central database
- **HTTPS Ready**: Deploy behind HTTPS on the hospital network when used beyond a trusted local environment

## 📝 File Structure

```
OPD2_Workforce_Management/
├── index.html              # Main application
├── style.css              # Styling (Turquoise Light Luxury theme)
├── script.js              # Existing application logic and UI event handling
├── opd2-data-store.js     # Central API data layer and one-time legacy migration
├── opd2-config.js         # Optional API URL/API key configuration
├── server.js              # Self-contained HTTP server and SQLite API
├── package.json           # Start/check scripts
├── opd2-logo-transparent.png  # Hospital logo
├── README.md              # This file
└── .nojekyll             # GitHub Pages config
```

## 🎨 Color Palette

| Variable | Color | Usage |
|----------|-------|-------|
| Canvas | #edf8f8 | Light turquoise background |
| Surface | #ffffff | Cards & panels |
| Ink | #173a4b | Primary text |
| Teal | #12b8a3 | Accent, active states, and buttons |
| Sky | #4b9de8 | Secondary accent and gradients |
| Amber | #f2b955 | Warning |
| Red | #f26659 | Critical |

## 🔄 Version History

### v3.3 (Current)
- 🌐 Centralized SQLite database shared across devices through a self-contained server API
- 🔁 One-time migration of legacy browser data into the central database
- 🧩 Existing UI, calculations, assignment workflows, PDF export, reset, and records behavior preserved

### v3.2
- ✨ **Desktop-like Landscape Mode**: Small devices now retain the full Turquoise sidebar when rotated sideways, providing a desktop-like experience on phones and tablets
- 🖼️ **Enhanced Logo Focus**: Improved logo prominence on the Turquoise sidebar with soft glow effects and multi-layer shadows
- 🔓 Editable training, Float, and compensatory hour inputs
- 📊 Daily 7-hour readiness calculation
- 🟢 Color-coded status system

### v3.1
- ✨ **Enhanced Logo Focus**: Improved logo prominence on the Turquoise sidebar with soft glow effects and multi-layer shadows
- 📱 **Desktop-like Landscape Mode**: Small devices now retain the full Turquoise sidebar when rotated sideways, providing a desktop-like experience on phones and tablets
- 🔓 Editable training, Float, and compensatory hour inputs
- 📊 Daily 7-hour readiness calculation
- 🟢 Color-coded status system

### v3.0
- ✨ Converted the reference Dark UI into a Turquoise / sky / off-white Light Luxury skin without changing the core geometry or typography
- 🎨 Turquoise gradient sidebar with layered glass detail and an off-white content canvas
- 🎯 Hover elevation, glow, sheen sweep, focus rings, and micro-interactions retained from the reference design
- 🖼️ Borderless premium logo presentation
- 🔓 Editable training, Float, and compensatory hour inputs
- 📱 **Desktop-like Landscape Mode**: Small devices now retain the full Turquoise sidebar when rotated sideways, providing a desktop-like experience on phones and tablets
- 🖼️ **Enhanced Logo Focus**: Improved logo prominence on the Turquoise sidebar with soft glow effects and multi-layer shadows
- 📊 Daily 7-hour readiness calculation
- 🟢 Color-coded status system
- 🧹 Removed role activity panel

### v1.0
- Initial release
- Basic workforce planning
- Light theme

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💼 Author

**Conceived, Designed, and Built by**: RN. Patipon Wiyo

## 🙏 Acknowledgments

- Maharaj Nakorn Chiang Mai Hospital
- OPD 2 (Surgical Specialty Clinic) Team
- All healthcare professionals using this system

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

## 🚀 Deployment

### Central Server (recommended)
Run one instance of the server on a machine that all approved devices can reach. Node.js 22.5 or newer is required because the server uses the built-in SQLite module.

```bash
cd OPD2_Workforce_Management-main
npm start
```

The application will be available at `http://SERVER_IP:8787`. The database is created automatically at `data/opd2.sqlite`. Back up that file using the hospital's normal backup procedure. For production use, place the service behind HTTPS and restrict network access to the intended hospital users.

Optional environment variables are available for deployment:

| Variable | Purpose | Default |
|----------|---------|---------|
| `PORT` | HTTP port | `8787` |
| `HOST` | Listen address | `0.0.0.0` |
| `OPD2_DB_PATH` | SQLite database path | `data/opd2.sqlite` |
| `OPD2_ALLOWED_ORIGIN` | Allowed browser origin | `*` |
| `OPD2_API_KEY` | Optional API key protection | empty |

### Separate static frontend
If the frontend must remain on a static host, edit `opd2-config.js` and set `window.OPD2_API_BASE` to the HTTPS URL of the central OPD2 server. The static host alone cannot provide a shared database; the `server.js` process must remain online.

### GitHub Pages
The original GitHub Pages workflow is suitable only for a static frontend. It must be used together with a separately hosted `server.js` endpoint and an `opd2-config.js` API URL; otherwise each browser will use the temporary fallback cache rather than a shared database.

### Hospital Network
- Run `server.js` once on an approved hospital server or always-on workstation.
- Allow the chosen port only on the hospital network or through the hospital reverse proxy.
- Open the server URL from every approved desktop, tablet, or mobile device.
- Back up `data/opd2.sqlite` regularly; do not commit it to the repository.

---

**Made with ❤️ for better healthcare workforce management**

*Last Updated: August 17, 2026 · Version 3.3*
