# NOVO Expense Tracker

A production-ready, offline-first expense management web application built with Next.js, TypeScript, and TailwindCSS.

## Features

- ✅ **Add/Edit/Delete** income and expenses
- ✅ **Monthly filtering** with navigation
- ✅ **Dashboard** with totals and balance
- ✅ **Charts** (pie chart for categories, bar chart for trends)
- ✅ **Dark/Light mode** with system preference detection
- ✅ **Fully responsive** design
- ✅ **PDF Export** using jsPDF and jsPDF-AutoTable
- ✅ **Offline-first** - all data stored in localStorage
- ✅ **TypeScript** for type safety
- ✅ **Clean, reusable components**

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **PDF Export:** jsPDF + jsPDF-AutoTable
- **Icons:** Lucide React
- **Date Utilities:** date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (install via `npm install -g pnpm`)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles and Tailwind imports
├── components/
│   ├── Button.tsx          # Reusable button component
│   ├── Charts.tsx          # Pie and bar charts
│   ├── Header.tsx          # App header with theme toggle
│   ├── Input.tsx           # Reusable input component
│   ├── Modal.tsx           # Modal dialog component
│   ├── MonthFilter.tsx     # Month navigation component
│   ├── Select.tsx          # Reusable select component
│   ├── SummaryCards.tsx    # Income/Expenses/Balance cards
│   ├── ThemeProvider.tsx   # Theme context provider
│   └── TransactionForm.tsx # Add/Edit transaction form
│   ├── TransactionTable.tsx # Transactions table
├── lib/
│   ├── pdfExport.ts        # PDF export functionality
│   ├── storage.ts          # localStorage CRUD helpers
│   └── utils.ts            # Utility functions
└── types/
    └── index.ts            # TypeScript type definitions
```

## Usage

1. **Add Transaction:** Click the "Add Transaction" button in the header
2. **Edit Transaction:** Click the edit icon on any transaction row
3. **Delete Transaction:** Click the delete icon on any transaction row
4. **Filter by Month:** Use the month navigation arrows or click "Today"
5. **Toggle Theme:** Click the moon/sun icon in the header
6. **Export PDF:** Click "Export PDF" button above the transactions table

## Data Storage

All data is stored in the browser's localStorage under the key `novo_expense_tracker_transactions`. No backend or database is required.

## License

MIT