// In-memory employee data store (persists across Fast Refresh via globalThis)

import { Employee } from "./types";

const initialEmployees: Employee[] = [
  { id: "e1", name: "Alice Johnson", designation: "CEO", team: "Executive" },
  { id: "e2", name: "Bob Smith", designation: "CTO", team: "Engineering", managerId: "e1" },
  { id: "e3", name: "Carol Lee", designation: "CFO", team: "Finance", managerId: "e1" },
  { id: "e4", name: "David Kim", designation: "Engineering Manager", team: "Engineering", managerId: "e2" },
  { id: "e5", name: "Ella Brown", designation: "Lead Engineer", team: "Engineering", managerId: "e4" },
  { id: "e6", name: "Frank Green", designation: "Software Engineer", team: "Engineering", managerId: "e5" },
  { id: "e7", name: "Grace Miller", designation: "Software Engineer", team: "Engineering", managerId: "e5" },
  { id: "e8", name: "Henry Wilson", designation: "Finance Manager", team: "Finance", managerId: "e3" },
  { id: "e9", name: "Ivy Chen", designation: "Accountant", team: "Finance", managerId: "e8" },
  { id: "e10", name: "Jack Davis", designation: "Accountant", team: "Finance", managerId: "e8" },
  { id: "e11", name: "Karen Lopez", designation: "HR Manager", team: "People", managerId: "e1" },
  { id: "e12", name: "Leo Martinez", designation: "Recruiter", team: "People", managerId: "e11" }
];

// Initialize store once
declare global {
  var employeeStore: Employee[] | undefined;
}

/**
 * Initialize or retrieve the employee store from globalThis
 * This pattern survives Next.js module hot reloading in development
 */
if (!globalThis.employeeStore) {
  globalThis.employeeStore = initialEmployees.map(e => ({ ...e }));
}

export function getAllEmployees(): Employee[] {
  return globalThis.employeeStore || [];
}

export function setEmployeeManager(id: string, managerId?: string): boolean {
  if (!globalThis.employeeStore) return false;
  
  const emp = globalThis.employeeStore.find(e => e.id === id);
  
  if (!emp) return false;
  
  // Prevent self-management
  if (managerId === id) return false;
  
  emp.managerId = managerId || undefined;
  
  return true;
}

export function resetEmployees(): void {
  globalThis.employeeStore = initialEmployees.map(e => ({ ...e }));
}

