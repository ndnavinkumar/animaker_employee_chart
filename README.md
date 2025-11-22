# Employee Organization Chart

A modern, interactive employee organization chart application built with Next.js, TypeScript, and React.

## ✨ Features

### 📋 Employee List (Left Panel)
- ✅ Search by name, designation, or team
- ✅ Filter by team using dropdown
- ✅ Keyboard navigation (Arrow keys, Home, End, Enter)
- ✅ Collapsible team sections
- ✅ Search term highlighting
- ✅ Grouped by teams

### 🌳 Organization Tree (Right Panel)
- ✅ Hierarchical tree visualization
- ✅ Manager-employee relationships
- ✅ Drag & drop to reorganize reporting structure
- ✅ **Persistent changes via API (survives page refresh during server runtime)**
- ✅ Cycle prevention (no circular reporting)
- ✅ Team filtering
- ✅ Visual connecting lines
- ✅ Automatic layout calculation
- ✅ Reset button to restore original structure

### 🎨 Additional Features
- ✅ Optimistic UI updates
- ✅ **API-based persistence (in-memory store)**
- ✅ Custom CSS animations
- ✅ Team-based color gradients
- ✅ Responsive design
- ✅ Mock API with MSW (no backend needed)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 💾 Data Persistence

The application uses **API routes with in-memory storage** to persist organizational changes:

- **Drag & Drop Changes:** When you reorganize the org chart, a PUT request updates the employee's manager
- **Survives Page Refresh:** Changes persist in the server's memory during runtime
- **Reset Option:** Click the "Reset Chart" button to restore the original organization structure
- **No Database Required:** Data is stored in-memory on the server (resets when server restarts)

### How It Works

1. **Initial Load:** `GET /api/employees` returns all employees from in-memory store
2. **Drag & Drop:** `PUT /api/employees/:id/manager` updates the employee's manager
3. **Optimistic Updates:** UI updates immediately, then syncs with server response
4. **Page Refresh:** Fresh data is fetched from the API with all changes intact
5. **Reset:** `POST /api/employees/reset` restores original data

### API Endpoints

- `GET /api/employees` - Fetch all employees
- `PUT /api/employees/:id/manager` - Update employee's manager
- `POST /api/employees/reset` - Reset to initial data

---

## 📁 Project Structure

```
animaker_employee_chart/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Main page component
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Global styles + custom CSS
│   └── api/employees/       # API routes for data persistence
│       ├── route.ts         # GET /api/employees
│       ├── reset/           # POST /api/employees/reset
│       └── [id]/manager/    # PUT /api/employees/:id/manager
│
├── components/               # React components
│   ├── EmployeeList.tsx     # Left panel: employee list
│   ├── EmployeeTree.tsx     # Right panel: org tree
│   └── ResetButton.tsx      # Reset chart button
│
├── lib/                      # Utilities & logic
│   ├── types.ts             # TypeScript types
│   ├── data.ts              # Mock data + localStorage logic
│   ├── useEmployees.ts      # Employee data hook
│   ├── treeHelpers.ts       # Tree building utilities
│   └── searchHelpers.ts     # Search/filter helpers
│
└── mocks/                    # API mocking (MSW)
    ├── handlers.ts          # Mock API routes
    └── browser.ts           # MSW setup
```

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4 + Custom CSS
- **API Mocking:** MSW (Mock Service Worker)
- **Build Tool:** Turbopack

---

## 📚 Documentation for Developers

### For Junior Developers:
1. **[JUNIOR_DEV_GUIDE.md](./JUNIOR_DEV_GUIDE.md)** - Start here! Quick start guide with learning path
2. **[CODE_STRUCTURE.md](./CODE_STRUCTURE.md)** - Complete architecture guide with diagrams
3. **[OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)** - All optimizations explained

### Code Quality:
- ✅ **Comprehensive comments** - Every function documented
- ✅ **Helper functions** - Complex logic extracted and explained
- ✅ **Type safety** - Full TypeScript coverage
- ✅ **Best practices** - React patterns demonstrated

---

## 🎯 Key Concepts

### Data Flow
```
User Action (search/filter/drag)
  ↓
State Update (React hooks)
  ↓
Data Processing (custom hook)
  ↓
UI Re-render (components)
```

### Tree Building
```
Flat employee list
  ↓
buildEmployeeTree() - Groups by manager
  ↓
Hierarchical tree structure
  ↓
Recursive rendering
```

### Drag & Drop
```
Drag employee
  ↓
Validate (no cycles)
  ↓
Optimistic update
  ↓
API call
  ↓
Success: sync | Error: rollback
```

---

## 🎨 Customization

### Change Theme Colors
Edit `app/globals.css`:
```css
.employee-avatar.engineering {
  background: linear-gradient(135deg, #yourcolor1, #yourcolor2);
}
```

### Add New Employee Field
1. Update `Employee` interface in `lib/types.ts`
2. Add to mock data in `lib/data.ts`
3. Display in components

### Modify Search Logic
Edit filter function in `lib/useEmployees.ts`

---

## 🧪 Mock API

The app uses **MSW (Mock Service Worker)** to simulate a backend:

**Endpoints:**
- `GET /api/employees` - Returns all employees
- `PUT /api/employees/:id/manager` - Updates employee's manager

**Benefits:**
- No backend setup needed
- Works like a real API
- Data persists during session
- Easy to modify in `mocks/handlers.ts`

---

## 📖 Learning Resources

### Concepts Used:
- **React Hooks:** `useState`, `useEffect`, `useMemo`, `useCallback`
- **Custom Hooks:** `useEmployees` for data management
- **TypeScript:** Interfaces and type safety
- **Component Composition:** Small, focused components
- **Optimistic Updates:** Instant UI feedback
- **Drag & Drop:** HTML5 drag API

### Best Practices Demonstrated:
- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Clear naming conventions
- ✅ Comprehensive documentation
- ✅ Error handling with rollback
- ✅ Accessibility (ARIA labels, keyboard nav)

---

## 🐛 Troubleshooting

**Search not working?**
- Check browser console for errors
- Verify `useEmployees` hook is fetching data

**Tree not displaying?**
- Ensure all employees have valid `managerId` references
- Check `buildEmployeeTree()` function

**Drag & drop not working?**
- Verify browser supports HTML5 drag API
- Check `wouldCreateCycle()` validation

**Styles not applying?**
- Run `npm run dev` again
- Check Tailwind CSS is configured correctly

---

## 🤝 Contributing

This is a demo project. Feel free to:
- Experiment with the code
- Learn from the patterns
- Modify for your needs
- Use as a learning resource

---

## 📝 License

This project is for educational purposes.

---

## 🎓 Perfect For Learning:

- ✅ React beginners
- ✅ TypeScript learners
- ✅ Next.js App Router
- ✅ Component composition patterns
- ✅ Custom hooks
- ✅ Drag & drop implementation
- ✅ Optimistic updates
- ✅ State management

---

## 🌟 Highlights

- **Junior-Friendly:** Extensively documented with learning guides
- **Production-Ready Patterns:** Best practices demonstrated throughout
- **No Backend Needed:** Uses MSW for API simulation
- **Modern Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Interactive:** Drag & drop, search, filter, keyboard navigation
- **Well-Organized:** Clear file structure with helper functions

---

**Built with ❤️ for learning and demonstration purposes**
