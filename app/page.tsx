"use client";
import { EmployeeList } from "../components/EmployeeList";
import { EmployeeTree } from "../components/EmployeeTree";
import { ResetButton } from "../components/ResetButton";
import { useState } from "react";
import { Employee } from "../lib/types";
// Main page layout (list + tree)
export default function Home() {
  // Shared state between list and tree
  const [selected, setSelected] = useState<Employee | null>(null);
  const [teamFilter, setTeamFilter] = useState<string>("");
  
  return (
    <div className="h-screen flex text-gray-800">
      {/* List panel */}
      <div 
        className="h-full bg-white border-r border-gray-200" 
        style={{ width: "16%", minWidth: 180 }}
      >
        <EmployeeList 
          selectedId={selected?.id} 
          onSelect={setSelected} 
          onTeamFilterChange={setTeamFilter} 
        />
      </div>
      
      {/* Tree panel */}
      <div 
        className="p-6 overflow-y-auto flex flex-col gap-6 bg-white text-black" 
        style={{ width: "90%" }}
      >
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Organization Chart</h1>
          <ResetButton />
        </div>
        <div className="flex-1 min-h-0">
          <EmployeeTree 
            focusId={selected?.id} 
            onSelect={setSelected} 
            teamFilter={teamFilter} 
          />
        </div>
      </div>
    </div>
  );
}
