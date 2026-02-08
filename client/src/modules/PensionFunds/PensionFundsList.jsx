import React, { useState } from 'react'
import { Search, Download, Eye, Edit } from 'lucide-react'
import { pensionFunds } from '../../common/data'

const PensionFundsList = ({ setCurrentScreen }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')

  const filteredFunds = pensionFunds.filter(fund => {
    const matchesSearch = fund.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'All' || fund.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pension Funds</h1>
          <p className="text-slate-600 mt-1">Manage all pension fund accounts</p>
        </div>
        <button onClick={() => setCurrentScreen('create-fund')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <span>+</span>
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
            {filteredFunds.map((fund) => (
              <tr key={fund.id} className="border-b border-slate-200 hover:bg-slate-50">
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
}

export default PensionFundsList
