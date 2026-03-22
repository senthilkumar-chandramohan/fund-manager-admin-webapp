# High-Level Design (HLD)
## AI-Powered Pension Fund Management System

**Version**: 2.0  
**Last Updated**: March 22, 2026  
**Status**: Updated - Aligned with Smart Contract and Database Implementation

---

## Document Change Log

### Version 2.0 Updates
- Aligned with implemented `FundManager.sol` smart contract
- Synchronized with Prisma database schema
- Added detailed RBAC implementation
- Included containerization and CI/CD pipeline design
- Added monitoring and logging architecture
- Updated diagrams to reflect actual implementation
- Added deployment automation strategy

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Diagrams](#2-architecture-diagrams)
3. [Component Design](#3-component-design)
4. [Data Architecture](#4-data-architecture)
5. [Security Architecture](#5-security-architecture)
6. [Integration Architecture](#6-integration-architecture)
7. [Infrastructure Architecture](#7-infrastructure-architecture)
8. [Monitoring and Logging](#8-monitoring-and-logging)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Scalability and Performance](#10-scalability-and-performance)

---

## 1. System Overview

### 1.1 Purpose
The AI-Powered Pension Fund Management System is a decentralized application (dApp) that combines blockchain smart contracts, AI-driven investment optimization, and traditional web technologies to provide transparent, secure, and automated pension fund management.

### 1.2 Key Architectural Principles

- **Separation of Concerns**: Clear boundaries between blockchain, backend, frontend, and AI layers
- **Immutability**: Critical fund parameters stored immutably on blockchain
- **Security First**: Multi-signature approvals, RBAC, encryption at rest and in transit
- **Scalability**: Horizontal scaling for web services, efficient blockchain interactions
- **Observability**: Comprehensive logging, monitoring, and alerting
- **Automation**: n8n workflows for routine operations and AI-driven decisions

### 1.3 Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Blockchain** | Solidity ^0.8.28, OpenZeppelin, Hardhat |
| **Backend** | Node.js, Express.js, Prisma ORM, PostgreSQL |
| **Frontend** | React.js, Next.js, TailwindCSS, Web3.js/ethers.js |
| **AI/Workflows** | n8n, LangChain, Anthropic Claude API |
| **Infrastructure** | Docker, Kubernetes, AWS/GCP, Terraform |
| **Monitoring** | Prometheus, Grafana, ELK Stack, Sentry, Datadog |
| **CI/CD** | GitHub Actions, ArgoCD, Docker Registry |

---

## 2. Architecture Diagrams

### 2.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                              │
├────────────────────────┬────────────────────────────────────────────┤
│   Admin Web App        │   Customer Web/Mobile App                  │
│   (React/Next.js)      │   (React/Next.js + React Native)           │
└────────────┬───────────┴────────────────┬───────────────────────────┘
             │                            │
             │    HTTPS/WSS               │    HTTPS/WSS
             │                            │
┌────────────▼────────────────────────────▼───────────────────────────┐
│                      API GATEWAY / LOAD BALANCER                     │
│                     (NGINX / AWS ALB + WAF)                          │
└────────────┬─────────────────────────────────────────────────────────┘
             │
             │
┌────────────▼─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER (Node.js)                        │
├───────────────────────┬──────────────────────────────────────────────┤
│  REST API Services    │  WebSocket Services                          │
│  - Authentication     │  - Real-time updates                         │
│  - Fund Management    │  - Notifications                             │
│  - Investment Ops     │  - Transaction status                        │
│  - Governor Actions   │                                              │
└─────┬─────────────────┴──────────────┬───────────────────────────────┘
      │                                │
      │                                │
┌─────▼────────────────────┐  ┌────────▼──────────────────────────────┐
│   BUSINESS LOGIC LAYER   │  │     WORKFLOW ORCHESTRATION            │
│                          │  │                                       │
│  - RBAC Enforcement      │  │  ┌─────────────────────────────────┐ │
│  - Data Validation       │  │  │     n8n Workflow Engine         │ │
│  - Business Rules        │  │  ├─────────────────────────────────┤ │
│  - Event Handlers        │  │  │ • Pension Distribution          │ │
│                          │  │  │ • Investment Allocation         │ │
└─────┬────────────────────┘  │  │ • Emergency Withdrawal Handler  │ │
      │                       │  │ • Performance Monitoring        │ │
      │                       │  └─────────┬───────────────────────┘ │
      │                       │            │                         │
      │                       │  ┌─────────▼───────────────────────┐ │
      │                       │  │   AI Agent Layer (LangChain)    │ │
      │                       │  │   - Investment Analysis         │ │
      │                       │  │   - Portfolio Optimization      │ │
      │                       │  │   - Risk Assessment             │ │
      │                       │  └─────────┬───────────────────────┘ │
      │                       └────────────┼─────────────────────────┘
      │                                    │
┌─────▼────────────────────────────────────▼────────────────────────────┐
│                        DATA LAYER                                     │
├──────────────────────────────┬────────────────────────────────────────┤
│   PostgreSQL Database        │   Blockchain Layer                     │
│   (Prisma ORM)               │                                        │
│                              │   ┌──────────────────────────────────┐ │
│  ┌────────────────────────┐  │   │   EVM Blockchain Network         │ │
│  │ • Users                │  │   │   (Ethereum/Polygon/Arbitrum)    │ │
│  │ • PensionFunds         │  │   │                                  │ │
│  │ • Beneficiaries        │  │   │  ┌────────────────────────────┐  │ │
│  │ • InvestmentProposals  │  │   │  │  FundManager Contract      │  │ │
│  │ • Investments          │  │   │  │  (Solidity ^0.8.28)        │  │ │
│  │ • Transactions         │  │   │  │                            │  │ │
│  │ • EmergencyRequests    │  │   │  │  • Beneficiary mgmt        │  │ │
│  │ • Workflows            │  │   │  │  • Pension distribution    │  │ │
│  │ • Notifications        │  │   │  │  • Emergency withdrawals   │  │ │
│  └────────────────────────┘  │   │  │  • Investment allocation   │  │ │
│                              │   │  └────────────────────────────┘  │ │
│                              │   │                                  │ │
│                              │   │  ┌────────────────────────────┐  │ │
│                              │   │  │  Investment Contracts      │  │ │
│                              │   │  │  (IInvestmentContract)     │  │ │
│                              │   │  └────────────────────────────┘  │ │
│                              │   └──────────────────────────────────┘ │
└──────────────────────────────┴────────────────────────────────────────┘
                               │
┌──────────────────────────────▼────────────────────────────────────────┐
│                     EXTERNAL INTEGRATIONS                             │
├────────────────────┬──────────────────┬───────────────────────────────┤
│  Blockchain RPCs   │  MCP Servers     │  External Services            │
│  • Infura          │  • Market Data   │  • SendGrid (Email)           │
│  • Alchemy         │  • Risk Analytics│  • Twilio (SMS)               │
│  • QuickNode       │  • Compliance    │  • FCM (Push Notifications)   │
│                    │  • Economic Data │  • Inflation Data APIs        │
└────────────────────┴──────────────────┴───────────────────────────────┘
```

### 2.2 Smart Contract Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      FundManager.sol                                │
│                   (Main Pension Fund Contract)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Inherits from OpenZeppelin:                                        │
│  • Pausable        (Emergency pause functionality)                  │
│  • ReentrancyGuard (Protection against reentrancy attacks)          │
│  • Ownable         (Owner-based access control)                     │
│                                                                     │
│  Uses:                                                              │
│  • SafeERC20       (Safe token transfers)                           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  IMMUTABLE STATE (Set in Constructor)                               │
│  • causeName: string                                                │
│  • causeDescription: string                                         │
│  • beneficiaries: Beneficiary[] (address, sharePercentage)          │
│  • token: IERC20 (stablecoin address)                               │
│  • releaseAmount: uint256 (base pension amount)                     │
│  • fundMaturityDate: uint256 (maturity timestamp)                   │
│  • governors: address[] (multi-sig signers)                         │
│  • emergencyWithdrawalConfig: EmergencyWithdrawalConfig             │
│    - requiredNumberofApprovals                                      │
│    - timesAllowed                                                   │
│    - limitPerWithdrawal                                             │
│    - totalLimit                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  MUTABLE STATE                                                      │
│  • totalWithdrawnAmount: uint256                                    │
│  • emergencyWithdrawals: mapping(bytes32 => EmergencyWithdrawal)    │
│  • emergencyWithdrawalApprovals: mapping(bytes32 => uint256)        │
│  • hasApprovedEmergencyWithdrawal: mapping(bytes32 => mapping)      │
│  • paused: bool (from Pausable)                                     │
├─────────────────────────────────────────────────────────────────────┤
│  CORE FUNCTIONS                                                     │
│                                                                     │
│  Contribution:                                                      │
│  • contributeFund(amount, note) → deposits tokens                   │
│                                                                     │
│  Pension Distribution:                                              │
│  • releaseRegularPension(inflationCoefficient) → distributes funds  │
│                                                                     │
│  Emergency Withdrawals:                                             │
│  • initiateEmergencyWithdrawal(amount) → returns withdrawalId       │
│  • approveEmergencyWithdrawal(governor, withdrawalId)               │
│  • executeEmergencyWithdrawal(withdrawalId) → transfers funds       │
│                                                                     │
│  Investment Management:                                             │
│  • investFund(investmentContract, amount) → allocates to investment │
│  • withdrawInvestment(investmentContract) → redeems investment      │
│                                                                     │
│  View Functions:                                                    │
│  • getWalletBalance() → current contract balance                    │
│  • getBeneficiaryCount() → number of beneficiaries                  │
│  • getAllBeneficiaries() → beneficiary details                      │
├─────────────────────────────────────────────────────────────────────┤
│  MODIFIERS                                                          │
│  • onlyGovernor(address) → restricts to governors                   │
│  • withdrawalLimitNotBreached(amount) → validates limits            │
│  • tokenBalanceIsSufficient(amount) → checks balance                │
│  • nonReentrant (from ReentrancyGuard)                              │
│  • whenNotPaused (from Pausable)                                    │
│  • onlyOwner (from Ownable)                                         │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ interacts with
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Investment Contracts (IInvestmentContract)             │
├─────────────────────────────────────────────────────────────────────┤
│  Interface:                                                         │
│  • invest(sender, amount) external                                  │
│  • withdraw(sender) external returns (uint256)                      │
│                                                                     │
│  Examples:                                                          │
│  • Aave Lending Pool Adapter                                        │
│  • Compound Finance Adapter                                         │
│  • Yearn Vault Adapter                                              │
│  • Bond Token Contract                                              │
│  • Index Fund Token Contract                                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               │ uses
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ERC20 Stablecoin Contracts                       │
│                    (USDC / USDT / PYUSD / DAI)                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Database Entity-Relationship Diagram

```
┌──────────────────┐
│      User        │
├──────────────────┤
│ id (PK)          │
│ email (UNIQUE)   │
│ name             │
│ wallet (UNIQUE)  │
│ privateKey       │
│ role             │──┐
│ createdAt        │  │
│ updatedAt        │  │
└──────────────────┘  │
         │            │
         │ 1:N        │ 1:N
         │            │
         ▼            ▼
┌──────────────────┐ ┌──────────────────┐
│  Notification    │ │ GovernorApproval │
├──────────────────┤ ├──────────────────┤
│ id (PK)          │ │ id (PK)          │
│ userId (FK)      │ │ governorId (FK)  │
│ title            │ │ requestType      │
│ message          │ │ requestId        │
│ type             │ │ status           │
│ read             │ │ createdAt        │
│ createdAt        │ └──────────────────┘
└──────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         PensionFund                                │
├────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                            │
│ name                                                               │
│ description                                                        │
│ maturity                                                           │
│ riskAppetite (LOW/MEDIUM/HIGH)                                     │
│ reserveAmount                                                      │
│ investmentDuration                                                 │
│ investmentDecisionMadeBy (Human/AI)                                │
│ stablecoin (USDC/USDT/PYUSD)                                       │
│ releaseInterval (WEEKLY/FORTNIGHTLY/MONTHLY/QUARTERLY)             │
│ lastReleasedDate                                                   │
│ contractAddress (UNIQUE)                                           │
│ selectedGovernors (String[])                                       │
│ createdAt                                                          │
│ updatedAt                                                          │
└────────────────────────────────────────────────────────────────────┘
         │
         │ 1:N
         ├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
         │              │              │              │              │              │
         ▼              ▼              ▼              ▼              ▼              ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────────┐
│  Beneficiary    │ │ Investment  │ │ Transaction │ │   Workflow   │ │Emergency │ │ Termination  │
│                 │ │  Proposal   │ │             │ │              │ │Withdrawal│ │   Request    │
├─────────────────┤ ├─────────────┤ ├─────────────┤ ├──────────────┤ │ Request  │ ├──────────────┤
│ id (PK)         │ │ id (PK)     │ │ id (PK)     │ │ id (PK)      │ ├──────────┤ │ id (PK)      │
│ name            │ │ fundId (FK) │ │ fundId (FK) │ │ fundId (FK)  │ │ id (PK)  │ │ fundId (FK)  │
│ email           │ │ aiScore     │ │ txHash      │ │ type         │ │fundId(FK)│ │ reason       │
│ relationship    │ │ expectedROI │ │ type        │ │ status       │ │ userId   │ │ status       │
│ share           │ │ riskLevel   │ │ amount      │ │n8nWorkflowId │ │withdrawal│ │ approvedAt   │
│ fundId (FK)     │ │investment   │ │ status      │ │ lastRun      │ │ Id       │ │ approvedBy   │
│ walletAddress   │ │ Amount      │ │ createdAt   │ │ nextRun      │ │ amount   │ │ createdAt    │
│ walletPrivateKey│ │investment   │ └─────────────┘ │ createdAt    │ │ reason   │ └──────────────┘
│ createdAt       │ │ Contract    │                 │ updatedAt    │ │ status   │
│ updatedAt       │ │ status      │                 └──────────────┘ │approvedBy│
└─────────────────┘ │ createdAt   │                                  │ createdAt│
                    │ approvedAt  │                                  └──────────┘
                    │ rejectedAt  │
                    │ approvedBy  │
                    └─────────────┘
                         │
                         │ 1:N
                         ▼
                    ┌─────────────┐
                    │ Investment  │
                    ├─────────────┤
                    │ id (PK)     │
                    │ fundId (FK) │
                    │proposalId   │
                    │ (FK)        │
                    │ roi         │
                    │investment   │
                    │ Amount      │
                    │investment   │
                    │ Contract    │
                    │ status      │
                    │ maturityDate│
                    │ createdAt   │
                    │ updatedAt   │
                    └─────────────┘
```

### 2.4 RBAC (Role-Based Access Control) Model

```
┌─────────────────────────────────────────────────────────────────────┐
│                         RBAC HIERARCHY                              │
└─────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │  Super Admin     │
                        │  (Full Access)   │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    │                         │
          ┌─────────▼─────────┐     ┌────────▼────────┐
          │   Administrator   │     │   Governor      │
          │  (Fund Mgmt)      │     │  (Multi-sig)    │
          └─────────┬─────────┘     └────────┬────────┘
                    │                        │
                    │                        │
                    └────────────┬───────────┘
                                 │
                        ┌────────▼────────┐
                        │   End User      │
                        │  (Contributor/  │
                        │  Beneficiary)   │
                        └─────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      PERMISSION MATRIX                               │
├──────────────┬──────────┬──────────┬──────────┬─────────────────────┤
│  Resource    │  Super   │  Admin   │Governor  │   User              │
│              │  Admin   │          │          │                     │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ System       │          │          │          │                     │
│ Config       │  CRUD    │  Read    │  None    │  None               │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ User         │          │          │          │                     │
│ Management   │  CRUD    │  R (own) │  R (own) │  R (own)            │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ Create       │          │          │          │                     │
│ Fund         │  Yes     │  Yes     │  No      │  No                 │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ View Fund    │          │          │          │                     │
│ Details      │  All     │  All     │  Assigned│  Own Only           │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ Investment   │          │          │          │                     │
│ Proposals    │  Approve │  Approve │  View    │  View (own fund)    │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ Emergency    │          │          │          │                     │
│ Withdrawal   │  Approve │  View    │  Approve │  Request            │
│              │  Execute │          │          │                     │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ Workflow     │          │          │          │                     │
│ Management   │  CRUD    │  CRUD    │  View    │  None               │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ Risk         │          │          │          │                     │
│ Appetite     │  Update  │  View    │  Update  │  Update (own fund)  │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ View         │          │          │          │                     │
│ Transactions │  All     │  All     │  Assigned│  Own Only           │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ Analytics &  │          │          │          │                     │
│ Reports      │  All     │  All     │  Assigned│  Own Only           │
├──────────────┼──────────┼──────────┼──────────┼─────────────────────┤
│ Pause        │          │          │          │                     │
│ Contract     │  Yes     │  No      │  No      │  No                 │
└──────────────┴──────────┴──────────┴──────────┴─────────────────────┘

Implementation:
• Role stored in User.role field (admin, governor, user)
• Middleware checks role before executing controller logic
• Governor permissions checked against PensionFund.selectedGovernors array
• API returns 403 Forbidden if insufficient permissions
```

### 2.5 Workflow Architecture (n8n)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    n8n WORKFLOW ORCHESTRATION                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WORKFLOW 1: Pension Distribution                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Trigger: Cron Schedule (based on PensionFund.releaseInterval)      │
│                                                                     │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────────┐        │
│  │ Check      │───▶│ Fetch        │───▶│ Calculate         │       │
│  │ Maturity   │    │ Inflation    │    │ Inflation         │        │
│  │ Date       │    │ Data (APIs)  │    │ Coefficient       │        │
│  └────────────┘    └──────────────┘    └─────────┬─────────┘        │
│                                                   │                 │
│                                                   ▼                 │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────────┐        │
│  │ Create     │◀───│ Update DB    │◀───│ Call Contract     │       │
│  │ Transaction│    │ lastReleased │    │ releaseRegular    │        │
│  │ Records    │    │ Date         │    │ Pension()         │        │
│  └─────┬──────┘    └──────────────┘    └───────────────────┘        │
│        │                                                            │
│        ▼                                                            │
│  ┌────────────┐    ┌──────────────┐                                 │
│  │ Send       │───▶│ Log Workflow │                                │
│  │ Notifications   │ Execution    │                                 │
│  └────────────┘    └──────────────┘                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WORKFLOW 2: AI Investment Allocation                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Trigger: Scheduled / Manual / Risk Appetite Change Event           │
│                                                                     │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────────┐        │
│  │ Fetch Fund │───▶│ Query MCP    │───▶│ AI Agent          │       │
│  │ Balance &  │    │ Servers      │    │ Analysis          │        │
│  │ Risk       │    │ (Market Data)│    │ (LangChain)       │        │
│  └────────────┘    └──────────────┘    └─────────┬─────────┘        │
│                                                   │                 │
│                                                   ▼                 │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────────┐        │
│  │ Wait for   │◀───│ Create       │◀───│ Generate          │       │
│  │ Human      │    │ Investment   │    │ Proposal          │        │
│  │ Approval   │    │ Proposal (DB)│    │ (Allocations)     │        │
│  └─────┬──────┘    └──────────────┘    └───────────────────┘        │
│        │                                                            │
│        │ If Approved                                                │
│        ▼                                                            │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────────┐        │
│  │ For Each   │───▶│ Create       │───▶│ Update Proposal   │       │
│  │ Allocation │    │ Investment & │    │ Status &          │        │
│  │ Call       │    │ Transaction  │    │ investmentDecision│        │
│  │ investFund()    │ Records      │    │ MadeBy = "AI"     │        │
│  └────────────┘    └──────────────┘    └───────────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WORKFLOW 3: Emergency Withdrawal Handler                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Trigger: Database Polling (new EmergencyWithdrawalRequest)         │
│                                                                     │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────────┐        │
│  │ Detect New │───▶│ Call Contract│───▶│ Store returned    │       │
│  │ Request    │    │ initiate     │    │ withdrawalId      │        │
│  │ (Pending)  │    │ Emergency    │    │ in DB             │        │
│  └────────────┘    │ Withdrawal() │    └───────────────────┘        │
│                    └──────────────┘                                 │
│                           │                                         │
│                           ▼                                         │
│  ┌────────────┐    ┌──────────────┐                                 │
│  │ Send       │───▶│ Fetch        │                                │
│  │ Notifications   │ Governors    │                                 │
│  │ to All     │    │ from         │                                 │
│  │ Governors  │    │ selectedGov..│                                 │
│  └────────────┘    └──────────────┘                                 │
│                                                                     │
│  ┌────────────────────────────────────────────────────────┐         │
│  │  APPROVAL MONITORING LOOP                              │         │
│  ├────────────────────────────────────────────────────────┤         │
│  │  ┌────────────┐    ┌──────────────┐    ┌────────────┐ │          │
│  │  │ Check      │───▶│ If Sufficient│───▶│ Call       │ │         │
│  │  │ Approval   │    │ Approvals    │    │ execute    │ │          │
│  │  │ Count      │    │ Reached      │    │ Emergency  │ │          │
│  │  └────────────┘    └──────────────┘    │ Withdrawal │ │          │
│  │                                         └─────┬──────┘ │         │
│  │                                               │        │         │
│  │                                               ▼        │         │
│  │  ┌────────────┐    ┌──────────────┐    ┌────────────┐ │          │
│  │  │ Send       │◀───│ Create       │◀───│ Update     │ │         │
│  │  │ Confirm    │    │ Transaction  │    │ Status to  │ │          │
│  │  │ Notifications   │ Records      │    │ Processed  │ │          │
│  │  └────────────┘    └──────────────┘    └────────────┘ │          │
│  └────────────────────────────────────────────────────────┘         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  WORKFLOW 4: Investment Performance Monitoring                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Trigger: Daily Cron Schedule                                       │
│                                                                     │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────────┐        │
│  │ Query All  │───▶│ For Each     │───▶│ Query Investment  │       │
│  │ Active     │    │ Investment   │    │ Contract for      │        │
│  │ Investments│    │              │    │ Current Value     │        │
│  └────────────┘    └──────────────┘    └─────────┬─────────┘        │
│                                                   │                 │
│                                                   ▼                 │
│  ┌────────────┐    ┌──────────────┐    ┌───────────────────┐        │
│  │ Alert if   │◀───│ Update       │◀───│ Calculate Actual  │       │
│  │ Under-     │    │ Investment   │    │ ROI               │        │
│  │ performing │    │ ROI in DB    │    │                   │        │
│  └────────────┘    └──────────────┘    └───────────────────┘        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Design

### 3.1 Smart Contract Layer

#### 3.1.1 FundManager Contract

**Purpose**: Core contract managing pension fund lifecycle

**Key Components**:

```solidity
// State Management
struct Beneficiary {
    address payable wallet;
    uint256 sharePercentage; // Basis points (10000 = 100%)
}

struct EmergencyWithdrawal {
    string status;
    uint256 amount;
}

struct EmergencyWithdrawalConfig {
    uint256 requiredNumberofApprovals;
    uint256 timesAllowed;
    uint256 limitPerWithdrawal;
    uint256 totalLimit;
}

// Access Control Patterns
modifier onlyGovernor(address _governor) {
    if (!isGovernor[_governor]) revert NotGovernor();
    _;
}

modifier withdrawalLimitNotBreached(uint256 _amount) {
    if (_amount > emergencyWithdrawalConfig.limitPerWithdrawal) {
        revert WithdrawalAmountBreachesLimit();
    }
    if (totalWithdrawnAmount + _amount > emergencyWithdrawalConfig.totalLimit) {
        revert TotalWithdrawalLimitBreached();
    }
    _;
}
```

**Security Mechanisms**:
- ReentrancyGuard on all state-changing functions
- Pausable for emergency stops
- SafeERC20 for all token transfers
- Custom errors for gas efficiency
- Multi-signature requirement enforcement

#### 3.1.2 Investment Contract Interface

```solidity
interface IInvestmentContract {
    function invest(address sender, uint256 amount) external;
    function withdraw(address sender) external returns (uint256);
}
```

**Implementation Examples**:
- Aave lending pool wrapper
- Compound cToken wrapper
- Yearn vault wrapper
- Custom bond contracts
- Index fund token contracts

### 3.2 Backend Services Layer

#### 3.2.1 API Service Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Express.js Application                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              Middleware Stack                              │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  1. CORS Handler                                           │     │
│  │  2. Request Logger (Morgan)                                │     │
│  │  3. Body Parser (JSON, URL-encoded)                        │     │
│  │  4. Compression (gzip)                                     │     │
│  │  5. Rate Limiter (express-rate-limit)                      │     │
│  │  6. Helmet (Security Headers)                              │     │
│  │  7. Authentication Middleware (JWT/Web3)                   │     │
│  │  8. RBAC Authorization Middleware                          │     │
│  │  9. Request Validation (express-validator)                 │     │
│  │  10. Error Handler                                         │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                    Route Handlers                          │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  /api/auth         - Authentication & Authorization        │     │
│  │  /api/admin/*      - Admin operations (RBAC protected)     │     │
│  │  /api/user/*       - User operations                       │     │
│  │  /api/governor/*   - Governor operations                   │     │
│  │  /api/funds/*      - Fund management                       │     │
│  │  /api/investments/*- Investment operations                 │     │
│  │  /api/workflows/*  - Workflow management                   │     │
│  │  /api/notifications/* - Notification management            │     │
│  │  /health           - Health check endpoint                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │               Business Logic Layer                         │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  • FundService      - Fund CRUD operations                 │     │
│  │  • InvestmentService- Investment proposal & execution      │     │
│  │  • GovernorService  - Multi-sig approval logic             │     │
│  │  • BlockchainService- Contract interactions                │     │
│  │  • WorkflowService  - n8n integration                      │     │
│  │  • NotificationService - Multi-channel notifications       │     │
│  │  • AnalyticsService - Reporting & metrics                  │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                  Data Access Layer                         │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  Prisma ORM                                                │     │
│  │  • Type-safe database queries                              │     │
│  │  • Migration management                                    │     │
│  │  • Connection pooling                                      │     │
│  │  • Query optimization                                      │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│             Web3 Authentication Flow                                │
└─────────────────────────────────────────────────────────────────────┘

User                    Frontend                Backend              Database
  │                        │                       │                    │
  │   Connect Wallet       │                       │                    │
  │───────────────────────▶│                       │                   │
  │                        │                       │                    │
  │   Request Challenge    │                       │                    │
  │                        │──────────────────────▶│                    │
  │                        │                       │  Generate Nonce    │
  │                        │     Nonce Message     │  & Timestamp       │
  │                        │◀──────────────────────│                    │
  │   Sign Message         │                       │                    │
  │◀───────────────────────│                       │                    │
  │                        │                       │                    │
  │   Signature            │                       │                    │
  │───────────────────────▶│                       │                    │
  │                        │  Wallet + Signature   │                    │
  │                        │──────────────────────▶│                    │
  │                        │                       │ Verify Signature   │
  │                        │                       │ (ecrecover)        │
  │                        │                       │                    │
  │                        │                       │  Query User by     │
  │                        │                       │  Wallet Address    │
  │                        │                       │───────────────────▶│
  │                        │                       │                    │
  │                        │                       │  User Data         │
  │                        │                       │◀───────────────────│
  │                        │                       │                    │
  │                        │                       │  Generate JWT      │
  │                        │                       │  (payload: userId, │
  │                        │                       │   wallet, role)    │
  │                        │                       │                    │
  │                        │    JWT Token          │                    │
  │                        │◀──────────────────────│                    │
  │   JWT Stored           │                       │                    │
  │◀───────────────────────│                       │                    │
  │                        │                       │                    │
  │   Subsequent Requests  │                       │                    │
  │   (Header: Bearer JWT) │                       │                    │
  │───────────────────────▶│──────────────────────▶│                    │
  │                        │                       │  Verify JWT        │
  │                        │                       │  Extract User Info │
  │                        │                       │  Check RBAC        │
  │                        │                       │                    │
  │                        │     Response          │                    │
  │◀───────────────────────│◀──────────────────────│                    │
  │                        │                       │                    │
```

#### 3.2.3 RBAC Middleware Implementation

```javascript
// middleware/rbac.js

const PERMISSIONS = {
  SUPER_ADMIN: {
    funds: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    workflows: ['create', 'read', 'update', 'delete'],
    investments: ['approve', 'reject', 'view'],
    emergencyWithdrawals: ['approve', 'execute', 'view'],
    system: ['configure', 'pause']
  },
  ADMIN: {
    funds: ['create', 'read', 'update'],
    users: ['read'],
    workflows: ['create', 'read', 'update', 'delete'],
    investments: ['approve', 'reject', 'view'],
    emergencyWithdrawals: ['view'],
    system: ['read']
  },
  GOVERNOR: {
    funds: ['read'],
    emergencyWithdrawals: ['approve', 'view'],
    riskAppetite: ['update'],
    investments: ['view']
  },
  USER: {
    funds: ['read'], // own only
    transactions: ['read'], // own only
    emergencyWithdrawals: ['request', 'view'], // own only
    riskAppetite: ['update'], // own fund only
    notifications: ['read', 'update']
  }
};

function checkPermission(resource, action) {
  return async (req, res, next) => {
    const { user } = req; // Set by auth middleware
    
    // Super admin has all permissions
    if (user.role === 'SUPER_ADMIN') {
      return next();
    }
    
    const userPermissions = PERMISSIONS[user.role];
    
    if (!userPermissions || !userPermissions[resource]) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    if (!userPermissions[resource].includes(action)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    // Additional checks for governors
    if (user.role === 'GOVERNOR' && resource === 'emergencyWithdrawals') {
      const { fundId } = req.params;
      const fund = await prisma.pensionFund.findUnique({
        where: { id: fundId }
      });
      
      if (!fund.selectedGovernors.includes(user.id)) {
        return res.status(403).json({ 
          error: 'Not a governor for this fund' 
        });
      }
    }
    
    next();
  };
}

module.exports = { checkPermission };
```

### 3.3 Frontend Architecture

#### 3.3.1 Admin Web Application Structure

```
admin-webapp/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   └── PendingActions.jsx
│   │   ├── funds/
│   │   │   ├── FundsList.jsx
│   │   │   ├── FundDetails.jsx
│   │   │   └── CreateFundWizard.jsx
│   │   ├── investments/
│   │   │   ├── ProposalCard.jsx
│   │   │   ├── ProposalDetails.jsx
│   │   │   └── ApprovalModal.jsx
│   │   ├── workflows/
│   │   │   ├── WorkflowsList.jsx
│   │   │   ├── WorkflowLogs.jsx
│   │   │   └── WorkflowConfig.jsx
│   │   └── emergency/
│   │       ├── RequestsList.jsx
│   │       └── ApprovalInterface.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useContract.js
│   │   ├── usePrisma.js
│   │   └── useNotifications.js
│   ├── services/
│   │   ├── api.js
│   │   ├── blockchain.js
│   │   ├── web3.js
│   │   └── websocket.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── Web3Context.jsx
│   │   └── NotificationContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Funds.jsx
│   │   ├── CreateFund.jsx
│   │   ├── Investments.jsx
│   │   ├── Workflows.jsx
│   │   └── Settings.jsx
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   └── App.jsx
├── public/
├── package.json
└── tailwind.config.js
```

#### 3.3.2 State Management Strategy

```javascript
// Using React Context + Hooks for state management

// contexts/AuthContext.jsx
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const login = async (walletAddress, signature) => {
    const response = await api.post('/auth/login', {
      walletAddress,
      signature
    });
    
    const { token, user } = response.data;
    localStorage.setItem('jwt', token);
    setUser(user);
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    localStorage.removeItem('jwt');
    setUser(null);
    setIsAuthenticated(false);
  };
  
  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('jwt');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      loading, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for consuming auth context
export const useAuth = () => useContext(AuthContext);
```

### 3.4 AI/Workflow Layer

#### 3.4.1 LangChain AI Agent Architecture

```python
# ai_agents/investment_optimizer.py

from langchain.agents import initialize_agent, Tool
from langchain.llms import Anthropic
from langchain.memory import ConversationBufferMemory

class InvestmentOptimizer:
    def __init__(self, fund_data, mcp_client):
        self.fund_data = fund_data
        self.mcp_client = mcp_client
        self.llm = Anthropic(model="claude-3-opus")
        
        # Define tools for the agent
        self.tools = [
            Tool(
                name="GetMarketData",
                func=self.get_market_data,
                description="Fetch historical returns and current prices"
            ),
            Tool(
                name="GetRiskMetrics",
                func=self.get_risk_metrics,
                description="Get volatility and correlation data"
            ),
            Tool(
                name="ValidateAllocation",
                func=self.validate_allocation,
                description="Check if allocation meets constraints"
            )
        ]
        
        self.agent = initialize_agent(
            self.tools,
            self.llm,
            agent="zero-shot-react-description",
            verbose=True
        )
    
    def get_market_data(self, instrument_type):
        """Fetch market data from MCP servers"""
        return self.mcp_client.query(
            "/market-data/historical-returns",
            {"type": instrument_type, "period": "5y"}
        )
    
    def get_risk_metrics(self, instruments):
        """Get risk analytics from MCP"""
        return self.mcp_client.query(
            "/risk-analytics/instrument-risk",
            {"instruments": instruments}
        )
    
    def validate_allocation(self, allocation):
        """Validate allocation against constraints"""
        # Check diversification (min 5 instruments)
        if len(allocation) < 5:
            return False
        
        # Check single instrument limit (max 30%)
        for inst in allocation:
            if inst['percentage'] > 30:
                return False
        
        # Check debt/equity ratio for risk appetite
        debt_total = sum(i['percentage'] for i in allocation if i['type'] == 'debt')
        equity_total = sum(i['percentage'] for i in allocation if i['type'] == 'equity')
        
        risk_appetite = self.fund_data['riskAppetite']
        if risk_appetite == 'LOW' and debt_total < 70:
            return False
        elif risk_appetite == 'HIGH' and equity_total < 60:
            return False
        
        return True
    
    def generate_proposal(self):
        """Generate investment proposal using AI agent"""
        prompt = f"""
        Analyze the pension fund with the following parameters:
        - Current Corpus: ${self.fund_data['balance']}
        - Risk Appetite: {self.fund_data['riskAppetite']}
        - Current Allocations: {self.fund_data['currentAllocations']}
        
        Using the available tools:
        1. Get market data for debt and equity instruments
        2. Get risk metrics for potential investments
        3. Recommend an optimal allocation strategy
        4. Validate the allocation meets constraints
        
        Provide a diversified allocation (min 5 instruments, max 30% per instrument)
        that maximizes expected returns within the risk profile.
        
        Return your recommendation in JSON format.
        """
        
        result = self.agent.run(prompt)
        return self.parse_proposal(result)
    
    def parse_proposal(self, agent_output):
        """Parse agent output into structured proposal"""
        # Extract JSON from agent output
        # Calculate metrics
        # Return structured proposal
        pass
```

---

## 4. Data Architecture

### 4.1 Database Schema Design

**Database**: PostgreSQL 14+  
**ORM**: Prisma  
**Connection Pooling**: PgBouncer

#### 4.1.1 Indexing Strategy

```sql
-- Performance-critical indexes

-- User lookups by wallet
CREATE UNIQUE INDEX idx_user_wallet ON users(wallet);
CREATE UNIQUE INDEX idx_user_email ON users(email);

-- Fund lookups by contract address
CREATE UNIQUE INDEX idx_fund_contract ON pension_funds(contract_address);

-- Transaction lookups
CREATE INDEX idx_transaction_fund ON transactions(fund_id);
CREATE INDEX idx_transaction_hash ON transactions(tx_hash);
CREATE INDEX idx_transaction_created ON transactions(created_at DESC);

-- Emergency withdrawal requests
CREATE INDEX idx_emergency_fund_status ON emergency_withdrawal_requests(fund_id, status);
CREATE INDEX idx_emergency_withdrawal_id ON emergency_withdrawal_requests(withdrawal_id);

-- Investment proposals
CREATE INDEX idx_proposal_fund_status ON investment_proposals(fund_id, status);
CREATE INDEX idx_proposal_created ON investment_proposals(created_at DESC);

-- Investments
CREATE INDEX idx_investment_fund_status ON investments(fund_id, status);
CREATE INDEX idx_investment_contract ON investments(investment_contract);

-- Notifications
CREATE INDEX idx_notification_user_read ON notifications(user_id, read);
CREATE INDEX idx_notification_created ON notifications(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_fund_maturity_interval ON pension_funds(maturity, release_interval);
CREATE INDEX idx_workflow_fund_status ON workflows(fund_id, status);
```

#### 4.1.2 Data Partitioning Strategy

```sql
-- Partition transactions table by month for historical data
CREATE TABLE transactions (
    id TEXT NOT NULL,
    fund_id TEXT NOT NULL,
    tx_hash TEXT,
    type TEXT NOT NULL,
    amount TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP NOT NULL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE transactions_2026_03 PARTITION OF transactions
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE transactions_2026_04 PARTITION OF transactions
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- Automated partition creation script
-- Run monthly via cron job
```

### 4.2 Caching Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Redis Caching Layer                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Cache Key Patterns:                                                │
│  • user:{userId}                    TTL: 1 hour                     │
│  • fund:{fundId}                    TTL: 5 minutes                  │
│  • fund:{fundId}:balance            TTL: 1 minute                   │
│  • fund:{fundId}:beneficiaries      TTL: 1 hour                     │
│  • proposals:pending                TTL: 30 seconds                 │
│  • notifications:{userId}:unread    TTL: 10 seconds                 │
│  • tx:{txHash}                      TTL: Until confirmed            │
│                                                                     │
│  Cache Invalidation Strategy:                                       │
│  • Write-through caching for user preferences                       │
│  • Cache-aside for fund data                                        │
│  • Pub/Sub for real-time invalidation on blockchain events          │
│                                                                     │
│  Redis Data Structures:                                             │
│  • Strings: Simple key-value pairs (user data, fund metadata)       │
│  • Hashes: Complex objects (fund details with multiple fields)      │
│  • Lists: Recent activities, transaction history                    │
│  • Sets: User notification IDs, pending proposal IDs                │
│  • Sorted Sets: Leaderboards, time-sorted data                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Backup and Recovery Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Backup Strategy                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  PostgreSQL:                                                        │
│  • Continuous WAL archiving to S3                                   │
│  • Full backup: Daily at 2 AM UTC                                   │
│  • Incremental backup: Every 6 hours                                │
│  • Point-in-time recovery (PITR): Last 30 days                      │
│  • Backup retention: 90 days                                        │
│  • Cross-region replication to DR site                              │
│                                                                     │
│  Recovery Time Objective (RTO): 1 hour                              │
│  Recovery Point Objective (RPO): 15 minutes                         │
│                                                                     │
│  Blockchain Data:                                                   │
│  • Archive nodes for complete history                               │
│  • Smart contract deployment artifacts versioned in Git             │
│  • ABI and deployment addresses in configuration management         │
│                                                                     │
│  Application State:                                                 │
│  • Docker images: Tagged and stored in registry                     │
│  • Configuration: Stored in Git with encryption for secrets         │
│  • Infrastructure: Terraform state in S3 with state locking         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Security Architecture

### 5.1 Security Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Defense in Depth Strategy                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Layer 1: Network Security                                          │
│  • WAF (Web Application Firewall) - AWS WAF / Cloudflare            │
│  • DDoS protection                                                  │
│  • Rate limiting at edge                                            │
│  • IP whitelisting for admin endpoints                              │
│  • VPC isolation for backend services                               │
│                                                                     │
│  Layer 2: Application Security                                      │
│  • HTTPS/TLS 1.3 only                                               │
│  • HSTS headers                                                     │
│  • CSP (Content Security Policy)                                    │
│  • XSS protection headers                                           │
│  • CSRF tokens for state-changing operations                        │
│  • Input validation and sanitization                                │
│  • Output encoding                                                  │
│  • SQL injection prevention (Prisma ORM)                            │
│                                                                     │
│  Layer 3: Authentication & Authorization                            │
│  • Web3 wallet signature verification                               │
│  • JWT with short expiration (15 min)                               │
│  • Refresh tokens (7 days)                                          │
│  • Role-based access control (RBAC)                                 │
│  • Multi-factor authentication for admin actions                    │
│  • Session management and invalidation                              │
│                                                                     │
│  Layer 4: Data Security                                             │
│  • Encryption at rest (AES-256)                                     │
│  • Encryption in transit (TLS 1.3)                                  │
│  • Encrypted private keys (Beneficiary wallets)                     │
│  • Secrets management (AWS Secrets Manager / HashiCorp Vault)       │
│  • Database connection encryption                                   │
│  • PII data minimization                                            │
│                                                                     │
│  Layer 5: Smart Contract Security                                   │
│  • OpenZeppelin audited libraries                                   │
│  • ReentrancyGuard on all external calls                            │
│  • SafeERC20 for token operations                                   │
│  • Access control modifiers                                         │
│  • Pausable functionality                                           │
│  • Multi-sig requirements for critical operations                   │
│  • Professional smart contract audit                                │
│  • Bug bounty program                                               │
│                                                                     │
│  Layer 6: Monitoring & Response                                     │
│  • Real-time security monitoring (SIEM)                             │
│  • Intrusion detection system (IDS)                                 │
│  • Audit logging of all sensitive operations                        │
│  • Anomaly detection for unusual patterns                           │
│  • Incident response plan                                           │
│  • Security patch management                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Encryption Implementation

```javascript
// utils/encryption.js

const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypt sensitive data (e.g., private keys)
 */
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return IV + authTag + encrypted data
  return iv.toString('hex') + 
         authTag.toString('hex') + 
         encrypted;
}

/**
 * Decrypt sensitive data
 */
function decrypt(encryptedData) {
  const iv = Buffer.from(
    encryptedData.slice(0, IV_LENGTH * 2), 
    'hex'
  );
  const authTag = Buffer.from(
    encryptedData.slice(
      IV_LENGTH * 2, 
      IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2
    ), 
    'hex'
  );
  const encrypted = encryptedData.slice(
    IV_LENGTH * 2 + AUTH_TAG_LENGTH * 2
  );
  
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    Buffer.from(ENCRYPTION_KEY, 'hex'), 
    iv
  );
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = { encrypt, decrypt };
```

### 5.3 Security Audit Checklist

- [ ] **Smart Contract Audit**
  - [ ] Professional audit by 2+ firms (Certik, Trail of Bits, OpenZeppelin)
  - [ ] Formal verification of critical functions
  - [ ] Fuzzing tests
  - [ ] Gas optimization review
  - [ ] Upgrade mechanism security review

- [ ] **Application Security**
  - [ ] OWASP Top 10 compliance testing
  - [ ] Penetration testing
  - [ ] API security testing
  - [ ] Dependency vulnerability scanning
  - [ ] Static application security testing (SAST)
  - [ ] Dynamic application security testing (DAST)

- [ ] **Infrastructure Security**
  - [ ] Network security assessment
  - [ ] Cloud security posture review
  - [ ] Secret management audit
  - [ ] Access control review
  - [ ] Logging and monitoring verification

- [ ] **Data Privacy**
  - [ ] GDPR compliance check (if applicable)
  - [ ] Data classification and handling procedures
  - [ ] PII encryption verification
  - [ ] Data retention policy implementation
  - [ ] Right to erasure implementation

---

## 6. Integration Architecture

### 6.1 Blockchain Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│              Blockchain Integration Layer                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              RPC Provider Management                       │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  Primary Providers:                                        │     │
│  │  • Infura (Tier 1)                                         │     │
│  │  • Alchemy (Tier 1)                                        │     │
│  │  • QuickNode (Tier 2)                                      │     │
│  │                                                            │     │
│  │  Fallback Strategy:                                        │     │
│  │  1. Try primary provider                                   │     │
│  │  2. If fails, rotate to next provider                      │     │
│  │  3. Exponential backoff (1s, 2s, 4s, 8s)                   │     │
│  │  4. Circuit breaker after 5 consecutive failures           │     │
│  │  5. Alert monitoring team                                  │     │
│  │                                                            │     │
│  │  Health Checks:                                            │     │
│  │  • Query latest block every 30 seconds                     │     │
│  │  • Track response times                                    │     │
│  │  • Monitor error rates                                     │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │           Transaction Management                           │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  Gas Price Strategy:                                       │     │
│  │  • Query current gas prices from multiple sources          │     │
│  │  • Use median value                                        │     │
│  │  • Add 10% buffer for normal transactions                  │     │
│  │  • Add 20% buffer for time-sensitive transactions          │     │
│  │  • Set max gas price limit (user configurable)             │     │
│  │                                                            │     │
│  │  Transaction Submission:                                   │     │
│  │  1. Estimate gas limit                                     │     │
│  │  2. Add 20% buffer to gas limit                            │     │
│  │  3. Sign transaction                                       │     │
│  │  4. Submit to blockchain                                   │     │
│  │  5. Store tx hash in database (status: PENDING)            │     │
│  │  6. Monitor for confirmations                              │     │
│  │                                                            │     │
│  │  Confirmation Monitoring:                                  │     │
│  │  • Poll for receipt every 5 seconds                        │     │
│  │  • Wait for configurable confirmations (default: 3)        │     │
│  │  • Update database status to CONFIRMED                     │     │
│  │  • Emit event for real-time updates                        │     │
│  │  • Handle failures and resubmissions                       │     │
│  │                                                            │     │
│  │  Transaction Retry Logic:                                  │     │
│  │  • If pending for >5 minutes, increase gas price by 20%    │     │
│  │  • Resubmit with same nonce                                │     │
│  │  • Max 3 retries before manual intervention                │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │             Event Listening & Processing                   │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  Event Listeners:                                          │     │
│  │  • FundReceived                                            │     │
│  │  • FundReleased                                            │     │
│  │  • EmergencyWithdrawalInitiated                            │     │
│  │  • EmergencyWithdrawalApproved                             │     │
│  │  • EmergencyWithdrawalExecuted                             │     │
│  │  • InvestmentMade                                          │     │
│  │  • InvestmentWithdrawn                                     │     │
│  │                                                            │     │
│  │  Processing Pipeline:                                      │     │
│  │  1. Listen for events from last processed block            │     │
│  │  2. Parse event data                                       │     │
│  │  3. Update database accordingly                            │     │
│  │  4. Trigger notifications                                  │     │
│  │  5. Update last processed block number                     │     │
│  │  6. Handle blockchain reorganizations                      │     │
│  │                                                            │     │
│  │  Reliability:                                              │     │
│  │  • Store last processed block in database                  │     │
│  │  • Replay events from last checkpoint on restart           │     │
│  │  • Idempotent event processing                             │     │
│  │  • Dead letter queue for failed processing                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 External Service Integration

```
┌─────────────────────────────────────────────────────────────────────┐
│                  External Service Integrations                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  MCP (Model Context Protocol) Servers:                              │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Market Data MCP Server                                    │     │
│  │  Endpoints:                                                │     │
│  │  • GET /market-data/historical-returns                     │     │
│  │  • GET /market-data/current-prices                         │     │
│  │  • GET /market-data/instruments                            │     │
│  │                                                            │     │
│  │  Rate Limits: 1000 req/hour                                │     │
│  │  Caching: 5 minutes for historical data                    │     │
│  │  Fallback: Use cached data if API unavailable              │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Risk Analytics MCP Server                                 │     │
│  │  Endpoints:                                                │     │
│  │  • GET /risk-analytics/instrument-risk                     │     │
│  │  • GET /risk-analytics/correlation-matrix                  │     │
│  │  • GET /risk-analytics/volatility                          │     │
│  │                                                            │     │
│  │  Rate Limits: 500 req/hour                                 │     │
│  │  Caching: 1 hour for risk metrics                          │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  Inflation Data APIs:                                               │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Primary: Bureau of Labor Statistics (BLS) API             │     │
│  │  Secondary: European Central Bank API                      │     │
│  │  Tertiary: World Bank Open Data API                        │     │
│  │                                                            │     │
│  │  Strategy:                                                 │     │
│  │  • Query all three sources                                 │     │
│  │  • Use median value                                        │     │
│  │  • Cache for 24 hours                                      │     │
│  │  • Alert if sources diverge >1%                            │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  Notification Services:                                             │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Email: SendGrid / AWS SES                                 │     │
│  │  • Transactional emails                                    │     │
│  │  • Notification digests                                    │     │
│  │  • Rate limit: 10,000/day per user                         │     │
│  │                                                            │     │
│  │  SMS: Twilio / AWS SNS                                     │     │
│  │  • Emergency alerts                                        │     │
│  │  • 2FA codes                                               │     │
│  │  • Opt-in only                                             │     │
│  │                                                            │     │
│  │  Push: Firebase Cloud Messaging (FCM) / APNS               │     │
│  │  • Real-time notifications                                 │     │
│  │  • Mobile app only                                         │     │
│  │  • Batched for efficiency                                  │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Infrastructure Architecture

### 7.1 Cloud Infrastructure (AWS Example)

```
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS Infrastructure                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        Region: us-east-1                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │                  Public Subnet                             │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │                                                            │     │
│  │  ┌──────────────┐         ┌──────────────┐                 │     │
│  │  │ Application  │         │   Bastion    │                 │     │
│  │  │ Load Balancer│◀───────│     Host     │                 │     │
│  │  │    (ALB)     │         │              │                 │     │
│  │  └──────┬───────┘         └──────────────┘                 │     │
│  │         │                                                  │     │
│  └─────────┼──────────────────────────────────────────────────┘     │
│            │                                                        │
│  ┌─────────▼────────────────────────────────────────────────────┐   │
│  │              Private Subnet - Application Tier               │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │                                                              │   │
│  │  ┌────────────────┐    ┌────────────────┐    ┌──────────┐    │   │
│  │  │  ECS Cluster   │    │  ECS Cluster   │    │   ECS    │    │   │
│  │  │   (API-1)      │    │   (API-2)      │    │ Cluster  │    │   │
│  │  │                │    │                │    │  (API-3) │    │   │
│  │  │  Auto Scaling  │    │  Auto Scaling  │    │   Auto   │    │   │
│  │  │   Group        │    │   Group        │    │ Scaling  │    │   │
│  │  └────────┬───────┘    └────────┬───────┘    └────┬─────┘    │   │
│  │           │                     │                 │          │   │
│  └───────────┼─────────────────────┼─────────────────┼──────────┘   │
│              │                     │                 │              │
│  ┌───────────▼─────────────────────▼─────────────────▼───────┐      │
│  │           Private Subnet - Data Tier                      │      │
│  │           Private Subnet - Data Tier                      │      │
│  │           Private Subnet - Data Tier                      │      │
│  ├───────────────────────────────────────────────────────────┤      │
│  │                                                           │      │
│  │  ┌──────────────────────────────────────────────────┐     │      │
│  │  │   RDS PostgreSQL (Multi-AZ)                      │     │      │
│  │  │   • Primary Instance                             │     │      │
│  │  │   • Read Replica (Auto-failover)                 │     │      │
│  │  │   • Automated Backups                            │     │      │
│  │  └──────────────────────────────────────────────────┘     │      │
│  │                                                           │      │
│  │  ┌──────────────────────────────────────────────────┐     │      │
│  │  │   ElastiCache Redis Cluster                      │     │      │
│  │  │   • 3 nodes (1 primary, 2 replicas)              │     │      │
│  │  │   • Automatic failover                           │     │      │
│  │  └──────────────────────────────────────────────────┘     │      │
│  │                                                           │      │
│  │  ┌──────────────────────────────────────────────────┐     │      │
│  │  │   EC2 Instance (n8n Workflow Engine)             │     │      │
│  │  │   • Type: t3.xlarge                              │     │      │
│  │  │   • Persistent EBS volume                        │     │      │
│  │  └──────────────────────────────────────────────────┘     │      │
│  │                                                           │      │
│  └───────────────────────────────────────────────────────────┘      │
│                                                                     │
│  Additional AWS Services:                                           │
│  • S3: Static asset hosting, backups, logs                          │
│  • CloudFront: CDN for frontend assets                              │
│  • Route 53: DNS management                                         │
│  • CloudWatch: Metrics and logging                                  │
│  • Secrets Manager: Secure credential storage                       │
│  • WAF: Web Application Firewall                                    │
│  • KMS: Encryption key management                                   │
│  • SNS/SQS: Event-driven messaging                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     Disaster Recovery Region                        │
│                       Region: us-west-2                             │
├─────────────────────────────────────────────────────────────────────┤
│  • RDS Cross-Region Read Replica                                    │
│  • S3 Cross-Region Replication                                      │
│  • Standby infrastructure (can be activated in <1 hour)             │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Kubernetes Deployment (Alternative to ECS)

```yaml
# k8s/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-deployment
  namespace: pension-fund-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: pension-fund-api:v2.0.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-credentials
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
  namespace: pension-fund-prod
spec:
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
  namespace: pension-fund-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-deployment
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 7.3 Containerization Strategy

```dockerfile
# Dockerfile (Multi-stage build)

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Generate Prisma Client
RUN npx prisma generate

# Copy application code
COPY . .

# Build application (if TypeScript)
# RUN npm run build

# Stage 2: Production
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/server.js"]
```

---

## 8. Monitoring and Logging

### 8.1 Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              Metrics Collection (Prometheus)               │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  Application Metrics:                                      │     │
│  │  • HTTP request rate, latency, errors (by endpoint)        │     │
│  │  • Database query performance                              │     │
│  │  • Cache hit/miss rates                                    │     │
│  │  • WebSocket connections                                   │     │
│  │  • Custom business metrics (funds created, txs processed)  │     │
│  │                                                            │     │
│  │  Infrastructure Metrics:                                   │     │
│  │  • CPU, memory, disk, network usage                        │     │
│  │  • Container/pod health                                    │     │
│  │  • Load balancer metrics                                   │     │
│  │  • Auto-scaling events                                     │     │
│  │                                                            │     │
│  │  Blockchain Metrics:                                       │     │
│  │  • Gas prices                                              │     │
│  │  • Transaction confirmation times                          │     │
│  │  • Failed transaction rate                                 │     │
│  │  • Smart contract function call counts                     │     │
│  │  • RPC provider response times                             │     │
│  │                                                            │     │
│  │  Workflow Metrics (n8n):                                   │     │
│  │  • Workflow execution count, duration, errors              │     │
│  │  • AI agent decision latency                               │     │
│  │  • MCP server query latency                                │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │            Visualization (Grafana)                         │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  Dashboards:                                               │     │
│  │  • System Overview                                         │     │
│  │  • Application Performance                                 │     │
│  │  • Blockchain Operations                                   │     │
│  │  • Business Metrics                                        │     │
│  │  • Security Monitoring                                     │     │
│  │  • Cost Analysis                                           │     │
│  │                                                            │     │
│  │  Alerts:                                                   │     │
│  │  • High error rate (>5% in 5 min)                          │     │
│  │  • High latency (p95 >2s)                                  │     │
│  │  • Database connection pool exhaustion                     │     │
│  │  • Failed transactions (>3 in 10 min)                      │     │
│  │  • Low disk space (<20%)                                   │     │
│  │  • Security anomalies                                      │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │         Application Performance Monitoring (Datadog)       │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  • Distributed tracing                                     │     │
│  │  • Error tracking and aggregation                          │     │
│  │  • User session replay (for debugging)                     │     │
│  │  • Real User Monitoring (RUM)                              │     │
│  │  • Synthetic monitoring                                    │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │           Smart Contract Monitoring (Tenderly)             │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  • Transaction simulation before execution                 │     │
│  │  • Real-time alerting on contract events                   │     │
│  │  • Gas usage analysis                                      │     │
│  │  • Failed transaction debugging                            │     │
│  │  • Contract state tracking                                 │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Logging Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ELK Stack (Elasticsearch, Logstash, Kibana)    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              Log Sources                                   │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  Application Logs:                                         │     │
│  │  • Structured JSON logs (Winston logger)                   │     │
│  │  • Log levels: ERROR, WARN, INFO, HTTP, DEBUG              │     │
│  │  • Request/Response logs                                   │     │
│  │  • Business event logs                                     │     │
│  │                                                            │     │
│  │  Audit Logs:                                               │     │
│  │  • User authentication/authorization events                │     │
│  │  • Fund creation/modification                              │     │
│  │  • Investment approvals/rejections                         │     │
│  │  • Emergency withdrawal requests/approvals                 │     │
│  │  • Configuration changes                                   │     │
│  │  • RBAC permission checks                                  │     │
│  │                                                            │     │
│  │  Infrastructure Logs:                                      │     │
│  │  • Container logs                                          │     │
│  │  • Load balancer access logs                               │     │
│  │  • Database query logs (slow queries)                      │     │
│  │  • System logs                                             │     │
│  │                                                            │     │
│  │  Security Logs:                                            │     │
│  │  • Failed authentication attempts                          │     │
│  │  • Rate limiting events                                    │     │
│  │  • Suspicious activity detection                           │     │
│  │  • WAF blocks                                              │     │
│  └────────────────────────────────────────────────────────────┘     │
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │         Logstash (Aggregation & Processing)                │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  • Parse and structure logs                                │     │
│  │  • Enrich with metadata (timestamps, IDs, tags)            │     │
│  │  • Filter and route by log type                            │     │
│  │  • Redact sensitive data (PII, keys, passwords)            │     │
│  └────────────────────────────────────────────────────────────┘     │
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │            Elasticsearch (Storage & Indexing)              │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  • Full-text search indexing                               │     │
│  │  • Time-series data optimization                           │     │
│  │  • Index rotation (daily/weekly)                           │     │
│  │  • Retention policy (90 days for app logs, 7 years audit)  │     │
│  └────────────────────────────────────────────────────────────┘     │
│                          │                                          │
│                          ▼                                          │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              Kibana (Visualization & Analysis)             │     │
│  ├────────────────────────────────────────────────────────────┤     │
│  │  • Log search and filtering                                │     │
│  │  • Dashboards for log analysis                             │     │
│  │  • Alerting on log patterns                                │     │
│  │  • Audit trail reports                                     │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Log Format Example:
{
  "timestamp": "2026-03-22T14:30:45.123Z",
  "level": "INFO",
  "service": "api",
  "environment": "production",
  "requestId": "req-abc123",
  "userId": "user-xyz789",
  "action": "FUND_CREATED",
  "fundId": "fund-456def",
  "contractAddress": "0x...",
  "duration": 1234,
  "message": "Pension fund created successfully",
  "metadata": {
    "fundName": "Johnson Family Trust",
    "beneficiaryCount": 3
  }
}
```

### 8.3 Alerting Strategy

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Alert Severity Levels                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CRITICAL (P0) - Immediate Response Required                         │
│  • Multiple service instances down                                   │
│  • Database unreachable                                              │
│  • Smart contract security incident                                  │
│  • Data breach detected                                              │
│                                                                      │
│  Notification Channels: PagerDuty, SMS, Phone Call                   │
│  Response Time: < 15 minutes                                         │
│                                                                      │
│  HIGH (P1) - Urgent Attention Needed                                 │
│  • Single service instance down                                      │
│  • High error rate (>5%)                                             │
│  • Failed blockchain transactions (>5 in 10 min)                     │
│  • Database performance degradation                                  │
│  • Workflow execution failures                                       │
│                                                                      │
│  Notification Channels: Slack, Email, PagerDuty                      │
│  Response Time: < 1 hour                                             │
│                                                                      │
│  MEDIUM (P2) - Investigation Required                                │
│  • Elevated response times (p95 >2s)                                 │
│  • Cache miss rate spike                                             │
│  • Moderate error rate (2-5%)                                        │
│  • Disk space low (<30%)                                             │
│                                                                      │
│  Notification Channels: Slack, Email                                 │
│  Response Time: < 4 hours                                            │
│                                                                      │
│  LOW (P3) - Awareness                                                │
│  • Slow response times (p95 1.5-2s)                                  │
│  • Low error rate (1-2%)                                             │
│  • Informational security events                                     │
│                                                                      │
│  Notification Channels: Slack                                        │
│  Response Time: Next business day                                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

Alert Escalation Policy:
• P0: Immediate notification to on-call engineer + manager
• P1: On-call engineer, escalate to manager after 30 min
• P2: On-call engineer, escalate if not resolved in 2 hours
• P3: Team Slack channel, no escalation
```

---

## 9. Deployment Architecture

### 9.1 CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                     GitHub Actions Workflow                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  On Push to 'develop' branch                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐                                                 │
│  │  Checkout Code │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Install Dependencies│                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Run Linting         │                                           │
│  │  (ESLint, Prettier)  │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Run Unit Tests      │                                           │
│  │  (Jest, Mocha)       │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Security Scan       │                                           │
│  │  (Snyk, npm audit)   │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Build Docker Image  │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Push to Registry    │                                           │
│  │  (ECR/DockerHub)     │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Deploy to Staging   │                                           │
│  │  (Auto-deploy)       │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Integration Tests   │                                           │
│  │  (on Staging)        │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  E2E Tests           │                                           │
│  │  (Cypress, Playwright)│                                          │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Notify Team         │                                           │
│  │  (Slack)             │                                           │
│  └──────────────────────┘                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  On Tag (Production Release)                                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌────────────────┐                                                 │
│  │  All Above +   │                                                 │
│  └───────┬────────┘                                                 │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Manual Approval     │                                           │
│  │  (Required)          │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Deploy to Prod      │                                           │
│  │  (Blue-Green)        │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Smoke Tests         │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Monitoring Check    │                                           │
│  │  (5 min)             │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Rollback or         │                                           │
│  │  Complete Deployment │                                           │
│  └───────┬──────────────┘                                           │
│          │                                                          │
│  ┌───────▼──────────────┐                                           │
│  │  Create Release      │                                           │
│  │  Notes               │                                           │
│  └──────────────────────┘                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Smart Contract Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│             Smart Contract Deployment Workflow                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Development → Testnet → Mainnet                                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Step 1: Local Development & Testing                        │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  • Write/modify contracts                                   │    │
│  │  • Compile with Hardhat                                     │    │
│  │  • Run unit tests (Hardhat test suite)                      │    │
│  │  • Run coverage tests (solidity-coverage)                   │    │
│  │  • Deploy to local Hardhat network                          │    │
│  │  • Integration tests with local blockchain                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Step 2: Testnet Deployment (Sepolia/Mumbai)                │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  • Deploy via Hardhat script                                │    │
│  │  • Verify contract on Etherscan                             │    │
│  │  • Run integration tests against testnet                    │    │
│  │  • Test with frontend (staging environment)                 │    │
│  │  • Perform security testing                                 │    │
│  │  • Gas optimization review                                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Step 3: Security Audit                                     │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  • Submit to audit firms (2+ firms)                         │    │
│  │  • Address findings                                         │    │
│  │  • Re-audit if significant changes                          │    │
│  │  • Obtain audit report                                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Step 4: Mainnet Deployment                                 │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  • Deploy from multi-sig wallet (Gnosis Safe)               │    │
│  │  • Verify contract on Etherscan                             │    │
│  │  • Transfer ownership to governance multi-sig               │    │
│  │  • Monitor initial transactions closely                     │    │
│  │  • Update frontend with new contract address                │    │
│  │  • Publish deployment docs and ABI                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Post-Deployment                                            │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  • Set up Tenderly monitoring                               │    │
│  │  • Configure alerts for contract events                     │    │
│  │  • Launch bug bounty program                                │    │
│  │  • Maintain upgrade documentation                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.3 Database Migration Strategy

```javascript
// Prisma Migration Workflow

// 1. Development
// Create migration
npm run prisma:migrate:dev --name add_new_field

// 2. Review migration SQL
cat prisma/migrations/\*/migration.sql

// 3. Staging deployment
// Run migrations on staging database
npm run prisma:migrate:deploy

// 4. Verify migration
// Check database schema
npm run prisma:studio

// 5. Production deployment
// Run migrations during deployment window
// With database backup taken beforehand
npm run prisma:migrate:deploy

// 6. Rollback procedure (if needed)
// Manual rollback using backup
psql -h production-db -U admin -d pension_fund < backup.sql
```

### 9.4 Environment Configuration Management

```
┌─────────────────────────────────────────────────────────────────────┐
│                Environment Configuration                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Configuration Sources (Priority Order):                            │
│  1. Environment Variables (highest priority)                        │
│  2. Secrets Manager (AWS Secrets Manager / Vault)                   │
│  3. .env files (development only, gitignored)                       │
│  4. Default values in code                                          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Secrets (stored in Secrets Manager)                        │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  • DATABASE_URL                                             │    │
│  │  • REDIS_URL                                                │    │
│  │  • JWT_SECRET                                               │    │
│  │  • ENCRYPTION_KEY                                           │    │
│  │  • BLOCKCHAIN_RPC_URLS                                      │    │
│  │  • PRIVATE_KEYS (deployer, bot wallets)                     │    │
│  │  • API_KEYS (SendGrid, Twilio, MCP servers)                 │    │
│  │  • ANTHROPIC_API_KEY                                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Non-Secrets (environment variables)                        │    │
│  ├─────────────────────────────────────────────────────────────┤    │
│  │  • NODE_ENV (development|staging|production)                │    │
│  │  • PORT                                                     │    │
│  │  • LOG_LEVEL                                                │    │
│  │  • BLOCKCHAIN_NETWORK (ethereum|polygon|arbitrum)           │    │
│  │  • CORS_ORIGIN                                              │    │
│  │  • RATE_LIMIT_MAX                                           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  Secret Rotation Policy:                                            │
│  • Database passwords: Every 90 days                                │
│  • API keys: Every 180 days                                         │
│  • Encryption keys: Annually                                        │
│  • Automated rotation where supported                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Scalability and Performance

### 10.1 Scalability Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Horizontal Scaling Plan                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Application Tier:                                                  │
│  • Stateless API servers (easy to scale)                            │
│  • Auto-scaling based on:                                           │
│    - CPU > 70% → scale up                                           │
│    - Memory > 80% → scale up                                        │
│    - Request queue length > 100 → scale up                          │
│  • Min instances: 3 (across 3 AZs)                                  │
│  • Max instances: 20                                                │
│  • Load balancing: Round-robin with health checks                   │
│                                                                     │
│  Database Tier:                                                     │
│  • Vertical scaling for writes (larger instance)                    │
│  • Horizontal scaling for reads (read replicas)                     │
│  • Connection pooling (PgBouncer) - 1000 connections                │
│  • Query optimization and indexing                                  │
│  • Partitioning for large tables (transactions)                     │
│                                                                     │
│  Caching Tier:                                                      │
│  • Redis cluster with 3 nodes (1 primary, 2 replicas)               │
│  • Automatic failover                                               │
│  • Eviction policy: LRU                                             │
│  • Memory: 16GB per node (expandable to 64GB)                       │
│                                                                     │
│  Workflow Tier (n8n):                                               │
│  • Initially: Single EC2 instance                                   │
│  • Scale: Deploy multiple n8n instances with queue-based execution  │
│  • Use SQS/RabbitMQ for workflow job distribution                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Performance Optimization

```
┌─────────────────────────────────────────────────────────────────────┐
│                  Performance Optimization Techniques                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  API Layer:                                                         │
│  • Response compression (gzip)                                      │
│  • HTTP/2 support                                                   │
│  • API response caching (Redis)                                     │
│  • GraphQL for flexible data fetching (future)                      │
│  • Rate limiting to prevent abuse                                   │
│  • CDN for static assets                                            │
│                                                                     │
│  Database:                                                          │
│  • Indexed all foreign keys and frequently queried fields           │
│  • Materialized views for complex reports                           │
│  • Query result caching (Redis)                                     │
│  • Batch operations where possible                                  │
│  • Connection pooling (PgBouncer)                                   │
│  • Read replicas for analytics queries                              │
│                                                                     │
│  Blockchain:                                                        │
│  • Batch read operations (multicall)                                │
│  • Cache contract data (balances, beneficiaries)                    │
│  • Use events for state tracking (vs polling)                       │
│  • Gas optimization in smart contracts                              │
│  • Parallel transaction submission for independent ops              │
│                                                                     │
│  Frontend:                                                          │
│  • Code splitting and lazy loading                                  │
│  • Image optimization and lazy loading                              │
│  • Service workers for offline capability                           │
│  • Memoization of expensive computations                            │
│  • Virtualized lists for long tables                                │
│  • WebSocket for real-time updates (vs polling)                     │
│                                                                     │
│  AI/Workflows:                                                      │
│  • Cache MCP server responses                                       │
│  • Parallel execution where independent                             │
│  • Timeout limits to prevent hanging                                │
│  • Result caching for repeated scenarios                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.3 Load Testing Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Load Testing Plan (k6)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Test Scenarios:                                                     │
│                                                                      │
│  1. Smoke Test (Baseline)                                            │
│     • 10 VUs (virtual users)                                         │
│     • Duration: 5 minutes                                            │
│     • Validates basic functionality                                  │
│                                                                      │
│  2. Load Test (Normal Traffic)                                       │
│     • Ramp up to 1000 VUs over 5 minutes                             │
│     • Hold at 1000 VUs for 30 minutes                                │
│     • Ramp down over 5 minutes                                       │
│     • Metrics: avg response time, error rate                         │
│                                                                      │
│  3. Stress Test (Find Breaking Point)                                │
│     • Ramp up to 5000 VUs over 10 minutes                            │
│     • Hold until system degrades                                     │
│     • Identify bottlenecks                                           │
│                                                                      │
│  4. Spike Test (Sudden Traffic)                                      │
│     • Instant ramp to 2000 VUs                                       │
│     • Hold for 5 minutes                                             │
│     • Instant ramp down                                              │
│     • Tests auto-scaling response                                    │
│                                                                      │
│  5. Endurance Test (Sustained Load)                                  │
│     • 500 VUs                                                        │
│     • Duration: 4 hours                                              │
│     • Checks for memory leaks, resource exhaustion                   │
│                                                                      │
│  Success Criteria:                                                   │
│  • p95 response time < 2 seconds                                     │
│  • p99 response time < 5 seconds                                     │
│  • Error rate < 0.1%                                                 │
│  • No memory leaks or degradation over time                          │
│  • Auto-scaling triggers within 2 minutes                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Appendices

### Appendix A: Technology Justification

| Technology | Justification |
|------------|---------------|
| **Solidity** | Industry standard for EVM smart contracts, extensive tooling and community support |
| **PostgreSQL** | ACID compliance, excellent Prisma ORM support, robust for financial data |
| **Prisma ORM** | Type-safe database access, excellent migration management, developer productivity |
| **Node.js/Express** | Large ecosystem, excellent async I/O for blockchain operations, team expertise |
| **React/Next.js** | Component reusability, SSR capabilities, excellent developer experience |
| **n8n** | Visual workflow builder, self-hostable, extensive integrations |
| **LangChain** | Standardized AI agent framework, MCP support, flexibility |
| **Redis** | High-performance caching, pub/sub for real-time features |
| **Docker/K8s** | Containerization for consistency, K8s for orchestration at scale |

### Appendix B: Disaster Recovery Runbook

**RTO (Recovery Time Objective)**: 1 hour  
**RPO (Recovery Point Objective)**: 15 minutes

**Disaster Scenarios**:

1. **Database Failure**
   - Switch to read replica (automatic failover)
   - Restore from backup if corruption detected
   - Verify data integrity
   - Resume normal operations

2. **Application Tier Outage**
   - Auto-scaling should replace failed instances
   - Manual intervention if auto-scaling fails
   - Deploy to DR region if primary region down

3. **Smart Contract Vulnerability**
   - Pause contract immediately
   - Assess impact and develop patch
   - Deploy patched contract
   - Migrate state if necessary
   - Communicate with users

4. **Complete Region Failure**
   - Failover to DR region (us-west-2)
   - Update DNS to point to DR region
   - Activate standby infrastructure
   - Restore from cross-region backups

### Appendix C: Glossary

- **AUM**: Assets Under Management
- **EVM**: Ethereum Virtual Machine
- **RBAC**: Role-Based Access Control
- **MCP**: Model Context Protocol
- **RPC**: Remote Procedure Call
- **VU**: Virtual User (in load testing)
- **WAF**: Web Application Firewall
- **SIEM**: Security Information and Event Management
- **P95/P99**: 95th/99th percentile latency
- **Multi-sig**: Multi-signature wallet requiring multiple approvals

---

**Document Version**: 2.0  
**Last Updated**: March 22, 2026  
**Status**: Updated - Aligned with Implementation  
**Next Review Date**: April 15, 2026

---

*This HLD reflects the actual implementation architecture of the AI-Powered Pension Fund Management System, including smart contracts (FundManager.sol), database schema (Prisma), RBAC, monitoring, deployment pipelines, and scalability strategies.*