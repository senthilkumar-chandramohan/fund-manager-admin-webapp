# Fund Manager API Documentation

## Overview
The Fund Manager API provides endpoints for managing pension funds, investment proposals, workflows, and user preferences. The API uses Prisma for database operations with PostgreSQL.

## Database Setup

### Prerequisites
- PostgreSQL database
- Prisma CLI installed globally

### Initialize Prisma
```bash
npm install
npx prisma migrate dev --name init
```

This will:
1. Create all tables in PostgreSQL
2. Generate Prisma Client

## API Endpoints

### Admin Endpoints (`/api/admin`)

#### Create Pension Fund
```
POST /api/admin/pension-funds
Content-Type: application/json

{
  "name": "Johnson Family Pension",
  "description": "Pension fund for Johnson family",
  "corpus": "125430",
  "maturity": "2028-06-15",
  "stablecoin": "USDC",
  "riskAppetite": "MEDIUM",
  "contractAddress": "0x9D30A06cdB7e17e9CFe99581d1806c9b538A7b20",
  "contractDeployed": true,
  "creatorId": "user123"
}

Response: 201
{
  "success": true,
  "data": { /* fund object */ }
}
```

#### List All Pension Funds
```
GET /api/admin/pension-funds?status=Active&stablecoin=USDC

Response: 200
{
  "success": true,
  "data": [ /* array of funds */ ]
}
```

#### Create Workflow
```
POST /api/admin/workflows
Content-Type: application/json

{
  "fundId": "fund123",
  "type": "Investment Allocation",
  "n8nWorkflowId": "workflow456",
  "nextRun": "2026-02-01T10:00:00Z"
}

Response: 201
{
  "success": true,
  "data": { /* workflow object */ }
}
```

#### List Pending Investment Proposals
```
GET /api/admin/investment-proposals?fundId=fund123&riskLevel=MEDIUM

Response: 200
{
  "success": true,
  "data": [ /* array of proposals */ ]
}
```

#### Approve Investment Proposal
```
POST /api/admin/investment-proposals/{id}/approve
Content-Type: application/json

{
  "approvedBy": "admin123"
}

Response: 200
{
  "success": true,
  "data": { /* updated proposal */ }
}
```

#### Reject Investment Proposal
```
POST /api/admin/investment-proposals/{id}/reject
Content-Type: application/json

{
  "approvedBy": "admin123"
}

Response: 200
{
  "success": true,
  "data": { /* updated proposal */ }
}
```

---

### User Endpoints (`/api/user`)

#### Get User's Pension Funds
```
GET /api/user/{userId}/pension-funds

Response: 200
{
  "success": true,
  "data": [ /* array of funds */ ]
}
```

#### Get Pension Fund Details
```
GET /api/user/pension-funds/{fundId}

Response: 200
{
  "success": true,
  "data": { /* fund with details */ }
}
```

#### Get Transaction History
```
GET /api/user/pension-funds/{fundId}/transactions?limit=50&offset=0

Response: 200
{
  "success": true,
  "data": {
    "transactions": [ /* array of transactions */ ],
    "total": 150,
    "page": 1
  }
}
```

#### Request Emergency Withdrawal
```
POST /api/user/pension-funds/{fundId}/emergency-withdrawal
Content-Type: application/json

{
  "userId": "user123",
  "amount": "5000",
  "reason": "Medical emergency"
}

Response: 201
{
  "success": true,
  "data": { /* withdrawal request */ }
}
```

#### Get Emergency Withdrawal History
```
GET /api/user/pension-funds/{fundId}/emergency-withdrawals

Response: 200
{
  "success": true,
  "data": [ /* array of requests */ ]
}
```

#### Update Risk Appetite
```
POST /api/user/pension-funds/{fundId}/risk-appetite
Content-Type: application/json

{
  "riskAppetite": "HIGH"
}

Response: 200
{
  "success": true,
  "data": { /* updated fund */ }
}
```

#### Get User Notifications
```
GET /api/user/notifications?userId=user123&limit=20&offset=0

Response: 200
{
  "success": true,
  "data": {
    "notifications": [ /* array of notifications */ ],
    "total": 50,
    "unread": 5,
    "page": 1
  }
}
```

#### Mark Notification as Read
```
PATCH /api/user/notifications/{notificationId}/read

Response: 200
{
  "success": true,
  "data": { /* updated notification */ }
}
```

#### Get User Preferences
```
GET /api/user/preferences?userId=user123

Response: 200
{
  "success": true,
  "data": {
    "id": "pref123",
    "userId": "user123",
    "emailNotifications": true,
    "pushNotifications": true,
    "theme": "light",
    "language": "en"
  }
}
```

#### Update User Preferences
```
PUT /api/user/preferences
Content-Type: application/json

{
  "userId": "user123",
  "emailNotifications": true,
  "pushNotifications": false,
  "theme": "dark",
  "language": "en"
}

Response: 200
{
  "success": true,
  "data": { /* updated preferences */ }
}
```

---

### Governor Endpoints (`/api/governor`)

#### Get Pending Approvals
```
GET /api/governor/pending-approvals

Response: 200
{
  "success": true,
  "data": [
    {
      "id": "req123",
      "type": "emergency_withdrawal",
      "data": { /* request details */ }
    },
    {
      "id": "term456",
      "type": "termination",
      "data": { /* termination details */ }
    }
  ]
}
```

#### Approve Emergency Withdrawal
```
POST /api/governor/emergency-withdrawals/{id}/approve
Content-Type: application/json

{
  "approvedBy": "governor123"
}

Response: 200
{
  "success": true,
  "data": { /* updated request */ }
}
```

#### Reject Emergency Withdrawal
```
POST /api/governor/emergency-withdrawals/{id}/reject
Content-Type: application/json

{
  "approvedBy": "governor123"
}

Response: 200
{
  "success": true,
  "data": { /* updated request */ }
}
```

#### Approve Termination Request
```
POST /api/governor/terminations/{id}/approve
Content-Type: application/json

{
  "approvedBy": "governor123"
}

Response: 200
{
  "success": true,
  "data": { /* updated request, fund marked as Closed */ }
}
```

#### Reject Termination Request
```
POST /api/governor/terminations/{id}/reject
Content-Type: application/json

{
  "approvedBy": "governor123"
}

Response: 200
{
  "success": true,
  "data": { /* updated request */ }
}
```

---

## Database Models

### User
- id (String, primary key)
- email (String, unique)
- name (String)
- wallet (String, unique)
- role (String: admin, governor, user)
- createdAt, updatedAt

### PensionFund
- id (String, primary key)
- name, description
- corpus, maturity, status, stablecoin, roi
- riskAppetite (LOW, MEDIUM, HIGH)
- contractAddress, contractDeployed
- creatorId (Foreign key to User)

### InvestmentProposal
- id (String, primary key)
- fundId (Foreign key)
- aiScore, expectedROI, riskLevel
- status (Pending, Approved, Rejected)
- approvedAt, rejectedAt

### Workflow
- id (String, primary key)
- fundId (Foreign key)
- type, status, n8nWorkflowId
- lastRun, nextRun

### Transaction
- id (String, primary key)
- fundId, txHash, type, amount, status

### EmergencyWithdrawalRequest
- id (String, primary key)
- fundId, userId, amount, reason
- status (Pending, Approved, Rejected, Processed)
- approvedAt, approvedBy

### TerminationRequest
- id (String, primary key)
- fundId, reason
- status (Pending, Approved, Rejected)
- approvedAt, approvedBy

### Notification
- id (String, primary key)
- userId, title, message, type, read

### UserPreferences
- id (String, primary key)
- userId (unique)
- emailNotifications, pushNotifications
- theme, language

---

## Service Modules

### PensionFundService
- `createPensionFund(data)` - Create new pension fund
- `getAllPensionFunds(filters)` - Get all funds with optional filters
- `getUserPensionFunds(userId)` - Get funds created by user
- `getPensionFundDetails(fundId)` - Get detailed fund information
- `updateRiskAppetite(fundId, riskAppetite)` - Update risk appetite

### InvestmentProposalService
- `getPendingProposals(filters)` - Get pending proposals
- `approveProposal(proposalId, approvedBy)` - Approve proposal
- `rejectProposal(proposalId, approvedBy)` - Reject proposal

### WorkflowService
- `createWorkflow(data)` - Create workflow
- `getWorkflowsByFund(fundId)` - Get fund workflows
- `updateWorkflowStatus(workflowId, status)` - Update status

### TransactionService
- `getTransactionHistory(fundId, limit, offset)` - Get transaction history with pagination
- `createTransaction(data)` - Create transaction

### WithdrawalService
- `requestEmergencyWithdrawal(data)` - Request withdrawal
- `approveEmergencyWithdrawal(requestId, approvedBy)` - Approve request
- `rejectEmergencyWithdrawal(requestId, approvedBy)` - Reject request

### NotificationService
- `getUserNotifications(userId, limit, offset)` - Get notifications with pagination
- `createNotification(data)` - Create notification
- `markAsRead(notificationId)` - Mark single as read
- `markAllAsRead(userId)` - Mark all as read

### UserPreferencesService
- `getUserPreferences(userId)` - Get preferences (creates defaults if needed)
- `updateUserPreferences(userId, data)` - Update preferences
- `updateTheme(userId, theme)` - Update theme
- `updateLanguage(userId, language)` - Update language

### TerminationService
- `getPendingTerminations()` - Get pending requests
- `createTerminationRequest(fundId, reason)` - Create request
- `approveTermination(terminationId, approvedBy)` - Approve (closes fund)
- `rejectTermination(terminationId, approvedBy)` - Reject request

---

## Error Handling

All endpoints return standard error responses:
```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (missing required fields)
- 404: Not Found
- 500: Server Error

---

## Notes

- All dates are in ISO 8601 format
- Large numbers (corpus, amount) are stored as strings to prevent precision loss
- Pagination uses limit (default 50) and offset (default 0) parameters
- User roles: "admin" (can create funds, approve proposals), "governor" (can approve withdrawals/terminations), "user" (standard user)
