# CarePlan · OPD 2 Workforce Management

> **Intelligent workforce planning system for OPD 2 (Surgical Specialty Clinic)**  
> A modern, luxurious web application for managing daily staff readiness and patient demand forecasting

![Version](https://img.shields.io/badge/version-3.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

## 🎯 Overview

CarePlan is a sophisticated workforce management system designed specifically for **OPD 2 (Surgical Specialty Clinic)** at Maharaj Nakorn Chiang Mai Hospital. It provides real-time insights into staff readiness and workload capacity, enabling data-driven decision-making for clinic operations.

### Key Features

- **📊 Daily Readiness Assessment**: Calculate workforce readiness based on 7-hour work shifts (08:00–16:00)
- **👥 Smart Staff Allocation**: Manage Nurse, PN, and HP staff assignments with leave and activity tracking
- **📈 Demand Forecasting**: Plan for patient volume across appointment, walk-in, and external channels
- **🎨 Luxury UI/UX**: Dark-theme interaction model preserved in a Turquoise / sky / off-white light theme with glassmorphism, dimensional shadows, hover elevation, and smooth micro-interactions
- **💾 Local Data Storage**: All data stored securely on user's device (localStorage)
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

### Local Storage
All data is stored in your browser's localStorage:
- `careplan-staff-v2`: Staff configuration
- `careplan-weeks-v2`: Weekly plans
- `careplan-records-v2`: Historical records

### Reset Data
- Click "คืนค่าเริ่มต้น" (Reset) button to clear all data
- Returns to default staff configuration

### Export Records
- Save weekly records for archival
- View historical data with detailed breakdowns

## 🛠 Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: Browser localStorage
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

- **No Server**: All data stays on your device
- **No Tracking**: No analytics or telemetry
- **No Sync**: Data not sent anywhere
- **Local Only**: Works offline completely
- **HTTPS Ready**: Safe for hospital networks

## 📝 File Structure

```
OPD2_Workforce_Management/
├── index.html              # Main application
├── style.css              # Styling (Turquoise Light Luxury theme)
├── script.js              # Application logic
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

### v3.1 (Current)
- ✨ **Enhanced Logo Focus**: Improved logo prominence on the Turquoise sidebar with soft glow effects and multi-layer shadows
- 📱 **Advanced Responsive Support**: Tailored layouts for iPhone 16 Pro Max, iPad, and laptops, including a dedicated **Landscape Mode** reflow
- 🔓 Editable training, Float, and compensatory hour inputs
- 📊 Daily 7-hour readiness calculation
- 🟢 Color-coded status system

### v3.0
- ✨ Converted the reference Dark UI into a Turquoise / sky / off-white Light Luxury skin without changing the core geometry or typography
- 🎨 Turquoise gradient sidebar with layered glass detail and an off-white content canvas
- 🎯 Hover elevation, glow, sheen sweep, focus rings, and micro-interactions retained from the reference design
- 🖼️ Borderless premium logo presentation
- 🔓 Editable training, Float, and compensatory hour inputs
- 📱 **Advanced Responsive Support**: Tailored layouts for iPhone 16 Pro Max, iPad, and laptops, including a dedicated **Landscape Mode** reflow
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

### Local Development
```bash
# No build step needed
# Just open index.html in browser
open index.html
```

### GitHub Pages
```bash
# Push to main branch
git push origin main

# Your site will be live at:
# https://yourusername.github.io/OPD2_Workforce_Management
```

### Hospital Network
- Copy all files to hospital web server
- Access via internal URL
- No external dependencies required

---

**Made with ❤️ for better healthcare workforce management**

*Last Updated: August 11, 2026 · Version 3.1*
