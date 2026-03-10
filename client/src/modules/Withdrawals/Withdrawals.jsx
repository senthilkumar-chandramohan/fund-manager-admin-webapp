import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const Withdrawals = () => {
  const [activeTab, setActiveTab] = useState('open-requests');
  const [funds, setFunds] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // New Request Form State
  const [selectedFund, setSelectedFund] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  // Fetch funds on mount
  useEffect(() => {
    fetchFunds();
    fetchOpenRequests();
  }, []);

  const fetchFunds = async () => {
    try {
      const response = await axios.get('/api/admin/pension-funds');
      console.log('Fetched funds response:', response.data);
      const fundsData = Array.isArray(response.data.data) ? response.data.data : [];
      console.log('Setting funds to:', fundsData);
      setFunds(fundsData);
    } catch (err) {
      console.error('Error fetching funds:', err);
      setFunds([]);
    }
  };

  const fetchOpenRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/emergency-withdrawals');
      setOpenRequests(response.data);
    } catch (err) {
      console.error('Error fetching open requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitNewRequest = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/admin/emergency-withdrawals', {
        fundId: selectedFund,
        amount,
        reason
      });

      setSuccess(`Emergency withdrawal request created successfully! ${response.data.message || ''}`);
      
      // Reset form
      setSelectedFund('');
      setAmount('');
      setReason('');

      // Switch to open requests tab to view
      setTimeout(() => {
        setActiveTab('open-requests');
        fetchOpenRequests();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, governorId) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await axios.post(`/api/admin/emergency-withdrawals/${requestId}/approve`, {
        governorId
      });

      setSuccess(response.data.message || 'Withdrawal request approved successfully!');
      fetchOpenRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (requestId) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await axios.post(`/api/admin/emergency-withdrawals/${requestId}/reject`);
      setSuccess(response.data.message || 'Withdrawal request rejected successfully!');
      fetchOpenRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableGovernors = (request) => {
    if (!request.fund || !request.fund.selectedGovernors) return [];
    
    // Get all governors for the fund
    const fundGovernorIds = request.fund.selectedGovernors;
    
    // Filter out governors who have already approved
    return request.availableGovernors || [];
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('open-requests')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'open-requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Open Requests
            </button>
            <button
              onClick={() => setActiveTab('new-request')}
              className={`px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === 'new-request'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              New Request
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Alerts */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <XCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
              <CheckCircle size={20} />
              <span>{success}</span>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'open-requests' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Open Emergency Withdrawal Requests</h3>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : openRequests.length === 0 ? (
                <p className="text-gray-500">No pending withdrawal requests.</p>
              ) : (
                <div className="space-y-4">
                  {openRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Pension Fund</label>
                          <p className="text-gray-900">{request.fund?.name || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Amount</label>
                          <p className="text-gray-900">{request.amount} {request.fund?.stablecoin || ''}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">Reason</label>
                          <p className="text-gray-900">{request.reason || 'N/A'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Status</label>
                          <p className="text-gray-900">{request.status}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Approved By</label>
                          <p className="text-gray-900">
                            {request.approvedBy?.length || 0} / {request.fund?.selectedGovernors?.length || 0} governors
                          </p>
                        </div>
                      </div>

                      {request.availableGovernors && request.availableGovernors.length > 0 && (
                        <div className="flex gap-4 items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Select Governor to Approve
                            </label>
                            <select
                              id={`governor-${request.id}`}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md"
                              defaultValue=""
                            >
                              <option value="" disabled>Select a governor</option>
                              {request.availableGovernors.map((gov) => (
                                <option key={gov.id} value={gov.id}>
                                  {gov.name} ({gov.email})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const select = document.getElementById(`governor-${request.id}`);
                                if (select.value) {
                                  handleApprove(request.id, select.value);
                                } else {
                                  setError('Please select a governor');
                                }
                              }}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300"
                              disabled={loading}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300"
                              disabled={loading}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                      {(!request.availableGovernors || request.availableGovernors.length === 0) && (
                        <p className="text-sm text-gray-500 italic">All governors have already approved this request.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'new-request' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Create New Emergency Withdrawal Request</h3>
              <form onSubmit={handleSubmitNewRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pension Fund *
                  </label>
                  <select
                    value={selectedFund}
                    onChange={(e) => setSelectedFund(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select a pension fund</option>
                    {Array.isArray(funds) && funds.map((fund) => (
                      <option key={fund.id} value={fund.id}>
                        {fund.name}
                      </option>
                    ))}
                  </select>
                  {funds.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">Loading pension funds...</p>
                  )}
                  {funds.length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{funds.length} fund(s) available</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter amount"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Enter reason for emergency withdrawal"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                    disabled={loading || !selectedFund}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdrawals;
