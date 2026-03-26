import React, { useState, useEffect, useRef } from 'react'
import { UserPlus, Coins, Loader2, Play, Trash2 } from 'lucide-react'
import axios from 'axios'
import { API_HOST } from '../../common/constants'

const Utilities = () => {
  const [activeTab, setActiveTab] = useState('governors')
  
  // Governor state
  const [governorForm, setGovernorForm] = useState({
    name: '',
    email: '',
  })
  const [governorLoading, setGovernorLoading] = useState(false)
  const [governorMessage, setGovernorMessage] = useState(null)

  // Fund state
  const [pensionFunds, setPensionFunds] = useState([])
  const [fundsLoading, setFundsLoading] = useState(false)
  const [fundAmounts, setFundAmounts] = useState({})
  const [fundMessage, setFundMessage] = useState(null)

  // Jobs state
  const [jobLogs, setJobLogs] = useState('')
  const [runningJob, setRunningJob] = useState(null)
  const [jobMessage, setJobMessage] = useState(null)
  const textareaRef = useRef(null)

  // Fetch pension funds when tab switches to fund management
  useEffect(() => {
    if (activeTab === 'funds') {
      fetchPensionFunds()
    }
  }, [activeTab])

  // Auto-scroll textarea to bottom when logs are updated
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight
    }
  }, [jobLogs])

  const fetchPensionFunds = async () => {
    setFundsLoading(true)
    try {
      const response = await axios.get(`${API_HOST}/api/admin/pension-funds`)
      setPensionFunds(response.data.data || [])
    } catch (error) {
      console.error('Error fetching pension funds:', error)
      setFundMessage({ type: 'error', text: 'Failed to load pension funds' })
    } finally {
      setFundsLoading(false)
    }
  }

  const handleGovernorSubmit = async (e) => {
    e.preventDefault()
    setGovernorLoading(true)
    setGovernorMessage(null)

    try {
      const response = await axios.post(`${API_HOST}/api/admin/governors`, governorForm)
      setGovernorMessage({ 
        type: 'success', 
        text: `Governor created successfully! Wallet: ${response.data.data.wallet}` 
      })
      setGovernorForm({ name: '', email: '' })
    } catch (error) {
      setGovernorMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to create governor' 
      })
    } finally {
      setGovernorLoading(false)
    }
  }

  const handleFundAmountChange = (fundId, amount) => {
    setFundAmounts(prev => ({
      ...prev,
      [fundId]: amount
    }))
  }

  const handleAddFundToPension = async (fundId) => {
    const amount = fundAmounts[fundId]
    if (!amount || parseFloat(amount) <= 0) {
      setFundMessage({ type: 'error', text: 'Please enter a valid amount' })
      return
    }

    setFundsLoading(true)
    setFundMessage(null)

    try {
      const response = await axios.post(`${API_HOST}/api/admin/pension-funds/${fundId}/add-funds`, {
        amount: amount
      })
      setFundMessage({ 
        type: 'success', 
        text: `Successfully added ${amount} to pension fund` 
      })
      // Clear the amount after successful submission
      setFundAmounts(prev => ({
        ...prev,
        [fundId]: ''
      }))
    } catch (error) {
      setFundMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to add funds to pension contract' 
      })
    } finally {
      setFundsLoading(false)
    }
  }

  const runJob = async (endpoint, jobTitle) => {
    setRunningJob(jobTitle)
    setJobMessage(null)
    setJobLogs(`🔄 Starting ${jobTitle}...\n`)

    try {
      const response = await fetch(`${API_HOST}${endpoint}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk

        // Split by newline and process complete lines
        const lines = buffer.split('\n')
        buffer = lines[lines.length - 1] // Keep incomplete line in buffer

        // Add complete lines to logs
        for (let i = 0; i < lines.length - 1; i++) {
          setJobLogs(prev => prev + lines[i] + '\n')
        }
      }

      // Process any remaining buffer
      if (buffer) {
        setJobLogs(prev => prev + buffer + '\n')
      }

      setJobLogs(prev => prev + `\n✅ ${jobTitle} completed successfully!\n`)
      setJobMessage({ type: 'success', text: `${jobTitle} finished` })
    } catch (error) {
      console.error(`Error running job:`, error)
      setJobLogs(prev => prev + `\n❌ Error: ${error.message}\n`)
      setJobMessage({ type: 'error', text: `Failed to run ${jobTitle}: ${error.message}` })
    } finally {
      setRunningJob(null)
    }
  }

  const clearLogs = () => {
    setJobLogs('')
    setJobMessage(null)
  }

  return (
    <div className="max-w-6xl">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('governors')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'governors' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus size={20} />
            Add Governors
          </button>
          <button
            onClick={() => setActiveTab('funds')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'funds' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins size={20} />
            Add Fund to Pension Contract
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
              activeTab === 'jobs' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Play size={20} />
            Jobs
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'governors' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Governor</h2>
          
          {governorMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              governorMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {governorMessage.text}
            </div>
          )}

          <form onSubmit={handleGovernorSubmit} className="max-w-2xl">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={governorForm.name}
                onChange={(e) => setGovernorForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter governor's full name"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={governorForm.email}
                onChange={(e) => setGovernorForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter governor's email"
              />
            </div>

            <button
              type="submit"
              disabled={governorLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {governorLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Governor...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Create Governor
                </>
              )}
            </button>

            <p className="mt-4 text-sm text-slate-600">
              * A new wallet will be automatically created for this governor
            </p>
          </form>
        </div>
      )}

      {activeTab === 'funds' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Add Funds to Pension Contracts</h2>
          
          {fundMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              fundMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {fundMessage.text}
            </div>
          )}

          {fundsLoading && pensionFunds.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          ) : pensionFunds.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              No pension funds found
            </div>
          ) : (
            <div className="space-y-4">
              {pensionFunds.map(fund => (
                <div key={fund.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-4">
                      <h3 className="font-semibold text-slate-900">{fund.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Contract: <span className="font-mono text-xs">{fund.contractAddress}</span>
                      </p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-sm text-slate-600">Stablecoin</p>
                      <p className="font-medium text-slate-900">{fund.stablecoin || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Amount
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={fundAmounts[fund.id] || ''}
                        onChange={(e) => handleFundAmountChange(fund.id, e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <button
                        onClick={() => handleAddFundToPension(fund.id)}
                        disabled={fundsLoading || !fundAmounts[fund.id]}
                        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'jobs' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Run Background Jobs</h2>

          {jobMessage && (
            <div className={`mb-6 p-4 rounded-lg ${
              jobMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {jobMessage.text}
            </div>
          )}

          <div className="mb-6 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Available Jobs</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => runJob('/api/admin/jobs/investment-batch', 'Investment Batch Job')}
                  disabled={runningJob !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {runningJob === 'Investment Batch Job' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Investment Batch Job
                    </>
                  )}
                </button>

                <button
                  onClick={() => runJob('/api/admin/jobs/investment-divestment', 'Divestment Job')}
                  disabled={runningJob !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {runningJob === 'Divestment Job' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Divestment Job
                    </>
                  )}
                </button>

                <button
                  onClick={() => runJob('/api/admin/jobs/pension-release', 'Pension Release Job')}
                  disabled={runningJob !== null}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {runningJob === 'Pension Release Job' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Pension Release Job
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">
                Job Logs
              </label>
              <button
                onClick={clearLogs}
                disabled={runningJob !== null}
                className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>
            <textarea
              ref={textareaRef}
              value={jobLogs}
              disabled
              className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 font-mono text-sm h-96 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Job logs will appear here..."
            />
            <p className="mt-2 text-xs text-slate-500">
              ℹ️ Logs are automatically scrolled to show the latest output. Only one job can run at a time.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Utilities
