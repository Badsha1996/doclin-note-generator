import ConfigContent from "@/components/common/ConfigContent";
import PageHeader from "@/components/common/PageHeader";
import Sidebar from "@/components/common/Sidebar";
import GlassLayout from "@/layouts/GlassLayout";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/config/")({
  component: ConfigComponent,
});

function ConfigComponent() {
  return (
    <div className="space-y-8">
      {/*************************** Header ***************************/}
      <PageHeader
        title="Select Configuration"
        subTitle="Select configuration details to generate accurate exam papers or study
          notes"
      />

      {/*************************** Main Layout ***************************/}
      <GlassLayout>
        <div className="flex gap-6">
          <Sidebar />
          <ConfigContent />
        </div>
      </GlassLayout>
    </div>
  );
}
