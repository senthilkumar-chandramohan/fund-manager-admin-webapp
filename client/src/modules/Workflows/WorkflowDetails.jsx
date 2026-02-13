import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit } from 'lucide-react'

const WorkflowDetails = () => {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/workflows" className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft size={20} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Workflow Details</h1>
            <p className="text-slate-600 mt-1">Workflow ID: {id}</p>
          </div>
        </div>
        <Link to={`/workflow/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Edit size={16} />
          Edit Workflow
        </Link>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Workflow Information</h2>
        <p className="text-slate-600">Detailed workflow information will be displayed here.</p>
      </div>
    </div>
  )
}

export default WorkflowDetails
