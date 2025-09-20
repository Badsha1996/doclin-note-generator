import { createFileRoute } from "@tanstack/react-router";
import { useState, type SetStateAction } from "react";

import ConfigContent from "@/components/common/ConfigContent";
import PageHeader from "@/components/common/PageHeader";
import Sidebar from "@/components/common/Sidebar";
import GlassLayout from "@/layouts/GlassLayout";


export const Route = createFileRoute("/config/")({
  component: ConfigComponent,
});

function ConfigComponent() {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedMarks, setSelectedMarks] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("")
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
