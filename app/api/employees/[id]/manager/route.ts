import { NextResponse, NextRequest } from "next/server";
import { getAllEmployees, setEmployeeManager } from "../../../../../lib/data";
import { Employee } from "../../../../../lib/types";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const managerId = (body?.managerId ?? undefined) as string | undefined;

    // Prevent self-manager
    if (managerId && managerId === id) {
      return NextResponse.json({ error: "Employee cannot manage themselves" }, { status: 400 });
    }

    // Prevent cycles (walk up ancestors of manager)
    const parent: Record<string, string | undefined> = {};
    (getAllEmployees() as Employee[]).forEach((e: Employee) => { if (e.managerId) parent[e.id] = e.managerId; });
    let cur = managerId;
    while (cur) {
      if (cur === id) {
        return NextResponse.json({ error: "Cycle detected" }, { status: 400 });
      }
      cur = parent[cur];
    }

    const ok = setEmployeeManager(id, managerId);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const employee = (getAllEmployees() as Employee[]).find((e: Employee) => e.id === id);
    return NextResponse.json({ employee });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
