import DashboardNav from "@/components/common/DashboardNav";
import { createFileRoute } from "@tanstack/react-router";
import {
  BrainCircuit,
  LayoutDashboard,
  NotepadTextDashed,
  ScrollText,
  UserRound,
} from "lucide-react";
import { useState } from "react";
export const Route = createFileRoute("/dashboard/")({
  component: Dashboard,
});

function Dashboard() {
  const data = [
    {
      key: "Dashboard",
      icon: <LayoutDashboard />,
    },
    {
      key: "Users",
      icon: <UserRound />,
    },
    {
      key: "Documents",
      icon: <ScrollText />,
    },
    {
      key: "Model Selection",
      icon: <BrainCircuit />,
    },
    {
      key: "Templates",
      icon: <NotepadTextDashed />,
    },
  ];
  const [selected, setSelected] = useState("Dashboard");
  const handleChange = (option: string) => {
    setSelected(option);
  };
  return (
    <div className="m-4 p-2  ">
      <div className="bg-white/70 rounded-xl p-2 h-[calc(100svh-8rem)] flex gap-3">
        <DashboardNav value={selected} onChange={handleChange} options={data} />
        <div className="bg-gray-100 backdrop-blur-md rounded-xl grow p-4 text-slate-700 overflow-auto">
          <div className="flex h-1/2 gap-2 flex-wrap ">
            <div className="w-1/3 h-full grid grid-cols-2 grid-rows-2 gap-2">
              <div className="shadow-md shadow-slate-300 rounded-md bg-white"></div>
              <div className=" shadow-md shadow-slate-300 rounded-md bg-white"></div>
              <div className=" shadow-md shadow-slate-300 rounded-md bg-white"></div>
              <div className=" shadow-md shadow-slate-300 rounded-md bg-white"></div>
            </div>
            <div className="grow shadow-md shadow-slate-300 rounded-md bg-white"></div>
          </div>
          <div className=""></div>
        </div>
      </div>
    </div>
  );
}
