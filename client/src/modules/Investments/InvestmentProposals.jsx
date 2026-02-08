import React, { useState } from 'react'
import { Search, RefreshCw, Eye, CheckCircle, X, Clock, TrendingUp } from 'lucide-react'
import { investmentProposals } from '../../common/data'

const InvestmentProposals = () => {
  const [proposalSearchTerm, setProposalSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('All')
  const [showProposalDetails, setShowProposalDetails] = useState(null)

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
        <SummaryCard icon={Clock} label="Pending Review" value="3" bgColor="orange" />
        <SummaryCard icon={CheckCircle} label="Approved This Month" value="18" bgColor="green" />
        <SummaryCard icon={TrendingUp} label="Avg Projected ROI" value="8.7%" bgColor="blue" />
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map(proposal => (
          <ProposalCard 
            key={proposal.id} 
            proposal={proposal} 
            isExpanded={showProposalDetails === proposal.id}
            onToggle={() => setShowProposalDetails(showProposalDetails === proposal.id ? null : proposal.id)}
          />
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

const SummaryCard = ({ icon: Icon, label, value, bgColor }) => {
  const bgClass = bgColor === 'orange' ? 'bg-orange-50 border-orange-200' : 
                  bgColor === 'green' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'
  const textClass = bgColor === 'orange' ? 'text-orange-600 text-orange-900' : 
                    bgColor === 'green' ? 'text-green-600 text-green-900' : 'text-blue-600 text-blue-900'

  return (
    <div className={`${bgClass} border-2 p-6 rounded-xl`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={textClass.split(' ')[0]} size={24} />
        <span className={`text-2xl font-bold ${textClass.split(' ')[1]}`}>{value}</span>
      </div>
      <p className={`font-semibold ${textClass.split(' ')[1]}`}>{label}</p>
    </div>
  )
}

const ProposalCard = ({ proposal, isExpanded, onToggle }) => (
  <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow p-6">
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
        onClick={onToggle}
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
)

export default InvestmentProposals
