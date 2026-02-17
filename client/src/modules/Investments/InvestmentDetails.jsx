import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, X, Clock, TrendingUp, DollarSign, BarChart3, Calendar, ExternalLink, RefreshCw } from 'lucide-react'
import axios from 'axios'

const InvestmentDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [proposal, setProposal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchProposal = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`http://localhost:5000/api/admin/investment-proposals/${id}`)
      setProposal(response.data.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching proposal:', err)
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposal()
  }, [id])

  const handleApprove = async () => {
    try {
      setActionLoading(true)
      await axios.post(`http://localhost:5000/api/admin/investment-proposals/${id}/approve`, {
        approvedBy: 'Admin' // TODO: Get from authenticated user
      })
      fetchProposal()
    } catch (err) {
      console.error('Error approving proposal:', err)
      alert('Failed to approve proposal')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setActionLoading(true)
      await axios.post(`http://localhost:5000/api/admin/investment-proposals/${id}/reject`, {
        approvedBy: 'Admin' // TODO: Get from authenticated user
      })
      fetchProposal()
    } catch (err) {
      console.error('Error rejecting proposal:', err)
      alert('Failed to reject proposal')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center p-12">
          <RefreshCw className="animate-spin text-slate-600" size={48} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600 font-semibold mb-4">Error: {error}</p>
          <button
            onClick={() => navigate('/investments')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Investments
          </button>
        </div>
      </div>
    )
  }

  if (!proposal) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-600 font-semibold mb-4">Proposal not found</p>
          <button
            onClick={() => navigate('/investments')}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Back to Investments
          </button>
        </div>
      </div>
    )
  }

  const isPending = proposal.status === 'Pending'
  const createdDate = new Date(proposal.createdAt).toLocaleString()
  const approvedDate = proposal.approvedAt ? new Date(proposal.approvedAt).toLocaleString() : null
  const rejectedDate = proposal.rejectedAt ? new Date(proposal.rejectedAt).toLocaleString() : null
  const maturityDate = new Date(proposal.fund.maturity).toLocaleDateString()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/investments" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Investment Proposal Details</h1>
            <p className="text-slate-600 mt-1">ID: {proposal.id}</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        {isPending && (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
            >
              <CheckCircle size={20} />
              Approve
            </button>
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
            >
              <X size={20} />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Status Banner */}
      <div className={`p-6 rounded-xl border-2 ${
        proposal.status === 'Pending' ? 'bg-orange-50 border-orange-200' :
        proposal.status === 'Approved' ? 'bg-green-50 border-green-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold ${
              proposal.status === 'Pending' ? 'text-orange-900' :
              proposal.status === 'Approved' ? 'text-green-900' :
              'text-red-900'
            }`}>
              Status: {proposal.status}
            </h2>
            {approvedDate && (
              <p className="text-sm text-slate-600 mt-1">Approved on {approvedDate} by {proposal.approvedBy}</p>
            )}
            {rejectedDate && (
              <p className="text-sm text-slate-600 mt-1">Rejected on {rejectedDate} by {proposal.approvedBy}</p>
            )}
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            proposal.status === 'Pending' ? 'bg-orange-200 text-orange-900' :
            proposal.status === 'Approved' ? 'bg-green-200 text-green-900' :
            'bg-red-200 text-red-900'
          }`}>
            {proposal.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          icon={BarChart3}
          label="AI Score"
          value={proposal.aiScore}
          suffix="/ 100"
          color="blue"
        />
        <MetricCard
          icon={TrendingUp}
          label="Expected ROI"
          value={proposal.expectedROI}
          suffix="%"
          color="green"
        />
        <MetricCard
          icon={DollarSign}
          label="Investment Amount"
          value={proposal.investmentAmount || 'N/A'}
          suffix={proposal.investmentAmount ? proposal.fund.stablecoin : ''}
          color="purple"
        />
        <MetricCard
          icon={Clock}
          label="Risk Level"
          value={proposal.riskLevel}
          color={proposal.riskLevel === 'LOW' ? 'green' : proposal.riskLevel === 'MEDIUM' ? 'yellow' : 'red'}
        />
      </div>

      {/* Fund Information */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 size={24} />
          Associated Pension Fund
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <InfoRow label="Fund Name" value={proposal.fund.name} />
          <InfoRow label="Fund ID" value={proposal.fund.id} />
          <InfoRow label="Description" value={proposal.fund.description || 'N/A'} />
          <InfoRow label="Risk Appetite" value={proposal.fund.riskAppetite} />
          <InfoRow label="Stablecoin" value={proposal.fund.stablecoin} />
          <InfoRow label="Reserve Amount" value={proposal.fund.reserveAmount || 'N/A'} />
          <InfoRow label="Investment Duration" value={proposal.fund.investmentDuration || 'N/A'} />
          <InfoRow label="Maturity Date" value={maturityDate} />
          <InfoRow 
            label="Contract Address" 
            value={
              <a 
                href={`https://sepolia.etherscan.io/address/${proposal.fund.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {proposal.fund.contractAddress.slice(0, 10)}...{proposal.fund.contractAddress.slice(-8)}
                <ExternalLink size={14} />
              </a>
            }
          />
          <InfoRow 
            label="Investment Contract" 
            value={
              proposal.investmentContract ? (
                <a 
                  href={`https://sepolia.etherscan.io/address/${proposal.investmentContract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {proposal.investmentContract.slice(0, 10)}...{proposal.investmentContract.slice(-8)}
                  <ExternalLink size={14} />
                </a>
              ) : 'N/A'
            }
          />
          <InfoRow
            label="View Fund Details"
            value={
              <Link
                to={`/fund/${proposal.fund.id}`}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                View Full Details →
              </Link>
            }
          />
        </div>
      </div>

      {/* Proposal Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Calendar size={24} />
          Proposal Timeline
        </h2>
        <div className="space-y-4">
          <TimelineItem
            date={createdDate}
            title="Proposal Created"
            description="AI-generated investment proposal based on fund parameters"
            status="completed"
          />
          {approvedDate && (
            <TimelineItem
              date={approvedDate}
              title={`Approved by ${proposal.approvedBy}`}
              description="Proposal has been reviewed and approved for execution"
              status="completed"
            />
          )}
          {rejectedDate && (
            <TimelineItem
              date={rejectedDate}
              title={`Rejected by ${proposal.approvedBy}`}
              description="Proposal has been reviewed and rejected"
              status="rejected"
            />
          )}
          {isPending && (
            <TimelineItem
              date="Pending"
              title="Awaiting Review"
              description="Proposal is pending admin approval"
              status="pending"
            />
          )}
        </div>
      </div>
    </div>
  )
}

const MetricCard = ({ icon: Icon, label, value, suffix = '', color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-600 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-600 text-green-900',
    purple: 'bg-purple-50 border-purple-200 text-purple-600 text-purple-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-600 text-yellow-900',
    red: 'bg-red-50 border-red-200 text-red-600 text-red-900'
  }
  const classes = colorClasses[color] || colorClasses.blue
  const [bgClass, borderClass, iconClass, textClass] = classes.split(' ')

  return (
    <div className={`${bgClass} border-2 ${borderClass} p-6 rounded-xl`}>
      <Icon className={iconClass} size={24} />
      <p className="text-sm font-semibold text-slate-600 mt-4">{label}</p>
      <p className={`text-2xl font-bold ${textClass} mt-1`}>
        {value} {suffix && <span className="text-lg">{suffix}</span>}
      </p>
    </div>
  )
}

const InfoRow = ({ label, value }) => (
  <div>
    <p className="text-sm font-semibold text-slate-600 mb-1">{label}</p>
    <p className="text-lg text-slate-900">{value}</p>
  </div>
)

const TimelineItem = ({ date, title, description, status }) => {
  const statusColors = {
    completed: 'bg-green-100 border-green-300',
    pending: 'bg-orange-100 border-orange-300',
    rejected: 'bg-red-100 border-red-300'
  }

  return (
    <div className={`border-l-4 ${statusColors[status]} pl-4 py-2`}>
      <p className="text-sm text-slate-600">{date}</p>
      <p className="text-lg font-bold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  )
}

export default InvestmentDetails
