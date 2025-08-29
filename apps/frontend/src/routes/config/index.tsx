import ConfigContent from "@/components/common/ConfigContent";
import Sidebar from "@/components/common/Sidebar";
import GlassLayout from "@/layouts/GlassLayout";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/config/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="bg-gradient-to-r from-pink-400 via-blue-500 to-purple-500 bg-clip-text text-transparent  font-extrabold text-4xl">
          Select Configuration 
        </h1>

        <p className="text-gray-400 text-sm mt-2">
          Select configuration details to generate accurate exam papers or study
          notes
        </p>
      </div>

      {/* Main Layout */}
      <GlassLayout>
        <div className="flex gap-6">
          <Sidebar />
          <ConfigContent />
        </div>
      </GlassLayout>
    </div>
  );
}
