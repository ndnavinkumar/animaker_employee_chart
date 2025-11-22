"use client";
import { useEffect, useMemo, useState, useLayoutEffect, useRef, useCallback } from "react";
import { Employee } from "../lib/types";
import { useEmployees } from "../lib/useEmployees";
import { buildEmployeeTree, getInitials, wouldCreateCycle, TreeNode } from "../lib/treeHelpers";
// Component props
interface EmployeeTreeProps {
  /** ID of employee to highlight/focus */
  focusId?: string | null;
  /** Callback when an employee is selected */
  onSelect?: (emp: Employee) => void;
  /** Team name to filter the tree by */
  teamFilter?: string;
}

// Single org chart node with drag/drop
function OrgNode({ node, focusId, onSelect, onDropOn }: { 
  node: TreeNode; 
  focusId?: string | null; 
  onSelect?: (emp: Employee) => void; 
  onDropOn: (dragId: string, targetId: string) => void;
}) {
  // State management
  const isFocused = focusId === node.id;
  const hasChildren = node.children.length > 0;
  const [isOver, setIsOver] = useState(false); // Drag-over state
  
  // Refs for calculating connecting line positions
  const childrenRef = useRef<HTMLDivElement | null>(null);
  const childRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // State for horizontal connecting line position and width
  const [hLine, setHLine] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Compute horizontal connecting line
  const recompute = useCallback(() => {
    // No line needed if no children
    if (!childrenRef.current || node.children.length === 0) {
      setHLine({ left: 0, width: 0 });
      return;
    }
    
    const containerRect = childrenRef.current.getBoundingClientRect();
    const centers: number[] = [];
    
    // Calculate center position of each child node
    node.children.forEach((c: TreeNode) => {
      const el = childRefs.current[c.id];
      if (!el) return;
      
      const r = el.getBoundingClientRect();
      // Get horizontal center relative to container
      centers.push(r.left - containerRect.left + r.width / 2);
    });
    
    // Draw line from leftmost to rightmost child center
    if (centers.length >= 2) {
      const min = Math.min(...centers);
      const max = Math.max(...centers);
      setHLine({ left: min, width: Math.max(0, max - min) });
    } else {
      setHLine({ left: 0, width: 0 });
    }
  }, [node.children]);

  // Recompute after render
  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => recompute());
    return () => cancelAnimationFrame(id);
  }, [recompute]);

  // Recompute on resize
  useEffect(() => {
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recompute]);

  return (
    <div className="flex flex-col items-center">
      <div
        draggable
        // Start drag: store employee ID in transfer data
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', node.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        // Drag over: allow drop and show visual feedback
        onDragOver={(e) => { 
          e.preventDefault(); 
          setIsOver(true); 
          e.dataTransfer.dropEffect = 'move'; 
        }}
        // Drag leaves: remove visual feedback
        onDragLeave={() => setIsOver(false)}
        // Drop: reassign employee to new manager
        onDrop={(e) => { 
          e.preventDefault(); 
          setIsOver(false); 
          const dragId = e.dataTransfer.getData('text/plain'); 
          if (dragId) onDropOn(dragId, node.id); 
        }}
        onClick={() => onSelect?.(node)}
        className={`tree-node-card relative bg-white border-2 rounded-lg p-3 shadow-sm cursor-pointer min-w-[200px] max-w-[220px] ${
          isFocused ? "focused border-blue-500 ring-2 ring-blue-200" : isOver ? 'drop-target border-green-500 ring-2 ring-green-200' : "border-gray-300"
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Team-based avatar */}
          <div className={`employee-avatar ${node.team.toLowerCase()} w-12 h-12 rounded shrink-0 flex items-center justify-center text-white font-semibold`}>
            {getInitials(node.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 leading-tight truncate" title={node.name}>{node.name}</h3>
            <p className="text-xs text-gray-600 mt-1 leading-tight truncate" title={node.designation}>{node.designation}</p>
          </div>
        </div>
      </div>

      {/* Children + lines */}
      {hasChildren && (
        <>
          {/* Vertical line from parent to horizontal line */}
          <div className="org-line-vertical h-6"></div>
          
          {/* Container for children and horizontal connecting line */}
          <div ref={childrenRef} className="relative flex items-start justify-center gap-6 px-3">
            {/* Horizontal line connecting all children */}
            {hLine.width > 0 && (
              <div className="org-line-horizontal absolute top-0" style={{ left: hLine.left, width: hLine.width }} />
            )}
            
            {/* Render each child node */}
            {node.children.map((child: TreeNode) => (
              <div key={child.id} ref={el => { childRefs.current[child.id] = el; }} className="flex flex-col items-center">
                {/* Vertical line */}
                <div className="org-line-vertical h-6"></div>
                {/* Child node */}
                <OrgNode node={child} focusId={focusId} onSelect={onSelect} onDropOn={onDropOn} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Organization tree with drag/drop + cycle prevention
export function EmployeeTree({ focusId, onSelect, teamFilter }: EmployeeTreeProps) {
  const { allEmployees, loading, error, updateEmployeeManager } = useEmployees();

  // Filter employees by team if filter is active
  const visibleEmployees = useMemo(() => {
    if (!teamFilter) return allEmployees;
    return allEmployees.filter(e => e.team === teamFilter);
  }, [allEmployees, teamFilter]);
  
  // Build hierarchical tree from flat employee list
  const tree = useMemo(() => buildEmployeeTree(visibleEmployees), [visibleEmployees]);

  // Handle drop (prevent cycles)
  const handleDropOn = useCallback(async (dragId: string, targetId: string) => {
    // Can't assign employee to themselves
    if (dragId === targetId) return;
    
    // Prevent creating circular reporting structure
    // e.g., if A reports to B, then B can't report to A
    if (wouldCreateCycle(dragId, targetId, allEmployees)) {
      console.warn('Cannot reassign: would create circular reporting structure');
      return;
    }
    
    try {
      // Update employee's manager in backend
      await updateEmployeeManager(dragId, targetId);
      
      // Update selection to show the updated employee
      const updated = allEmployees.find(e => e.id === dragId);
      if (updated) {
        onSelect?.({ ...updated, managerId: targetId });
      }
    } catch (err) {
      console.error('Failed to update manager:', err);
    }
  }, [allEmployees, onSelect, updateEmployeeManager]);

  return (
    <div className="flex flex-col h-full">
      {/* Loading */}
      {loading && <p className="text-sm text-gray-500">Loading hierarchy…</p>}
      
      {/* Error */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      
      {/* Chart */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
          <div className="min-w-max flex justify-center">
            {/* Root nodes */}
            {tree.map((root: TreeNode) => (
              <OrgNode key={root.id} node={root} focusId={focusId} onSelect={onSelect} onDropOn={handleDropOn} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
