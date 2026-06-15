import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Sidebar, MobileBottomNav } from "@/components/Sidebar";
import { DashboardPage } from "@/pages/DashboardPage";
import { CertificateListPage } from "@/pages/CertificateListPage";
import { CertificateFormPage } from "@/pages/CertificateFormPage";
import { CertificateDetailPage } from "@/pages/CertificateDetailPage";
import { ReminderCenterPage } from "@/pages/ReminderCenterPage";
import { MemberManagePage } from "@/pages/MemberManagePage";
import { useAppStore } from "@/store/useAppStore";

function AppLayout() {
  const init = useAppStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-h-screen pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/certificates" element={<CertificateListPage />} />
              <Route path="/certificates/new" element={<CertificateFormPage />} />
              <Route path="/certificates/:id" element={<CertificateDetailPage />} />
              <Route path="/certificates/:id/edit" element={<CertificateFormPage />} />
              <Route path="/reminders" element={<ReminderCenterPage />} />
              <Route path="/members" element={<MemberManagePage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
