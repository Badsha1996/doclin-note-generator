import Users from "@/components/dashboard/Users";
import { monthlyUserData, weeklyUserData } from "@/lib/data";
import { useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Line,
} from "recharts";
function UserManagement() {
  const data = [
    { name: "Active Users", value: 20000 },
    { name: "Inactive Users", value: 1200 },
  ];
  const [view, setView] = useState("monthly");
  const _data = view === "monthly" ? monthlyUserData : weeklyUserData;

  return (
    <div className="">
      <div
        className="
        grid 
        grid-cols-1 grid-rows-4
        md:grid-cols-2 md:grid-rows-2
        lg:grid-cols-4 lg:grid-rows-1
        gap-4
      "
      >
        <div
          className="
          flex flex-col justify-between 
          bg-white/10 backdrop-blur-xl 
          border border-white/20 
          rounded-2xl p-6 
          shadow-inner shadow-purple-500/10 
          hover:bg-white/20 hover:shadow-xl 
          transition-all duration-300
        "
        >
          <div className="flex items-center justify-between">
            <p className="text-xl text-gray-300">Total Users</p>
            <div className="p-2 rounded-full bg-purple-500/20 text-purple-400">
              👥
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">12,450</h2>
          <p className="text-xs text-green-400 mt-1">▲ +12% from last month</p>
        </div>

        <div
          className="
          flex flex-col justify-between 
          bg-white/10 backdrop-blur-xl 
          border border-white/20 
          rounded-2xl p-6 
          shadow-inner shadow-green-500/10 
          hover:bg-white/20 hover:shadow-xl 
          transition-all duration-300
        "
        >
          <div className="flex items-center justify-between">
            <p className="text-xl text-gray-300">Active Today</p>
            <div className="p-2 rounded-full bg-green-500/20 text-green-400">
              ✅
            </div>
          </div>
          <h2 className="text-3xl font-bold text-green-400">2,310</h2>
          <p className="text-xs text-green-400 mt-1">▲ +5% vs yesterday</p>
        </div>

        <div
          className="
          flex flex-col justify-between 
          bg-white/10 backdrop-blur-xl 
          border border-white/20 
          rounded-2xl p-6 
          shadow-inner shadow-blue-500/10 
          hover:bg-white/20 hover:shadow-xl 
          transition-all duration-300
        "
        >
          <div className="flex items-center justify-between">
            <p className="text-xl text-gray-300">New This Month</p>
            <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
              ➕
            </div>
          </div>
          <h2 className="text-3xl font-bold text-blue-400">540</h2>
          <p className="text-xs text-green-400 mt-1">▲ +8% vs last month</p>
        </div>

        <div
          className="
          flex flex-col justify-between 
          bg-white/10 backdrop-blur-xl 
          border border-white/20 
          rounded-2xl p-6 
          shadow-inner shadow-red-500/10 
          hover:bg-white/20 hover:shadow-xl 
          transition-all duration-300
        "
        >
          <div className="flex items-center justify-between">
            <p className="text-xl text-gray-300">Inactive Users</p>
            <div className="p-2 rounded-full bg-red-500/20 text-red-400">
              ❌
            </div>
          </div>
          <h2 className="text-3xl font-bold text-red-400">1,120</h2>
          <p className="text-xs text-red-400 mt-1">▼ -3% vs last week</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 my-6">
        <div className="col-span-1 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg p-4 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-white mb-2">User Status</h2>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <defs>
                <linearGradient id="activeGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(167, 243, 208, 0.9)" />
                  <stop offset="100%" stopColor="rgba(34, 197, 94, 0.7)" />
                </linearGradient>
                <linearGradient
                  id="inactiveGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="rgba(253, 164, 175, 0.9)" />
                  <stop offset="100%" stopColor="rgba(239, 68, 68, 0.7)" />
                </linearGradient>
                {/* Optional glow */}
                <filter
                  id="shadow"
                  x="-50%"
                  y="-50%"
                  width="200%"
                  height="200%"
                >
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="4"
                    floodColor="rgba(255,255,255,0.3)"
                  />
                </filter>
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="url(#activeGradient)" />
                <Cell fill="url(#inactiveGradient)" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-3">
          <div className="w-full ">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-white">
                  {view === "monthly" ? "Monthly Users" : "Weekly Users"}
                </h2>
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value)}
                  className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 outline-none backdrop-blur-md"
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={_data}>
                  <XAxis
                    dataKey={view === "monthly" ? "month" : "week"}
                    stroke="white"
                  />
                  <YAxis stroke="white" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(12px)",
                      borderRadius: "12px",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "white",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#60a5fa" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <Users />
    </div>
  );
}

export default UserManagement;
