export const pensionFunds = [
  { id: '1', name: 'Johnson Family Pension', corpus: '125,430', maturity: '2028-06-15', status: 'Active', beneficiaries: 3, roi: '7.8' },
  { id: '2', name: 'Smith Retirement Fund', corpus: '89,200', maturity: '2026-03-22', status: 'Active', beneficiaries: 2, roi: '9.2' },
  { id: '3', name: 'Davis Pension Plan', corpus: '203,890', maturity: '2030-11-10', status: 'Active', beneficiaries: 4, roi: '8.1' },
  { id: '4', name: 'Martinez Senior Fund', corpus: '67,500', maturity: '2025-08-05', status: 'Matured', beneficiaries: 1, roi: '6.9' },
]

export const investmentProposals = [
  { id: '1', fundName: 'Johnson Family Pension', aiScore: '92', expectedROI: '8.5', risk: 'MEDIUM', created: '2h ago', expiresIn: '46h' },
  { id: '2', fundName: 'Smith Retirement Fund', aiScore: '88', expectedROI: '9.1', risk: 'HIGH', created: '5h ago', expiresIn: '43h' },
  { id: '3', fundName: 'Wilson Trust Fund', aiScore: '85', expectedROI: '7.2', risk: 'LOW', created: '1d ago', expiresIn: '23h' },
]

export const workflows = [
  { id: '1', fundName: 'Johnson Family Pension', type: 'Investment Allocation', status: 'Running', lastRun: '2h ago', nextRun: '6d 22h' },
  { id: '2', fundName: 'Smith Retirement Fund', type: 'Pension Distribution', status: 'Success', lastRun: '1d ago', nextRun: '29d' },
  { id: '3', fundName: 'Davis Pension Plan', type: 'Investment Allocation', status: 'Failed', lastRun: '3h ago', nextRun: 'Manual' },
]

export const dashboardStats = {
  totalAUM: '12,456,789',
  activeAccounts: '1,234',
  avgROI: '8.42',
  pendingApprovals: '5'
}

export const menuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'funds', label: 'Pension Funds' },
  { id: 'create-fund', label: 'Create Fund' },
  { id: 'investments', label: 'Investments' },
  { id: 'workflows', label: 'Workflows' },
  { id: 'beneficiaries', label: 'Beneficiaries' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' },
]
