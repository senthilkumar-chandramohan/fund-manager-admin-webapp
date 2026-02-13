import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const WorkflowEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Workflow update functionality coming soon!')
    navigate(`/workflow/${id}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={`/workflow/${id}`} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} className="text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Workflow</h1>
          <p className="text-slate-600 mt-1">Update workflow configuration</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Workflow Name</label>
            <input
              type="text"
              placeholder="Enter workflow name"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            <Link
              to={`/workflow/${id}`}
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

export default WorkflowEdit
