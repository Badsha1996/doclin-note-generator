import { useApi } from "@/hook/useApi";
import type { UserKPIResponse } from "@/types/api";
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
function Kpi() {
  const { data, isLoading, isError } = useApi<UserKPIResponse>({
    endpoint: "/user/kpi",
    method: "GET",
  });
  const kpi = data?.data;
  const pieData = [
    { name: "Paid Users", value: kpi?.paidUsers },
    {
      name: "Free Users",
      value: (kpi?.totalUsers || 0) - (kpi?.paidUsers || 0),
    },
  ];
  if (!kpi || isError) return <div className="">Error...</div>;
  return (
    <>
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
          {!isLoading && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-300">Total Users</p>
                <div className="p-2 rounded-full bg-purple-500/20 text-purple-400">
                  👥
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white">
                {kpi.totalUsers}
              </h2>
            </>
          )}
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
          {!isLoading && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-300">Paid Users</p>
                <div className="p-2 rounded-full bg-green-500/20 text-green-400">
                  ✅
                </div>
              </div>
              <h2 className="text-3xl font-bold text-green-400">
                {kpi.paidUsers}
              </h2>
            </>
          )}
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
          {!isLoading && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-300">New This Month</p>
                <div className="p-2 rounded-full bg-blue-500/20 text-blue-400">
                  👤
                </div>
              </div>
              <h2 className="text-3xl font-bold text-blue-400">
                {kpi.newUsers}
              </h2>
            </>
          )}
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
          {!isLoading && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xl text-gray-300">Blocked Users</p>
                <div className="p-2 rounded-full bg-red-500/20 text-red-400">
                  ❌
                </div>
              </div>
              <h2 className="text-3xl font-bold text-red-400">
                {kpi.blockedUsers}
              </h2>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 my-6">
        <div className="col-span-1 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg p-4 flex flex-col justify-between">
          <h2 className="text-lg font-semibold text-white mb-2">User Status</h2>
          <ResponsiveContainer width="100%" height={200}>
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
                data={pieData}
                cx="50%"
                cy="50%"
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
                <h2 className="text-lg font-semibold text-white">User Trend</h2>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={kpi.trend}>
                  <XAxis dataKey="month" stroke="white" />
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
    </>
  );
}

export default Kpi;
