import { useState } from "react";
import "./App.css";

// components
import Header from "./components/header";
import Sidebar from "./components/sidebar";

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
    <div className="h-screen flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={collapsed} setCurrentPage={setCurrentPage} />

        <main className="flex-1 bg-zinc-950 text-white p-4">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;