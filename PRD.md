# Product Requirements Document (PRD)
## AI-Powered Pension Fund Management System

**Version**: 2.0  
**Last Updated**: March 22, 2026  
**Status**: Updated - Incorporating Smart Contract & Database Implementation

---

## Document Change Log

### Version 2.0 Updates
- Aligned with implemented Solidity smart contract (`FundManager.sol`)
- Synchronized with Prisma database schema
- Updated terminology to match implementation (causeName/causeDescription vs fundName/fundDescription)
- Refined emergency withdrawal workflow based on contract implementation
- Updated investment management to reflect contract interface
- Aligned data models with actual implementation

---

## 1. Executive Summary

### 1.1 Product Overview
An intelligent pension fund management system built on Ethereum Virtual Machine (EVM) blockchain that combines smart contracts, AI-powered investment automation, and user-friendly interfaces. The system enables automated contributions, AI-driven investment allocation, inflation-adjusted payouts, and emergency withdrawal capabilities with multi-signature security.

### 1.2 Product Vision
To democratize pension fund management by leveraging blockchain technology for transparency and security, while using AI agents to optimize investment returns and automate complex financial workflows.

### 1.3 Target Users
- **Primary**: Individuals and families planning for retirement or creating trust funds
- **Secondary**: Small businesses setting up pension schemes for employees
- **Tertiary**: Financial advisors managing multiple pension accounts

### 1.4 Key Differentiators
- AI-powered investment optimization with human oversight
- Blockchain-based transparency and immutability
- Multi-signature security for critical operations
- Automated inflation adjustment for pension payouts
- Flexible emergency withdrawal provisions with configurable limits

---

## 2. Product Goals and Success Metrics

### 2.1 Business Goals
1. Enable creation and management of 10,000+ pension fund accounts within first year
2. Achieve 95%+ customer satisfaction through automated, transparent operations
3. Demonstrate superior returns compared to traditional pension funds through AI optimization
4. Reduce operational costs by 70% compared to traditional pension fund management

### 2.2 Success Metrics
- **Primary KPIs**:
  - Number of active pension fund accounts
  - Total Assets Under Management (AUM)
  - Average ROI compared to benchmark indices
  - Customer retention rate (target: >90%)
  - Emergency withdrawal request approval time (target: <24 hours)

- **Secondary KPIs**:
  - AI investment decision accuracy rate
  - Smart contract transaction success rate (target: >99.9%)
  - User engagement metrics (logins, feature usage)
  - Average cost per transaction
  - Time to create new fund account (target: <5 minutes)

---

## 3. System Architecture Overview

### 3.1 Core Components
1. **Smart Contract Layer**: Solidity-based EVM smart contracts (`FundManager.sol`)
2. **AI Orchestration Layer**: n8n workflows with AI agents
3. **Administrative Web Application**: Fund setup and management interface
4. **Customer-Facing Application**: Web/mobile app for end-users
5. **Integration Layer**: MCP servers for market data and risk analytics
6. **Blockchain Infrastructure**: EVM-compatible blockchain network
7. **Database Layer**: PostgreSQL with Prisma ORM

### 3.2 Technology Stack
- **Smart Contracts**: Solidity ^0.8.28
- **Blockchain**: Ethereum/Polygon/Arbitrum (configurable)
- **Workflow Automation**: n8n (self-hosted or cloud)
- **AI/ML Framework**: LangChain for AI agents
- **Frontend**: React.js/Next.js
- **Backend**: Node.js/Express
- **Database**: PostgreSQL with Prisma ORM
- **MCP Integration**: Model Context Protocol servers
- **Authentication**: Web3 wallet integration (MetaMask, WalletConnect)

---

## 4. Detailed Functional Requirements

## 4.1 Smart Contract Implementation (`FundManager.sol`)

### 4.1.1 Immutable Parameters
Upon deployment, the following parameters must be set and cannot be changed:

| Parameter | Type | Contract Variable | Description |
|-----------|------|-------------------|-------------|
| Cause Name | string | `causeName` | Human-readable name of the fund |
| Cause Description | string | `causeDescription` | Detailed description of fund purpose |
| Beneficiaries | address[] | `beneficiaries` | Array of beneficiary wallet addresses |
| Share Percentages | uint256[] | `sharePercentages` | Share percentage for each beneficiary in basis points (10000 = 100%) |
| Token Address | address | `token` | ERC20 stablecoin contract address (immutable) |
| Release Amount | uint256 | `releaseAmount` | Base monthly pension amount (in token units with decimals) |
| Fund Maturity Date | uint256 | `fundMaturityDate` | Unix timestamp when pension payouts begin (immutable) |
| Governors | address[] | `governors` | Multi-sig wallet addresses for approvals |
| Required Approvals | uint256 | `emergencyWithdrawalConfig.requiredNumberofApprovals` | Minimum approvals needed for emergency actions |
| Max Emergency Withdrawals | uint256 | `emergencyWithdrawalConfig.timesAllowed` | Maximum number of emergency withdrawals allowed |
| Limit Per Emergency Withdrawal | uint256 | `emergencyWithdrawalConfig.limitPerWithdrawal` | Token limit per emergency withdrawal |
| Total Emergency Withdrawal Limit | uint256 | `emergencyWithdrawalConfig.totalLimit` | Cumulative emergency withdrawal limit |

### 4.1.2 Mutable State Variables

| Variable | Type | Description |
|----------|------|-------------|
| totalWithdrawnAmount | uint256 | Cumulative emergency withdrawals executed |
| emergencyWithdrawals | mapping(bytes32 => EmergencyWithdrawal) | Emergency withdrawal requests by ID |
| emergencyWithdrawalApprovals | mapping(bytes32 => uint256) | Approval count for each withdrawal |
| hasApprovedEmergencyWithdrawal | mapping(bytes32 => mapping(address => bool)) | Tracks which governors approved which withdrawals |
| paused | bool | Contract pause status (from Pausable) |

### 4.1.3 Core Smart Contract Functions

**Contribution Management**
```solidity
function contributeFund(uint256 _amount, string memory note) external nonReentrant whenNotPaused
```
- Allows anyone to deposit stablecoin tokens to the fund
- Validates amount > 0
- Transfers tokens from sender to contract using SafeERC20
- Emits `FundReceived` event with sender, note, token address, amount, and timestamp
- Protected by reentrancy guard and pause mechanism

**Pension Distribution**
```solidity
function releaseRegularPension(uint256 _inflationCoefficient) external nonReentrant whenNotPaused
```
- Callable only after `fundMaturityDate`
- Calculates adjusted pension: `releaseAmount * inflationCoefficient / 100`
- Distributes to beneficiaries according to share percentages (in basis points)
- Emits `FundReleased` event
- Reverts if insufficient balance with `InsufficientTokens` error
- Protected by reentrancy guard

**Emergency Withdrawal - Initiate**
```solidity
function initiateEmergencyWithdrawal(uint256 _amount) 
    external 
    nonReentrant 
    withdrawalLimitNotBreached(_amount) 
    returns (bytes32 withdrawalId)
```
- Creates withdrawal request with unique ID (hash of "EMERGENCY_WITHDRAWAL", timestamp, sender)
- Creates `EmergencyWithdrawal` struct with status "INITIATED" and amount
- Validates against per-withdrawal and total limits via modifier
- Emits `EmergencyWithdrawalInitiated` event
- Returns withdrawalId for tracking

**Emergency Withdrawal - Approve**
```solidity
function approveEmergencyWithdrawal(address _governor, bytes32 withdrawalId) 
    external 
    onlyGovernor(_governor)
```
- Records governor approval for withdrawal request
- Prevents duplicate approvals from same governor
- Increments approval count
- Emits `EmergencyWithdrawalApproved` event with current approval count
- Reverts with `AlreadyApproved` if governor already approved

**Emergency Withdrawal - Execute**
```solidity
function executeEmergencyWithdrawal(bytes32 withdrawalId)
    external
    nonReentrant
    withdrawalLimitNotBreached(emergencyWithdrawals[withdrawalId].amount)
    tokenBalanceIsSufficient(emergencyWithdrawals[withdrawalId].amount)
```
- Validates sufficient approvals met (`requiredNumberofApprovals`)
- Distributes amount to beneficiaries per share percentages
- Updates withdrawal status to "EXECUTED"
- Updates `totalWithdrawnAmount`
- Emits `EmergencyWithdrawalExecuted` event
- Protected by multiple modifiers for safety

**Investment Management**
```solidity
function investFund(address _investmentContract, uint256 _amount)
    external
    onlyOwner
    nonReentrant
    whenNotPaused
```
- Transfers tokens to investment smart contract implementing `IInvestmentContract`
- Approves investment contract to spend tokens using `forceApprove`
- Calls `invest(address sender, uint256 amount)` on investment contract
- Emits `InvestmentMade` event on success
- Reverts with `InvestmentFailed` if external call fails
- Only callable by contract owner

```solidity
function withdrawInvestment(address _investmentContract)
    external
    onlyOwner
    nonReentrant
    returns (uint256 withdrawnAmount)
```
- Calls `withdraw(address sender)` on investment contract
- Calculates withdrawn amount by balance difference
- Emits `InvestmentWithdrawn` event
- Reverts with `WithdrawalFailed` if no tokens received
- Returns withdrawn amount

**View Functions**
```solidity
function getWalletBalance() external view returns (uint256)
function getBeneficiaryCount() external view returns (uint256)
function getAllBeneficiaries() external view returns (Beneficiary[] memory)
```

### 4.1.4 Security Features
- **Multi-signature requirement**: Emergency withdrawals require configurable number of governor approvals
- **Reentrancy guards**: All state-changing functions protected with `nonReentrant` modifier
- **Access control**: Governor-only functions via `onlyGovernor` modifier, owner-only for investments
- **Input validation**: Custom errors for all validation failures
- **SafeERC20**: All token transfers use OpenZeppelin's SafeERC20 library
- **Pausable functionality**: Contract can be paused in emergencies
- **Withdrawal limits**: Enforced via modifiers checking per-withdrawal and total limits
- **Basis points precision**: Share percentages use 10000 basis points for accurate distribution

### 4.1.5 Investment Contract Interface
External investment contracts must implement:
```solidity
interface IInvestmentContract {
    function invest(address sender, uint256 amount) external;
    function withdraw(address sender) external returns (uint256);
}
```

---

## 4.2 Database Schema (Prisma Implementation)

### 4.2.1 User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  wallet    String   @unique
  privateKey String?
  role      String   @default("user") // admin, governor, user
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  notifications      Notification[]
  preferences        UserPreferences?
  governorApprovals  GovernorApproval[]
}
```

**Purpose**: Stores user account information including wallet addresses and roles.

**Key Fields**:
- `wallet`: Unique Ethereum address for Web3 authentication
- `privateKey`: Optional encrypted private key for managed wallets
- `role`: User role (admin, governor, user) for RBAC
- Relations to notifications, preferences, and approvals

### 4.2.2 PensionFund Model
```prisma
model PensionFund {
  id                String   @id @default(cuid())
  name              String
  description       String?
  maturity          DateTime
  riskAppetite      String   @default("MEDIUM") // LOW, MEDIUM, HIGH
  reserveAmount     String?
  investmentDuration String? // short_term, medium_term, long_term
  investmentDecisionMadeBy String? // Human, AI
  stablecoin        String?  // PYUSD, USDC, USDT
  releaseInterval   ReleaseInterval? // WEEKLY, FORTNIGHTLY, MONTHLY, QUARTERLY
  lastReleasedDate  DateTime?
  contractAddress   String   @unique
  selectedGovernors String[] // Array of governor user IDs
  
  investmentProposals InvestmentProposal[]
  workflows         Workflow[]
  transactions      Transaction[]
  emergencyRequests EmergencyWithdrawalRequest[]
  terminationRequests TerminationRequest[]
  beneficiaries    Beneficiary[]
  investments       Investment[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Purpose**: Stores off-chain metadata for pension funds linked to smart contracts.

**Key Fields**:
- `contractAddress`: Unique link to deployed FundManager contract
- `riskAppetite`: Investment risk profile (LOW/MEDIUM/HIGH)
- `releaseInterval`: Frequency of pension distributions
- `lastReleasedDate`: Tracks last pension payout for scheduling
- `selectedGovernors`: Array of user IDs who are governors
- `investmentDecisionMadeBy`: Tracks whether investments are Human or AI-approved

**Relations**: One-to-many with proposals, workflows, transactions, requests, beneficiaries, investments

### 4.2.3 Beneficiary Model
```prisma
model Beneficiary {
  id              String   @id @default(cuid())
  name            String
  email           String
  relationship    String
  share           Int      // Share percentage
  fundId          String
  fund            PensionFund @relation(fields: [fundId], references: [id], onDelete: Cascade)
  walletAddress   String
  walletPrivateKey String  // Encrypted private key
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

**Purpose**: Stores beneficiary details with managed wallets.

**Key Fields**:
- `share`: Percentage share (matches smart contract basis points / 100)
- `walletAddress`: Beneficiary's Ethereum address (matches contract)
- `walletPrivateKey`: Encrypted private key for managed wallets
- `relationship`: Description of relationship to fund creator

**Cascade**: Deletes when parent PensionFund is deleted

### 4.2.4 InvestmentProposal Model
```prisma
model InvestmentProposal {
  id              String   @id @default(cuid())
  fundId          String
  fund            PensionFund @relation(fields: [fundId], references: [id], onDelete: Cascade)
  
  aiScore         String   // 0-100
  expectedROI     String   // Percentage
  riskLevel       String   // LOW, MEDIUM, HIGH
  investmentAmount String?
  investmentContract String? // Contract address
  status          String   @default("Pending") // Pending, Approved, Rejected
  
  investments     Investment[]
  
  createdAt       DateTime @default(now())
  approvedAt      DateTime?
  rejectedAt      DateTime?
  approvedBy      String?
}
```

**Purpose**: Stores AI-generated investment proposals awaiting human approval.

**Key Fields**:
- `aiScore`: AI confidence score (0-100)
- `expectedROI`: Projected return on investment
- `investmentContract`: Address of investment contract (for `investFund` call)
- `status`: Approval workflow status
- Timestamps track proposal lifecycle

### 4.2.5 EmergencyWithdrawalRequest Model
```prisma
model EmergencyWithdrawalRequest {
  id            String   @id @default(cuid())
  fundId        String
  fund          PensionFund @relation(fields: [fundId], references: [id], onDelete: Cascade)
  
  userId        String
  withdrawalId  String?  // Blockchain withdrawal ID (bytes32 from contract)
  amount        String
  reason        String?
  status        String   @default("Pending") // Pending, PartiallyApproved, Approved, Rejected, Processed
  approvedBy    String[] // Array of governor IDs
  
  createdAt     DateTime @default(now())
}
```

**Purpose**: Tracks emergency withdrawal requests and approval workflow.

**Key Fields**:
- `withdrawalId`: Links to on-chain `bytes32` withdrawal ID from `initiateEmergencyWithdrawal`
- `approvedBy`: Array tracking which governors have approved
- `status`: Workflow status (Pending → PartiallyApproved → Approved → Processed)

**Workflow**: 
1. User creates request → Pending
2. Governors approve → PartiallyApproved
3. Sufficient approvals → Approved
4. `executeEmergencyWithdrawal` called → Processed

### 4.2.6 Investment Model
```prisma
model Investment {
  id                  String   @id @default(cuid())
  fundId              String
  fund                PensionFund @relation(fields: [fundId], references: [id], onDelete: Cascade)
  
  proposalId          String?
  proposal            InvestmentProposal? @relation(fields: [proposalId], references: [id], onDelete: SetNull)
  
  roi                 String   // Return on Investment
  investmentAmount    String
  investmentContract  String?  // Smart contract address
  status              String   @default("INVESTED") // INVESTED, DIVESTED
  maturityDate        DateTime?
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

**Purpose**: Tracks active and historical investments.

**Key Fields**:
- `investmentContract`: Address used in `investFund` calls
- `roi`: Actual ROI achieved (updated periodically)
- `status`: INVESTED (active) or DIVESTED (withdrawn)
- `proposalId`: Links to originating proposal (optional, can be null if divested)

### 4.2.7 Workflow Model
```prisma
model Workflow {
  id            String   @id @default(cuid())
  fundId        String
  fund          PensionFund @relation(fields: [fundId], references: [id], onDelete: Cascade)
  
  type          String   // Investment Allocation, Pension Distribution, etc
  status        String   @default("Running") // Running, Success, Failed, Paused
  n8nWorkflowId String?
  
  lastRun       DateTime?
  nextRun       DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Purpose**: Links pension funds to n8n workflow instances.

**Key Fields**:
- `n8nWorkflowId`: External n8n workflow ID for API calls
- `type`: Workflow purpose (matches workflow types in system)
- `lastRun`/`nextRun`: Scheduling information

### 4.2.8 Transaction Model
```prisma
model Transaction {
  id            String   @id @default(cuid())
  fundId        String
  fund          PensionFund @relation(fields: [fundId], references: [id], onDelete: Cascade)
  
  txHash        String?  @unique
  type          String   // Deposit, Withdrawal, Interest, etc
  amount        String
  status        String   @default("Pending")
  
  createdAt     DateTime @default(now())
}
```

**Purpose**: Stores all blockchain transactions for audit trail.

**Key Fields**:
- `txHash`: Ethereum transaction hash (indexed for fast lookup)
- `type`: Transaction category for reporting
- `status`: Pending/Confirmed/Failed

### 4.2.9 Supporting Models

**Notification Model**: User notifications
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title     String
  message   String
  type      String   // info, warning, error, success
  read      Boolean  @default(false)
  
  createdAt DateTime @default(now())
}
```

**UserPreferences Model**: User settings
```prisma
model UserPreferences {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  emailNotifications Boolean @default(true)
  pushNotifications  Boolean @default(true)
  theme              String  @default("light")
  language           String  @default("en")
  
  updatedAt DateTime @updatedAt
}
```

**GovernorApproval Model**: Tracks approval actions
```prisma
model GovernorApproval {
  id        String   @id @default(cuid())
  governorId String
  governor  User     @relation(fields: [governorId], references: [id], onDelete: Cascade)
  
  requestType String // emergency_withdrawal, termination
  requestId   String
  status      String @default("Pending")
  
  createdAt DateTime @default(now())
}
```

**TerminationRequest Model**: Fund termination requests
```prisma
model TerminationRequest {
  id            String   @id @default(cuid())
  fundId        String
  fund          PensionFund @relation(fields: [fundId], references: [id], onDelete: Cascade)
  
  reason        String?
  status        String   @default("Pending")
  
  approvedAt    DateTime?
  approvedBy    String?
  
  createdAt     DateTime @default(now())
}
```

---

## 4.3 AI-Powered Workflow System (n8n)

### 4.3.1 Workflow Architecture
Each pension fund account has dedicated n8n workflow instances:

**Workflow 1: Inflation-Adjusted Pension Distribution**

*Trigger*: Scheduled based on `PensionFund.releaseInterval` (WEEKLY/FORTNIGHTLY/MONTHLY/QUARTERLY)

*Steps*:
1. Check if fund has matured (`fundMaturityDate < now`)
2. Check if distribution is due based on `releaseInterval` and `lastReleasedDate`
3. Fetch inflation data from APIs
4. Calculate inflation coefficient
5. Call `releaseRegularPension(inflationCoefficient)` on FundManager contract
6. Update `PensionFund.lastReleasedDate` in database
7. Create `Transaction` records for audit
8. Send notifications to beneficiaries
9. Log workflow execution in `Workflow` model

**Workflow 2: AI-Powered Investment Allocation**

*Trigger*: 
- Scheduled (weekly analysis)
- Manual trigger by administrator
- Risk appetite change event
- Significant corpus change

*Steps*:
1. **Data Collection**
   - Fetch current fund balance via `getWalletBalance()`
   - Query `PensionFund.riskAppetite` from database
   - Fetch current allocations from `Investment` model
   - Query MCP servers for market data

2. **AI Agent Analysis**
   - Initialize LangChain agent with fund parameters
   - Process MCP data for optimal allocations
   - Calculate debt/equity ratio based on risk appetite
   - Generate diversified instrument recommendations
   - Estimate expected returns

3. **Create Proposal**
   - Insert new `InvestmentProposal` record with status "Pending"
   - Set `aiScore`, `expectedROI`, `riskLevel`
   - Store investment contract addresses

4. **Human-in-the-Loop Approval**
   - Send notification to administrators
   - Wait for approval/rejection
   - Update proposal status and timestamps

5. **Execution** (upon approval)
   - For each instrument allocation:
     - Call `investFund(investmentContract, amount)` on FundManager
     - Create `Investment` record with status "INVESTED"
     - Create `Transaction` record
   - Update proposal `approvedAt` and `approvedBy`
   - Update `PensionFund.investmentDecisionMadeBy` = "AI"

**Workflow 3: Investment Performance Monitoring**

*Trigger*: Scheduled (daily)

*Steps*:
1. Query all active `Investment` records (status = "INVESTED")
2. For each investment:
   - Query investment contract for current value
   - Calculate actual ROI
   - Update `Investment.roi` field
3. Compare actual vs expected returns
4. Flag underperforming investments
5. Alert administrators if ROI < expected by >15%
6. Generate performance report

**Workflow 4: Emergency Withdrawal Notification Handler**

*Trigger*: Polling database for new `EmergencyWithdrawalRequest` records

*Steps*:
1. Detect new requests with status "Pending"
2. If `withdrawalId` is null:
   - Call `initiateEmergencyWithdrawal(amount)` on contract
   - Store returned `bytes32 withdrawalId` in database
3. Fetch governors from `PensionFund.selectedGovernors`
4. Send notifications to all governors
5. Monitor for approvals:
   - When governor approves in UI, call `approveEmergencyWithdrawal(governor, withdrawalId)`
   - Update `EmergencyWithdrawalRequest.approvedBy` array
   - Update status to "PartiallyApproved"
6. When sufficient approvals reached:
   - Update status to "Approved"
   - Call `executeEmergencyWithdrawal(withdrawalId)` on contract
   - Update status to "Processed"
   - Create `Transaction` record
   - Send confirmation notifications

---

## 4.4 Administrative Web Application

### 4.4.1 Core Features

**Dashboard**
- Overview of all pension fund accounts from `PensionFund` model
- Key metrics: Total AUM (sum of contract balances), number of accounts, average ROI from `Investment` model
- Recent activity feed from `Transaction` model
- Alerts from `EmergencyWithdrawalRequest` and `InvestmentProposal` (status = "Pending")
- Performance analytics charts using `Investment` ROI data

**Pension Fund Account Creation Wizard**

*Step 1: Basic Information*
- Cause Name (maps to `causeName` in contract, `name` in DB)
- Cause Description (maps to `causeDescription` in contract, `description` in DB)
- Maturity date (maps to `fundMaturityDate` in contract, `maturity` in DB)
- Base pension amount (maps to `releaseAmount` in contract)
- Stablecoin selection (stored in both contract `token` and DB `stablecoin`)
- Release interval (stored in DB `releaseInterval` enum)

*Step 2: Beneficiaries Configuration*
- Add beneficiary with wallet address and share percentage
- Shares must sum to exactly 100% (10000 basis points in contract)
- Creates `Beneficiary` records in database
- Option to generate managed wallets (creates wallet, stores encrypted private key)

*Step 3: Governance Setup*
- Add governor wallet addresses
- Required approvals (maps to `requiredNumberofApprovals` in contract config)
- Stores governor user IDs in `PensionFund.selectedGovernors` array

*Step 4: Emergency Withdrawal Configuration*
- Max number of withdrawals (maps to `timesAllowed`)
- Max per withdrawal (maps to `limitPerWithdrawal`)
- Total limit (maps to `totalLimit`)

*Step 5: Investment Parameters*
- Risk appetite (LOW/MEDIUM/HIGH, stored in `PensionFund.riskAppetite`)
- Investment duration preference (stored in DB)
- Investment decision preference (AI/Human)

*Step 6: Review and Deploy*
- Review all parameters
- Deploy FundManager contract with constructor parameters
- Store `contractAddress` in `PensionFund` table
- Create initial `Workflow` records for the fund

**Investment Approval Dashboard**
- Query `InvestmentProposal` where status = "Pending"
- Display AI score, expected ROI, risk level
- Show proposed allocations (parse proposal data)
- Approve action:
  - Update `InvestmentProposal` status = "Approved"
  - Set `approvedAt` = now, `approvedBy` = current admin user ID
  - Trigger n8n workflow to execute investments
- Reject action:
  - Update status = "Rejected", set `rejectedAt`

**Emergency Request Management**
- Query `EmergencyWithdrawalRequest` where governor is in `PensionFund.selectedGovernors`
- Display pending requests
- Approve action:
  - Call contract `approveEmergencyWithdrawal(governorWallet, withdrawalId)`
  - Add governor user ID to `approvedBy` array
  - Update status based on approval count
  - Create `GovernorApproval` record

**Workflow Management**
- List all `Workflow` records grouped by pension fund
- Display status, last run, next run
- Manual trigger: Update n8n workflow via API
- View execution logs
- Edit workflow schedules (update `nextRun`)

**Analytics and Reporting**
- Performance analytics from `Investment` table
- ROI trends over time
- Transaction history from `Transaction` table
- Emergency withdrawal analytics from `EmergencyWithdrawalRequest`
- Export to CSV/PDF

---

## 4.5 Customer-Facing Application (Web/Mobile)

### 4.5.1 Core Features

**Authentication**
- Web3 wallet connection using user's wallet address
- Match `User.wallet` for authentication
- Biometric auth for mobile

**Dashboard**
- Query user's pension funds (where user is beneficiary or in governors list)
- For each fund:
  - Fetch contract balance via `getWalletBalance()`
  - Display from `PensionFund`: name, maturity date, risk appetite
  - Calculate expected monthly pension from `releaseAmount`
  - Show fund status (Active if `maturity > now`, Matured otherwise)

**Fund Details**
- Query `PensionFund` by ID
- Display basic info: name, description, maturity, corpus (from contract)
- List beneficiaries from `Beneficiary` table with share percentages
- Show emergency withdrawal status:
  - Used: count from `EmergencyWithdrawalRequest` where status = "Processed"
  - Total allowed: from contract `emergencyWithdrawalConfig.timesAllowed`
  - Amount withdrawn: sum of processed request amounts
  - Total limit: from contract `totalLimit`

**Transaction History**
- Query `Transaction` table filtered by fundId
- Tabs for different types (Deposit, Withdrawal, Interest)
- Show amount, date, tx hash (link to block explorer), status
- Filter by date range, type

**Emergency Withdrawal Request**
- Create new `EmergencyWithdrawalRequest` record
- Set userId, fundId, amount, reason, status = "Pending"
- Workflow will call `initiateEmergencyWithdrawal` and populate `withdrawalId`
- Track approval progress by monitoring `approvedBy` array length

**Risk Appetite Settings**
- Display current `PensionFund.riskAppetite`
- Allow change (LOW/MEDIUM/HIGH)
- Update database field
- Trigger workflow event for portfolio rebalancing

**Investment Portfolio View**
- Query `Investment` where fundId matches and status = "INVESTED"
- Display allocations by instrument
- Show current value, ROI from `Investment.roi`
- Calculate total portfolio value
- Show debt/equity ratio from investment types

**Notifications**
- Query `Notification` where userId matches
- Display unread count
- Mark as read (update `read` field)
- Filter by type

---

## 5. Data Flow Examples

### 5.1 Creating a Pension Fund

1. **Admin fills wizard** → Collects all parameters
2. **Deploy contract**:
   - Call FundManager constructor with parameters
   - Contract validates and stores immutable data
3. **Store in database**:
   - Insert `PensionFund` with contractAddress
   - Insert multiple `Beneficiary` records
   - Insert governor IDs into `selectedGovernors` array
4. **Create workflows**:
   - Insert `Workflow` records (Pension Distribution, Investment Allocation)
   - Create corresponding n8n workflows with fundId

### 5.2 Emergency Withdrawal Flow

1. **User requests withdrawal**:
   - User creates request in UI
   - Insert `EmergencyWithdrawalRequest` (status = "Pending", withdrawalId = null)
2. **Workflow detects request**:
   - n8n polls for new requests
   - Calls `initiateEmergencyWithdrawal(amount)` on contract
   - Updates database with returned `withdrawalId`
3. **Governors approve**:
   - Each governor clicks approve in UI
   - Backend calls `approveEmergencyWithdrawal(governorAddress, withdrawalId)`
   - Updates `approvedBy` array in database
   - Contract tracks approvals in `emergencyWithdrawalApprovals` mapping
4. **Execution**:
   - When sufficient approvals reached (status = "Approved")
   - Workflow or admin calls `executeEmergencyWithdrawal(withdrawalId)`
   - Contract distributes funds to beneficiaries
   - Database updated to status = "Processed"
   - `Transaction` records created

### 5.3 AI Investment Allocation

1. **Workflow triggers**:
   - Scheduled or manual trigger
   - Fetches fund data from `PensionFund`, `Investment` tables
   - Calls contract `getWalletBalance()` for available funds
2. **AI generates proposal**:
   - Queries MCP servers for market data
   - AI agent analyzes and recommends allocations
   - Creates `InvestmentProposal` (status = "Pending")
3. **Human approval**:
   - Admin reviews in dashboard
   - Approves: Updates status = "Approved", sets timestamps
4. **Execution**:
   - Workflow reads approved proposal
   - For each allocation:
     - Calls `investFund(contractAddress, amount)` on FundManager
     - Creates `Investment` record (status = "INVESTED")
     - Creates `Transaction` record
5. **Monitoring**:
   - Daily workflow queries investment contracts
   - Updates `Investment.roi` field
   - Alerts if underperforming

### 5.4 Pension Distribution

1. **Workflow scheduled**:
   - Based on `releaseInterval` and `lastReleasedDate`
   - Checks if `fundMaturityDate` has passed
2. **Fetch inflation data**:
   - Queries external APIs
   - Calculates inflation coefficient
3. **Call contract**:
   - `releaseRegularPension(inflationCoefficient)`
   - Contract calculates: `releaseAmount * coefficient / 100`
   - Distributes to beneficiaries via `getAllBeneficiaries()`
4. **Update database**:
   - Set `PensionFund.lastReleasedDate` = now
   - Create `Transaction` records for each beneficiary
   - Send `Notification` to beneficiaries
5. **Audit**:
   - Log in `Workflow` execution history

---

## 6. Updated API Specifications

### 6.1 Key Endpoints Aligned with Schema

**POST /api/admin/pension-funds**
Create new pension fund

Request:
```json
{
  "causeName": "string",
  "causeDescription": "string",
  "maturityDate": "ISO 8601",
  "releaseAmount": "string",
  "releaseInterval": "MONTHLY|WEEKLY|FORTNIGHTLY|QUARTERLY",
  "stablecoin": "USDC|USDT|PYUSD",
  "beneficiaries": [
    { "name": "string", "email": "string", "walletAddress": "address", "share": 40 }
  ],
  "governors": ["userId1", "userId2"],
  "requiredApprovals": 2,
  "emergencyConfig": {
    "timesAllowed": 3,
    "limitPerWithdrawal": "10000",
    "totalLimit": "25000"
  },
  "riskAppetite": "LOW|MEDIUM|HIGH"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "pensionFundId": "cuid",
    "contractAddress": "0x...",
    "deploymentTxHash": "0x..."
  }
}
```

**GET /api/user/pension-funds/{id}**
Get fund details

Response:
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "Johnson Family Trust",
    "description": "...",
    "contractAddress": "0x...",
    "maturity": "2028-06-15T00:00:00Z",
    "currentBalance": "125430.50",
    "releaseAmount": "5000",
    "releaseInterval": "MONTHLY",
    "lastReleasedDate": "2026-02-22T...",
    "riskAppetite": "MEDIUM",
    "beneficiaries": [
      {
        "name": "John Doe",
        "walletAddress": "0x...",
        "share": 40,
        "email": "john@example.com"
      }
    ],
    "emergencyWithdrawalStatus": {
      "timesUsed": 1,
      "timesAllowed": 3,
      "amountWithdrawn": "8000",
      "totalLimit": "25000"
    }
  }
}
```

**POST /api/user/emergency-withdrawal**
Request emergency withdrawal

Request:
```json
{
  "fundId": "cuid",
  "amount": "5000",
  "reason": "Medical emergency"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "requestId": "cuid",
    "status": "Pending",
    "withdrawalId": null,
    "approvalProgress": "0 of 2 approvals"
  }
}
```

**POST /api/governor/approve-emergency-withdrawal**
Approve emergency withdrawal

Request:
```json
{
  "requestId": "cuid",
  "governorUserId": "cuid"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "requestId": "cuid",
    "withdrawalId": "0x1234...",
    "status": "PartiallyApproved",
    "approvalProgress": "1 of 2 approvals"
  }
}
```

**GET /api/admin/investment-proposals**
List pending proposals

Response:
```json
{
  "success": true,
  "data": {
    "proposals": [
      {
        "id": "cuid",
        "fundName": "Johnson Family Trust",
        "aiScore": "92",
        "expectedROI": "8.5",
        "riskLevel": "MEDIUM",
        "investmentAmount": "50000",
        "investmentContract": "0x...",
        "status": "Pending",
        "createdAt": "2026-03-22T10:00:00Z"
      }
    ]
  }
}
```

---

## 7. Security Considerations

### 7.1 Smart Contract Security
- **Audited contract**: FundManager.sol implements OpenZeppelin standards (Pausable, ReentrancyGuard, Ownable, SafeERC20)
- **Custom errors**: Gas-efficient error handling
- **Modifiers**: `onlyGovernor`, `withdrawalLimitNotBreached`, `tokenBalanceIsSufficient`
- **Basis points**: Precise percentage calculations (10000 = 100%)
- **Emergency pause**: Owner can pause contract in emergencies

### 7.2 Database Security
- **Encrypted private keys**: Beneficiary wallet private keys encrypted at rest
- **Cascade deletes**: Proper foreign key constraints prevent orphaned records
- **Unique constraints**: Prevent duplicate wallets, contract addresses
- **RBAC**: User roles (admin, governor, user) enforced in API layer

### 7.3 API Security
- **Web3 authentication**: Verify wallet signatures
- **Role-based access**: Check user role before sensitive operations
- **Governor verification**: Validate governor is in `selectedGovernors` array
- **Transaction validation**: Verify on-chain state before database updates

---

## 8. Testing Strategy

### 8.1 Smart Contract Testing
- **Unit tests** for all functions using Hardhat
- **Test cases**:
  - Constructor validation (invalid maturity, shares not summing to 100%)
  - Contribution with reentrancy attack simulation
  - Pension release before/after maturity
  - Emergency withdrawal multi-sig flow
  - Investment allocation and withdrawal
  - Pause/unpause functionality
  - Custom error cases
- **Coverage target**: 100% for critical paths
- **Mainnet fork tests**: Test against real stablecoin contracts

### 8.2 Database Testing
- **Migration tests**: Ensure Prisma migrations execute correctly
- **Relation tests**: Verify cascade deletes work properly
- **Constraint tests**: Test unique constraints (wallet, contractAddress)
- **Query tests**: Test complex joins and aggregations
- **Seed data**: Consistent test data for development

### 8.3 Integration Testing
- **Contract + DB sync**: Verify database updates after contract events
- **Workflow tests**: Test n8n workflow execution end-to-end
- **API tests**: Test endpoints with real database and mocked contract calls
- **Governor approval flow**: Test multi-step approval process
- **Investment flow**: Test proposal creation → approval → execution

---

## 9. Deployment Checklist

### 9.1 Pre-Deployment
- [ ] Smart contract audited by professional firm
- [ ] All tests passing (unit, integration, e2e)
- [ ] Database migrations tested on staging
- [ ] Environment variables configured
- [ ] Encryption keys for private key storage generated
- [ ] RPC endpoints configured with failover

### 9.2 Smart Contract Deployment
- [ ] Deploy to testnet (Sepolia/Mumbai)
- [ ] Verify contract on block explorer
- [ ] Test contract interactions from admin UI
- [ ] Deploy to mainnet with multi-sig deployer
- [ ] Transfer ownership to governance contract/multi-sig

### 9.3 Database Setup
- [ ] Run Prisma migrations on production database
- [ ] Create admin user accounts
- [ ] Seed reference data (if any)
- [ ] Set up database backups (hourly snapshots)
- [ ] Configure read replicas for scaling

### 9.4 Application Deployment
- [ ] Deploy backend API with environment variables
- [ ] Deploy admin web app
- [ ] Deploy customer web/mobile apps
- [ ] Configure n8n workflows for each fund
- [ ] Set up monitoring and alerting
- [ ] Configure CDN for static assets

---

## 10. Future Enhancements

### 10.1 Smart Contract Upgrades
- Implement upgrade proxy pattern for non-immutable logic
- Add support for multiple stablecoins per fund
- Implement fund termination function with multi-sig
- Add beneficiary modification with multi-sig approval
- Support for partial emergency withdrawals (not full distribution)

### 10.2 Database Enhancements
- Add `AuditLog` model for compliance tracking
- Implement soft deletes for critical records
- Add `FundPerformanceSnapshot` for historical tracking
- Support for multiple investment proposals per period
- Add `Rebalancing` model to track portfolio adjustments

### 10.3 Feature Additions
- **Tax reporting**: Generate 1099 forms from Transaction history
- **Beneficiary portal**: Dedicated UI for beneficiaries to view only their share
- **Multi-chain support**: Deploy same fund across multiple chains
- **DeFi integrations**: Direct integration with Aave, Compound for yield
- **Social features**: Beneficiary testimonials, success stories
- **Mobile wallet**: Built-in wallet management (encrypt private keys client-side)

---

## Appendices

### Appendix A: Glossary (Updated)

- **Basis Points**: Unit for percentage (10000 basis points = 100%)
- **Cause**: The pension fund's name/purpose (causeName in contract)
- **FundManager**: The Solidity smart contract managing pension funds
- **Release Amount**: Base monthly pension amount before inflation adjustment
- **Release Interval**: Frequency of pension distributions (WEEKLY/MONTHLY/etc.)
- **Governor**: Multi-sig wallet holder who approves emergency actions
- **Investment Contract**: External smart contract implementing IInvestmentContract interface
- **Withdrawal ID**: Unique bytes32 identifier for emergency withdrawal requests
- **Share Percentage**: Beneficiary's portion in basis points (4000 = 40%)

### Appendix B: Contract-Database Field Mapping

| Contract Field | Database Table | Database Field |
|----------------|----------------|----------------|
| causeName | PensionFund | name |
| causeDescription | PensionFund | description |
| fundMaturityDate | PensionFund | maturity |
| releaseAmount | PensionFund | reserveAmount (optional, for display) |
| token | PensionFund | stablecoin |
| beneficiaries | Beneficiary | walletAddress, share |
| governors | PensionFund | selectedGovernors[] |
| emergencyWithdrawalConfig.requiredNumberofApprovals | PensionFund | (derived from selectedGovernors length) |
| emergencyWithdrawalConfig.timesAllowed | PensionFund | (stored in contract, not DB) |
| totalWithdrawnAmount | EmergencyWithdrawalRequest | sum(amount) where status='Processed' |

### Appendix C: Prisma Enum Reference

```prisma
enum ReleaseInterval {
  WEEKLY
  FORTNIGHTLY
  MONTHLY
  QUARTERLY
}
```

**Usage**: Determines pension distribution frequency. Workflow uses this to schedule `releaseRegularPension` calls.

---

**Document Version**: 2.0  
**Last Updated**: March 22, 2026  
**Status**: Updated - Aligned with Smart Contract and Database Implementation  
**Next Review Date**: April 15, 2026

---

*This updated PRD reflects the actual implementation of FundManager.sol smart contract and Prisma database schema. All functional requirements, data flows, and API specifications have been aligned with the working codebase.*