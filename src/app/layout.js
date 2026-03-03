import "./globals.css";

export const metadata = {
  title: "MedRoster — Hospital Staff Scheduling",
  description: "Simple, efficient staff timetable management for hospitals",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
