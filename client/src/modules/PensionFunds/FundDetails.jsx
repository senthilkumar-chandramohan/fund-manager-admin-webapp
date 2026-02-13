import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Edit } from 'lucide-react'

const FundDetails = () => {
  const { id } = useParams()
  const [fund, setFund] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFund = async () => {
      try {
        const response = await axios.get(`/api/funds/${id}`)
        setFund(response.data.data)
      } catch (error) {
        console.error('Error fetching fund:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFund()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  if (!fund) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900">Fund Not Found</h2>
        <p className="text-slate-600 mt-2">The fund you're looking for doesn't exist.</p>
        <Link to="/funds" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Funds
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/funds" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{fund.name}</h1>
            <p className="text-slate-600 mt-1">Fund ID: {fund.id}</p>
          </div>
        </div>
        <Link to={`/fund/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Edit size={16} />
          Edit Fund
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Fund Information</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-600">Fund Name</p>
            <p className="font-semibold text-slate-900">{fund.name}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Status</p>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
              fund.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {fund.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-600">Description</p>
            <p className="font-semibold text-slate-900">{fund.description || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Contract Address</p>
            {fund.contractAddress ? (
              <a 
                href={`https://sepolia.etherscan.io/address/${fund.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-blue-600 hover:text-blue-700 break-all underline"
              >
                {fund.contractAddress}
              </a>
            ) : (
              <p className="font-mono text-sm text-slate-600">N/A</p>
            )}
          </div>
          <div>
            <p className="text-sm text-slate-600">Maturity Date</p>
            <p className="font-semibold text-slate-900">{new Date(fund.maturity).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Risk Appetite</p>
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              fund.riskAppetite === 'HIGH' ? 'bg-red-100 text-red-700' :
              fund.riskAppetite === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {fund.riskAppetite}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-600">Reserve Amount</p>
            <p className="font-semibold text-slate-900">${fund.reserveAmount || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Investment Duration</p>
            <p className="font-semibold text-slate-900">
              {fund.investmentDuration?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Beneficiaries</p>
            <p className="font-semibold text-slate-900">{fund.beneficiaryCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Created At</p>
            <p className="font-semibold text-slate-900">{new Date(fund.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Last Updated</p>
            <p className="font-semibold text-slate-900">{new Date(fund.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {fund.beneficiaries && fund.beneficiaries.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Beneficiaries ({fund.beneficiaries.length})</h2>
          <div className="space-y-3">
            {fund.beneficiaries.map((beneficiary) => (
              <div key={beneficiary.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900">{beneficiary.name}</p>
                    <p className="text-sm text-slate-600">{beneficiary.email}</p>
                    <p className="text-xs text-slate-500 mt-1">Relationship: {beneficiary.relationship}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{beneficiary.share}%</p>
                    <p className="text-xs text-slate-500">Share</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-500">Wallet Address:</p>
                  <p className="font-mono text-xs text-slate-700 break-all">{beneficiary.walletAddress}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FundDetails
