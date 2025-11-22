import { Employee } from "./types";
// Tree node with children
export interface TreeNode extends Employee {
  children: TreeNode[];
}
// Build hierarchical tree from flat list via managerId
export function buildEmployeeTree(employees: Employee[]): TreeNode[] {
  // Create a map of all employees as tree nodes
  const map: Record<string, TreeNode> = {};
  employees.forEach(emp => {
    map[emp.id] = { ...emp, children: [] };
  });
  
  // Connect children to parents
  const roots: TreeNode[] = [];
  employees.forEach(emp => {
    if (emp.managerId) {
      const parent = map[emp.managerId];
      if (parent) {
        parent.children.push(map[emp.id]);
      } else {
        // Parent not found in current set, treat as root
        roots.push(map[emp.id]);
      }
    } else {
      // No manager means top-level employee
      roots.push(map[emp.id]);
    }
  });
  
  // Sort recursively by name
  const sortRecursive = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => sortRecursive(node.children));
  };
  sortRecursive(roots);
  
  return roots;
}

// Generate initials (up to 3 letters)
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

// True if assigning dragId under targetId creates a cycle
export function wouldCreateCycle(
  dragId: string, 
  targetId: string, 
  allEmployees: Employee[]
): boolean {
  if (dragId === targetId) {
    return true; // Self-management
  }
  
  // Build parent lookup map
  const parentMap: Record<string, string | undefined> = {};
  allEmployees.forEach(emp => {
    if (emp.managerId) {
      parentMap[emp.id] = emp.managerId;
    }
  });
  
  // Walk up from target to see if we encounter dragId
  let current = targetId;
  while (current) {
    if (current === dragId) {
      return true; // Would create a cycle
    }
    current = parentMap[current] || '';
  }
  
  return false;
}
