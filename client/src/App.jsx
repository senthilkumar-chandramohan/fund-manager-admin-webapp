import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { BarChart3, Plus, Users, Settings, Bell, LogOut, Search, Filter, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, Briefcase, FileText, Activity, Menu, X, Eye, Edit, Trash2, Download, RefreshCw } from 'lucide-react'

function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [funds, setFunds] = useState([])
  const [serverStatus, setServerStatus] = useState('Checking...')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [createFundStep, setCreateFundStep] = useState(1)
  const [showProposalDetails, setShowProposalDetails] = useState(false)

  // Sample data
  const pensionFunds = [
    { id: '1', name: 'Johnson Family Pension', corpus: '125,430', maturity: '2028-06-15', status: 'Active', beneficiaries: 3, roi: '7.8' },
    { id: '2', name: 'Smith Retirement Fund', corpus: '89,200', maturity: '2026-03-22', status: 'Active', beneficiaries: 2, roi: '9.2' },
    { id: '3', name: 'Davis Pension Plan', corpus: '203,890', maturity: '2030-11-10', status: 'Active', beneficiaries: 4, roi: '8.1' },
    { id: '4', name: 'Martinez Senior Fund', corpus: '67,500', maturity: '2025-08-05', status: 'Matured', beneficiaries: 1, roi: '6.9' },
  ]

  const investmentProposals = [
    { id: '1', fundName: 'Johnson Family Pension', aiScore: '92', expectedROI: '8.5', risk: 'MEDIUM', created: '2h ago', expiresIn: '46h' },
    { id: '2', fundName: 'Smith Retirement Fund', aiScore: '88', expectedROI: '9.1', risk: 'HIGH', created: '5h ago', expiresIn: '43h' },
    { id: '3', fundName: 'Wilson Trust Fund', aiScore: '85', expectedROI: '7.2', risk: 'LOW', created: '1d ago', expiresIn: '23h' },
  ]

  const workflows = [
    { id: '1', fundName: 'Johnson Family Pension', type: 'Investment Allocation', status: 'Running', lastRun: '2h ago', nextRun: '6d 22h' },
    { id: '2', fundName: 'Smith Retirement Fund', type: 'Pension Distribution', status: 'Success', lastRun: '1d ago', nextRun: '29d' },
    { id: '3', fundName: 'Davis Pension Plan', type: 'Investment Allocation', status: 'Failed', lastRun: '3h ago', nextRun: 'Manual' },
  ]

  const dashboardStats = {
    totalAUM: '12,456,789',
    activeAccounts: '1,234',
    avgROI: '8.42',
    pendingApprovals: '5'
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthRes = await axios.get('/api/health')
        setServerStatus('✓ Connected')
        const fundsRes = await axios.get('/api/funds')
        setFunds(fundsRes.data.data)
      } catch (error) {
        setServerStatus('✗ Disconnected')
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter funds based on search and status
  const filteredFunds = pensionFunds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'All' || fund.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Sidebar Component
  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 z-50`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        {sidebarOpen && <h1 className="text-xl font-bold">PensionAdmin</h1>}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      <nav className="p-4">
        {[
          { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
          { id: 'funds', icon: Briefcase, label: 'Pension Funds' },
          { id: 'create-fund', icon: Plus, label: 'Create Fund' },
          { id: 'investments', icon: TrendingUp, label: 'Investments' },
          { id: 'workflows', icon: Activity, label: 'Workflows' },
          { id: 'beneficiaries', icon: Users, label: 'Beneficiaries' },
          { id: 'reports', icon: FileText, label: 'Reports' },
          { id: 'settings', icon: Settings, label: 'Settings' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded mb-2 transition-colors ${
              currentScreen === item.id ? 'bg-blue-600' : 'hover:bg-slate-800'
            }`}
          >
            <item.icon size={20} />
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded">
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  // Dashboard Screen
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of all pension fund accounts</p>
        </div>
        <button onClick={() => setCurrentScreen('create-fund')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Create Fund
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="text-blue-600" size={24} />
            </div>
            <span className="text-green-600 text-sm font-medium">+12.5%</span>
          </div>
          <p className="text-slate-600 text-sm">Total AUM</p>
          <p className="text-2xl font-bold text-slate-900">${dashboardStats.totalAUM}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="text-green-600" size={24} />
            </div>
            <span className="text-green-600 text-sm font-medium">+8.2%</span>
          </div>
          <p className="text-slate-600 text-sm">Active Accounts</p>
          <p className="text-2xl font-bold text-slate-900">{dashboardStats.activeAccounts}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
            <span className="text-green-600 text-sm font-medium">+2.1%</span>
          </div>
          <p className="text-slate-600 text-sm">Average ROI</p>
          <p className="text-2xl font-bold text-slate-900">{dashboardStats.avgROI}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Bell className="text-orange-600" size={24} />
            </div>
            <span className="text-orange-600 text-sm font-medium">Action needed</span>
          </div>
          <p className="text-slate-600 text-sm">Pending Approvals</p>
          <p className="text-2xl font-bold text-slate-900">{dashboardStats.pendingApprovals}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Pension Funds</h2>
          <div className="space-y-3">
            {pensionFunds.slice(0, 4).map(fund => (
              <div key={fund.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {fund.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{fund.name}</p>
                    <p className="text-sm text-slate-600">{fund.beneficiaries} beneficiaries • Maturity: {fund.maturity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">${fund.corpus}</p>
                  <p className="text-sm text-green-600">ROI: {fund.roi}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Pending Actions</h2>
          <div className="space-y-3">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-orange-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Investment Approval</p>
                  <p className="text-xs text-slate-600 mt-1">3 proposals awaiting review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Pension Funds List with Search & Filter
  const PensionFundsList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pension Funds</h1>
          <p className="text-slate-600 mt-1">Manage all pension fund accounts</p>
        </div>
        <button onClick={() => setCurrentScreen('create-fund')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />
          Create New Fund
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by fund name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All</option>
            <option>Active</option>
            <option>Matured</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Funds Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Fund Name</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Corpus</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">ROI</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Maturity Date</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Beneficiaries</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFunds.map((fund, idx) => (
              <tr key={fund.id} className={`border-b border-slate-200 hover:bg-slate-50`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {fund.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{fund.name}</p>
                      <p className="text-xs text-slate-500">ID: {fund.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-semibold text-slate-900">${fund.corpus}</td>
                <td className="p-4">
                  <span className="text-green-600 font-semibold">{fund.roi}%</span>
                </td>
                <td className="p-4 text-slate-600">{fund.maturity}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    fund.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {fund.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{fund.beneficiaries}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded" title="View Details">
                      <Eye size={16} className="text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-200 rounded" title="Edit">
                      <Edit size={16} className="text-slate-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFunds.length === 0 && (
          <div className="p-8 text-center text-slate-600">
            <p>No funds found matching your criteria</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">Showing {filteredFunds.length} of {pensionFunds.length} funds</p>
      </div>
    </div>
  )

  // Create Fund Wizard
  const CreateFundWizard = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Pension Fund</h1>
        <p className="text-slate-600 mt-1">Deploy a new smart contract for pension management</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: 'Basic Info' },
            { num: 2, label: 'Beneficiaries' },
            { num: 3, label: 'Governance' },
            { num: 4, label: 'Emergency Rules' },
            { num: 5, label: 'Investment' },
            { num: 6, label: 'Review' }
          ].map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  createFundStep === step.num ? 'bg-blue-600 text-white' :
                  createFundStep > step.num ? 'bg-green-500 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {createFundStep > step.num ? <CheckCircle size={20} /> : step.num}
                </div>
                <p className={`text-xs mt-2 ${createFundStep === step.num ? 'text-blue-600 font-semibold' : 'text-slate-600'}`}>
                  {step.label}
                </p>
              </div>
              {idx < 5 && (
                <div className={`flex-1 h-1 mx-2 ${createFundStep > step.num ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      {createFundStep === 1 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fund Name *</label>
              <input
                type="text"
                placeholder="e.g., Johnson Family Pension Fund"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
              <p className="text-xs text-slate-500 mt-1">Maximum 100 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Fund Description *</label>
              <textarea
                placeholder="Describe the purpose and goals of this pension fund..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 mt-1">Maximum 500 characters</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Maturity Date *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Stablecoin *</label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select stablecoin</option>
                  <option>USDC - USD Coin</option>
                  <option>USDT - Tether</option>
                  <option>DAI - Dai Stablecoin</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {createFundStep === 2 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Beneficiaries Configuration</h2>
          
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Add Beneficiary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Wallet Address</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Share Percentage</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="33.33"
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCreateFundStep(Math.max(1, createFundStep - 1))}
          disabled={createFundStep === 1}
          className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => setCreateFundStep(Math.min(6, createFundStep + 1))}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {createFundStep === 6 ? 'Deploy Contract' : 'Next Step'}
        </button>
      </div>
    </div>
  )

  // Investment Proposals with Search & Filter
  const InvestmentProposals = () => {
    const [proposalSearchTerm, setProposalSearchTerm] = useState('')
    const [riskFilter, setRiskFilter] = useState('All')

    const filteredProposals = investmentProposals.filter(proposal => {
      const matchesSearch = proposal.fundName.toLowerCase().includes(proposalSearchTerm.toLowerCase())
      const matchesRisk = riskFilter === 'All' || proposal.risk === riskFilter
      return matchesSearch && matchesRisk
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Investment Proposals</h1>
            <p className="text-slate-600 mt-1">Review and approve AI-generated investment recommendations</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by fund name..."
                value={proposalSearchTerm}
                onChange={(e) => setProposalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Risk Levels</option>
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
              <RefreshCw size={20} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-orange-600" size={24} />
              <span className="text-2xl font-bold text-orange-900">3</span>
            </div>
            <p className="text-orange-900 font-semibold">Pending Review</p>
          </div>

          <div className="bg-green-50 border-2 border-green-200 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-2xl font-bold text-green-900">18</span>
            </div>
            <p className="text-green-900 font-semibold">Approved This Month</p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-blue-600" size={24} />
              <span className="text-2xl font-bold text-blue-900">8.7%</span>
            </div>
            <p className="text-blue-900 font-semibold">Avg Projected ROI</p>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          {filteredProposals.map(proposal => (
            <div key={proposal.id} className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{proposal.fundName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      proposal.risk === 'LOW' ? 'bg-green-100 text-green-700' :
                      proposal.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {proposal.risk} RISK
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">Created {proposal.created} • Expires in {proposal.expiresIn}</p>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">AI Score</p>
                    <div className="relative w-16 h-16">
                      <svg className="transform -rotate-90 w-16 h-16">
                        <circle cx="32" cy="32" r="28" stroke="#e2e8f0" strokeWidth="6" fill="none" />
                        <circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="6" fill="none"
                                strokeDasharray={`${(parseInt(proposal.aiScore) / 100) * 175.93} 175.93`} />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">{proposal.aiScore}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Expected ROI</p>
                    <p className="text-3xl font-bold text-green-600">{proposal.expectedROI}%</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowProposalDetails(!showProposalDetails)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold"
                >
                  <Eye size={20} />
                  View Details
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                  <CheckCircle size={20} />
                  Approve
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                  <X size={20} />
                  Reject
                </button>
              </div>
            </div>
          ))}
          {filteredProposals.length === 0 && (
            <div className="p-8 text-center text-slate-600 bg-white rounded-xl border border-slate-200">
              <p>No proposals found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Workflows Management with Search & Filter
  const WorkflowsManagement = () => {
    const [workflowSearchTerm, setWorkflowSearchTerm] = useState('')
    const [workflowTypeFilter, setWorkflowTypeFilter] = useState('All Types')
    const [workflowStatusFilter, setWorkflowStatusFilter] = useState('All Statuses')

    const filteredWorkflows = workflows.filter(workflow => {
      const matchesSearch = workflow.fundName.toLowerCase().includes(workflowSearchTerm.toLowerCase())
      const matchesType = workflowTypeFilter === 'All Types' || workflow.type === workflowTypeFilter
      const matchesStatus = workflowStatusFilter === 'All Statuses' || workflow.status === workflowStatusFilter
      return matchesSearch && matchesType && matchesStatus
    })

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Workflow Management</h1>
            <p className="text-slate-600 mt-1">Monitor and manage automated workflows</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={20} />
            Create Workflow
          </button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="text-blue-600" size={20} />
              <span className="text-2xl font-bold text-blue-900">48</span>
            </div>
            <p className="text-sm font-semibold text-blue-900">Total Workflows</p>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-2xl font-bold text-green-900">42</span>
            </div>
            <p className="text-sm font-semibold text-green-900">Active</p>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-2xl font-bold text-red-900">3</span>
            </div>
            <p className="text-sm font-semibold text-red-900">Failed</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-yellow-600" size={20} />
              <span className="text-2xl font-bold text-yellow-900">3</span>
            </div>
            <p className="text-sm font-semibold text-yellow-900">Paused</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search workflows..."
                value={workflowSearchTerm}
                onChange={(e) => setWorkflowSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={workflowTypeFilter}
              onChange={(e) => setWorkflowTypeFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Types</option>
              <option>Pension Distribution</option>
              <option>Investment Allocation</option>
              <option>Performance Monitoring</option>
            </select>
            <select
              value={workflowStatusFilter}
              onChange={(e) => setWorkflowStatusFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>All Statuses</option>
              <option>Running</option>
              <option>Success</option>
              <option>Failed</option>
            </select>
          </div>
        </div>

        {/* Workflows Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-slate-900">Fund Name</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-900">Workflow Type</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-900">Status</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-900">Last Run</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-900">Next Run</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map((workflow) => (
                <tr key={workflow.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-900">{workflow.fundName}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {workflow.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {workflow.status === 'Running' && <Clock className="text-blue-600" size={16} />}
                      {workflow.status === 'Success' && <CheckCircle className="text-green-600" size={16} />}
                      {workflow.status === 'Failed' && <AlertCircle className="text-red-600" size={16} />}
                      <span className={`text-sm font-semibold ${
                        workflow.status === 'Running' ? 'text-blue-600' :
                        workflow.status === 'Success' ? 'text-green-600' :
                        'text-red-600'
                      }`}>
                        {workflow.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">{workflow.lastRun}</td>
                  <td className="p-4 text-slate-600 text-sm">{workflow.nextRun}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded text-blue-600" title="View Logs">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 hover:bg-green-50 rounded text-green-600" title="Run Now">
                        <RefreshCw size={16} />
                      </button>
                      <button className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Settings">
                        <Settings size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredWorkflows.length === 0 && (
            <div className="p-8 text-center text-slate-600">
              <p>No workflows found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Main render
  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      
      {/* Top Navigation Bar */}
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        <div className="bg-white border-b border-slate-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {currentScreen === 'dashboard' && 'Dashboard'}
                {currentScreen === 'funds' && 'Pension Funds'}
                {currentScreen === 'create-fund' && 'Create Fund'}
                {currentScreen === 'investments' && 'Investment Proposals'}
                {currentScreen === 'workflows' && 'Workflows'}
                {currentScreen === 'beneficiaries' && 'Beneficiaries'}
                {currentScreen === 'reports' && 'Reports'}
                {currentScreen === 'settings' && 'Settings'}
              </h2>
            </div>
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

        {/* Main Content */}
        <div className="p-8">
          {currentScreen === 'dashboard' && <Dashboard />}
          {currentScreen === 'funds' && <PensionFundsList />}
          {currentScreen === 'create-fund' && <CreateFundWizard />}
          {currentScreen === 'investments' && <InvestmentProposals />}
          {currentScreen === 'workflows' && <WorkflowsManagement />}
          {currentScreen === 'beneficiaries' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-slate-900">Beneficiaries Management</h2>
              <p className="text-slate-600 mt-2">Coming soon...</p>
            </div>
          )}
          {currentScreen === 'reports' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
              <p className="text-slate-600 mt-2">Coming soon...</p>
            </div>
          )}
          {currentScreen === 'settings' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
              <p className="text-slate-600 mt-2">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
