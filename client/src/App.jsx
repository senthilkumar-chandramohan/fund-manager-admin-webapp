import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Bell } from 'lucide-react'

// Import modules
import Sidebar from './modules/Sidebar/Sidebar'
import Dashboard from './modules/Dashboard/Dashboard'
import PensionFundsList from './modules/PensionFunds/PensionFundsList'
import FundDetails from './modules/PensionFunds/FundDetails'
import FundEdit from './modules/PensionFunds/FundEdit'
import CreateFundWizard from './modules/CreateFund/CreateFundWizard'
import InvestmentProposals from './modules/Investments/InvestmentProposals'
import InvestmentDetails from './modules/Investments/InvestmentDetails'
import WorkflowsManagement from './modules/Workflows/WorkflowsManagement'
import WorkflowDetails from './modules/Workflows/WorkflowDetails'
import WorkflowEdit from './modules/Workflows/WorkflowEdit'
import BeneficiariesList from './modules/Beneficiaries/BeneficiariesList'
import BeneficiaryDetails from './modules/Beneficiaries/BeneficiaryDetails'
import BeneficiaryEdit from './modules/Beneficiaries/BeneficiaryEdit'

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [serverStatus, setServerStatus] = useState('Checking...')
  const location = useLocation()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthRes = await axios.get('/api/health')
        setServerStatus('✓ Connected')
      } catch (error) {
        setServerStatus('✗ Disconnected')
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') return 'Dashboard'
    if (path === '/funds') return 'Pension Funds'
    if (path === '/create-fund') return 'Create Fund'
    if (path.startsWith('/fund/') && path.endsWith('/edit')) return 'Edit Fund'
    if (path.startsWith('/fund/')) return 'Fund Details'
    if (path === '/investments') return 'Investment Proposals'
    if (path.startsWith('/investment/')) return 'Investment Details'
    if (path === '/workflows') return 'Workflows'
    if (path.startsWith('/workflow/') && path.endsWith('/edit')) return 'Edit Workflow'
    if (path.startsWith('/workflow/')) return 'Workflow Details'
    if (path === '/beneficiaries') return 'Beneficiaries'
    if (path.startsWith('/beneficiary/') && path.endsWith('/edit')) return 'Edit Beneficiary'
    if (path.startsWith('/beneficiary/')) return 'Beneficiary Details'
    return 'Dashboard'
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />
      
      {/* Main Content Area */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {getPageTitle()}
            </h2>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-slate-100 rounded-lg">
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">Admin User</p>
                  <p className="text-xs text-slate-600">{serverStatus}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screen Content */}
        <div className="p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/funds" element={<PensionFundsList />} />
            <Route path="/fund/:id" element={<FundDetails />} />
            <Route path="/fund/:id/edit" element={<FundEdit />} />
            <Route path="/create-fund" element={<CreateFundWizard />} />
            <Route path="/investments" element={<InvestmentProposals />} />
            <Route path="/investment/:id" element={<InvestmentDetails />} />
            <Route path="/workflows" element={<WorkflowsManagement />} />
            <Route path="/workflow/:id" element={<WorkflowDetails />} />
            <Route path="/workflow/:id/edit" element={<WorkflowEdit />} />
            <Route path="/beneficiaries" element={<BeneficiariesList />} />
            <Route path="/beneficiary/:id" element={<BeneficiaryDetails />} />
            <Route path="/beneficiary/:id/edit" element={<BeneficiaryEdit />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
