import { useState } from "react";
import "./App.css";

// context
import { ToastProvider } from "./contexts/toastContext";

// components
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Toast from "./components/toast";

// pages
import Downloads from "./pages/downloads";
import Settings from "./pages/settings";

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
      case "settings":
        return <Settings />;
      default:
        return <Downloads />;
    }
  };

  return (
    <ToastProvider>
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
    </ToastProvider>
  );
}

export default App;