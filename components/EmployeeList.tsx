"use client";
import { useEmployees } from "../lib/useEmployees";
import { Employee } from "../lib/types";
import { groupEmployeesByTeam, findSearchMatch } from "../lib/searchHelpers";
import { useState, useMemo, useCallback, useEffect } from "react";
// Component props
interface EmployeeListProps {
  /** Callback when an employee is selected */
  onSelect?: (employee: Employee) => void;
  /** ID of currently selected employee */
  selectedId?: string;
  /** Callback when team filter changes */
  onTeamFilterChange?: (team: string) => void;
}

// Employee list with search/filter + keyboard nav
export function EmployeeList({ onSelect, selectedId, onTeamFilterChange }: EmployeeListProps) {
  // Get employee data and filter controls from custom hook
  const { employees, loading, error, search, setSearch, teamFilter, setTeamFilter, teams } = useEmployees();
  
  // Component state
  const [expanded, setExpanded] = useState(true); // Controls if search/filter panel is visible
  const [collapsedTeams, setCollapsedTeams] = useState<Record<string, boolean>>({}); // Tracks which team sections are collapsed
  const [focusIndex, setFocusIndex] = useState<number>(-1); // Current keyboard-focused employee index

  const total = employees.length;

  // Group employees by team for organized display
  const teamsWithEmployees = useMemo(() => {
    return groupEmployeesByTeam(employees);
  }, [employees]);

  // Toggle team collapse
  const toggleTeam = useCallback((team: string) => {
    setCollapsedTeams(prev => ({ ...prev, [team]: !prev[team] }));
  }, []);

  // Sync team filter with parent
  useEffect(() => {
    onTeamFilterChange?.(teamFilter);
  }, [teamFilter, onTeamFilterChange]);

  // Flatten employees for keyboard nav
  const flatEmployees = useMemo(() => teamsWithEmployees.flatMap((g: [string, Employee[]]) => g[1]), [teamsWithEmployees]);

  // Keyboard navigation (arrows/home/end/enter)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Don't handle keys while loading or in error state
    if (loading || error) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIndex(i => Math.min(flatEmployees.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIndex(i => Math.max(0, i - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusIndex(flatEmployees.length - 1);
    } else if (e.key === 'Enter' && focusIndex >= 0) {
      e.preventDefault();
      const emp = flatEmployees[focusIndex];
      if (emp) onSelect?.(emp);
    }
  }, [flatEmployees, focusIndex, loading, error, onSelect]);

  const normalizedSearch = search.trim().toLowerCase();
  
  // Highlight search term in text
  const highlight = useCallback((text: string) => {
    const match = findSearchMatch(text, normalizedSearch);
    
    if (!match) {
      return text;
    }
    
    return (
      <>
        {match.before}
        <mark className="search-highlight">{match.match}</mark>
        {match.after}
      </>
    );
  }, [normalizedSearch]);

  return (
    <div className="flex flex-col h-full bg-white employee-list-container" onKeyDown={handleKeyDown} tabIndex={0} aria-label="Employee list" role="listbox">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-200 px-3 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-base text-gray-800 tracking-tight">Employees</h2>
          <span className="text-xs text-gray-500">{total}</span>
        </div>
        {expanded && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-2 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 placeholder:text-gray-400"
              />
              <span className="absolute left-2 top-2 text-gray-400 text-sm" aria-hidden>🔍</span>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="teamSelect" className="text-xs font-medium text-gray-600">Filter by team</label>
              <select
                id="teamSelect"
                value={teamFilter}
                onChange={e => setTeamFilter(e.target.value)}
                className="w-full px-2 py-2 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
              >
                <option value="">All Teams</option>
                {teams.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >{expanded ? "Collapse" : "Expand"}</button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading && <p className="px-3 py-2 text-sm text-gray-500">Loading…</p>}
        {error && <p className="px-3 py-2 text-sm text-red-600">{error}</p>}
        {!loading && !error && employees.length === 0 && (
          <p className="px-3 py-2 text-sm text-gray-500">No employees</p>
        )}
        <div>
          {teamsWithEmployees.map(([team, list]: [string, Employee[]]) => {
            const collapsed = collapsedTeams[team];
            return (
              <div key={team} className="border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => toggleTeam(team)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 tracking-tight"
                  aria-expanded={!collapsed}
                >
                  <span className="truncate">{team}</span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="text-[11px]">{list.length}</span>
                    <span className="text-sm">{collapsed ? '▸' : '▾'}</span>
                  </span>
                </button>
                {!collapsed && (
                  <ul className="divide-y divide-gray-100" role="group" aria-label={`${team} team`}>
                    {list.map((emp: Employee) => {
                      const idx = flatEmployees.indexOf(emp);
                      const focused = idx === focusIndex;
                      return (
                        <li
                          key={emp.id}
                          role="option"
                          aria-selected={selectedId === emp.id}
                          onClick={() => onSelect?.(emp)}
                          onMouseEnter={() => setFocusIndex(idx)}
                          className={`group px-3 py-2 cursor-pointer text-sm transition-colors flex flex-col ${
                            selectedId === emp.id ? 'bg-blue-50' : focused ? 'bg-gray-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <p className="font-semibold text-gray-800 truncate group-hover:text-gray-900" title={emp.name}>{highlight(emp.name)}</p>
                          <p className="text-gray-600 leading-tight truncate text-xs" title={emp.designation}>{highlight(emp.designation)}</p>
                          <p className="text-gray-500 text-[11px] mt-0.5" title={emp.team}>{highlight(emp.team)}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
