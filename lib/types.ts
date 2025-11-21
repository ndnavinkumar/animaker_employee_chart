export interface Employee {
  id: string;
  name: string;
  designation: string;
  team: string;
  managerId?: string; // undefined / null means top-level
}

export interface EmployeeResponse {
  employees: Employee[];
}
