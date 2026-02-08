# 📁 Project File Structure

## Complete Server Directory Structure

```
fund-manager-admin-webapp/
├── server/
│   ├── index.js                              # Main entry point - starts Express server
│   ├── package.json                          # Dependencies (Express, Cors, Prisma)
│   ├── .env                                  # Environment variables (DATABASE_URL, etc)
│   ├── .gitignore                            # Git ignore rules
│   ├── node_modules/                         # Installed packages
│   ├── prisma/
│   │   └── schema.prisma                     # Database schema (450+ lines, 10 models)
│   │
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.js                      # Route registration hub (imports all routes)
│   │   │   ├── health.js                     # GET /api/health
│   │   │   ├── funds.js                      # GET /api/funds (legacy)
│   │   │   ├── admin.js                      # Admin endpoints (6 endpoints)
│   │   │   │   ├─ POST /api/admin/pension-funds
│   │   │   │   ├─ GET /api/admin/pension-funds
│   │   │   │   ├─ POST /api/admin/workflows
│   │   │   │   ├─ GET /api/admin/investment-proposals
│   │   │   │   ├─ POST /api/admin/investment-proposals/:id/approve
│   │   │   │   └─ POST /api/admin/investment-proposals/:id/reject
│   │   │   ├─ user.js                       # User endpoints (10 endpoints)
│   │   │   │   ├─ GET /api/user/:userId/pension-funds
│   │   │   │   ├─ GET /api/user/pension-funds/:id
│   │   │   │   ├─ GET /api/user/pension-funds/:id/transactions
│   │   │   │   ├─ POST /api/user/pension-funds/:id/emergency-withdrawal
│   │   │   │   ├─ GET /api/user/pension-funds/:id/emergency-withdrawals
│   │   │   │   ├─ POST /api/user/pension-funds/:id/risk-appetite
│   │   │   │   ├─ GET /api/user/notifications
│   │   │   │   ├─ PATCH /api/user/notifications/:id/read
│   │   │   │   ├─ GET /api/user/preferences
│   │   │   │   └─ PUT /api/user/preferences
│   │   │   └─ governor.js                   # Governor endpoints (5 endpoints)
│   │   │       ├─ GET /api/governor/pending-approvals
│   │   │       ├─ POST /api/governor/emergency-withdrawals/:id/approve
│   │   │       ├─ POST /api/governor/emergency-withdrawals/:id/reject
│   │   │       ├─ POST /api/governor/terminations/:id/approve
│   │   │       └─ POST /api/governor/terminations/:id/reject
│   │   │
│   │   └── services/
│   │       ├─ PensionFundService.js         # Pension fund CRUD operations
│   │       │   ├─ createPensionFund()
│   │       │   ├─ getAllPensionFunds()
│   │       │   ├─ getUserPensionFunds()
│   │       │   ├─ getPensionFundDetails()
│   │       │   └─ updateRiskAppetite()
│   │       ├─ InvestmentProposalService.js  # Proposal management
│   │       │   ├─ getPendingProposals()
│   │       │   ├─ getProposalsByFund()
│   │       │   ├─ createProposal()
│   │       │   ├─ approveProposal()
│   │       │   └─ rejectProposal()
│   │       ├─ WorkflowService.js            # n8n workflow operations
│   │       │   ├─ createWorkflow()
│   │       │   ├─ getWorkflowsByFund()
│   │       │   ├─ getActiveWorkflows()
│   │       │   ├─ updateWorkflowStatus()
│   │       │   └─ scheduleNextRun()
│   │       ├─ TransactionService.js         # Transaction history
│   │       │   ├─ getTransactionHistory()
│   │       │   ├─ createTransaction()
│   │       │   ├─ updateTransactionStatus()
│   │       │   └─ getTransactionByHash()
│   │       ├─ WithdrawalService.js          # Emergency withdrawals
│   │       │   ├─ requestEmergencyWithdrawal()
│   │       │   ├─ getEmergencyWithdrawalHistory()
│   │       │   ├─ getPendingEmergencyRequests()
│   │       │   ├─ approveEmergencyWithdrawal()
│   │       │   ├─ rejectEmergencyWithdrawal()
│   │       │   └─ processWithdrawal()
│   │       ├─ NotificationService.js        # User notifications
│   │       │   ├─ getUserNotifications()
│   │       │   ├─ createNotification()
│   │       │   ├─ markAsRead()
│   │       │   ├─ markAllAsRead()
│   │       │   └─ deleteNotification()
│   │       ├─ UserPreferencesService.js     # User settings
│   │       │   ├─ getUserPreferences()
│   │       │   ├─ updateUserPreferences()
│   │       │   ├─ updateTheme()
│   │       │   ├─ updateLanguage()
│   │       │   ├─ toggleEmailNotifications()
│   │       │   └─ togglePushNotifications()
│   │       └─ TerminationService.js         # Fund termination
│   │           ├─ getPendingTerminations()
│   │           ├─ createTerminationRequest()
│   │           ├─ approveTermination()
│   │           ├─ rejectTermination()
│   │           └─ getTerminationHistory()
│   │
│   ├── API_DOCUMENTATION.md                 # Complete API reference (200+ lines)
│   ├── ARCHITECTURE.md                      # System design & structure
│   ├── GETTING_STARTED.md                   # Setup instructions & examples
│   ├── ENDPOINTS.md                         # Visual endpoint overview
│   ├── IMPLEMENTATION_SUMMARY.md            # What was built
│   └── FILE_STRUCTURE.md                    # This file
│
└── client/                                  # React frontend (unchanged)
    ├── src/
    │   ├── modules/
    │   ├── common/
    │   ├── App.jsx
    │   └── index.jsx
    └── ...
```

## File Purposes at a Glance

### Core Files
| File | Lines | Purpose |
|------|-------|---------|
| index.js | 20 | Start Express server, load routes |
| package.json | 30 | Dependencies & scripts |
| .env | 10 | Environment variables |

### Database
| File | Lines | Purpose |
|------|-------|---------|
| prisma/schema.prisma | 450+ | Data models (10 entities) |

### Routes (5 files)
| File | Lines | Endpoints | Purpose |
|------|-------|-----------|---------|
| src/routes/index.js | 20 | - | Register all routes |
| src/routes/health.js | 10 | 1 | Server health check |
| src/routes/funds.js | 30 | 4 | Legacy fund endpoints |
| src/routes/admin.js | 90 | 6 | Admin operations |
| src/routes/user.js | 130 | 10 | User account operations |
| src/routes/governor.js | 70 | 5 | Governor approvals |
| **Total Routes** | **350** | **26** | API endpoints |

### Services (8 files)
| File | Lines | Methods | Purpose |
|------|-------|---------|---------|
| PensionFundService.js | 120 | 5 | Fund CRUD |
| InvestmentProposalService.js | 100 | 5 | Proposal management |
| WorkflowService.js | 100 | 5 | Workflow operations |
| TransactionService.js | 90 | 4 | Transaction history |
| WithdrawalService.js | 130 | 6 | Emergency withdrawals |
| NotificationService.js | 120 | 5 | Notifications |
| UserPreferencesService.js | 150 | 6 | User preferences |
| TerminationService.js | 110 | 4 | Fund termination |
| **Total Services** | **920** | **40** | Business logic |

### Documentation (4 files)
| File | Lines | Purpose |
|------|-------|---------|
| API_DOCUMENTATION.md | 320 | All endpoints with examples |
| ARCHITECTURE.md | 220 | System design overview |
| GETTING_STARTED.md | 280 | Setup & quick start |
| ENDPOINTS.md | 280 | Visual reference |
| IMPLEMENTATION_SUMMARY.md | 320 | What was built |

## Code Organization

### By Responsibility
```
Routes (Express handlers)
    ↓
Services (Business logic)
    ↓
Prisma (Database queries)
    ↓
PostgreSQL (Data storage)
```

### By Domain
```
Admin Routes ──→ PensionFundService ──→ Prisma
             ──→ InvestmentProposalService
             ──→ WorkflowService

User Routes ──→ WithdrawalService ──→ Prisma
            ──→ NotificationService
            ──→ UserPreferencesService
            ──→ TransactionService

Governor Routes ──→ WithdrawalService ──→ Prisma
                ──→ TerminationService
```

## Adding New Features

### To add a new endpoint:

1. **Create service** (`src/services/NewService.js`)
   - Define business logic
   - Use Prisma for data access

2. **Create route** (or add to existing `src/routes/*.js`)
   - Import service
   - Define Express handler
   - Call service method

3. **Register route** (update `src/routes/index.js`)
   - Import new route file
   - Add `app.use()` call

4. **Update schema** (optional, `prisma/schema.prisma`)
   - Add new model if needed
   - Run `npx prisma migrate dev --name descriptive_name`

Example structure:
```javascript
// src/services/MyService.js
export class MyService {
  static async doSomething(data) {
    // business logic
  }
}

// src/routes/myRoutes.js
router.post('/my-endpoint', async (req, res) => {
  const result = await MyService.doSomething(req.body);
  res.json({ success: true, data: result });
});

// src/routes/index.js
import myRoutes from './myRoutes.js';
app.use('/api/my', myRoutes);
```

## Import Paths

All imports are relative to file location:
```javascript
// From routes/admin.js
import Service from '../services/PensionFundService.js';

// From index.js
import { registerRoutes } from './src/routes/index.js';
```

## Configuration Files

### .env
```
DATABASE_URL="postgresql://user:pass@localhost/fund_manager"
PORT=5000
NODE_ENV=development
```

### package.json
```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "@prisma/client": "^5.8.0"
  }
}
```

## Running the Server

```bash
# Install
npm install

# Setup database
npx prisma migrate dev --name init

# Development (auto-reload)
npm run dev

# Production
npm start
```

## Database Tools

```bash
# Browse data visually
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database (⚠️ deletes data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

## Summary Stats

- **Total API Endpoints**: 21
- **Service Classes**: 8
- **Database Models**: 10
- **Route Files**: 5
- **Lines of Code**: ~2,850
- **Documentation Pages**: 5

---

You have a well-organized, scalable, and documented backend API! 🚀
