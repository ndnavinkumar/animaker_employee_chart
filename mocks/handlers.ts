import { http, HttpResponse, delay } from 'msw';
import { employees } from '../lib/data';
import { Employee } from '../lib/types';

// In-memory mutable copy so PUT updates persist during session
const store: Employee[] = employees.map(e => ({ ...e }));

export const handlers = [
  http.get('/api/employees', async () => {
    await delay(200); // simulate network latency
    return HttpResponse.json({ employees: store });
  }),
  http.put('/api/employees/:id/manager', async ({ params, request }) => {
    const id = params.id as string;
    const body = await request.json().catch(() => ({}));
    const { managerId } = body as { managerId?: string | null };
    const target = store.find(e => e.id === id);
    if (!target) {
      return new HttpResponse(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }
    // Prevent self-manager or cycles (simple check: managerId not equal id)
    if (managerId && managerId === id) {
      return new HttpResponse(JSON.stringify({ error: 'Employee cannot manage themselves' }), { status: 400 });
    }
    target.managerId = managerId || undefined;
    return HttpResponse.json({ employee: target });
  })
];
