# 🚀 Quick Reference Card

## One-Page API Reference

### Setup (Do This First!)
```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

### All Endpoints (Alphabetical)

#### Admin (6 endpoints)
```
POST   /api/admin/pension-funds                    ✅ Create fund
GET    /api/admin/pension-funds                    ✅ List funds
POST   /api/admin/workflows                        ✅ Create workflow
GET    /api/admin/investment-proposals             ✅ List proposals
POST   /api/admin/investment-proposals/:id/approve ✅ Approve proposal
POST   /api/admin/investment-proposals/:id/reject  ✅ Reject proposal
```

#### User (10 endpoints)
```
GET    /api/user/:userId/pension-funds                      ✅ Get funds
GET    /api/user/pension-funds/:id                          ✅ Get details
GET    /api/user/pension-funds/:id/transactions             ✅ Get history
POST   /api/user/pension-funds/:id/emergency-withdrawal     ✅ Request withdrawal
GET    /api/user/pension-funds/:id/emergency-withdrawals    ✅ Withdrawal history
POST   /api/user/pension-funds/:id/risk-appetite            ✅ Update risk
GET    /api/user/notifications                              ✅ Get notifications
PATCH  /api/user/notifications/:id/read                     ✅ Mark read
GET    /api/user/preferences                                ✅ Get preferences
PUT    /api/user/preferences                                ✅ Update preferences
```

#### Governor (5 endpoints)
```
GET    /api/governor/pending-approvals                 ✅ Get pending
POST   /api/governor/emergency-withdrawals/:id/approve ✅ Approve withdrawal
POST   /api/governor/emergency-withdrawals/:id/reject  ✅ Reject withdrawal
POST   /api/governor/terminations/:id/approve          ✅ Approve termination
POST   /api/governor/terminations/:id/reject           ✅ Reject termination
```

#### Health (1 endpoint)
```
GET    /api/health                              ✅ Server status
```

---

## Common Request Examples

### Create Pension Fund
```bash
curl -X POST http://localhost:5000/api/admin/pension-funds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fund Name",
    "corpus": "500000",
    "maturity": "2030-12-31",
    "stablecoin": "USDC",
    "contractAddress": "0x...",
    "contractDeployed": true,
    "creatorId": "user123"
  }'
```

### Get User Funds
```bash
curl http://localhost:5000/api/user/user123/pension-funds
```

### Request Withdrawal
```bash
curl -X POST http://localhost:5000/api/user/pension-funds/fund123/emergency-withdrawal \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","amount":"5000","reason":"Medical"}'
```

### Approve Proposal
```bash
curl -X POST http://localhost:5000/api/admin/investment-proposals/prop123/approve \
  -H "Content-Type: application/json" \
  -d '{"approvedBy":"admin123"}'
```

### Approve Withdrawal (Governor)
```bash
curl -X POST http://localhost:5000/api/governor/emergency-withdrawals/req123/approve \
  -H "Content-Type: application/json" \
  -d '{"approvedBy":"gov123"}'
```

---

## Response Formats

### Success (200/201)
```json
{
  "success": true,
  "data": { /* resource */ }
}
```

### Error (400/500)
```json
{
  "error": "Error message"
}
```

### Paginated
```json
{
  "success": true,
  "data": {
    "items": [ /* array */ ],
    "total": 100,
    "page": 1
  }
}
```

---

## Database Models at a Glance

```
User
├─ id, email, wallet, role
├─ PensionFund (1→N)
├─ Notification (1→N)
├─ UserPreferences (1→1)
└─ GovernorApproval (1→N)

PensionFund
├─ id, name, corpus, maturity, status
├─ riskAppetite, contractAddress
├─ InvestmentProposal (1→N)
├─ Workflow (1→N)
├─ Transaction (1→N)
├─ EmergencyWithdrawalRequest (1→N)
└─ TerminationRequest (1→N)

InvestmentProposal
├─ id, fundId, aiScore, expectedROI
└─ riskLevel, status, approvedBy

Workflow
├─ id, fundId, type, status
├─ n8nWorkflowId, lastRun, nextRun

Transaction
├─ id, fundId, txHash, type
├─ amount, status

EmergencyWithdrawalRequest
├─ id, fundId, userId, amount
├─ status (Pending→Approved→Processed)
└─ reason, approvedBy

TerminationRequest
├─ id, fundId, status
└─ reason, approvedBy

Notification
├─ id, userId, title, message
└─ type, read

UserPreferences
├─ id, userId, emailNotifications
├─ pushNotifications, theme, language
```

---

## Status Values

### Pension Fund Status
- `Active` - Fund is running
- `Matured` - Maturity date reached
- `Closed` - Fund terminated

### Investment Proposal Status
- `Pending` - Awaiting approval
- `Approved` - Approved
- `Rejected` - Rejected

### Workflow Status
- `Running` - Currently executing
- `Success` - Completed successfully
- `Failed` - Execution failed
- `Paused` - Paused

### Withdrawal Status
- `Pending` - Awaiting governor approval
- `Approved` - Governor approved
- `Rejected` - Governor rejected
- `Processed` - Payment processed

### Termination Status
- `Pending` - Awaiting governor approval
- `Approved` - Approved (fund closes)
- `Rejected` - Rejected

---

## Service Methods Quick Reference

```javascript
// PensionFundService
PensionFundService.createPensionFund(data)
PensionFundService.getAllPensionFunds(filters)
PensionFundService.getUserPensionFunds(userId)
PensionFundService.getPensionFundDetails(fundId)
PensionFundService.updateRiskAppetite(fundId, risk)

// InvestmentProposalService
InvestmentProposalService.getPendingProposals(filters)
InvestmentProposalService.approveProposal(id, approver)
InvestmentProposalService.rejectProposal(id, approver)

// WorkflowService
WorkflowService.createWorkflow(data)
WorkflowService.getWorkflowsByFund(fundId)
WorkflowService.updateWorkflowStatus(id, status)

// TransactionService
TransactionService.getTransactionHistory(fundId, limit, offset)
TransactionService.createTransaction(data)

// WithdrawalService
WithdrawalService.requestEmergencyWithdrawal(data)
WithdrawalService.approveEmergencyWithdrawal(id, approver)
WithdrawalService.rejectEmergencyWithdrawal(id, approver)

// NotificationService
NotificationService.getUserNotifications(userId, limit, offset)
NotificationService.createNotification(data)
NotificationService.markAsRead(id)

// UserPreferencesService
UserPreferencesService.getUserPreferences(userId)
UserPreferencesService.updateUserPreferences(userId, data)

// TerminationService
TerminationService.getPendingTerminations()
TerminationService.approveTermination(id, approver)
```

---

## Useful Commands

```bash
npm install              # Install dependencies
npm run dev             # Run server with auto-reload
npm start               # Run production server

npx prisma migrate dev --name init      # Create database
npx prisma studio                       # Open database browser
npx prisma generate                     # Regenerate client
npx prisma migrate reset                # Reset database (⚠️)
npx prisma migrate status               # Check migrations
```

---

## File Locations

```
Main entry point:        index.js
Routes:                  src/routes/
Services:                src/services/
Database schema:         prisma/schema.prisma
Environment:             .env

API docs:                API_DOCUMENTATION.md
Architecture:            ARCHITECTURE.md
Getting started:         GETTING_STARTED.md
```

---

## Key Info

| Item | Value |
|------|-------|
| **Base URL** | http://localhost:5000 |
| **Default Port** | 5000 |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Framework** | Express.js |
| **Total Endpoints** | 21 |
| **Service Classes** | 8 |
| **Data Models** | 10 |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `DATABASE_URL not found` | Add `DATABASE_URL` to `.env` |
| `Table does not exist` | Run `npx prisma migrate dev --name init` |
| `Port 5000 in use` | Change `PORT` in `.env` or `.listen()` |
| `Cannot find module` | Run `npm install` |
| `Prisma Client not generated` | Run `npx prisma generate` |

---

## Next Steps

1. ✅ Install dependencies → `npm install`
2. ✅ Setup database → `npx prisma migrate dev --name init`
3. ✅ Start server → `npm run dev`
4. → Test endpoints with cURL/Postman
5. → Add authentication middleware
6. → Deploy to production

---

**Quick Test**: 
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "Server is running",
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

---

📚 For details, see:
- **API_DOCUMENTATION.md** - All endpoints
- **ARCHITECTURE.md** - System design
- **GETTING_STARTED.md** - Setup guide
