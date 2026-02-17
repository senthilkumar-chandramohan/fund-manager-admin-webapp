import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
import axios from 'axios';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';

const prisma = new PrismaClient();

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)'
];

// Configuration
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY';
const CONTRACTS_API_URL = process.env.CONTRACTS_API_URL || 'http://localhost:6000/contracts';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Investment Batch Job Service
 * Runs daily to identify pension funds with excess funds and create investment proposals
 */
class InvestmentBatchJobService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    
    // Initialize OpenAI LLM
    if (!OPENAI_API_KEY) {
      console.warn('⚠ OPENAI_API_KEY not configured. LLM-powered investment analysis will be disabled.');
    }
    this.llm = OPENAI_API_KEY ? new ChatOpenAI({
      openAIApiKey: OPENAI_API_KEY,
      modelName: 'gpt-4',
      temperature: 0.7,
    }) : null;
  }

  /**
   * Main execution function for the batch job
   */
  async execute() {
    console.log('========================================');
    console.log(`Investment Batch Job Started at ${new Date().toISOString()}`);
    console.log('========================================');

    try {
      // Fetch all active pension funds
      const pensionFunds = await this.fetchActivePensionFunds();
      console.log(`Found ${pensionFunds.length} active pension funds to process`);

      let processedCount = 0;
      let proposalsCreated = 0;

      // Process each pension fund
      for (const fund of pensionFunds) {
        try {
          console.log(`\nProcessing Fund: ${fund.name} (${fund.id})`);
          
          const result = await this.processFund(fund);
          processedCount++;
          
          if (result.proposalsCreated > 0) {
            proposalsCreated += result.proposalsCreated;
            console.log(`✓ Created ${result.proposalsCreated} investment proposal(s) for ${fund.name}`);
          } else {
            console.log(`- No excess funds or proposals needed for ${fund.name}`);
          }
        } catch (error) {
          console.error(`✗ Error processing fund ${fund.name}:`, error.message);
        }
      }

      console.log('\n========================================');
      console.log(`Investment Batch Job Completed`);
      console.log(`Processed: ${processedCount}/${pensionFunds.length} funds`);
      console.log(`Total Proposals Created: ${proposalsCreated}`);
      console.log('========================================\n');

      return {
        success: true,
        processed: processedCount,
        proposalsCreated
      };
    } catch (error) {
      console.error('Investment Batch Job Failed:', error);
      throw error;
    }
  }

  /**
   * Fetch all pension funds from database (both active and mature)
   */
  async fetchActivePensionFunds() {
    return await prisma.pensionFund.findMany({
      select: {
        id: true,
        name: true,
        contractAddress: true,
        reserveAmount: true,
        riskAppetite: true,
        investmentDuration: true,
        stablecoin: true
      }
    });
  }

  /**
   * Process a single pension fund
   */
  async processFund(fund) {
    // Validate required fields
    if (!fund.reserveAmount || !fund.stablecoin) {
      console.log(`  ⚠ Skipping fund ${fund.name}: Missing reserveAmount or stablecoin configuration`);
      return { proposalsCreated: 0 };
    }

    // Get stablecoin contract address
    const stablecoinAddress = this.getStablecoinAddress(fund.stablecoin);
    if (!stablecoinAddress) {
      console.log(`  ⚠ Skipping fund ${fund.name}: Unknown stablecoin ${fund.stablecoin}`);
      return { proposalsCreated: 0 };
    }

    // Check balance on Sepolia
    const balance = await this.getTokenBalance(fund.contractAddress, stablecoinAddress);
    console.log(`  Current Balance: ${ethers.formatUnits(balance, 6)} ${fund.stablecoin}`);

    // Parse reserve amount (assuming it's stored as a string in same units)
    const reserveAmount = ethers.parseUnits(fund.reserveAmount, 6);
    console.log(`  Reserve Amount: ${ethers.formatUnits(reserveAmount, 6)} ${fund.stablecoin}`);

    // Calculate excess funds
    const excessFunds = balance - reserveAmount;
    
    if (excessFunds <= 0) {
      console.log(`  No excess funds available for investment`);
      return { proposalsCreated: 0 };
    }

    console.log(`  Excess Funds Available: ${ethers.formatUnits(excessFunds, 6)} ${fund.stablecoin}`);

    // Query contracts API and use LLM to generate investment proposals
    const investments = await this.generateInvestmentProposals(
      fund.riskAppetite,
      fund.stablecoin,
      fund.investmentDuration,
      excessFunds
    );

    if (!investments || investments.length === 0) {
      console.log(`  No investment opportunities generated`);
      return { proposalsCreated: 0 };
    }

    console.log(`  Generated ${investments.length} investment proposal(s) using LLM`);

    // Create investment proposals
    const proposals = await this.createInvestmentProposals(fund.id, investments, excessFunds);

    return { proposalsCreated: proposals.length };
  }

  /**
   * Get token balance from Sepolia blockchain
   */
  async getTokenBalance(fundAddress, tokenAddress) {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await tokenContract.balanceOf(fundAddress);
      return balance;
    } catch (error) {
      console.error(`  Error fetching balance for ${fundAddress}:`, error.message);
      throw error;
    }
  }

  /**
   * Query contracts REST API for available investment contracts
   */
  async queryContractsAPI(riskAppetite, stablecoin, investmentDuration) {
    try {
      console.log(`  Querying Contracts API...`);
      console.log(`  Parameters: Risk=${riskAppetite}, Stablecoin=${stablecoin}`);

      const response = await axios.get(CONTRACTS_API_URL, {
        params: {
          risk: riskAppetite,
          stablecoin: stablecoin
        },
        timeout: 30000 // 30 second timeout
      });

      // Expected response format: array of contract addresses or contract info
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error(`  Contracts API not available at ${CONTRACTS_API_URL}`);
      } else {
        console.error(`  Error querying Contracts API:`, error.message);
      }
      return [];
    }
  }

  /**
   * Generate investment proposals using LLM analysis of contract data
   */
  async generateInvestmentProposals(riskAppetite, stablecoin, investmentDuration, excessFunds) {
    try {
      // Step 1: Get available contracts from REST API
      const contracts = await this.queryContractsAPI(riskAppetite, stablecoin, investmentDuration);
      
      if (!contracts || contracts.length === 0) {
        console.log(`  No contracts available from API`);
        return [];
      }

      console.log(`  Found ${contracts.length} contract(s) from API`);

      // Step 2: Check if LLM is available
      if (!this.llm) {
        console.log(`  LLM not configured, using default proposal generation`);
        return this.generateDefaultProposals(contracts, riskAppetite, excessFunds);
      }

      // Step 3: Use LLM to analyze contracts and generate proposals
      console.log(`  Using LLM to analyze contracts and generate investment proposals...`);
      
      const excessFundsFormatted = ethers.formatUnits(excessFunds, 6);
      
      const prompt = PromptTemplate.fromTemplate(`You are an expert investment analyst for a pension fund management system.

Given the following information:
- Risk Appetite: {riskAppetite}
- Stablecoin: {stablecoin}
- Investment Duration: {investmentDuration}
- Available Excess Funds: {excessFunds} {stablecoin}
- Available Investment Contracts: {contracts}

Analyze each contract and generate investment proposals. For each contract, provide:
1. AI Score (0-100): Confidence score for this investment
2. Expected ROI (%): Projected return on investment percentage
3. Risk Level: LOW, MEDIUM, or HIGH
4. Investment Amount: How much to allocate (total allocations should not exceed available excess funds)

Generate 2-5 investment proposals based on the available contracts and fund parameters.

IMPORTANT: Respond ONLY with a valid JSON array. Each object must have exactly these fields:
- aiScore: string (number 0-100)
- expectedROI: string (decimal percentage)
- riskLevel: string (must be exactly "LOW", "MEDIUM", or "HIGH")
- investmentAmount: string (amount in {stablecoin} units, ensure total doesn't exceed {excessFunds})
- contractAddress: string (from available contracts)
- analysis: string (brief explanation)

Example format:
[
  {{"aiScore": "85", "expectedROI": "12.5", "riskLevel": "MEDIUM", "investmentAmount": "50000.00", "contractAddress": "0x...", "analysis": "Strong fundamentals with moderate risk"}}
]

Respond with JSON array only, no other text.`);

      const formattedPrompt = await prompt.format({
        riskAppetite,
        stablecoin,
        investmentDuration,
        excessFunds: excessFundsFormatted,
        contracts: JSON.stringify(contracts, null, 2)
      });

      const response = await this.llm.invoke(formattedPrompt);
      const content = response.content;

      // Parse LLM response
      let proposals;
      try {
        // Extract JSON from response (in case LLM adds extra text)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          proposals = JSON.parse(jsonMatch[0]);
        } else {
          proposals = JSON.parse(content);
        }
      } catch (parseError) {
        console.error(`  Error parsing LLM response:`, parseError.message);
        console.error(`  Response content:`, content);
        return this.generateDefaultProposals(contracts, riskAppetite, excessFunds);
      }

      // Validate proposals
      if (!Array.isArray(proposals) || proposals.length === 0) {
        console.log(`  LLM did not generate valid proposals, using defaults`);
        return this.generateDefaultProposals(contracts, riskAppetite, excessFunds);
      }

      console.log(`  ✓ LLM generated ${proposals.length} investment proposal(s)`);
      return proposals;

    } catch (error) {
      console.error(`  Error in LLM-powered proposal generation:`, error.message);
      // Fallback to default generation if LLM fails
      const contracts = await this.queryContractsAPI(riskAppetite, stablecoin, investmentDuration);
      return this.generateDefaultProposals(contracts, riskAppetite, excessFunds);
    }
  }

  /**
   * Generate default proposals when LLM is not available
   */
  generateDefaultProposals(contracts, riskAppetite, excessFunds = null) {
    const defaultScores = {
      'LOW': { aiScore: '70', expectedROI: '5.0', riskLevel: 'LOW' },
      'MEDIUM': { aiScore: '75', expectedROI: '8.5', riskLevel: 'MEDIUM' },
      'HIGH': { aiScore: '80', expectedROI: '15.0', riskLevel: 'HIGH' }
    };

    const defaults = defaultScores[riskAppetite] || defaultScores['MEDIUM'];
    const numProposals = Math.min(contracts.length, 3);
    
    // Distribute excess funds equally among proposals if available
    let investmentAmount = null;
    if (excessFunds) {
      const amountPerProposal = excessFunds / BigInt(numProposals);
      investmentAmount = ethers.formatUnits(amountPerProposal, 6);
    }

    return contracts.slice(0, numProposals).map((contract, index) => ({
      aiScore: (parseInt(defaults.aiScore) - index * 2).toString(),
      expectedROI: (parseFloat(defaults.expectedROI) - index * 0.5).toFixed(1),
      riskLevel: defaults.riskLevel,
      investmentAmount: investmentAmount,
      contractAddress: typeof contract === 'string' ? contract : contract.address || contract.contractAddress,
      analysis: 'Default proposal generated without LLM analysis'
    }));
  }

  /**
   * Query LLM API for investment opportunities
   * @deprecated Use generateInvestmentProposals instead
   */
  async queryInvestmentOpportunities(riskAppetite, stablecoin, investmentDuration) {
    try {
      console.log(`  Querying Contracts API for investment opportunities...`);
      console.log(`  Parameters: Risk=${riskAppetite}, Stablecoin=${stablecoin}`);

      const response = await axios.get(CONTRACTS_API_URL, {
        params: {
          risk: riskAppetite,
          stablecoin: stablecoin
        },
        timeout: 30000 // 30 second timeout
      });

      // Expected response format: array of investment opportunities
      // Each opportunity should have: aiScore, expectedROI, riskLevel, description
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.error(`  Contracts API not available at ${CONTRACTS_API_URL}`);
      } else {
        console.error(`  Error querying Contracts API:`, error.message);
      }
      return [];
    }
  }

  /**
   * Create investment proposals in database
   */
  async createInvestmentProposals(fundId, investments, excessFunds) {
    const proposals = [];
    const excessFundsFormatted = ethers.formatUnits(excessFunds, 6);

    for (const investment of investments) {
      try {
        const proposal = await prisma.investmentProposal.create({
          data: {
            fundId: fundId,
            aiScore: investment.aiScore?.toString() || '0',
            expectedROI: investment.expectedROI?.toString() || '0',
            riskLevel: investment.riskLevel || 'MEDIUM',
            investmentAmount: investment.investmentAmount?.toString() || excessFundsFormatted,
            investmentContract: investment.contractAddress || null,
            status: 'Pending'
          }
        });
        proposals.push(proposal);
        console.log(`  ✓ Created proposal ${proposal.id} (Contract: ${proposal.investmentContract || 'N/A'}, Amount: ${proposal.investmentAmount}, Score: ${proposal.aiScore}, ROI: ${proposal.expectedROI}%)`);
      } catch (error) {
        console.error(`  Error creating proposal:`, error.message);
      }
    }

    return proposals;
  }

  /**
   * Get stablecoin contract address by symbol
   */
  getStablecoinAddress(symbol) {
    const STABLECOIN_ADDRESSES = {
      'PYUSD': '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9',
      'USDC': '0xf08a50178dfcde18524640ea6618a1f965821715',
      'USDT': '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'
    };

    return STABLECOIN_ADDRESSES[symbol];
  }
}

export default InvestmentBatchJobService;
