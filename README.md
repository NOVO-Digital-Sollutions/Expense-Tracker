# NOVO Expense Tracker

A production-ready, offline-first expense management web application built with Next.js, TypeScript, and TailwindCSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- ✅ **Multi-Account Support** - Manage multiple accounts (Wallet, Bank, Credit Card)
- ✅ **Add/Edit/Delete** income and expenses
- ✅ **Transfer Money** between accounts
- ✅ **Monthly filtering** with navigation
- ✅ **Dashboard** with totals and balance
- ✅ **Charts** (pie chart for categories, bar chart for trends)
- ✅ **Dark/Light mode** with system preference detection
- ✅ **Fully responsive** design
- ✅ **PDF Export** using jsPDF and jsPDF-AutoTable
- ✅ **Offline-first** - all data stored in localStorage
- ✅ **TypeScript** for type safety
- ✅ **Clean, reusable components**

## 🚀 Live Demo

Visit the live application: [GitHub Pages](https://your-username.github.io/novo-expense-tracker)

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Charts:** Recharts
- **PDF Export:** jsPDF + jsPDF-AutoTable
- **Icons:** Lucide React
- **Date Utilities:** date-fns
- **Package Manager:** pnpm

## 📋 Prerequisites

- Node.js 18+ 
- pnpm (install via `npm install -g pnpm`)

## 🏃 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/novo-expense-tracker.git
cd novo-expense-tracker

# Install dependencies
pnpm install
```

### Development

```bash
# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build static files
pnpm build
```

The static files will be in the `out` directory.

## 📦 Deployment to GitHub Pages

### Quick Setup (Recommended)

1. **Push your code to GitHub** repository

2. **Enable GitHub Pages**:
   - Go to your repository → Settings → Pages
   - Under "Source", select "GitHub Actions"

3. **The workflow will automatically deploy** when you push to the `main` branch

That's it! The GitHub Actions workflow (`.github/workflows/deploy.yml`) is already configured.

### If Your Repository is NOT in the Root (e.g., `/repo-name`)

If your GitHub Pages URL is `https://username.github.io/repo-name/` (note the `/repo-name` at the end), you need to update `next.config.js`:

1. **Uncomment and update** the basePath and assetPrefix:
   ```javascript
   basePath: '/your-repo-name',
   assetPrefix: '/your-repo-name',
   ```
   
2. Replace `your-repo-name` with your actual repository name

3. **Push the changes** - the workflow will automatically redeploy

### Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Update `next.config.js`** with your repository name (if deploying to subdirectory)
2. **Build the project**: `pnpm build`
3. **Deploy the `out` folder** using GitHub CLI or by committing to `gh-pages` branch

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Main dashboard page
│   └── globals.css         # Global styles and Tailwind imports
├── components/
│   ├── AccountForm.tsx     # Account creation/edit form
│   ├── AccountManager.tsx  # Account list and management UI
│   ├── Button.tsx          # Reusable button component
│   ├── Charts.tsx          # Pie and bar charts
│   ├── Header.tsx          # App header with theme toggle
│   ├── Input.tsx           # Reusable input component
│   ├── Modal.tsx           # Modal dialog component
│   ├── MonthFilter.tsx     # Month navigation component
│   ├── Select.tsx          # Reusable select component
│   ├── SummaryCards.tsx    # Income/Expenses/Balance cards
│   ├── ThemeProvider.tsx   # Theme context provider
│   ├── TransactionForm.tsx # Add/Edit transaction form
│   └── TransactionTable.tsx # Transactions table
├── lib/
│   ├── accounts.ts         # Account storage CRUD helpers
│   ├── balance.ts          # Balance calculation utilities
│   ├── pdfExport.ts        # PDF export functionality
│   ├── storage.ts          # Transaction storage CRUD helpers
│   └── utils.ts            # Utility functions
├── types/
│   └── index.ts            # TypeScript type definitions
└── public/                 # Static assets
```

## 💡 Usage

### Account Management

1. **Create Account:** Click "Accounts" button → "Add Account"
   - Enter account name (e.g., "Wallet", "Bank Account 1")
   - Select account type (Wallet, Bank Account, or Credit Card)
   - Set initial balance
   
2. **Edit Account:** Click "Accounts" → Edit icon on any account
   - Update account name and type
   - Balance updates automatically through transactions

3. **Delete Account:** Click "Accounts" → Delete icon on any account

### Transactions

1. **Add Transaction:** Click "Add Transaction" button
   - Select account
   - Choose type: Income, Expense, or Transfer
   - For transfers: Select source and destination accounts
   - Fill in amount, description, and date
   - Select category (not required for transfers)

2. **Edit Transaction:** Click edit icon on any transaction row

3. **Delete Transaction:** Click delete icon on any transaction row

### Transfers

- Select "Transfer" as transaction type
- Choose "From Account" (source)
- Choose "To Account" (destination)
- Enter amount and description
- Both account balances update automatically

### Dashboard Features

- **Monthly Filter:** Use arrow buttons to navigate between months
- **Summary Cards:** View income, expenses, monthly balance, and total balance
- **Account Balances:** See all account balances in the dashboard
- **Charts:** 
  - Pie chart showing expense breakdown by category
  - Bar chart showing 6-month income vs expenses trend
- **Export PDF:** Download monthly report as PDF

## 💾 Data Storage

All data is stored in the browser's localStorage:
- **Accounts:** `novo_expense_tracker_accounts`
- **Transactions:** `novo_expense_tracker_transactions`
- **Theme:** `theme`

No backend or database is required. Data persists in your browser and is not synced across devices.

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you have any questions or issues, please open an issue on GitHub.

## 🎯 Roadmap

- [ ] Data export/import (JSON)
- [ ] Recurring transactions
- [ ] Budget planning
- [ ] Multiple currencies
- [ ] Transaction tags

---

Made with ❤️ using Next.js and TypeScript