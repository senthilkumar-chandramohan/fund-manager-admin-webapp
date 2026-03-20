# Pension Release Batch Job Configuration

## Overview
The pension release batch job is an automated process that runs daily to identify matured pension funds that are due for periodic pension releases based on their configured release intervals. The job handles inflation adjustments and automatically liquidates investments if necessary to ensure sufficient funds for pension payouts.

## How It Works

1. **Scheduled Execution**: Runs daily at a configured time (default: 4:00 AM)
2. **Fund Analysis**: Iterates through all pension funds in the database
3. **Maturity Check**: Identifies funds that have passed their maturity date
4. **Release Interval Check**: Determines if a fund is due for release based on:
   - `releaseInterval` (WEEKLY, FORTNIGHTLY, MONTHLY, QUARTERLY)
   - `lastReleasedDate` (when pension was last released)
   - Current date
5. **Inflation Coefficient Calculation**: Fetches current inflation data from external API
6. **Fund Balance Verification**: Checks the blockchain balance of the fund
7. **Investment Liquidation** (if needed): 
   - Evaluates if fund balance is sufficient for pension release
   - Liquidates riskier investments first (based on `InvestmentProposal.riskLevel`)
   - Updates investment status to 'DIVESTED'
8. **Pension Release Execution**: Calls the `releaseRegularPension()` function on the fund's smart contract
9. **Database Update**: Updates `lastReleasedDate` in the database

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Pension Release Job Schedule (Cron format)
PENSION_RELEASE_JOB_SCHEDULE = "0 4 * * *"  # Daily at 4:00 AM

# Timezone for scheduler
SCHEDULER_TIMEZONE = "America/New_York"

# Sepolia RPC URL for blockchain interactions
SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"

# System wallet private key (for executing transactions)
SYSTEM_WALLET_PRIVATE_KEY = "0x..."
```

### Cron Schedule Format

The `PENSION_RELEASE_JOB_SCHEDULE` uses standard cron format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 and 7 are Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

**Common Examples:**
- `0 4 * * *` - Daily at 4:00 AM
- `0 0 * * *` - Daily at midnight
- `0 12 * * *` - Daily at noon
- `0 8 * * 1` - Every Monday at 8:00 AM
- `0 0 1 * *` - First day of every month at midnight

## Release Interval Logic

The job determines if a pension is due for release based on the `releaseInterval` field:

| Release Interval | Days Required | Example |
|-----------------|---------------|---------|
| WEEKLY | 7 days | If last released on Jan 1, next release on Jan 8 |
| FORTNIGHTLY | 14 days | If last released on Jan 1, next release on Jan 15 |
| MONTHLY | 30 days | If last released on Jan 1, next release on Jan 31 |
| QUARTERLY | 90 days | If last released on Jan 1, next release on Apr 1 |

## Inflation Coefficient

The inflation coefficient is fetched from the StatBureau API:
- **API Endpoint**: `http://www.statbureau.org/calculate-inflation-price-jsonp`
- **Calculation**: Based on fund creation date and current date
- **Format**: Returns JSONP response (e.g., `processInflation(123.45)`)
- **Conversion**: Value represents inflated amount as percentage
  - API returns: 123.45 = $100 is now worth $123.45
  - Coefficient passed: 123 (rounded integer percentage)
- **Smart Contract Formula**: `finalAmount = releaseAmount * coefficient / 100`
  - Example: releaseAmount = 1000, coefficient = 123 → finalAmount = 1230
  - 100 = 1.0x multiplier (no change)
  - 110 = 1.1x multiplier (10% increase)
  - 123 = 1.23x multiplier (23% increase)
- **Fallback**: If API fails, defaults to 100 (100% = 1.0x multiplier, no change)

**Note**: Your smart contract should divide the result by 100 in the formula above.

## Investment Liquidation Strategy

When fund balance is insufficient for pension release:

1. **Risk Assessment**: Investments are sorted by risk level (HIGH → MEDIUM → LOW)
2. **Priority Liquidation**: Highest-risk investments are liquidated first
3. **Cross-Reference**: Risk level is obtained from the `InvestmentProposal` table
4. **Blockchain Execution**: Calls `withdrawInvestment(investmentContractAddress)` on the fund contract
5. **Database Update**: Investment status is updated to 'DIVESTED'
6. **Threshold**: Currently liquidates when fund balance < 1000 (configurable)

## API Endpoints

### Manual Execution
Trigger the pension release job manually via API:

**Endpoint**: `GET /api/admin/jobs/pension-release`

**Response**:
```json
{
  "success": true,
  "message": "Pension release job completed successfully",
  "data": {
    "success": true,
    "processed": 5,
    "successful": 4,
    "failed": 1
  }
}
```

## Database Schema Requirements

### PensionFund Table
Required fields:
- `maturity` (DateTime): Fund maturity date
- `releaseInterval` (ReleaseInterval enum): WEEKLY, FORTNIGHTLY, MONTHLY, QUARTERLY
- `lastReleasedDate` (DateTime, nullable): Last pension release date
- `contractAddress` (String): Blockchain contract address
- `createdAt` (DateTime): Fund creation date

### Investment Table
Required fields:
- `fundId` (String): Foreign key to PensionFund
- `status` (String): INVESTED or DIVESTED
- `investmentContract` (String): Investment contract address
- `investmentAmount` (String): Amount invested
- `proposalId` (String, nullable): Link to InvestmentProposal

### InvestmentProposal Table
Required fields:
- `riskLevel` (String): LOW, MEDIUM, or HIGH
- `id` (String): Proposal identifier

## Smart Contract Requirements

The pension fund smart contract must implement:

```solidity
function releaseRegularPension(uint256 _inflationCoefficient) external;
function withdrawInvestment(address investmentContractAddress) external;
function token() view returns (address);
```

## Logging and Monitoring

The job provides detailed console logging:

```
========================================
Pension Release Job Started at 2026-03-13T04:00:00.000Z
========================================
Found 3 pension fund(s) due for release

Processing Fund: Employee Pension Fund (abc123)
  Contract Address: 0x...
  Maturity: 2025-12-31T00:00:00.000Z
  Release Interval: MONTHLY
  Last Released: 2026-02-13T04:00:00.000Z
  Fetching inflation data from: http://...
  Raw Inflation Value: 123.45
  Inflation Coefficient: 123 (1.23x multiplier)
  Fund Balance: 25000.00
  Executing releaseRegularPension with coefficient: 123
  Transaction submitted: 0x...
  Waiting for confirmation...
  Transaction confirmed in block: 12345
✓ Successfully released pension for fund abc123
  Transaction Hash: 0x...

========================================
Pension Release Job Completed
Processed: 3/3 funds
Successful: 3
Failed: 0
========================================
```

## Error Handling

The job handles various error scenarios:
- **Missing System Wallet**: Logs warning; transactions will fail
- **API Failures**: Uses default inflation coefficient of 1.0
- **Blockchain Errors**: Logs error; marks release as failed
- **Database Errors**: Logs error; continues with next fund
- **Low Fund Balance**: Automatically attempts to liquidate investments

## Testing

### Manual Trigger
Test the job without waiting for scheduled execution:

```bash
curl http://localhost:5000/api/admin/jobs/pension-release
```

### Verify Scheduler
Check server logs on startup:

```
========================================
Pension Release Scheduler Started
Schedule: 0 4 * * * (Daily at 4:00 AM)
========================================

Pension release scheduler is now active
```

## Architecture

### Files Created
1. **Service**: `src/services/PensionReleaseService.js`
   - Core business logic
   - Inflation calculation
   - Investment liquidation
   - Blockchain interaction

2. **Scheduler**: `src/jobs/pensionReleaseScheduler.js`
   - Cron job configuration
   - Schedule management
   - Manual execution support

3. **API Route**: `src/routes/admin.js`
   - `/api/admin/jobs/pension-release` endpoint
   - On-demand execution

4. **Server Integration**: `index.js`
   - Scheduler initialization
   - Graceful shutdown handling

## Best Practices

1. **Scheduling**: Set the job to run after investment divestment job (default: 4:00 AM vs 3:00 AM)
2. **Monitoring**: Regularly review job logs for failures
3. **Testing**: Use manual API endpoint before relying on scheduled execution
4. **Wallet Security**: Keep `SYSTEM_WALLET_PRIVATE_KEY` secure and never commit to version control
5. **Balance Thresholds**: Adjust liquidation threshold based on typical pension amounts
6. **Timezone**: Ensure `SCHEDULER_TIMEZONE` matches your operational timezone

## Troubleshooting

### Job Not Running
1. Check server logs for initialization errors
2. Verify cron expression with online validators
3. Ensure `SYSTEM_WALLET_PRIVATE_KEY` is configured

### Inflation API Failures
- Job will use default coefficient (1.0)
- Consider implementing local inflation data cache

### Investment Liquidation Issues
1. Verify investment contracts have sufficient balance
2. Check that `investmentContract` field is populated
3. Ensure system wallet has necessary permissions

### Database Updates Failing
- Verify Prisma client is properly configured
- Check database connection
- Review Prisma migration status

## Future Enhancements

Potential improvements:
1. **Dynamic Thresholds**: Calculate required pension amount before checking balance
2. **Partial Liquidation**: Liquidate only enough to cover pension release
3. **Notification System**: Alert admins when liquidation occurs
4. **Retry Logic**: Implement exponential backoff for failed releases
5. **Inflation Cache**: Store historical inflation data locally
6. **Multi-Currency Support**: Handle different stablecoins
7. **Gas Optimization**: Batch multiple pension releases in one transaction
