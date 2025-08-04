"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#fffce8",
        font: { size: 14, weight: "bold" },
        padding: 18,
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      backgroundColor: "#254c7c",
      titleColor: "#fffce8",
      bodyColor: "#fffce8",
    },
  },
  scales: {
    x: {
      stacked: true,
      grid: { color: "#254c7c" },
      ticks: { color: "#fffce8", font: { size: 14 } },
    },
    y: {
      stacked: true,
      grid: { color: "#254c7c" },
      ticks: { color: "#fffce8", font: { size: 14 } },
    },
  },
};

export default function BidEvaluationChart({ chartData }) {
  // Defensive: fallback to an empty chart if data not ready
  const labels = chartData?.map((item) => item.month) || [];
  const datasetProps = (label, key, color) => ({
    label,
    data: chartData?.map((item) => item[key]) || [],
    backgroundColor: color,
    borderRadius: 5,
    stack: "Stack 0",
  });

  const barData = {
    labels,
    datasets: [
      datasetProps("Fully Evaluated", "Fully", "#3EBF0F"),
      datasetProps("Partially Evaluated", "Partial", "#38a0f7"),
      datasetProps("Rejected", "Rejected", "#EF4444"),
      datasetProps("Pending", "Pending", "#F59E0B"),
    ],
  };

  return (
    <div className="w-full rounded-xl shadow bg-[#08305e] p-6 border border-[#254c7c] mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold" style={{ color: "#fffce8" }}>
          Bid Evaluation Status
        </h3>
      </div>
      <div className="h-[300px]">
        <Bar data={barData} options={chartOptions} />
      </div>
    </div>
  );
}
