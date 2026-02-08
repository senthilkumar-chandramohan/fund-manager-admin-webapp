# Getting Started with the New API

## Quick Start

### 1. Install Prisma Dependencies
```bash
cd server
npm install
```

### 2. Setup Database
Make sure your PostgreSQL database is running and update `.env`:
```
DATABASE_URL="postgresql://username:password@localhost:5432/fund_manager"
```

### 3. Create Database Tables
```bash
npx prisma migrate dev --name init
```

### 4. Start Server
```bash
npm run dev
```

Server will be available at `http://localhost:5000`

## Testing the API

### Using cURL

#### 1. Check Health
```bash
curl http://localhost:5000/api/health
```

#### 2. Create a User (in Postgres manually first, or via app signup)
Database should have a user record with ID `user123`

#### 3. Create a Pension Fund (Admin)
```bash
curl -X POST http://localhost:5000/api/admin/pension-funds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Pension Fund",
    "description": "A test pension fund",
    "corpus": "500000",
    "maturity": "2030-12-31",
    "stablecoin": "USDC",
    "riskAppetite": "MEDIUM",
    "contractAddress": "0x9D30A06cdB7e17e9CFe99581d1806c9b538A7b20",
    "contractDeployed": true,
    "creatorId": "user123"
  }'
```

#### 4. List All Pension Funds
```bash
curl http://localhost:5000/api/admin/pension-funds
```

#### 5. Get User Pension Funds
Replace `user123` with actual user ID:
```bash
curl http://localhost:5000/api/user/user123/pension-funds
```

#### 6. Get Fund Details
Replace `fundId` with actual fund ID from create response:
```bash
curl http://localhost:5000/api/user/pension-funds/{fundId}
```

### Using Postman

1. Import the endpoints from API_DOCUMENTATION.md
2. Set environment variables:
   - `baseUrl`: http://localhost:5000
   - `adminId`: admin123
   - `userId`: user123
   - `governorId`: governor123
3. Test each endpoint

## Database Queries with Prisma

### Access Prisma Studio (Visual DB Browser)
```bash
npx prisma studio
```

This opens a web UI at `http://localhost:5555` to browse and manage data

### Using Prisma CLI

#### View all users
```bash
npx prisma query "SELECT * FROM users"
```

#### Reset database (⚠️ Warning: Deletes all data)
```bash
npx prisma migrate reset
```

## Integrating with Frontend

The React frontend (client/) can now call these endpoints:

```javascript
// Get user's pension funds
const response = await fetch('/api/user/user123/pension-funds');
const { data } = await response.json();

// Create emergency withdrawal request
const request = await fetch('/api/user/pension-funds/fund123/emergency-withdrawal', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    amount: '5000',
    reason: 'Medical emergency'
  })
});
const { data } = await request.json();
```

## Debugging

### Enable Prisma Logging
Update `PrismaClient` initialization:
```javascript
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});
```

### Check Database Connections
```bash
# PostgreSQL should be running
psql -U username -d fund_manager

# Or check connection status
npx prisma db pull  # Shows current schema
```

### Common Issues

**Issue**: "P1000 Authentication failed"
- Solution: Check DATABASE_URL in .env is correct

**Issue**: "P2021 Table 'xxx' does not exist"
- Solution: Run `npx prisma migrate dev --name init`

**Issue**: "P3014 Migrate failed"
- Solution: Run `npx prisma migrate resolve --rolled-back init`

## Adding New Features

### 1. Update Database Schema
Edit `prisma/schema.prisma` and add a new model or field

### 2. Create Migration
```bash
npx prisma migrate dev --name descriptive_name
```

### 3. Create Service Class
Add new file in `src/services/` with CRUD methods using Prisma

### 4. Create Route Handler
Add new file in `src/routes/` with Express endpoints

### 5. Register Routes
Update `src/routes/index.js` to include new routes

Example:
```javascript
// In src/routes/index.js
import myNewRoutes from './myNewRoutes.js';

export const registerRoutes = (app) => {
  // ... existing routes
  app.use('/api/mynew', myNewRoutes);
};
```

## Next Steps

1. **Authentication**: Add JWT tokens with middleware
2. **Validation**: Add request body validation (Zod/Yup)
3. **Logging**: Setup Winston/Pino for logging
4. **Smart Contracts**: Integrate Web3.js for blockchain calls
5. **N8N Workflows**: Setup actual n8n automation triggers
6. **Real-time Updates**: Add Socket.io for live notifications
7. **Tests**: Create unit and integration tests
8. **Documentation**: Generate API docs with Swagger/OpenAPI

## Architecture Reminder

```
Frontend (React)
      ↓ HTTP Requests
API Routes (Express)
      ↓
Services (Business Logic)
      ↓
Prisma ORM
      ↓
PostgreSQL Database
```

Each layer is independent and testable.

## Useful Commands

```bash
# Install dependencies
npm install

# Start dev server with auto-reload
npm run dev

# Start production server
npm start

# Run database migrations
npx prisma migrate dev

# Open Prisma Studio (DB browser)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Reset database
npx prisma migrate reset

# View database schema
npx prisma db pull

# Check migration status
npx prisma migrate status
```

## Support

For issues or questions:
1. Check API_DOCUMENTATION.md for endpoint details
2. Review ARCHITECTURE.md for system overview
3. Check Prisma docs: https://www.prisma.io/docs/
4. Check Express docs: https://expressjs.com/
