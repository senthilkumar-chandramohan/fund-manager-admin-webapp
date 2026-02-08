# Server Architecture Summary

## Project Structure

```
server/
├── index.js                          # Main entry point
├── package.json                      # Dependencies (Express, Prisma, CORS)
├── .env                              # Environment variables (DATABASE_URL, etc)
├── prisma/
│   └── schema.prisma                 # Database schema with 10 models
├── src/
│   ├── routes/
│   │   ├── index.js                 # Route registration hub
│   │   ├── health.js                # Health check endpoint
│   │   ├── funds.js                 # Legacy funds endpoints
│   │   ├── admin.js                 # Admin routes (5 endpoints)
│   │   ├── user.js                  # User routes (10 endpoints)
│   │   └── governor.js              # Governor routes (4 endpoints)
│   └── services/
│       ├── PensionFundService.js    # Pension fund operations
│       ├── InvestmentProposalService.js  # Proposal management
│       ├── WorkflowService.js       # Workflow/n8n integration
│       ├── TransactionService.js    # Transaction history
│       ├── WithdrawalService.js     # Emergency withdrawals
│       ├── NotificationService.js   # Notifications
│       ├── UserPreferencesService.js # User settings
│       └── TerminationService.js    # Fund termination
└── API_DOCUMENTATION.md              # Comprehensive API docs
```

## Key Features

### 1. Database Layer (Prisma)
- ✅ 10 interconnected data models
- ✅ PostgreSQL with proper relationships and cascading deletes
- ✅ Type-safe database queries
- ✅ Built-in migrations

### 2. Service Layer
- ✅ 8 specialized service modules with CRUD operations
- ✅ Business logic separated from routes
- ✅ Error handling with descriptive messages
- ✅ Reusable methods for common operations

### 3. API Routes
- ✅ Admin endpoints: Create funds, manage proposals, create workflows
- ✅ User endpoints: Access funds, request withdrawals, manage preferences
- ✅ Governor endpoints: Approve/reject requests, manage terminations
- ✅ Proper HTTP status codes and error responses

### 4. Data Models
```
User
├─ PensionFund (created by user)
│  ├─ InvestmentProposal (AI recommendations)
│  ├─ Workflow (n8n automations)
│  ├─ Transaction (blockchain history)
│  ├─ EmergencyWithdrawalRequest
│  └─ TerminationRequest
├─ Notification
├─ UserPreferences
└─ GovernorApproval
```

## API Summary

### Admin Endpoints (5)
- POST /api/admin/pension-funds - Create fund
- GET /api/admin/pension-funds - List funds
- POST /api/admin/workflows - Create workflow
- GET /api/admin/investment-proposals - List proposals
- POST /api/admin/investment-proposals/{id}/approve - Approve
- POST /api/admin/investment-proposals/{id}/reject - Reject

### User Endpoints (10)
- GET /api/user/{userId}/pension-funds - Get user funds
- GET /api/user/pension-funds/{id} - Get fund details
- GET /api/user/pension-funds/{id}/transactions - Transaction history
- POST /api/user/pension-funds/{id}/emergency-withdrawal - Request withdrawal
- GET /api/user/pension-funds/{id}/emergency-withdrawals - Withdrawal history
- POST /api/user/pension-funds/{id}/risk-appetite - Update risk
- GET /api/user/notifications - Get notifications
- PATCH /api/user/notifications/{id}/read - Mark read
- GET /api/user/preferences - Get preferences
- PUT /api/user/preferences - Update preferences

### Governor Endpoints (4)
- GET /api/governor/pending-approvals - List pending
- POST /api/governor/emergency-withdrawals/{id}/approve - Approve withdrawal
- POST /api/governor/terminations/{id}/approve - Approve termination
- POST /api/governor/terminations/{id}/reject - Reject

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Update `.env` with PostgreSQL connection:
```
DATABASE_URL="postgresql://user:password@localhost:5432/fund_manager"
```

### 3. Run Migrations
```bash
npx prisma migrate dev --name init
```

### 4. Start Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## Usage Examples

### Create a Pension Fund
```bash
curl -X POST http://localhost:5000/api/admin/pension-funds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Johnson Family Pension",
    "corpus": "125430",
    "maturity": "2028-06-15",
    "stablecoin": "USDC",
    "contractAddress": "0x...",
    "contractDeployed": true,
    "creatorId": "admin123"
  }'
```

### Get User Funds
```bash
curl http://localhost:5000/api/user/user123/pension-funds
```

### Request Emergency Withdrawal
```bash
curl -X POST http://localhost:5000/api/user/pension-funds/fund123/emergency-withdrawal \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "amount": "5000",
    "reason": "Medical emergency"
  }'
```

### Approve Proposal
```bash
curl -X POST http://localhost:5000/api/admin/investment-proposals/prop123/approve \
  -H "Content-Type: application/json" \
  -d '{"approvedBy": "admin123"}'
```

## Key Design Decisions

1. **String for Large Numbers**: Corpus, amount, and ROI stored as strings to prevent precision loss
2. **Service-Based Architecture**: Business logic in services, routes stay thin
3. **Prisma ORM**: Type-safe queries with automatic client generation
4. **Role-Based Routing**: Separate route files for admin/user/governor operations
5. **Proper Error Handling**: Consistent error messages across all endpoints
6. **Pagination Support**: Limit/offset for endpoints returning many records

## Future Enhancements

- [ ] Add middleware for authentication/authorization
- [ ] Implement request validation with Zod/Yup
- [ ] Add logging with Winston/Pino
- [ ] Setup rate limiting
- [ ] Add WebSocket for real-time notifications
- [ ] Integrate with actual smart contracts (Web3.js)
- [ ] Add background jobs with Bull queue
- [ ] Setup CI/CD pipeline
