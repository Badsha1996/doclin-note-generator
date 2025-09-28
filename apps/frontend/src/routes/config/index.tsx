import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import ConfigContent from "@/components/common/ConfigContent";
import PageHeader from "@/components/common/PageHeader";
import Sidebar from "@/components/common/Sidebar";
import GlassLayout from "@/layouts/GlassLayout";
import { getUserInfo } from "@/lib/auth";

export const Route = createFileRoute("/config/")({
  beforeLoad: () => {
    if (!getUserInfo()) {
      throw redirect({ to: "/" });
    }
  },
  component: ConfigComponent,
});

function ConfigComponent() {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedMarks, setSelectedMarks] = useState<string>("80");
  const [selectedDuration, setSelectedDuration] = useState<string>("2");
  const [selectedUnit, setSelectedUnit] = useState<string>("hrs");

  return (
    <div className="space-y-8 mt-24">
      {/*************************** Header ***************************/}
      <PageHeader
        title="Select Configuration"
        subTitle="Select configuration details to generate accurate exam papers or study
          notes"
      />

      {/*************************** Main Layout ***************************/}
      <GlassLayout>
        <div className="flex gap-6">
          <Sidebar
            selectedBoard={selectedBoard}
            setSelectedBoard={setSelectedBoard}
            selectedSubject={selectedSubject}
            setSelectedSubject={setSelectedSubject}
            selectedMarks={selectedMarks}
            setSelectedMarks={setSelectedMarks}
            selectedDuration={selectedDuration}
            setSelectedDuration={setSelectedDuration}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
          />
          <ConfigContent
            selectedBoard={selectedBoard}
            selectedSubject={selectedSubject}
            selectedMarks={selectedMarks}
            selectedDuration={selectedDuration}
            selectedUnit={selectedUnit}
          />
        </div>
      </GlassLayout>
    </div>
  );
}
