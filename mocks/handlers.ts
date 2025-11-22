// MSW handlers for employee API endpoints (dev only)

import { http, HttpResponse, delay } from 'msw';
import { getAllEmployees, setEmployeeManager, resetEmployees } from '../lib/data';

export const handlers = [
  // GET /api/employees -> list employees
  http.get('/api/employees', async () => {
    await delay(200); // Simulate network latency
    return HttpResponse.json({ employees: getAllEmployees() });
  }),
  // PUT /api/employees/:id/manager -> update manager (cycle + self validation)
  http.put('/api/employees/:id/manager', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json().catch(() => ({}));
    const { managerId } = body as { managerId?: string | null };
    
    // Validate: prevent self-management
    if (managerId && managerId === id) {
      return new HttpResponse(
        JSON.stringify({ error: 'Employee cannot manage themselves' }), 
        { status: 400 }
      );
    }
    
    // Prevent cycles
    const allEmployees = getAllEmployees();
    const parent: Record<string, string | undefined> = {};
    allEmployees.forEach(e => { if (e.managerId) parent[e.id] = e.managerId; });
    let cur = managerId;
    while (cur) {
      if (cur === id) {
        return new HttpResponse(
          JSON.stringify({ error: 'Cycle detected' }), 
          { status: 400 }
        );
      }
      cur = parent[cur];
    }
    
    // Update the employee's manager in the in-memory store
    const ok = setEmployeeManager(id, managerId || undefined);
    if (!ok) {
      return new HttpResponse(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }
    
    const employee = getAllEmployees().find(e => e.id === id);
    return HttpResponse.json({ employee });
  }),

  // POST /api/employees/reset -> reset store
  http.post('/api/employees/reset', async () => {
    resetEmployees();
    return HttpResponse.json({ 
      success: true,
      employees: getAllEmployees() 
    });
  })
];
