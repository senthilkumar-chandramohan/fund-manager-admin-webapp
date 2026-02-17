# Investment Batch Job Configuration

## Overview
The investment batch job is an automated process that runs daily to identify pension funds with excess funds and create investment proposals using LLM-powered recommendations.

## How It Works

1. **Scheduled Execution**: Runs daily at a configured time (default: 2:00 AM)
2. **Fund Analysis**: Iterates through all active pension funds
3. **Balance Check**: Queries Sepolia blockchain to get current token balance
4. **Excess Calculation**: Compares balance with reserve amount
5. **LLM Query**: If excess funds exist, queries LLM API for investment opportunities
6. **Proposal Creation**: Inserts investment proposals into the database

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Investment Batch Job Schedule (Cron format)
INVESTMENT_JOB_SCHEDULE = "0 2 * * *"  # Daily at 2:00 AM

# Timezone for scheduler
SCHEDULER_TIMEZONE = "America/New_York"

# Sepolia RPC URL for balance checks
SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"

# LLM API endpoint
LLM_API_URL = "http://localhost:6000/contracts"
```

### Cron Schedule Format

The `INVESTMENT_JOB_SCHEDULE` uses standard cron format:
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
- `0 2 * * *` - Daily at 2:00 AM
- `0 0 * * *` - Daily at midnight
- `0 */6 * * *` - Every 6 hours
- `0 12 * * *` - Daily at noon
- `0 8 * * 1` - Every Monday at 8:00 AM

## LLM API Contract

### Request Format
```http
GET http://localhost:6000/contracts?risk={riskAppetite}&stablecoin={stablecoin}&duration={investmentDuration}
```

**Parameters:**
- `risk`: LOW | MEDIUM | HIGH
- `stablecoin`: PYUSD | USDC | USDT
- `duration`: short_term | medium_term | long_term

### Expected Response Format
```json
[
  {
    "aiScore": "85",
    "expectedROI": "12.5",
    "riskLevel": "MEDIUM",
    "description": "Investment opportunity details..."
  },
  {
    "aiScore": "78",
    "expectedROI": "9.2",
    "riskLevel": "LOW",
    "description": "Another investment opportunity..."
  }
]
```

**Required Fields:**
- `aiScore`: String, 0-100
- `expectedROI`: String, percentage value
- `riskLevel`: String, LOW | MEDIUM | HIGH
- `description`: String (optional), details about the investment

## Manual Execution

### Via API Endpoint
```http
POST http://localhost:5000/api/admin/jobs/investment-batch
```

This endpoint allows manual triggering of the batch job for testing purposes.

**Response:**
```json
{
  "success": true,
  "message": "Investment batch job completed successfully",
  "data": {
    "success": true,
    "processed": 5,
    "proposalsCreated": 12
  }
}
```

### Via Server Console
You can also trigger the job programmatically:
```javascript
const InvestmentScheduler = require('./src/jobs/investmentScheduler');
const scheduler = new InvestmentScheduler();
await scheduler.runNow();
```

## Database Requirements

### Required Columns in `pension_funds` table:
- `reserveAmount` (String): Minimum balance to maintain
- `stablecoin` (String): PYUSD | USDC | USDT
- `riskAppetite` (String): LOW | MEDIUM | HIGH
- `investmentDuration` (String): short_term | medium_term | long_term
- `contractAddress` (String): Smart contract address on Sepolia
- `maturity` (DateTime): Fund maturity date

### InvestmentProposal Table Structure:
```prisma
model InvestmentProposal {
  id              String   @id @default(cuid())
  fundId          String
  aiScore         String   // 0-100
  expectedROI     String   // Percentage
  riskLevel       String   // LOW, MEDIUM, HIGH
  status          String   @default("Pending")
  createdAt       DateTime @default(now())
}
```

## Monitoring & Logs

The batch job provides detailed console logging:

```
========================================
Investment Batch Job Started at 2024-02-15T02:00:00.000Z
========================================
Found 5 active pension funds to process

Processing Fund: Employee Retirement Fund (cuid123)
  Current Balance: 100000.00 PYUSD
  Reserve Amount: 20000.00 PYUSD
  Excess Funds Available: 80000.00 PYUSD
  Querying LLM API for investment opportunities...
  Parameters: Risk=MEDIUM, Stablecoin=PYUSD, Duration=long_term
  Found 3 investment opportunity(ies) from LLM
  ✓ Created proposal prop123 (Score: 85, ROI: 12.5%)
  ✓ Created proposal prop124 (Score: 78, ROI: 9.2%)
  ✓ Created proposal prop125 (Score: 72, ROI: 8.8%)
✓ Created 3 investment proposal(s) for Employee Retirement Fund

========================================
Investment Batch Job Completed
Processed: 5/5 funds
Total Proposals Created: 12
========================================
```

## Error Handling

The batch job handles various error scenarios:

1. **Missing Configuration**: Skips funds without reserveAmount or stablecoin
2. **Unknown Stablecoin**: Logs warning and skips the fund
3. **Blockchain RPC Errors**: Logs error and continues with next fund
4. **LLM API Unavailable**: Logs error and continues processing
5. **Database Errors**: Logs individual proposal creation failures

## Stablecoin Addresses (Sepolia)

The service uses these hardcoded addresses:
- **PYUSD**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`
- **USDC**: `0xf08a50178dfcde18524640ea6618a1f965821715`
- **USDT**: `0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0`

## Security Considerations

1. **Read-Only Operations**: The batch job only reads blockchain data and creates database records
2. **No Private Keys**: Does not require or handle private keys
3. **API Authentication**: Consider adding authentication to the manual trigger endpoint
4. **Rate Limiting**: Consider rate limiting the LLM API calls
5. **Timeout**: LLM API requests have a 30-second timeout

## Troubleshooting

### Scheduler Not Starting
- Check if `INVESTMENT_JOB_SCHEDULE` is a valid cron expression
- Verify timezone setting in `SCHEDULER_TIMEZONE`
- Check server logs for startup errors

### No Proposals Created
- Verify funds have `reserveAmount` and `stablecoin` configured
- Check if fund balances exceed reserve amounts
- Ensure LLM API is running at configured URL
- Check LLM API response format

### Balance Check Failures
- Verify `SEPOLIA_RPC_URL` is correct and accessible
- Check Infura API key is valid
- Ensure contract addresses are valid

## Next Steps

1. **Set up LLM API**: Ensure the LLM service is running at `http://localhost:6000/contracts`
2. **Run Migration**: Apply schema changes with `npx prisma migrate dev`
3. **Test Manually**: Use the API endpoint to test the batch job
4. **Monitor Logs**: Watch the first scheduled run to ensure proper execution
5. **Adjust Schedule**: Modify `INVESTMENT_JOB_SCHEDULE` as needed
