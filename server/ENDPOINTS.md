# API Endpoints Overview

## Complete Endpoint Map

### 🏥 Health & System
```
GET  /api/health                           - Server status
```

### 👤 Admin Endpoints
```
POST /api/admin/pension-funds              - Create new pension fund
GET  /api/admin/pension-funds              - List all pension funds
POST /api/admin/workflows                  - Create n8n workflow
GET  /api/admin/investment-proposals       - List pending proposals
POST /api/admin/investment-proposals/:id/approve   - Approve proposal
POST /api/admin/investment-proposals/:id/reject    - Reject proposal
```

### 👥 User Endpoints
```
GET  /api/user/:userId/pension-funds                           - Get user's funds
GET  /api/user/pension-funds/:id                              - Get fund details
GET  /api/user/pension-funds/:id/transactions                 - Get transaction history
POST /api/user/pension-funds/:id/emergency-withdrawal         - Request emergency withdrawal
GET  /api/user/pension-funds/:id/emergency-withdrawals        - Get withdrawal history
POST /api/user/pension-funds/:id/risk-appetite                - Update risk appetite
GET  /api/user/notifications                                  - Get notifications
PATCH /api/user/notifications/:id/read                        - Mark as read
GET  /api/user/preferences                                    - Get user preferences
PUT  /api/user/preferences                                    - Update preferences
```

### 👨‍⚖️ Governor Endpoints
```
GET  /api/governor/pending-approvals                          - Get pending approvals
POST /api/governor/emergency-withdrawals/:id/approve          - Approve withdrawal
POST /api/governor/emergency-withdrawals/:id/reject           - Reject withdrawal
POST /api/governor/terminations/:id/approve                   - Approve termination
POST /api/governor/terminations/:id/reject                    - Reject termination
```

## Data Flow Diagrams

### Creating a Pension Fund (Admin)
```
Admin Frontend
      ↓
  POST /api/admin/pension-funds
      ↓
  Admin Route Handler
      ↓
  PensionFundService.createPensionFund()
      ↓
  Prisma ORM
      ↓
  PostgreSQL Database
      ↓
  Return fund object + contract deployment info
```

### User Requesting Emergency Withdrawal
```
User Frontend
      ↓
  POST /api/user/pension-funds/:id/emergency-withdrawal
      ↓
  User Route Handler
      ↓
  WithdrawalService.requestEmergencyWithdrawal()
      ↓
  Prisma ORM
      ↓
  PostgreSQL Database
      ↓
  Notification created for governors
      ↓
  Return withdrawal request (status: Pending)
```

### Governor Approving Withdrawal
```
Governor Frontend
      ↓
  POST /api/governor/emergency-withdrawals/:id/approve
      ↓
  Governor Route Handler
      ↓
  WithdrawalService.approveEmergencyWithdrawal()
      ↓
  Update EmergencyWithdrawalRequest (status: Approved)
      ↓
  Create Notification for user
      ↓
  Return approved request
```

## Service Interaction Map

```
Routes
├── admin.js ────────────┐
├── user.js ──────────┐  │
├── governor.js ──┐   │  │
└── health.js  ┌──┴─┬─┴──┴──────────────┐
               │    │                   │
           Health  Funds          PensionFundService
            Check  API           ├─ create
                               ├─ getAll
                               ├─ getByUser
                               ├─ getDetails
                               └─ updateRiskAppetite
                               
                               InvestmentProposalService
                               ├─ getPending
                               ├─ getByFund
                               ├─ approve
                               └─ reject
                               
                               WorkflowService
                               ├─ create
                               ├─ getByFund
                               ├─ updateStatus
                               └─ scheduleNext
                               
                               TransactionService
                               ├─ getHistory
                               ├─ create
                               └─ updateStatus
                               
                               WithdrawalService
                               ├─ request
                               ├─ approve
                               ├─ reject
                               └─ process
                               
                               NotificationService
                               ├─ get
                               ├─ create
                               ├─ markAsRead
                               └─ delete
                               
                               UserPreferencesService
                               ├─ get
                               ├─ update
                               ├─ updateTheme
                               └─ updateLanguage
                               
                               TerminationService
                               ├─ getPending
                               ├─ create
                               ├─ approve
                               └─ reject
                               
                                    ↓
                            Prisma Client
                                    ↓
                            PostgreSQL Database
```

## Database Schema Relationships

```
User (1) ──────────────────────────┐
│                                   │
├─→ (N) PensionFund                │
│        ├─→ (N) InvestmentProposal│
│        ├─→ (N) Workflow          │
│        ├─→ (N) Transaction       │
│        ├─→ (N) EmergencyWithdrawal│
│        └─→ (N) TerminationRequest│
│                                   │
├─→ (1) UserPreferences            │
├─→ (N) Notification               │
└─→ (N) GovernorApproval           │
```

## State Transitions

### Pension Fund Status
```
Created → Active → Matured → Closed
                    (if approved for termination)
```

### Investment Proposal Status
```
Pending → Approved
       → Rejected
```

### Workflow Status
```
Running → Success
       → Failed
       → Paused
```

### Emergency Withdrawal Status
```
Pending → Approved → Processed
       → Rejected
```

### Termination Request Status
```
Pending → Approved (fund closes)
       → Rejected
```

## Query Patterns

### Filtering & Pagination
```javascript
// Get active funds only
GET /api/admin/pension-funds?status=Active

// Get funds with pagination
GET /api/user/pension-funds/:id/transactions?limit=25&offset=50

// Multiple filters
GET /api/admin/investment-proposals?fundId=fund123&riskLevel=HIGH
```

### Response Format
```javascript
// Success (200)
{
  "success": true,
  "data": { /* resource or array of resources */ }
}

// Error (400, 500)
{
  "error": "Descriptive error message"
}

// Paginated Response
{
  "success": true,
  "data": {
    "items": [ /* array */ ],
    "total": 150,
    "page": 1
  }
}
```

## Authentication Placeholder

Add JWT middleware to protect routes:
```javascript
// In main index.js
app.use('/api/admin', authenticateAdmin);
app.use('/api/governor', authenticateGovernor);
app.use('/api/user', authenticateUser);
```

## Rate Limiting Placeholder

Implement rate limiting:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api', limiter);
```

## Testing Checklist

- [ ] Health endpoint returns 200
- [ ] Create pension fund returns 201
- [ ] List funds returns array
- [ ] Get fund details works
- [ ] User can request emergency withdrawal
- [ ] Governor can approve withdrawal
- [ ] Notifications are created
- [ ] User preferences save correctly
- [ ] Workflow creation returns n8nWorkflowId
- [ ] Investment proposal approve/reject works
- [ ] Fund termination marks status as Closed
- [ ] Pagination works with limit/offset
