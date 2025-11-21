"use client";
import { useEffect, useMemo, useState, useLayoutEffect, useRef, useCallback } from "react";
import { Employee } from "../lib/types";
import { useEmployees } from "../lib/useEmployees";

interface EmployeeTreeProps {
  focusId?: string | null;
  onSelect?: (emp: Employee) => void;
  teamFilter?: string;
}

interface TreeNode extends Employee {
  children: TreeNode[];
}

function buildTree(employees: Employee[]): TreeNode[] {
  const map: Record<string, TreeNode> = {};
  employees.forEach(e => { map[e.id] = { ...e, children: [] }; });
  const roots: TreeNode[] = [];
  employees.forEach(e => {
    if (e.managerId) {
      const p = map[e.managerId];
      if (p) p.children.push(map[e.id]);
      else roots.push(map[e.id]);
    } else {
      roots.push(map[e.id]);
    }
  });
  const sortRec = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(n => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 3).toUpperCase();
}

function OrgNode({ node, focusId, onSelect, onDropOn }: { node: TreeNode; focusId?: string | null; onSelect?: (emp: Employee) => void; onDropOn: (dragId: string, targetId: string) => void }) {
  const isFocused = focusId === node.id;
  const hasChildren = node.children.length > 0;
  const childrenRef = useRef<HTMLDivElement | null>(null);
  const childRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [hLine, setHLine] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [isOver, setIsOver] = useState(false);

  const recompute = useCallback(() => {
    if (!childrenRef.current || node.children.length === 0) {
      setHLine({ left: 0, width: 0 });
      return;
    }
    const containerRect = childrenRef.current.getBoundingClientRect();
    const centers: number[] = [];
    node.children.forEach(c => {
      const el = childRefs.current[c.id];
      if (!el) return;
      const r = el.getBoundingClientRect();
      centers.push(r.left - containerRect.left + r.width / 2);
    });
    if (centers.length >= 2) {
      const min = Math.min(...centers);
      const max = Math.max(...centers);
      setHLine({ left: min, width: Math.max(0, max - min) });
    } else {
      setHLine({ left: 0, width: 0 });
    }
  }, [node.children]);

  useLayoutEffect(() => {
    const id = requestAnimationFrame(() => recompute());
    return () => cancelAnimationFrame(id);
  }, [recompute]);

  useEffect(() => {
    const onResize = () => recompute();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [recompute]);

  return (
    <div className="flex flex-col items-center">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', node.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(e) => { e.preventDefault(); setIsOver(true); e.dataTransfer.dropEffect = 'move'; }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => { e.preventDefault(); setIsOver(false); const dragId = e.dataTransfer.getData('text/plain'); if (dragId) onDropOn(dragId, node.id); }}
        onClick={() => onSelect?.(node)}
        className={`relative bg-white border-2 rounded-lg p-3 shadow-sm cursor-pointer transition-all hover:shadow-md min-w-[200px] max-w-[220px] ${
          isFocused ? "border-blue-500 ring-2 ring-blue-200" : isOver ? 'border-green-500 ring-2 ring-green-200' : "border-gray-300"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded flex-shrink-0 flex items-center justify-center text-white font-semibold">
            {initials(node.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-gray-900 leading-tight truncate" title={node.name}>{node.name}</h3>
            <p className="text-xs text-gray-600 mt-1 leading-tight truncate" title={node.designation}>{node.designation}</p>
          </div>
        </div>
      </div>

      {hasChildren && (
        <>
          <div className="w-px h-6 bg-gray-400"></div>
          <div ref={childrenRef} className="relative flex items-start justify-center gap-6 px-3">
            {hLine.width > 0 && (
              <div className="absolute top-0 h-px bg-gray-400" style={{ left: hLine.left, width: hLine.width }} />
            )}
            {node.children.map(child => (
              <div key={child.id} ref={el => { childRefs.current[child.id] = el; }} className="flex flex-col items-center">
                <div className="w-px h-6 bg-gray-400"></div>
                <OrgNode node={child} focusId={focusId} onSelect={onSelect} onDropOn={onDropOn} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function EmployeeTree({ focusId, onSelect, teamFilter }: EmployeeTreeProps) {
  const { allEmployees, loading, error, updateEmployeeManager } = useEmployees();

  const visibleEmployees = useMemo(() => {
    if (!teamFilter) return allEmployees;
    return allEmployees.filter(e => e.team === teamFilter);
  }, [allEmployees, teamFilter]);
  const tree = useMemo(() => buildTree(visibleEmployees), [visibleEmployees]);

  const handleDropOn = useCallback(async (dragId: string, targetId: string) => {
    if (dragId === targetId) return;
    // Prevent cycles: target cannot be a descendant of dragged
    const parent: Record<string, string | undefined> = {};
    allEmployees.forEach(e => { if (e.managerId) parent[e.id] = e.managerId; });
    let cur = targetId;
    while (cur) {
      if (cur === dragId) return; // would create cycle
      cur = parent[cur] || '';
    }
    try {
      await updateEmployeeManager(dragId, targetId);
      const updated = allEmployees.find(e => e.id === dragId);
      if (updated) onSelect?.({ ...updated, managerId: targetId });
    } catch (err) {
      console.error(err);
    }
  }, [allEmployees, onSelect, updateEmployeeManager]);

  return (
    <div className="flex flex-col h-full">
      {loading && <p className="text-sm text-gray-500">Loading hierarchy…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
          <div className="min-w-max flex justify-center">
            {tree.map(root => (
              <OrgNode key={root.id} node={root} focusId={focusId} onSelect={onSelect} onDropOn={handleDropOn} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
