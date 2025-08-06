"use client";
import "../globals.css";
import Sidebar from "../components/vendor/Sidebar";
import Navbar from "../components/shared/Navbar";
import NetworkStatus from "../components/shared/NetworkStatus";
import NotificationModal from "../components/shared/NotificationModal";


export default function RootLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full bg-[#fffce8]">
      <Sidebar />
      <div className="flex-1 flex flex-col" style={{ marginLeft: 240 }}>
        <Navbar />
        <main className="flex-1 pt-20 pb-4">
          <NetworkStatus />
          <NotificationModal />
          {children}
        </main>
      </div>
    </div>
  );
}
