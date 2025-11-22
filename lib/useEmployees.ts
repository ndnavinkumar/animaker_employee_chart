"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Employee } from "./types";
// Hook options
interface UseEmployeesOptions {
  /** Initial search query */
  initialSearch?: string;
  /** Initial team filter */
  initialTeam?: string;
}

// Manage employee data + search/filter + manager updates
export function useEmployees(opts: UseEmployeesOptions = {}) {
  // Employee data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and search state
  const [search, setSearch] = useState(opts.initialSearch || "");
  const [teamFilter, setTeamFilter] = useState(opts.initialTeam || "");

  // Fetch employees on mount
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/employees");
        
        if (!res.ok) {
          throw new Error("Failed to fetch employees");
        }
        
        const data = await res.json();
        
        // Only update if component is still mounted
        if (!cancelled) {
          setEmployees(data.employees as Employee[]);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    
    // Cleanup: prevent state updates after unmount
    return () => { cancelled = true; };
  }, []);

  // Unique team names
  const teams = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => set.add(e.team));
    return Array.from(set).sort();
  }, [employees]);

  // Filter + search across name/designation/team
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    
    return employees.filter(e => {
      // Apply team filter
      if (teamFilter && e.team !== teamFilter) {
        return false;
      }
      
      // If no search term, include all (after team filter)
      if (!term) {
        return true;
      }
      
      // Search in name, designation, or team
      return (
        e.name.toLowerCase().includes(term) ||
        e.designation.toLowerCase().includes(term) ||
        e.team.toLowerCase().includes(term)
      );
    });
  }, [employees, search, teamFilter]);

  // Optimistically update manager then sync; revert on failure
  const updateEmployeeManager = useCallback(async (id: string, managerId?: string) => {
    const prev = employees;
    const prevManager = prev.find(e => e.id === id)?.managerId;
    
    // Step 1: Optimistic update for instant UI feedback
    setEmployees(list => list.map(e => 
      e.id === id ? { ...e, managerId } : e
    ));
    
    try {
      // Step 2: Send update to backend
      const res = await fetch(`/api/employees/${encodeURIComponent(id)}/manager`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId: managerId ?? null })
      });
      
      if (!res.ok) {
        throw new Error(`Failed to update manager (${res.status})`);
      }
      
      // Step 3: Sync with server response to ensure consistency
      const { employee } = await res.json();
      if (employee) {
        setEmployees(list => list.map(e => 
          e.id === id ? employee as Employee : e
        ));
      }
    } catch (err) {
      // Step 4: Revert to previous state on failure
      setEmployees(list => list.map(e => 
        e.id === id ? { ...e, managerId: prevManager } : e
      ));
      throw err;
    }
  }, [employees]);

  return {
    employees: filtered,        // Filtered/searched employees for display
    allEmployees: employees,    // All employees (unfiltered) for tree building
    loading,                    // True while fetching data
    error,                      // Error message if fetch failed
    search,                     // Current search query
    setSearch,                  // Update search query
    teamFilter,                 // Current team filter
    setTeamFilter,              // Update team filter
    teams,                      // Array of all team names
    updateEmployeeManager       // Function to reassign employee's manager
  };
}
