import React from 'react'
import { DollarSign, Briefcase, TrendingUp, Bell, AlertCircle } from 'lucide-react'
import { dashboardStats, pensionFunds } from '../../common/data'

const Dashboard = ({ setCurrentScreen }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Overview of all pension fund accounts</p>
        </div>
        <button onClick={() => setCurrentScreen('create-fund')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <TrendingUp size={20} />
          Create Fund
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={DollarSign} label="Total AUM" value={`$${dashboardStats.totalAUM}`} change="+12.5%" />
        <StatCard icon={Briefcase} label="Active Accounts" value={dashboardStats.activeAccounts} change="+8.2%" />
        <StatCard icon={TrendingUp} label="Average ROI" value={`${dashboardStats.avgROI}%`} change="+2.1%" />
        <StatCard icon={Bell} label="Pending Approvals" value={dashboardStats.pendingApprovals} change="Action needed" isWarning />
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
}

const StatCard = ({ icon: Icon, label, value, change, isWarning = false }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${isWarning ? 'bg-orange-100' : 'bg-blue-100'}`}>
        <Icon className={isWarning ? 'text-orange-600' : 'text-blue-600'} size={24} />
      </div>
      <span className={`text-sm font-medium ${isWarning ? 'text-orange-600' : 'text-green-600'}`}>{change}</span>
    </div>
    <p className="text-slate-600 text-sm">{label}</p>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
)

export default Dashboard
