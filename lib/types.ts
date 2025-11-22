export interface Employee {
  id: string;        // Unique identifier
  name: string;      // Full name
  designation: string; // Role/title
  team: string;      // Team/department
  managerId?: string; // Manager employee id (undefined for top-level)
}
