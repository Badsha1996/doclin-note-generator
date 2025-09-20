import DashboardNav from "@/components/dashboard/DashboardNav";
import Model from "@/components/dashboard/Modelmanagement";
import UserManagement from "@/components/dashboard/UserManagement";
import PageHeader from "@/components/common/PageHeader";
import GlassLayout from "@/layouts/GlassLayout";
import { createFileRoute } from "@tanstack/react-router";
import {
  BrainCircuit,
  LayoutDashboard,
  FileText,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import Syllabus from "@/components/dashboard/SyllabusManagement";
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
      key: "Exam Papers",
      icon: <FileText />,
    },
    {
      key: "Model Selection",
      icon: <BrainCircuit />,
    },
  ];
  const [selected, setSelected] = useState("Dashboard");

  useEffect(() => {
    localStorage.setItem(
      "token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYTQ4MjU2ODQtZGNlNy00YWVkLWI4NTUtNTg3OWE5MTgyZWU0IiwiZW1haWwiOiJhbmlydWRoYXByYWRoYW40MDNAZ21haWwuY29tIiwicm9sZSI6ImFkbWluIiwidXNlcm5hbWUiOiJBbmlydWRoYSBELiBQcmFkaGFuIiwiZXhwIjoxNzU4Mzk1MzYxfQ.z0iu0fMlevkOTqEFpmivamjiKbsw01KIba9yiT4_zK0"
    );
  }, []);

  const handleChange = (option: string) => {
    setSelected(option);
  };
  return (
    <div className="p-2 space-y-8">
      <PageHeader title="Dashboard" subTitle="sub header" />
      <GlassLayout>
        <div className="bg-transparent rounded-xl p-2 h-[calc(100svh-8rem)] flex gap-4">
          <DashboardNav
            value={selected}
            onChange={handleChange}
            options={data}
          />
          <div className="bg-[linear-gradient(135deg,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.1)_100%)] rounded-xl grow p-4 text-slate-700 overflow-auto">
            {selected === "Users" && <UserManagement />}
            {selected === "Dashboard" && (
              <>
                <div className="flex h-1/2 gap-2 flex-wrap ">
                  <div className="w-1/3 h-full grid grid-cols-2 grid-rows-2 gap-2">
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl  p-4 shadow-inner shadow-purple-500/10 hover:bg-white/20 hover:shadow-xl transition-all duration-300 "></div>
                    <div className=" bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-4  hover:bg-white/20 hover:shadow-xl transition-all duration-300"></div>
                    <div className=" bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-4  hover:bg-white/20 hover:shadow-xl transition-all duration-300"></div>
                    <div className=" bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-4  hover:bg-white/20 hover:shadow-xl transition-all duration-300"></div>
                  </div>
                  <div className="grow bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-lg p-4 hover:bg-white/20 hover:shadow-xl transition-all duration-300"></div>
                </div>
                <div className=""></div>
              </>
            )}
            {selected === "Model Selection" && <Model />}
            {selected === "Exam Papers" && <Syllabus />}
          </div>
        </div>
      </GlassLayout>
    </div>
  );
}
