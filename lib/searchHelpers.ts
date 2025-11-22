import { Employee } from "./types";
// Group employees by team (sorted)
export function groupEmployeesByTeam(employees: Employee[]): [string, Employee[]][] {
  const map: Record<string, Employee[]> = {};
  
  for (const employee of employees) {
    if (!map[employee.team]) {
      map[employee.team] = [];
    }
    map[employee.team].push(employee);
  }
  
  return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
}

// Find search match boundaries for highlighting
export function findSearchMatch(text: string, searchTerm: string): { before: string; match: string; after: string } | null {
  if (!searchTerm) return null;
  
  const normalized = text.toLowerCase();
  const normalizedSearch = searchTerm.toLowerCase();
  const index = normalized.indexOf(normalizedSearch);
  
  if (index === -1) return null;
  
  return {
    before: text.slice(0, index),
    match: text.slice(index, index + searchTerm.length),
    after: text.slice(index + searchTerm.length)
  };
}
