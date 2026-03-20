import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Search, Filter, RefreshCw, ExternalLink, Calendar, DollarSign } from 'lucide-react'
import axios from 'axios'
import { API_HOST } from '../../common/constants'

const Investments = () => {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const fetchInvestments = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_HOST}/api/admin/investments`)
      setInvestments(response.data.data || [])
    } catch (error) {
      console.error('Error fetching investments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvestments()
  }, [])

  // Filter investments based on search and status
  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.fund?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All' || investment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'INVESTED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'DIVESTED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'PENDING':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <TrendingUp size={32} className="text-blue-600" />
            Active Investments
          </h1>
          <p className="text-slate-600 mt-1">Monitor all active fund investments</p>
        </div>
        <button
          onClick={fetchInvestments}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by fund name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="All">All Status</option>
              <option value="INVESTED">Invested</option>
              <option value="DIVESTED">Divested</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Total Investments</p>
          <p className="text-2xl font-bold text-slate-900">{investments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Active (Invested)</p>
          <p className="text-2xl font-bold text-green-600">
            {investments.filter(i => i.status === 'INVESTED').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">Divested</p>
          <p className="text-2xl font-bold text-blue-600">
            {investments.filter(i => i.status === 'DIVESTED').length}
          </p>
        </div>
      </div>

      {/* Investments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="animate-spin text-slate-600" size={48} />
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="text-center p-12">
            <TrendingUp size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Investments Found</h3>
            <p className="text-slate-600">No investments match your current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Investment ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Fund Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">ROI</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Maturity Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Contract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredInvestments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm text-slate-900">{investment.id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/fund/${investment.fund?.id}`}
                        className="font-semibold text-blue-600 hover:text-blue-700"
                      >
                        {investment.fund?.name || 'N/A'}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} className="text-slate-600" />
                        <p className="font-semibold text-slate-900">
                          {parseFloat(investment.investmentAmount || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-green-600">{investment.roi}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Calendar size={16} />
                        {new Date(investment.maturityDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(investment.status)}`}>
                        {investment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {investment.investmentContract ? (
                        <a
                          href={`https://sepolia.etherscan.io/address/${investment.investmentContract}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          View <ExternalLink size={14} />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Info */}
      {!loading && filteredInvestments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            Showing <span className="font-semibold">{filteredInvestments.length}</span> of{' '}
            <span className="font-semibold">{investments.length}</span> total investments
          </p>
        </div>
      )}
    </div>
  )
}

export default Investments
