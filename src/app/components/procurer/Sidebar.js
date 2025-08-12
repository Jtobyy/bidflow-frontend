"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, House, FileText, Briefcase, FileCheck, Settings, Power } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";

function Sidebar() {
  const { user, logout } = useAuth(); // <- make sure useAuth returns { user }
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { label: "Dashboard", href: "/procurer/dashboard", icon: <House size={18} /> },
    { label: "Tenders", href: "/procurer/tenders", icon: <Briefcase size={18} /> },
    { label: "Bids", href: "/procurer/bids", icon: <FileCheck size={18} /> },
    { label: "Documents", href: "/procurer/documents", icon: <FileText size={18} /> },
    // Settings stays at bottom
    { label: "Settings", href: "#", icon: <Settings size={18} />, bottom: true },
  ];

  const isActive = (path) => pathname.startsWith(path);

  // --- Profile helpers
  const displayName = useMemo(() => {
    if (!user) return "Profile";
    const first = user.first_name || "";
    const last = user.last_name || "";
    const name = `${first} ${last}`.trim();
    return name || user.username || user.email || "Profile";
  }, [user]);

  const initials = useMemo(() => {
    const src = displayName || "";
    const parts = src.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]?.[0]?.toUpperCase() || "U";
    return (parts[0]?.[0] || "U").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
  }, [displayName]);

  const avatarUrl = user?.avatar || user?.image || user?.avatar_url;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hamburger-btn absolute top-4 right-4 inline-flex items-center justify-center rounded-md p-2 text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden z-50"
      >
        <Menu className="block h-6 w-6" aria-hidden="true" />
      </button>

      <aside
        className={`sidebar z-20 px-6 pt-8 w-60 h-screen fixed top-0 bg-[#fffce8] border-r border-gray-200 ${
          isOpen ? "left-0" : "-left-60"
        } lg:left-0 lg:w-60 transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full relative">
          {/* BidFlow branding */}
          <div className="pb-6 text-3xl font-extrabold text-[#08305e] tracking-tight select-none">
            <span>Bid</span><span className="text-[#38a0f7]">Flow</span>
          </div>

          <div className="mb-2 border-t border-gray-300">
            <h2 className="text-sm text-gray-500 pl-2 mt-4">Main Menu</h2>
          </div>

          <nav className="flex-1 mt-2 pb-3">
            {menuItems
              .filter((item) => !item.bottom)
              .map(({ label, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 pl-4 p-2 rounded-md mb-1 cursor-pointer text-[#08305e] hover:bg-[#08305e]/20 font-medium transition ${
                    isActive(href) ? "bg-[#08305e]/30 font-bold" : ""
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              ))}
          </nav>

          {/* Bottom area: Profile -> Settings -> Logout */}
          <div className="mt-auto pb-3 space-y-2">
            {/* PROFILE BUTTON (new) */}
            <Link
              href="#"
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 pl-4 p-2 rounded-md cursor-pointer text-[#08305e] hover:bg-[#08305e]/20 font-medium transition ${
                isActive("/procurer/profile") ? "bg-[#08305e]/30 font-bold" : ""
              }`}
            >
              {/* Avatar */}
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="User avatar"
                  width={28}
                  height={28}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#08305e] text-white grid place-items-center text-xs font-bold">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <span className="block truncate">{displayName}</span>
                {user?.roles?.length ? (
                  <span className="block text-xs text-gray-500 truncate">
                    {user.roles.map((r) => r.name).join(" • ")}
                  </span>
                ) : null}
              </div>
            </Link>

            {/* SETTINGS */}
            {menuItems
              .filter((item) => item.bottom)
              .map(({ label, href, icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 pl-4 p-2 rounded-md cursor-pointer text-[#08305e] hover:bg-[#08305e]/20 font-medium transition ${
                    isActive(href) ? "bg-[#08305e]/30 font-bold" : ""
                  }`}
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              ))}

            {/* LOGOUT */}
            <button
              onClick={logout}
              className="flex  cursor-pointer items-center gap-3 pl-4 p-2 rounded-md text-red-600 font-medium hover:bg-red-100 w-full"
            >
              <Power size={18} /> 
              <span className="font-bold">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
