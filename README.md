# 🏥 MedRoster — Hospital Staff Scheduling

A centralized, web-based scheduling system designed to replace manual roster planning in hospitals. Inspired by modern SaaS dashboards, MedRoster brings workforce management into a single, intuitive interface.

![Dashboard Preview](https://img.shields.io/badge/UI-Synclly--Inspired-orange?style=for-the-badge)
![Tech](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Storage](https://img.shields.io/badge/Data-Local_JSON-blue?style=for-the-badge)

---

## ✨ Features

- **⚡ Instant Setup**: No login or database configuration required. Create a timetable and start planning in seconds.
- **📅 Visual Grid**: A high-performance calendar grid with color-coded shifts (Morning, Afternoon, Night) for quick visual scanning.
- **🪄 Auto-Generate**: Proprietary fair-rotation algorithm that automatically distributes shifts across staff while respecting weekend gaps.
- **👥 Staff Management**: Dedicated personnel cards to manage roles and departments (Emergency, ICU, Pediatrics, etc.).
- **📱 Responsive Design**: View and edit schedules on any device—optimized for both desktop planning and mobile viewing.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS with modern Design Tokens
- **Persistence**: Lightweight JSON-based local storage (no DB server needed)
- **Icons**: Lucide-inspired SVG system

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How It Works

1. **Create**: Name your hospital and create a new timetable from the landing page.
2. **Staff**: Go to the **Staff** tab to add your team members, their roles, and departments.
3. **Plan**: Switch to **Calendar** to manually assign shifts by clicking cells, or hit **Auto-Generate** for an instant fair rotation.
4. **Share**: The app persists your changes locally in `data.json`, making it perfect for rapid internal deployments.

---

*Built with ❤️ for Ghanaian Healthcare Workforce Management*
