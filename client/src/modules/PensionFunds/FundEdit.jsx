import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import axios from 'axios'

const FundEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    riskAppetite: 'MEDIUM',
    investmentDuration: 'medium_term',
    reserveAmount: ''
  })

  useEffect(() => {
    fetchFund()
  }, [id])

  const fetchFund = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/funds/${id}`)
      const fund = response.data.data
      
      setFormData({
        name: fund.name || '',
        description: fund.description || '',
        riskAppetite: fund.riskAppetite || 'MEDIUM',
        investmentDuration: fund.investmentDuration || 'medium_term',
        reserveAmount: fund.reserveAmount || ''
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching fund:', err)
      setError('Failed to load fund details')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      await axios.put(`/api/funds/${id}`, formData)
      alert('Fund updated successfully!')
      navigate(`/fund/${id}`)
    } catch (err) {
      console.error('Error updating fund:', err)
      alert('Failed to update fund. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading fund details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900">Error</h2>
        <p className="text-red-600 mt-2">{error}</p>
        <Link to="/funds" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Funds
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/fund/${id}`} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Fund</h1>
          <p className="text-slate-600 mt-1">Update fund details</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fund Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter fund name"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter fund description"
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Risk Appetite *</label>
            <select
              name="riskAppetite"
              value={formData.riskAppetite}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {formData.riskAppetite === 'LOW' && 'Conservative approach with stable, low-volatility investments'}
              {formData.riskAppetite === 'MEDIUM' && 'Balanced portfolio with mix of stable and growth investments'}
              {formData.riskAppetite === 'HIGH' && 'Aggressive approach targeting higher returns with higher volatility'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Investment Duration *</label>
            <select
              name="investmentDuration"
              value={formData.investmentDuration}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="short_term">Short Term</option>
              <option value="medium_term">Medium Term</option>
              <option value="long_term">Long Term</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              {formData.investmentDuration === 'short_term' && 'Investments with duration less than 1 year'}
              {formData.investmentDuration === 'medium_term' && 'Investments with duration between 1-5 years'}
              {formData.investmentDuration === 'long_term' && 'Investments with duration more than 5 years'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reserve Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="reserveAmount"
                value={formData.reserveAmount}
                onChange={handleChange}
                placeholder="e.g., 100000"
                step="0.01"
                min="0"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-medium">USD</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Amount reserved for emergency or special circumstances</p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              to={`/fund/${id}`}
              className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FundEdit
