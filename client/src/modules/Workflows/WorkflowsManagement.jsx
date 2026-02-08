import React, { useState } from 'react'
import { Search, Activity, CheckCircle, AlertCircle, Clock, Eye, RefreshCw, Settings } from 'lucide-react'
import { workflows } from '../../common/data'

const WorkflowsManagement = () => {
  const [workflowSearchTerm, setWorkflowSearchTerm] = useState('')
  const [workflowTypeFilter, setWorkflowTypeFilter] = useState('All Types')
  const [workflowStatusFilter, setWorkflowStatusFilter] = useState('All Statuses')

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.fundName.toLowerCase().includes(workflowSearchTerm.toLowerCase())
    const matchesType = workflowTypeFilter === 'All Types' || workflow.type === workflowTypeFilter
    const matchesStatus = workflowStatusFilter === 'All Statuses' || workflow.status === workflowStatusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workflow Management</h1>
          <p className="text-slate-600 mt-1">Monitor and manage automated workflows</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <span>+</span>
          Create Workflow
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-4 gap-4">
        <StatusCard icon={Activity} label="Total Workflows" value="48" bgColor="blue" />
        <StatusCard icon={CheckCircle} label="Active" value="42" bgColor="green" />
        <StatusCard icon={AlertCircle} label="Failed" value="3" bgColor="red" />
        <StatusCard icon={Clock} label="Paused" value="3" bgColor="yellow" />
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[250px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search workflows..."
              value={workflowSearchTerm}
              onChange={(e) => setWorkflowSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={workflowTypeFilter}
            onChange={(e) => setWorkflowTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Types</option>
            <option>Pension Distribution</option>
            <option>Investment Allocation</option>
            <option>Performance Monitoring</option>
          </select>
          <select
            value={workflowStatusFilter}
            onChange={(e) => setWorkflowStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All Statuses</option>
            <option>Running</option>
            <option>Success</option>
            <option>Failed</option>
          </select>
        </div>
      </div>

      {/* Workflows Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Fund Name</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Workflow Type</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Status</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Last Run</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Next Run</th>
              <th className="text-left p-4 text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkflows.map((workflow) => (
              <tr key={workflow.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="p-4 font-semibold text-slate-900">{workflow.fundName}</td>
                <td className="p-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {workflow.type}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {workflow.status === 'Running' && <Clock className="text-blue-600" size={16} />}
                    {workflow.status === 'Success' && <CheckCircle className="text-green-600" size={16} />}
                    {workflow.status === 'Failed' && <AlertCircle className="text-red-600" size={16} />}
                    <span className={`text-sm font-semibold ${
                      workflow.status === 'Running' ? 'text-blue-600' :
                      workflow.status === 'Success' ? 'text-green-600' :
                      'text-red-600'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-slate-600 text-sm">{workflow.lastRun}</td>
                <td className="p-4 text-slate-600 text-sm">{workflow.nextRun}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-blue-50 rounded text-blue-600" title="View Logs">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 hover:bg-green-50 rounded text-green-600" title="Run Now">
                      <RefreshCw size={16} />
                    </button>
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600" title="Settings">
                      <Settings size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredWorkflows.length === 0 && (
          <div className="p-8 text-center text-slate-600">
            <p>No workflows found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

const StatusCard = ({ icon: Icon, label, value, bgColor }) => {
  const bgClass = bgColor === 'blue' ? 'bg-blue-50 border-blue-200' :
                  bgColor === 'green' ? 'bg-green-50 border-green-200' :
                  bgColor === 'red' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
  const iconClass = bgColor === 'blue' ? 'text-blue-600' :
                    bgColor === 'green' ? 'text-green-600' :
                    bgColor === 'red' ? 'text-red-600' : 'text-yellow-600'
  const textClass = bgColor === 'blue' ? 'text-blue-900' :
                    bgColor === 'green' ? 'text-green-900' :
                    bgColor === 'red' ? 'text-red-900' : 'text-yellow-900'

  return (
    <div className={`${bgClass} border p-4 rounded-lg`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={iconClass} size={20} />
        <span className={`text-2xl font-bold ${textClass}`}>{value}</span>
      </div>
      <p className={`text-sm font-semibold ${textClass}`}>{label}</p>
    </div>
  )
}

export default WorkflowsManagement
