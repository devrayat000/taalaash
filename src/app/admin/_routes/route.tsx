import Navbar from "@/app/admin/(routes)/components/navbar";
import { ThemeProvider } from "@/providers/theme-provider";

async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Navbar />
      {children}
    </ThemeProvider>
  );
}

import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute("/admin/_routes")({
  component: DashboardLayout
});
