"use client";

import React, { useState, useEffect } from "react";
import {
  RefreshCw, Briefcase, FileText, FileCheck, Users2, ShieldCheck, Clock,
  UploadCloud, FileSearch, FileText as FileTextIcon, Trophy, Activity
} from "lucide-react";
import BidEvaluationChart from "@/app/components/procurer/BidEvaluationChart";
import { useApi } from "@/app/services/axios";
import { useRouter, useSearchParams } from "next/navigation";



const summaryCards = [
  { label: "Tenders", key: "tenders", icon: Briefcase, color: "#38a0f7" },
  { label: "Bids", key: "bids", icon: FileCheck, color: "#3EBF0F" },
  { label: "Documents", key: "documents", icon: FileText, color: "#FFBE3D" },
  { label: "Users", key: "users", icon: Users2, color: "#FF7849" },
  { label: "Compliant Bids", key: "compliant_bids", icon: ShieldCheck, color: "#10B981" },
  { label: "Pending Reviews", key: "pending_reviews", icon: Clock, color: "#F59E0B" },
];

const quickActions = [
  { label: "Review Bids", icon: FileSearch, color: "#3EBF0F", onClick: () => alert("Review Bids") },
  { label: "Upload Bid", icon: UploadCloud, color: "#F59E0B", onClick: () => alert("Upload Bid") },
  { label: "Generate Report", icon: FileTextIcon, color: "#10B981", onClick: () => alert("Generate Report") },
];

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [bidEvaluationData, setBidEvaluationData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const router = useRouter();

  const { api } = useApi();

  const fetchData = async () => {
    try {
      // Update with your API base URL if needed
      const { data } = await api.get("/ai/summary/");
      setSummary(data);
      setBidEvaluationData(data.bid_evaluation_chart || []);
      setLeaderboard(data.leaderboard || []);
      setRecentActivity(data.recent_activity || []);
      setAlerts(data.alerts || []);
      setLastUpdated(new Date());
    } catch (error) {
      // Fallback to empty/dummy data if error
      setBidEvaluationData([]);
      setLeaderboard([]);
      setRecentActivity([]);
      setAlerts([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setIsRefreshing(false));
  };

  const lastUpdatedString = lastUpdated
    ? `Last updated: ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Last updated: Never";

  const cardBg = "#08305e";
  const cardText = "#fffce8";
  const cardSubtle = "#b7c7de";

  return (
    <div className="py-10 max-w-[1500px] mx-auto w-full">
      {/* TOP ROW */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-2 border border-[#254c7c] rounded-lg px-4 py-2 shadow bg-[#08305e]">
          <span className="font-medium" style={{ color: cardText }}>{lastUpdatedString}</span>
          <button
            className={`ml-2 p-1 rounded-full cursor-pointer hover:bg-[#254c7c] transition ${isRefreshing ? "animate-spin" : ""}`}
            onClick={handleRefresh}
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" style={{ color: "#38a0f7" }} />
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 mb-10">
        {summaryCards.map(({ label, key, icon: Icon, color }) => (
          <div
            key={key}
            className="rounded-xl shadow"
            style={{ background: cardBg, color: cardText, minHeight: 120, border: "1px solid #254c7c" }}
          >
            <div className="flex flex-col items-center p-5">
              <div
                className="mb-2 flex items-center justify-center rounded-full w-10 h-10"
                style={{
                  background: `${color}20`,
                  border: `1.5px solid ${color}`,
                }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div className="text-2xl font-bold" style={{ color: cardText }}>{summary[key] ?? 0}</div>
              <div className="mt-1 text-xs font-medium" style={{ color: cardSubtle }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CHART: Bid Evaluation */}
      <BidEvaluationChart chartData={bidEvaluationData} />

      {/* QUICK ACTIONS + LEADERBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Quick Actions */}
        <div className="rounded-xl shadow bg-[#08305e] p-6 border border-[#254c7c]">
          <div className="font-semibold mb-3" style={{ color: cardText }}>Quick Actions</div>
          <div className="grid grid-cols-2 gap-4">
              <button
                className="flex cursor-pointer items-center gap-2 px-3 py-3 rounded-lg bg-[#254c7c] border border-[#254c7c] shadow hover:bg-[#2d5e9a] text-[#fffce8] font-medium hover:shadow-lg transition"
                onClick={() => router.push('/procurer/tenders?action=new')}
              >
                <Briefcase size={18} style={{ color: "#38a0f7" }} />
                <span className="text-sm">Create Tender</span>
              </button>

              {quickActions.map(({ label, icon: Icon, color, onClick }) => (
                <button
                  key={label}
                  className="flex cursor-pointer items-center gap-2 px-3 py-3 rounded-lg bg-[#254c7c] border border-[#254c7c] shadow hover:bg-[#2d5e9a] text-[#fffce8] font-medium hover:shadow-lg transition"
                  onClick={onClick}
                >
                  <Icon size={18} style={{ color }} />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
          </div>
        </div>
        {/* Leaderboard */}
        <div className="rounded-xl shadow bg-[#08305e] p-6 border border-[#254c7c]">
          <div className="font-semibold mb-3" style={{ color: cardText }}>Top Bidders</div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: cardSubtle }} className="font-semibold">
                <th className="text-left py-1">Company</th>
                <th className="text-left py-1">Avg. Score</th>
                <th className="text-left py-1">Bids</th>
                <th className="text-left py-1">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, i) => (
                <tr key={i} className="border-b border-[#254c7c] hover:bg-[#254c7c] transition" style={{ color: cardText }}>
                  <td className="py-2 font-medium">{row.company}</td>
                  <td className="py-2">{row.avg_score ?? row.avgScore}</td>
                  <td className="py-2">{row.bids}</td>
                  <td className="py-2">{row.compliance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity + Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Recent Activity Feed */}
        <div className="rounded-xl shadow bg-[#08305e] p-6 border border-[#254c7c]">
          <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: cardText }}>
            <Activity size={18} className="text-[#38a0f7]" /> Recent Activity
          </div>
          <ul className="space-y-3">
            {(recentActivity || []).map((item, idx) => (
              <li key={idx} className="flex items-center gap-2" style={{ color: cardSubtle }}>
                {/* Optionally, you could render icons conditionally by item.type */}
                <span>{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Alerts & Suggestions */}
        <div className="rounded-xl shadow bg-[#08305e] p-6 border border-[#254c7c]">
          <div className="font-semibold mb-3 flex items-center gap-2" style={{ color: cardText }}>
            <Clock size={18} className="text-[#F59E0B]" /> Alerts & Suggestions
          </div>
          <ul className="space-y-2 text-[#F59E0B] text-sm">
            {(alerts || []).map((a, idx) => (
              <li key={idx} className={a.type === "info" ? "text-[#3EBF0F]" : "text-[#F59E0B]"}>
                {a.type === "warning" ? "⚠️" : "🧠"} {a.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
