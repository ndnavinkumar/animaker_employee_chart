"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Employee } from "./types";

interface UseEmployeesOptions {
  initialSearch?: string;
  initialTeam?: string;
}

export function useEmployees(opts: UseEmployeesOptions = {}) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(opts.initialSearch || "");
  const [teamFilter, setTeamFilter] = useState(opts.initialTeam || "");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/employees");
        if (!res.ok) throw new Error("Failed to fetch employees");
        const data = await res.json();
        if (!cancelled) setEmployees(data.employees as Employee[]);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const teams = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => set.add(e.team));
    return Array.from(set).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return employees.filter(e => {
      if (teamFilter && e.team !== teamFilter) return false;
      if (!term) return true;
      return (
        e.name.toLowerCase().includes(term) ||
        e.designation.toLowerCase().includes(term) ||
        e.team.toLowerCase().includes(term)
      );
    });
  }, [employees, search, teamFilter]);

  const updateEmployeeManager = useCallback(async (id: string, managerId?: string) => {
    const prev = employees;
    const prevManager = prev.find(e => e.id === id)?.managerId;
    // optimistic update
    setEmployees(list => list.map(e => e.id === id ? { ...e, managerId } : e));
    try {
      const res = await fetch(`/api/employees/${encodeURIComponent(id)}/manager`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerId: managerId ?? null })
      });
      if (!res.ok) throw new Error(`Failed to update manager (${res.status})`);
      // ensure consistency with server response (optional re-sync)
      const { employee } = await res.json();
      if (employee) {
        setEmployees(list => list.map(e => e.id === id ? employee as Employee : e));
      }
    } catch (err) {
      // revert on failure
      setEmployees(list => list.map(e => e.id === id ? { ...e, managerId: prevManager } : e));
      throw err;
    }
  }, [employees]);

  return {
    employees: filtered,
    allEmployees: employees,
    loading,
    error,
    search,
    setSearch,
    teamFilter,
    setTeamFilter,
    teams,
    updateEmployeeManager
  };
}
