"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, X } from "lucide-react";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOffline, setShowOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    let offlineTimeout;

    const handleOnline = () => {
      clearTimeout(offlineTimeout);
      if (!isOnline) {
        setShowRestored(true);
        setTimeout(() => setShowRestored(false), 5000);
      }
      setIsOnline(true);
      setShowOffline(false);
    };

    const handleOffline = () => {
      offlineTimeout = setTimeout(() => {
        setIsOnline(false);
        setShowOffline(true);
      }, 3000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(offlineTimeout);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnline]);

  return (
    <>
      {showOffline && (
        <div
          className={`fixed bottom-5 left-5 p-3 rounded-lg shadow-lg w-96 z-[9999] flex items-center justify-between border ${
            "bg-[#fffce8] text-[#08305e] border-gray-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <WifiOff className="w-6 h-6 text-red-500" />
            <p className="text-sm">No Internet Connection. Please check your network.</p>
          </div>
          <button onClick={() => setShowOffline(false)} className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {showRestored && (
        <div
          className={`fixed bottom-5 left-5 p-3 rounded-lg shadow-lg w-96 z-[9999] flex items-center justify-between border ${
            "bg-[#fffce8] text-[#08305e] border-gray-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <Wifi className="w-6 h-6 text-green-500" />
            <p className="text-sm">Your Internet connection was <br/> restored.</p>
          </div>
          <button onClick={() => setShowRestored(false)} className="text-gray-600 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
};

export default NetworkStatus;
