"use client";
import { EmployeeList } from "../components/EmployeeList";
import { EmployeeTree } from "../components/EmployeeTree";
import { useState } from "react";
import { Employee } from "../lib/types";

export default function Home() {
  const [selected, setSelected] = useState<Employee | null>(null);
  const [teamFilter, setTeamFilter] = useState<string>("");
  return (
    <div className="h-screen flex text-gray-800">
      {/* Left panel 10% */}
      <div className="h-full bg-white border-r border-gray-200" style={{ width: "16%", minWidth: 180 }}>
        <EmployeeList selectedId={selected?.id} onSelect={setSelected} onTeamFilterChange={setTeamFilter} />
      </div>
      {/* Right panel 80% */}
      <div className="p-6 overflow-y-auto flex flex-col gap-6 bg-white text-black" style={{ width: "90%" }}>
        <div>
          <h1 className="text-2xl font-semibold mb-2">Organization Chart</h1>
        </div>
        <div className="flex-1 min-h-0">
          <EmployeeTree focusId={selected?.id} onSelect={setSelected} teamFilter={teamFilter} />
        </div>
      </div>

    </div>
  );
}
