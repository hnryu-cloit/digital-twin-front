import type React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { DashboardPage } from "@/pages/DashboardPage";
import { SurveyChatPage } from "@/pages/SurveyChatPage";
import { LiveAnalysisPage } from "@/pages/LiveAnalysisPage";
import { ReportPage } from "@/pages/ReportPage";
import { PersonaManagerPage } from "@/pages/PersonaManagerPage";
import { ReportHistoryPage } from "@/pages/ReportHistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";

export const App: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/analytics" element={<DashboardPage />} />
        <Route path="/survey" element={<SurveyChatPage />} />
        <Route path="/live" element={<LiveAnalysisPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/persona" element={<PersonaManagerPage />} />
        <Route path="/reports" element={<ReportHistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};
