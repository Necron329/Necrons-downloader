import { useState } from "react";
import "./App.css";

import { AppProviders } from "./contexts/AppProviders";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";

import Downloads from "./pages/Downloads";
import Settings from "./pages/Settings";
import MetadataEditor from "./pages/MetadataEditor";

function App() {
  const [collapsed, setCollapsed] = useState(true);
  const [currentPage, setCurrentPage] = useState("downloads");

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "downloads":
        return <Downloads />;
      case "metadata":
        return <MetadataEditor />;
      case "settings":
        return <Settings />;
      default:
        return <Downloads />;
    }
  };

  return (
    <AppProviders>
      <div className="h-screen flex flex-col">
        <Header onToggleSidebar={toggleSidebar} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsed={collapsed} setCurrentPage={setCurrentPage} />

          <main className="flex-1 bg-zinc-950 text-white p-4 overflow-y-auto">
            {renderPage()}
          </main>
        </div>
      </div>

      <Toast />
    </AppProviders>
  );
}

export default App;