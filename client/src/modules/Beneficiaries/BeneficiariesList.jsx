import React from 'react'
import { Link } from 'react-router-dom'

const BeneficiariesList = () => {
  const beneficiaries = [
    { id: 1, name: 'John Doe', email: 'john@example.com', relationship: 'Self' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', relationship: 'Spouse' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Beneficiaries</h1>
          <p className="text-slate-600 mt-1">Manage fund beneficiaries</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Name</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Email</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Relationship</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {beneficiaries.map(beneficiary => (
                <tr key={beneficiary.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">{beneficiary.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{beneficiary.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{beneficiary.relationship}</td>
                  <td className="px-6 py-4 text-sm">
                    <Link to={`/beneficiary/${beneficiary.id}`} className="text-blue-600 hover:text-blue-700 mr-3">
                      View
                    </Link>
                    <Link to={`/beneficiary/${beneficiary.id}/edit`} className="text-slate-600 hover:text-slate-700">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BeneficiariesList
