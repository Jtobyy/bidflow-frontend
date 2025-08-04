"use client";

import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useNotification } from '@/app/hooks/useNotification';

const Navbar = () => {
  const path = usePathname();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const { unreadCount, toggleNotification } = useNotification();


  useEffect(() => {
    const pathParts = path.split('/').filter(Boolean);
    let lastPart = pathParts[pathParts.length - 1] || "";
    if (/\d+$/.test(lastPart)) lastPart = pathParts[pathParts.length - 2] || "";

    const formattedTitle = lastPart
      ? lastPart.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : "Dashboard";
    setTitle(formattedTitle);
  }, [path]);

  // Optionally show back button for deep pages
  const showBackButton = path.split('/').length > 2;

  return (
    <div className="fixed pb-11 pt-12 top-0 left-0 right-0 z-10 flex items-center justify-between h-16 px-8 bg-[#fffce8] border-b border-gray-200 shadow-sm" style={{ marginLeft: '240px' }}>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-[#08305e]">{title}</h1>
      </div>
      <button className="relative" title="Notifications" onClick={toggleNotification}>
        <Bell className="text-[#08305e] cursor-pointer w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#38a0f7] text-white text-xs flex items-center justify-center font-bold border-2 border-[#fffce8]">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default Navbar;
