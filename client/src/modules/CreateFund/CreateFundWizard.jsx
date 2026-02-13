import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Wallet } from 'ethers'
import { API_HOST } from '../../common/constants'

const CreateFundWizard = () => {
  const [createFundStep, setCreateFundStep] = useState(1)
  
  // StepOne state
  const [fundName, setFundName] = useState('')
  const [fundDescription, setFundDescription] = useState('')
  const [maturityDate, setMaturityDate] = useState('')
  const [stablecoin, setStablecoin] = useState('0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9')
  const [pensionAmount, setPensionAmount] = useState('')
  const [releaseInterval, setReleaseInterval] = useState('')
  
  // StepTwo state
  const [beneficiaries, setBeneficiaries] = useState([])
  
  // StepThree state
  const [numGovernors, setNumGovernors] = useState('')
  const [selectedGovernors, setSelectedGovernors] = useState([])
  
  // StepFour state
  const [timesAllowed, setTimesAllowed] = useState('')
  const [limitPerWithdrawal, setLimitPerWithdrawal] = useState('')
  const [totalLimit, setTotalLimit] = useState('')
  
  // StepFive state
  const [riskAppetite, setRiskAppetite] = useState('MEDIUM')
  const [reserveAmount, setReserveAmount] = useState('')
  const [investmentDuration, setInvestmentDuration] = useState('medium_term')
  
  const [deploying, setDeploying] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [fundCreated, setFundCreated] = useState(false)
  const [createdFundData, setCreatedFundData] = useState(null)

  const steps = [
    { num: 1, label: 'Basic Info' },
    { num: 2, label: 'Beneficiaries' },
    { num: 3, label: 'Governance' },
    { num: 4, label: 'Emergency Rules' },
    { num: 5, label: 'Investment' },
    { num: 6, label: 'Review' }
  ]

  const deployContract = async () => {
    try {
      setDeploying(true)
      
      // Convert maturity date to epoch
      const maturityEpoch = Math.floor(new Date(maturityDate).getTime() / 1000)
      
      // Convert release interval from weeks to seconds
      const releaseIntervalSeconds = Number(releaseInterval) * 7 * 24 * 60 * 60
      
      // Convert amounts to 6 decimals (multiply by 1000000)
      const releaseAmountFormatted = (Number(pensionAmount) * 1000000).toString()
      const limitPerEmergencyFormatted = (Number(limitPerWithdrawal) * 1000000).toString()
      const totalLimitEmergencyFormatted = (Number(totalLimit) * 1000000).toString()
      
      // Get governor addresses from selected IDs (mock data - in production, fetch real addresses)
      const governorsList = [
        { id: 1, address: '0x1234567890123456789012345678901234567890' },
        { id: 2, address: '0x0987654321098765432109876543210987654321' },
        { id: 3, address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd' },
        { id: 4, address: '0xfedbcafedbcafedbcafedbcafedbcafedbcafedb' },
        { id: 5, address: '0x1111111111111111111111111111111111111111' },
        { id: 6, address: '0x2222222222222222222222222222222222222222' }
      ]
      const governorAddresses = selectedGovernors.map(id => 
        governorsList.find(g => g.id === id)?.address || '0x' + '0'.repeat(40)
      )
      
      const payload = {
        beneficiaryAddresses: beneficiaries.map(b => b.address),
        sharePercentages: beneficiaries.map(b => (b.share || 0) * 100), // convert to basis points
        tokenAddress: stablecoin,
        releaseAmount: releaseAmountFormatted,
        releaseInterval: releaseIntervalSeconds.toString(),
        fundMaturityDate: maturityEpoch.toString(),
        causeName: fundName,
        causeDescription: fundDescription,
        governors: governorAddresses,
        requiredNumberofApprovals: numGovernors,
        timesEmergencyWithdrawalAllowed: timesAllowed,
        limitPerEmergencyWithdrawal: limitPerEmergencyFormatted,
        totalLimitForEmergencyWithdrawal: totalLimitEmergencyFormatted
      }
      
      const fullPayload = {
        contract: payload,
        other: {
          beneficiaries: beneficiaries.map(b => ({
            name: b.name,
            email: b.email,
            relationship: b.relationship,
            share: b.share,
            address: b.address,
            privateKey: b.privateKey
          })),
          numGovernors,
          selectedGovernors,
          riskAppetite,
          reserveAmount,
          investmentDuration
        }
      }
      
      const response = await fetch(`${API_HOST}/api/funds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullPayload)
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const result = await response.json()
      setCreatedFundData(result.fund)
      setFundCreated(true)
    } catch (error) {
      alert('Error deploying fund: ' + error.message)
    } finally {
      setDeploying(false)
    }
  }

  const handleNextStep = () => {
    let error = ''
    switch (createFundStep) {
      case 1:
        if (!isStep1Valid()) {
          error = 'Please fill in all required fields before proceeding to the next step.'
        }
        break
      case 2:
        const totalShare = beneficiaries.reduce((sum, b) => sum + (b.share || 0), 0)
        if (totalShare !== 100) {
          error = 'The cumulative share percentage of all beneficiaries must equal 100%.'
        } else if (!isStep2Valid()) {
          error = 'Please add at least one beneficiary.'
        }
        break
      case 3:
        if (!isStep3Valid()) {
          error = 'Please ensure the number of governors and selected governors match.'
        }
        break
      case 4:
        if (!isStep4Valid()) {
          error = 'Please fill in all emergency rule fields.'
        }
        break
      case 5:
        if (!isStep5Valid()) {
          error = 'Please select a risk appetite.'
        }
        break
      default:
        break
    }

    if (error) {
      setErrorMessage(error)
    } else {
      setErrorMessage('')
      setCreateFundStep(Math.min(6, createFundStep + 1))
    }
  }

  // Validation functions for each step
  const isStep1Valid = () => {
    return fundName.trim() && fundDescription.trim() && maturityDate && pensionAmount && releaseInterval
  }

  const isStep2Valid = () => {
    const totalShare = beneficiaries.reduce((sum, b) => sum + (b.share || 0), 0)
    if (totalShare !== 100) {
      setErrorMessage('The cumulative share percentage of all beneficiaries must equal 100%.')
      return false
    }
    return beneficiaries.length > 0
  }

  const isStep3Valid = () => {
    return numGovernors && selectedGovernors.length === Number(numGovernors)
  }

  const isStep4Valid = () => {
    return timesAllowed && limitPerWithdrawal && totalLimit
  }

  const isStep5Valid = () => {
    return true // riskAppetite always has a default value
  }

  const isCurrentStepValid = () => {
    switch (createFundStep) {
      case 1:
        return isStep1Valid()
      case 2:
        return isStep2Valid()
      case 3:
        return isStep3Valid()
      case 4:
        return isStep4Valid()
      case 5:
        return isStep5Valid()
      case 6:
        return true // Review step is always valid
      default:
        return false
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Pension Fund</h1>
        <p className="text-slate-600 mt-1">Deploy a new smart contract for pension management</p>
      </div>

      {/* Progress Steps */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => (
            <React.Fragment key={step.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  createFundStep === step.num ? 'bg-blue-600 text-white' :
                  createFundStep > step.num ? 'bg-green-500 text-white' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {createFundStep > step.num ? <CheckCircle size={20} /> : step.num}
                </div>
                <p className={`text-xs mt-2 ${createFundStep === step.num ? 'text-blue-600 font-semibold' : 'text-slate-600'}`}>
                  {step.label}
                </p>
              </div>
              {idx < 5 && (
                <div className={`flex-1 h-1 mx-2 ${createFundStep > step.num ? 'bg-green-500' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      {createFundStep === 1 && <StepOne fundName={fundName} setFundName={setFundName} fundDescription={fundDescription} setFundDescription={setFundDescription} maturityDate={maturityDate} setMaturityDate={setMaturityDate} stablecoin={stablecoin} setStablecoin={setStablecoin} pensionAmount={pensionAmount} setPensionAmount={setPensionAmount} releaseInterval={releaseInterval} setReleaseInterval={setReleaseInterval} />}
      {createFundStep === 2 && <StepTwo beneficiaries={beneficiaries} setBeneficiaries={setBeneficiaries} />}
      {createFundStep === 3 && <StepThree numGovernors={numGovernors} setNumGovernors={setNumGovernors} selectedGovernors={selectedGovernors} setSelectedGovernors={setSelectedGovernors} />}
      {createFundStep === 4 && <StepFour timesAllowed={timesAllowed} setTimesAllowed={setTimesAllowed} limitPerWithdrawal={limitPerWithdrawal} setLimitPerWithdrawal={setLimitPerWithdrawal} totalLimit={totalLimit} setTotalLimit={setTotalLimit} />}
      {createFundStep === 5 && <StepFive riskAppetite={riskAppetite} setRiskAppetite={setRiskAppetite} reserveAmount={reserveAmount} setReserveAmount={setReserveAmount} investmentDuration={investmentDuration} setInvestmentDuration={setInvestmentDuration} />}
      {createFundStep === 6 && !fundCreated && <StepSix fundName={fundName} fundDescription={fundDescription} maturityDate={maturityDate} stablecoin={stablecoin} pensionAmount={pensionAmount} releaseInterval={releaseInterval} beneficiaries={beneficiaries} numGovernors={numGovernors} selectedGovernors={selectedGovernors} timesAllowed={timesAllowed} limitPerWithdrawal={limitPerWithdrawal} totalLimit={totalLimit} riskAppetite={riskAppetite} reserveAmount={reserveAmount} investmentDuration={investmentDuration} />}
      {createFundStep === 6 && fundCreated && <SuccessMessage fund={createdFundData} />}

      {/* Navigation Buttons */}
      {!fundCreated && <div className="flex justify-between">
        <button
          onClick={() => setCreateFundStep(Math.max(1, createFundStep - 1))}
          disabled={createFundStep === 1}
          className="px-6 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {errorMessage && (
          <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
        )}
        {createFundStep === 6 ? (
          <button
            onClick={deployContract}
            disabled={deploying}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deploying ? 'Deploying...' : 'Create Fund'}
          </button>
        ) : (
          <button
            onClick={handleNextStep}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next Step
          </button>
        )}
      </div>}
    </div>
  )
}

const SuccessMessage = ({ fund }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle size={40} className="text-green-600" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Fund Created Successfully!</h2>
          <p className="text-slate-600">Your pension fund has been deployed to the blockchain.</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <div className="space-y-3 text-left">
            <div>
              <p className="text-sm text-slate-600">Fund Name</p>
              <p className="font-semibold text-slate-900">{fund?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Contract Address</p>
              <p className="font-mono text-sm text-blue-600 break-all">{fund?.contractAddress || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Fund ID</p>
              <p className="font-mono text-sm text-slate-900">{fund?.id || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            to={`/fund/${fund?.id}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            View Fund Details
          </Link>
          <Link
            to="/funds"
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
          >
            Back to Funds List
          </Link>
        </div>
      </div>
    </div>
  )
}

const StepOne = ({ fundName, setFundName, fundDescription, setFundDescription, maturityDate, setMaturityDate, stablecoin, setStablecoin, pensionAmount, setPensionAmount, releaseInterval, setReleaseInterval }) => {
  const stablecoins = [
    { label: 'PYUSD - PayPal USD', value: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9' },
    { label: 'USDC - USD Coin', value: '0xf08a50178dfcde18524640ea6618a1f965821715' },
    { label: 'USDT - Tether', value: '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' }
  ]

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Basic Information</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Fund Name *</label>
          <input
            type="text"
            value={fundName}
            onChange={e => setFundName(e.target.value)}
            placeholder="e.g., Johnson Family Pension Fund"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
          <p className="text-xs text-slate-500 mt-1">Maximum 100 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Fund Description *</label>
          <textarea
            value={fundDescription}
            onChange={e => setFundDescription(e.target.value)}
            placeholder="Describe the purpose and goals of this pension fund..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            maxLength={500}
          />
          <p className="text-xs text-slate-500 mt-1">Maximum 500 characters</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Maturity Date *</label>
            <input
              type="date"
              value={maturityDate}
              onChange={e => setMaturityDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Stablecoin *</label>
            <select value={stablecoin} onChange={e => setStablecoin(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {stablecoins.map(coin => (
                <option key={coin.value} value={coin.value}>{coin.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pension (Release) Amount *</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={pensionAmount}
                onChange={e => setPensionAmount(e.target.value)}
                placeholder="e.g., 5000"
                step="0.01"
                min="0"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-medium">USD</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Amount released per pension payout</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Release Interval *</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={releaseInterval}
                onChange={e => setReleaseInterval(e.target.value)}
                placeholder="e.g., 4"
                min="1"
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-medium">Weeks</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Frequency of pension payouts in weeks</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const StepTwo = ({ beneficiaries, setBeneficiaries }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [relationship, setRelationship] = useState('Father')
  const [share, setShare] = useState('')

  const persist = (list) => {
    setBeneficiaries(list)
  }

  const addBeneficiary = () => {
    if (!name.trim() || !email.trim()) return
    const wallet = Wallet.createRandom()
    const b = {
      id: Date.now(),
      name: name.trim(),
      relationship,
      share: share ? Number(share) : null,
      email: email.trim(),
      address: wallet.address,
      privateKey: wallet.privateKey
    }
    const next = [...beneficiaries, b]
    persist(next)
    setName('')
    setEmail('')
    setShare('')
    setRelationship('Father')
  }

  const removeBeneficiary = (id) => {
    const next = beneficiaries.filter(b => b.id !== id)
    persist(next)
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Beneficiaries Configuration</h2>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Add Beneficiary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                type="text" placeholder="Full name"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                type="email" placeholder="example@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Relationship</label>
              <select value={relationship} onChange={e => setRelationship(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Self</option>
                <option>Father</option>
                <option>Mother</option>
                <option>Son</option>
                <option>Daughter</option>
                <option>Wife</option>
                <option>Sibling</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Share Percentage</label>
              <input value={share} onChange={e => setShare(e.target.value)} type="number" placeholder="33.33"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <button onClick={addBeneficiary} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-3">Added Beneficiaries</h3>
          {beneficiaries.length === 0 && <p className="text-sm text-slate-500">No beneficiaries added yet.</p>}
          <ul className="space-y-3 mt-3">
            {beneficiaries.map(b => (
              <li key={b.id} className="p-3 border border-slate-200 rounded-lg flex justify-between items-start">
                <div>
                  <div className="font-semibold">{b.name} <span className="text-sm text-slate-500">({b.relationship})</span></div>
                  <div className="text-xs text-slate-600">Address: {b.address}</div>
                  {b.share != null && <div className="text-xs text-slate-600">Share: {b.share}%</div>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button onClick={() => navigator.clipboard?.writeText(b.address)} className="text-sm text-blue-600">Copy Address</button>
                  <button onClick={() => removeBeneficiary(b.id)} className="text-sm text-red-600">Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const StepThree = ({ numGovernors, setNumGovernors, selectedGovernors, setSelectedGovernors }) => {
  const governorsList = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com' },
    { id: 3, name: 'Carol Williams', email: 'carol@example.com' },
    { id: 4, name: 'David Brown', email: 'david@example.com' },
    { id: 5, name: 'Emma Davis', email: 'emma@example.com' },
    { id: 6, name: 'Frank Miller', email: 'frank@example.com' }
  ]

  const handleGovernorSelect = (governorId) => {
    const max = numGovernors ? Number(numGovernors) : Infinity
    if (selectedGovernors.includes(governorId)) {
      setSelectedGovernors(selectedGovernors.filter(id => id !== governorId))
    } else if (selectedGovernors.length < max) {
      setSelectedGovernors([...selectedGovernors, governorId])
    }
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Governance Configuration</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Number of Governors *</label>
          <input
            type="number"
            value={numGovernors}
            onChange={e => setNumGovernors(e.target.value)}
            placeholder="e.g., 3"
            min="1"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">Specify the number of governors for this fund</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Governors</label>
          <p className="text-xs text-slate-600 mb-3">
            {numGovernors ? `Select up to ${numGovernors} governors` : 'Enter number of governors first'}
          </p>
          <div className="border border-slate-300 rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
            {governorsList.map(governor => (
              <label key={governor.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={selectedGovernors.includes(governor.id)}
                  onChange={() => handleGovernorSelect(governor.id)}
                  disabled={!numGovernors || (selectedGovernors.length >= Number(numGovernors) && !selectedGovernors.includes(governor.id))}
                  className="w-4 h-4 cursor-pointer"
                />
                <div>
                  <div className="font-medium text-slate-900">{governor.name}</div>
                  <div className="text-xs text-slate-500">{governor.email}</div>
                </div>
              </label>
            ))}
          </div>
          {selectedGovernors.length > 0 && (
            <p className="text-sm text-blue-600 mt-3">
              Selected: {selectedGovernors.length} / {numGovernors || '?'} governors
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const StepFour = ({ timesAllowed, setTimesAllowed, limitPerWithdrawal, setLimitPerWithdrawal, totalLimit, setTotalLimit }) => {

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Emergency Rules Configuration</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Times Emergency Withdrawal Allowed *</label>
          <input
            type="number"
            value={timesAllowed}
            onChange={e => setTimesAllowed(e.target.value)}
            placeholder="e.g., 3"
            min="1"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">Maximum number of times emergency withdrawal can be triggered</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Limit Per Emergency Withdrawal *</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={limitPerWithdrawal}
              onChange={e => setLimitPerWithdrawal(e.target.value)}
              placeholder="e.g., 50000"
              step="0.01"
              min="0"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-medium">USD</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Maximum amount allowed per single emergency withdrawal</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Total Limit For Emergency Withdrawal *</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={totalLimit}
              onChange={e => setTotalLimit(e.target.value)}
              placeholder="e.g., 150000"
              step="0.01"
              min="0"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-medium">USD</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Total cumulative amount allowed for all emergency withdrawals</p>
        </div>
      </div>
    </div>
  )
}

const StepFive = ({ riskAppetite, setRiskAppetite, reserveAmount, setReserveAmount, investmentDuration, setInvestmentDuration }) => {

  const riskLevels = [
    { value: 'LOW', label: 'Low Risk', description: 'Conservative approach with stable, low-volatility investments' },
    { value: 'MEDIUM', label: 'Medium Risk', description: 'Balanced portfolio with mix of stable and growth investments' },
    { value: 'HIGH', label: 'High Risk', description: 'Aggressive approach targeting higher returns with higher volatility' }
  ]

  const durationOptions = [
    { value: 'short_term', label: 'Short Term', description: 'Investments with duration less than 1 year' },
    { value: 'medium_term', label: 'Medium Term', description: 'Investments with duration between 1-5 years' },
    { value: 'long_term', label: 'Long Term', description: 'Investments with duration more than 5 years' }
  ]

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Investment Configuration</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-4">Risk Appetite *</label>
          <div className="grid grid-cols-1 gap-3">
            {riskLevels.map(level => (
              <label key={level.value} className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                style={{
                  borderColor: riskAppetite === level.value ? '#2563eb' : '#e2e8f0',
                  backgroundColor: riskAppetite === level.value ? '#eff6ff' : '#ffffff'
                }}>
                <input
                  type="radio"
                  name="riskAppetite"
                  value={level.value}
                  checked={riskAppetite === level.value}
                  onChange={e => setRiskAppetite(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <div className="ml-4">
                  <div className="font-semibold text-slate-900">{level.label}</div>
                  <div className="text-sm text-slate-600">{level.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Reserve Amount *</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={reserveAmount}
              onChange={e => setReserveAmount(e.target.value)}
              placeholder="e.g., 100000"
              step="0.01"
              min="0"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 font-medium">USD</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Amount reserved for emergency or special circumstances</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-4">Investment Duration *</label>
          <div className="grid grid-cols-1 gap-3">
            {durationOptions.map(duration => (
              <label key={duration.value} className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all"
                style={{
                  borderColor: investmentDuration === duration.value ? '#2563eb' : '#e2e8f0',
                  backgroundColor: investmentDuration === duration.value ? '#eff6ff' : '#ffffff'
                }}>
                <input
                  type="radio"
                  name="investmentDuration"
                  value={duration.value}
                  checked={investmentDuration === duration.value}
                  onChange={e => setInvestmentDuration(e.target.value)}
                  className="w-4 h-4 cursor-pointer"
                />
                <div className="ml-4">
                  <div className="font-semibold text-slate-900">{duration.label}</div>
                  <div className="text-sm text-slate-600">{duration.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const StepSix = ({ fundName, fundDescription, maturityDate, stablecoin, pensionAmount, releaseInterval, beneficiaries, numGovernors, selectedGovernors, timesAllowed, limitPerWithdrawal, totalLimit, riskAppetite, reserveAmount, investmentDuration }) => {
  const stablecoinLabels = {
    '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9': 'PYUSD - PayPal USD',
    '0xf08a50178dfcde18524640ea6618a1f965821715': 'USDC - USD Coin',
    '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0': 'USDT - Tether'
  }

  const governorsList = [
    { id: 1, name: 'Alice Johnson' },
    { id: 2, name: 'Bob Smith' },
    { id: 3, name: 'Carol Williams' },
    { id: 4, name: 'David Brown' },
    { id: 5, name: 'Emma Davis' },
    { id: 6, name: 'Frank Miller' }
  ]

  const selectedGovernorNames = selectedGovernors.map(id => 
    governorsList.find(g => g.id === id)?.name || 'Unknown'
  )

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900 mb-6">Review Summary</h2>

      <div className="space-y-6">
        <div className="border-l-4 border-blue-600 pl-4">
          <h3 className="font-semibold text-slate-900 mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600">Fund Name</p>
              <p className="font-medium">{fundName || '—'}</p>
            </div>
            <div>
              <p className="text-slate-600">Stablecoin</p>
              <p className="font-medium">{stablecoinLabels[stablecoin] || '—'}</p>
            </div>
            <div>
              <p className="text-slate-600">Fund Description</p>
              <p className="font-medium">{fundDescription || '—'}</p>
            </div>
            <div>
              <p className="text-slate-600">Maturity Date</p>
              <p className="font-medium">{maturityDate || '—'}</p>
            </div>
            <div>
              <p className="text-slate-600">Pension Amount</p>
              <p className="font-medium">${pensionAmount || '—'}</p>
            </div>
            <div>
              <p className="text-slate-600">Release Interval</p>
              <p className="font-medium">{releaseInterval || '—'} weeks</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-green-600 pl-4">
          <h3 className="font-semibold text-slate-900 mb-3">Beneficiaries ({beneficiaries.length})</h3>
          {beneficiaries.length === 0 ? (
            <p className="text-sm text-slate-500">No beneficiaries added</p>
          ) : (
            <ul className="text-sm space-y-2">
              {beneficiaries.map(b => (
                <li key={b.id} className="text-slate-700">
                  <span className="font-medium">{b.name}</span> ({b.relationship}) — {b.share || 0}% <span className="text-slate-500">{b.address}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-l-4 border-purple-600 pl-4">
          <h3 className="font-semibold text-slate-900 mb-3">Governance</h3>
          <div className="text-sm">
            <p className="text-slate-600">Number of Governors: <span className="font-medium">{numGovernors || '—'}</span></p>
            <p className="text-slate-600">Selected Governors:</p>
            {selectedGovernorNames.length === 0 ? (
              <p className="text-slate-500">None selected</p>
            ) : (
              <ul className="font-medium">
                {selectedGovernorNames.map((name, idx) => (
                  <li key={idx}>• {name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-l-4 border-orange-600 pl-4">
          <h3 className="font-semibold text-slate-900 mb-3">Emergency Rules</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <p className="text-slate-600">Times Allowed</p>
              <p className="font-medium">{timesAllowed || '—'}</p>
            </div>
            <div>
              <p className="text-slate-600">Limit Per Withdrawal</p>
              <p className="font-medium">${limitPerWithdrawal || '—'}</p>
            </div>
            <div>
              <p className="text-slate-600">Total Limit</p>
              <p className="font-medium">${totalLimit || '—'}</p>
            </div>
          </div>
        </div>

        <div className="border-l-4 border-red-600 pl-4">
          <h3 className="font-semibold text-slate-900 mb-3">Investment</h3>
          <div className="text-sm space-y-2">
            <div>
              <p className="text-slate-600">Risk Appetite</p>
              <p className="font-medium">{riskAppetite}</p>
            </div>
            <div>
              <p className="text-slate-600">Reserve Amount</p>
              <p className="font-medium">${reserveAmount || '—'}</p>
            </div>
            <div>
              <p className="text-slate-600">Investment Duration</p>
              <p className="font-medium">{investmentDuration?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateFundWizard
