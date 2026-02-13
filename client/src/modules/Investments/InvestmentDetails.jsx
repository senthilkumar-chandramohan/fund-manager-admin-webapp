import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'

const InvestmentDetails = () => {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/investments" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Investment Details</h1>
            <p className="text-slate-600 mt-1">Investment ID: {id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Investment Information</h2>
        <p className="text-slate-600">Detailed investment information will be displayed here.</p>
      </div>
    </div>
  )
}

export default InvestmentDetails
