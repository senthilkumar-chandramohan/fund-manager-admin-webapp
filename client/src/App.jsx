import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Bell } from 'lucide-react'

// Import modules
import Sidebar from './modules/Sidebar/Sidebar'
import Dashboard from './modules/Dashboard/Dashboard'
import PensionFundsList from './modules/PensionFunds/PensionFundsList'
import CreateFundWizard from './modules/CreateFund/CreateFundWizard'
import InvestmentProposals from './modules/Investments/InvestmentProposals'
import WorkflowsManagement from './modules/Workflows/WorkflowsManagement'

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [serverStatus, setServerStatus] = useState('Checking...')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthRes = await axios.get('/api/health')
        setServerStatus('✓ Connected')
      } catch (error) {
        setServerStatus('✗ Disconnected')
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Screen title mapping
  const screenTitles = {
    dashboard: 'Dashboard',
    funds: 'Pension Funds',
    'create-fund': 'Create Fund',
    investments: 'Investment Proposals',
    workflows: 'Workflows',
    beneficiaries: 'Beneficiaries',
    reports: 'Reports',
    settings: 'Settings'
  }

  // Render content based on current screen
  const renderContent = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <Dashboard setCurrentScreen={setCurrentScreen} />
      case 'funds':
        return <PensionFundsList setCurrentScreen={setCurrentScreen} />
      case 'create-fund':
        return <CreateFundWizard />
      case 'investments':
        return <InvestmentProposals />
      case 'workflows':
        return <WorkflowsManagement />
      case 'beneficiaries':
      case 'reports':
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{screenTitles[currentScreen]}</h2>
            <p className="text-slate-600 mt-2">Coming soon...</p>
          </div>
        )
      default:
        return <Dashboard setCurrentScreen={setCurrentScreen} />
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        currentScreen={currentScreen} 
        setCurrentScreen={setCurrentScreen}
      />
      
      {/* Main Content Area */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {screenTitles[currentScreen]}
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
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default App
