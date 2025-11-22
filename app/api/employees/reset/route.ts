import { NextResponse } from "next/server";
import { resetEmployees, getAllEmployees } from "../../../../lib/data";

export async function POST() {
  try {
    resetEmployees();
    return NextResponse.json({ 
      success: true,
      employees: getAllEmployees() 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to reset employees" },
      { status: 500 }
    );
  }
}
