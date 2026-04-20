# Solana Blinks "Donate Me SOL" - Functional Requirements Document

**Project Title:** Solana Blinks Donate Action Provider (Node.js + TypeScript)  
**Version:** 1.0  
**Date:** April 20, 2026  
**Status:** Production-Ready Specification

---

## 1. Executive Summary

Build a **production-ready Node.js + TypeScript server** that implements a Solana Actions API endpoint enabling one-click "Donate SOL" transactions. This standalone service exposes REST API endpoints following the Solana Actions specification, allowing any Blink-aware client (X.com extension, Phantom, Backpack, custom apps) to construct and execute non-custodial SOL donations.

### 1.1 Key Objectives

✅ Expose REST API following `@solana/actions` specification  
✅ Accept donations from any Blink-aware client  
✅ Construct unsigned transactions using Solana web3.js  
✅ Support mainnet, devnet, and testnet deployments  
✅ Handle wallet signing via client-side wallet adapters  
✅ Production-ready with error handling, logging, monitoring  
✅ Independently deployable to any Node.js hosting

### 1.2 Success Criteria

| Criterion | Definition |
|-----------|-----------|
| **Shareable URL** | Generate a Blink-compatible URL working on X.com and any platform |
| **One-Click Donations** | Users can donate via preset buttons (0.1, 0.5, 1.0 SOL) + custom input |
| **Non-Custodial** | Provider never touches user's private key; wallet handles signing |
| **Standards-Compliant** | Follows `@solana/actions` specification |
| **Transaction Verification** | Users can verify transaction before signing |
| **Fast Performance** | All endpoints respond in <500ms |
| **Multi-Network** | Works on mainnet, devnet, testnet with env config |

---

## 2. Functional Requirements

### 2.1 Core Features (7 Must-Have Requirements)

#### **FR1: CORS Preflight Support**
- **Endpoint:** `OPTIONS /api/actions/donate`
- **Purpose:** Validate Blink client CORS checks
- **Response:** `204 No Content` with CORS headers
- **Header:** `x-blockchain-ids: solana:*`
- **Rationale:** Browser-based clients require CORS validation before fetching action metadata

#### **FR2: Metadata Retrieval**
- **Endpoint:** `GET /api/actions/donate`
- **Purpose:** Return action metadata (UI definition, buttons, descriptions)
- **Response Format:**
  ```json
  {
    "type": "action",
    "icon": "https://blink-provider.com/donate-icon.png",
    "title": "Donate SOL",
    "description": "Support our mission with a SOL donation",
    "links": {
      "actions": [
        { "label": "Donate 0.1 SOL", "href": "/api/actions/donate?amount=0.1" },
        { "label": "Donate 0.5 SOL", "href": "/api/actions/donate?amount=0.5" },
        { "label": "Donate 1.0 SOL", "href": "/api/actions/donate?amount=1.0" },
        { "label": "Custom amount", "href": "/api/actions/donate?amount={amount}",
          "parameters": [{ "name": "amount", "type": "number", "label": "Enter SOL amount" }] }
      ]
    }
  }
  ```
- **Response Time:** <100ms
- **Rationale:** Clients need metadata to render Blink UI before transaction construction

#### **FR3: Transaction Construction**
- **Endpoint:** `POST /api/actions/donate`
- **Query Parameters:** `amount` (SOL amount to donate)
- **Request Body:**
  ```json
  {
    "account": "BZbmhKaFj9YBkFFHgzfJnXYkLVTcFKWXH9Q3q1n1v1K"
  }
  ```
- **Process:**
  1. Validate amount > 0 and < configured max
  2. Validate account is valid Solana public key (base58)
  3. Query RPC for latest blockhash
  4. Create `SystemProgram.transfer` instruction
  5. Build `VersionedTransaction` (V0)
  6. Serialize and encode as base64
- **Response:**
  ```json
  {
    "type": "transaction",
    "transaction": "AgADCr4IsyBJzZT/VbZ0DvXU5CQ0k6HkqQPVECJNKx7Bnr...",
    "message": "Review your donation in your wallet before signing"
  }
  ```
- **Response Time:** <500ms (includes RPC call)
- **Rationale:** Provides unsigned transaction for user's wallet to sign (non-custodial model)

#### **FR4: Configuration Management**
- **Configurable Parameters:**
  - `SOLANA_RPC_URL`: RPC endpoint (mainnet/devnet/testnet)
  - `SOLANA_NETWORK`: Network identifier
  - `DONATION_WALLET`: Recipient wallet address (base58)
  - `MIN_DONATION_AMOUNT`: Minimum SOL (default 0.01)
  - `MAX_DONATION_AMOUNT`: Maximum SOL (default 1000)
  - `PORT`: Server port (default 3000)
  - `HOST`: Server host (default 0.0.0.0)
  - `LOG_LEVEL`: Logging verbosity (debug/info/warn/error)
  - `ENVIRONMENT`: Deployment environment (dev/staging/prod)
- **Mechanism:** Environment variables via `.env` file (12-factor app pattern)
- **Rationale:** Single codebase deployable to multiple networks/environments

#### **FR5: Error Handling**
- **Error Cases Handled:**
  - Invalid amount (negative, zero, exceeds bounds)
  - Invalid public key format
  - RPC connection failure
  - Transaction construction failure
  - Missing required parameters
- **Response Format:**
  ```json
  {
    "error": "Amount exceeds maximum donation",
    "message": "Maximum allowed: 1000 SOL",
    "code": "AMOUNT_EXCEEDS_MAX"
  }
  ```
- **HTTP Status Codes:**
  - `400 Bad Request`: Client error (invalid input)
  - `500 Internal Server Error`: Server error (RPC failure)
  - `502 Bad Gateway`: RPC unavailable
- **Rationale:** Graceful error responses help clients and users debug issues

#### **FR6: Health Check Endpoint**
- **Endpoint:** `GET /health`
- **Purpose:** Deployment monitoring and service verification
- **Response:**
  ```json
  {
    "status": "healthy",
    "rpc": {
      "connected": true,
      "network": "devnet",
      "responseTime": 45
    },
    "timestamp": "2026-04-20T11:30:00.000Z"
  }
  ```
- **HTTP Status Code:** `200 OK` if healthy, `503 Service Unavailable` if RPC down
- **Rationale:** Required for deployment platforms (Vercel, Railway, K8s) to monitor health

#### **FR7: Logging & Observability**
- **Logged Events:**
  - Server startup/shutdown
  - Incoming requests (method, path, account masked)
  - RPC calls (blockhash queries, success/failure)
  - Transaction construction (amount, success/failure)
  - Errors (with full stack trace and context)
- **Log Format:** JSON or structured text with timestamps
- **Logger:** Pino for structured logging
- **Rationale:** Production debugging and monitoring visibility

---

## 3. Non-Functional Requirements

### 3.1 Performance Requirements

| Requirement | Target | Measurement |
|-------------|--------|-------------|
| Metadata retrieval latency | <100ms | p95 response time |
| Transaction construction latency | <500ms | p95 response time (includes RPC) |
| Health check latency | <50ms | p95 response time |
| Error response latency | <100ms | p95 response time |

### 3.2 Availability Requirements

| Requirement | Target | Implementation |
|-------------|--------|-----------------|
| Uptime | 99%+ | Graceful error handling, RPC failover |
| RPC failover | <30s | Retry logic with exponential backoff |
| Graceful degradation | Maintains service | Clear error messages if RPC down |

### 3.3 Security Requirements

| Requirement | Implementation |
|-------------|-----------------|
| CORS validation | Explicit origin headers, not wildcard |
| Input validation | All parameters validated (type, range, format) |
| Key exposure prevention | No private keys in logs or responses |
| Sensitive data masking | Account inputs logged as masked values |
| HTTPS enforcement | Required for production deployments |
| Rate limiting | Optional: prevent abuse (future enhancement) |

### 3.4 Scalability Requirements

| Requirement | Implementation |
|-------------|-----------------|
| Horizontal scaling | Stateless design (no in-memory state) |
| Load balancing | Works behind reverse proxy |
| Connection pooling | RPC connection reuse |
| Stateless design | Each request independent |

### 3.5 Maintainability Requirements

| Requirement | Implementation |
|-------------|-----------------|
| Type safety | TypeScript for compile-time checks |
| Code structure | Clear separation of concerns (routes, services, middleware) |
| Documentation | Inline comments, README, API reference |
| Configuration | Environment-driven (12-factor app) |
| Build process | Automated TypeScript compilation |

---

## 4. System Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────┐
│ User / Blink Client                     │
│ (X.com extension, Phantom, Web App)     │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
FR1: OPTIONS          FR2: GET (metadata)
CORS check            Describe actions
    │                         │
    └────────────┬────────────┘
                 │
   Render Blink UI (buttons)
                 │
    ┌────────────┴────────────┐
    │                         │
User clicks button      Custom amount
    │                         │
    └────────────┬────────────┘
                 │
        FR3: POST (build TX)
        1. Validate amount
        2. Get blockhash
        3. Build transfer
        4. Return unsigned TX
                 │
                 ▼
    Wallet (Phantom/Backpack)
    - Show confirmation
    - User signs
    - Broadcast
                 │
                 ▼
    Solana Blockchain
    - Execute transfer
    - Return confirmation
```

### 4.2 Recommended Folder Structure

```
donate-me-sol-blink/
│
├── src/
│   ├── index.ts                    # Server entry point
│   ├── config.ts                   # Environment config loader
│   ├── logger.ts                   # Pino logger setup
│   ├── types.ts                    # TypeScript interfaces
│   │
│   ├── server/
│   │   └── app.ts                  # Express app setup + middleware
│   │
│   ├── routes/
│   │   ├── health.ts               # GET /health endpoint
│   │   └── actions/
│   │       └── donate.ts           # OPTIONS/GET/POST /api/actions/donate
│   │
│   ├── services/
│   │   ├── solanaService.ts        # RPC, blockhash queries
│   │   ├── transactionService.ts   # Build unsigned TX
│   │   └── validationService.ts    # Input validation
│   │
│   └── middleware/
│       ├── cors.ts                 # CORS header middleware
│       ├── errorHandler.ts         # Error handling
│       └── requestLogger.ts        # Request logging
│
├── dist/                           # Compiled JavaScript (built)
│
├── .env.example                    # Environment variables template
├── .env                            # Actual env (gitignored)
│
├── tsconfig.json                   # TypeScript config
├── package.json                    # Dependencies
│
├── README.md                       # Quick start guide
└── docs/
    ├── API.md                      # API endpoint docs
    ├── ARCHITECTURE.md             # System design
    └── DEPLOYMENT.md               # Deployment guide
```

### 4.3 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | Node.js 18+ | Modern async/await, wide hosting support |
| **Language** | TypeScript | Type safety, better IDE support, fewer bugs |
| **Framework** | Express 4.18+ | Lightweight, minimal overhead, battle-tested |
| **Solana SDK** | @solana/web3.js 1.92+ | Official, comprehensive, well-maintained |
| **Logging** | Pino 8.17+ | Structured JSON logs, high performance |
| **Config** | dotenv 16.4+ | 12-factor app pattern, env-driven config |
| **Build** | TypeScript Compiler | Simple, no additional dependencies |

---

## 5. API Specification

### 5.1 Endpoint Summary

| Endpoint | Method | Purpose | Response Time |
|----------|--------|---------|----------------|
| `/api/actions/donate` | OPTIONS | CORS preflight | <10ms |
| `/api/actions/donate` | GET | Fetch metadata | <100ms |
| `/api/actions/donate` | POST | Build transaction | <500ms |
| `/health` | GET | Health check | <50ms |

### 5.2 Detailed Endpoint Definitions

#### OPTIONS /api/actions/donate

**Request:**
```
OPTIONS /api/actions/donate HTTP/1.1
Origin: https://x.com
Access-Control-Request-Method: POST
```

**Response (204 No Content):**
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS, POST
Access-Control-Allow-Headers: Accept, Content-Type, Content-Length
x-blockchain-ids: solana:*
x-action-version: 2.4
```

#### GET /api/actions/donate

**Response (200 OK):**
```json
{
  "type": "action",
  "icon": "https://example.com/donate.png",
  "title": "Donate SOL",
  "description": "Support our mission with a secure blockchain donation",
  "links": {
    "actions": [
      {
        "type": "transaction",
        "label": "Donate 0.1 SOL ⭐",
        "href": "/api/actions/donate?amount=0.1"
      },
      {
        "type": "transaction",
        "label": "Donate 0.5 SOL",
        "href": "/api/actions/donate?amount=0.5"
      },
      {
        "type": "transaction",
        "label": "Donate 1.0 SOL",
        "href": "/api/actions/donate?amount=1.0"
      },
      {
        "type": "transaction",
        "label": "Donate Custom Amount",
        "href": "/api/actions/donate?amount={amount}",
        "parameters": [
          {
            "name": "amount",
            "label": "Enter SOL amount",
            "type": "number",
            "required": true
          }
        ]
      }
    ]
  }
}
```

#### POST /api/actions/donate

**Request:**
```
POST /api/actions/donate?amount=0.5 HTTP/1.1
Content-Type: application/json

{
  "account": "BZbmhKaFj9YBkFFHgzfJnXYkLVTcFKWXH9Q3q1n1v1K"
}
```

**Response (200 OK):**
```json
{
  "type": "transaction",
  "transaction": "AgADCr4IsyBJzZT/VbZ0DvXU5CQ0k6HkqQPVECJNKx7B...",
  "message": "Review your donation in your wallet"
}
```

**Error Responses:**

Invalid Amount (400):
```json
{
  "error": "Invalid donation amount",
  "message": "Amount must be between 0.01 and 1000 SOL",
  "code": "INVALID_AMOUNT"
}
```

Invalid Account (400):
```json
{
  "error": "Invalid account public key",
  "message": "Account must be a valid Solana public key",
  "code": "INVALID_ACCOUNT"
}
```

RPC Failure (502):
```json
{
  "error": "RPC connection failed",
  "message": "Unable to fetch latest blockhash",
  "code": "RPC_FAILURE"
}
```

#### GET /health

**Response (200 OK):**
```json
{
  "status": "healthy",
  "rpc": {
    "connected": true,
    "network": "devnet",
    "responseTime": 45
  },
  "timestamp": "2026-04-20T11:30:00.000Z"
}
```

---

## 6. Configuration & Environment

### 6.1 Environment Variables (.env)

```env
# ========== Server ==========
PORT=3000
HOST=0.0.0.0
ENVIRONMENT=production

# ========== Solana Blockchain ==========
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_NETWORK=mainnet-beta
DONATION_WALLET=YOUR_SOLANA_WALLET_ADDRESS_HERE

# ========== Donation Limits ==========
MIN_DONATION_AMOUNT=0.01
MAX_DONATION_AMOUNT=1000

# ========== Logging ==========
LOG_LEVEL=info

# ========== Security ==========
ALLOWED_ORIGINS=https://x.com,https://api.blinks.dev
```

### 6.2 Environment Descriptions

| Variable | Purpose | Example |
|----------|---------|---------|
| `SOLANA_RPC_URL` | RPC endpoint for blockchain calls | `https://api.mainnet-beta.solana.com` |
| `SOLANA_NETWORK` | Network identifier | `mainnet-beta` or `devnet` |
| `DONATION_WALLET` | Public key receiving donations | `HS7M3zgnFVucMMM5k1a2sPBPjRndfYNW7Ep6eMueCvX4` |
| `MIN_DONATION_AMOUNT` | Minimum SOL allowed | `0.01` |
| `MAX_DONATION_AMOUNT` | Maximum SOL allowed | `1000` |
| `LOG_LEVEL` | Logging verbosity | `info` or `debug` |

---

## 7. Implementation Phases

### Phase 1: Project Setup
- [ ] Initialize Node.js project with TypeScript
- [ ] Configure tsconfig.json
- [ ] Set up build pipeline
- [ ] Create folder structure
- [ ] Install core dependencies

### Phase 2: Core Server
- [ ] Create Express app with middleware
- [ ] Implement CORS middleware
- [ ] Implement error handler
- [ ] Implement request logger
- [ ] Add graceful shutdown

### Phase 3: Solana Integration
- [ ] Create SolanaService (RPC connections)
- [ ] Implement getLatestBlockhash
- [ ] Implement transaction construction
- [ ] Create ValidationService
- [ ] Add retry logic

### Phase 4: API Routes
- [ ] Implement OPTIONS /api/actions/donate
- [ ] Implement GET /api/actions/donate
- [ ] Implement POST /api/actions/donate
- [ ] Implement GET /health
- [ ] Add error responses

### Phase 5: Configuration & Logging
- [ ] Load .env configuration
- [ ] Set up Pino logger
- [ ] Add different log levels
- [ ] Implement request/response logging

### Phase 6: Documentation
- [ ] API endpoint docs
- [ ] Architecture guide
- [ ] Deployment instructions
- [ ] Environment setup guide

### Phase 7: Deployment Prep
- [ ] Create build script
- [ ] Create deployment checklist
- [ ] Prepare for Vercel/Railway/AWS
- [ ] Create CI/CD pipeline

---

## 8. Success Metrics

| Metric | Target | Verification |
|--------|--------|--------------|
| **API Uptime** | 99%+ | Monitoring dashboard |
| **Response Time (p95)** | <500ms | APM tools / logs |
| **Error Rate** | <1% | Error tracking |
| **RPC Success Rate** | >99% | Application logs |
| **Deploy Time** | <5 minutes | CI/CD timing |

---

## 9. Security Considerations

### 9.1 Security Checklist

- ✅ CORS headers properly configured (not wildcard for POST)
- ✅ All parameters validated (type, range, format)
- ✅ No private keys in code, logs, or responses
- ✅ Account inputs logged as masked values
- ✅ HTTPS enforced in production
- ✅ Donation wallet immutable (env config)
- ✅ RPC URL from trusted source
- ✅ Error messages don't leak internal details

### 9.2 Non-Custodial Guarantee

- Provider **never** receives user's private key
- Provider **never** signs transactions
- User's wallet handles all signing
- Provider only constructs **unsigned** transactions
- Transaction fully verifiable before user approval

---

## 10. Deployment Considerations

### 10.1 Supported Platforms

- ✅ Vercel (Node.js runtime)
- ✅ Railway
- ✅ Render
- ✅ AWS Lambda (with serverless framework)
- ✅ DigitalOcean App Platform
- ✅ Self-hosted (any Linux server)

### 10.2 Deployment Checklist

- [ ] Environment variables configured
- [ ] SOLANA_RPC_URL pointing to correct network
- [ ] DONATION_WALLET set to mainnet address
- [ ] Health check URL configured
- [ ] HTTPS enforced
- [ ] Monitoring/alerting set up
- [ ] Error tracking enabled
- [ ] Log aggregation configured

---

## 11. Future Enhancements (Out of Scope)

- Rate limiting by IP address
- Multi-action provider (swap, stake, etc.)
- Blink Registry integration
- Transaction webhooks
- Advanced transaction composability
- Multi-signature support
- Transaction priority fees

---

## Appendix A: Transaction Construction Flow

```typescript
// 1. Validate inputs
if (amount <= 0 || amount > MAX_AMOUNT) throw Error("Invalid amount");
if (!isValidPublicKey(account)) throw Error("Invalid account");

// 2. Get latest blockhash
const { blockhash } = await connection.getLatestBlockhash();

// 3. Create transfer instruction
const instruction = SystemProgram.transfer({
  fromPubkey: userAccount,
  toPubkey: donationWallet,
  lamports: amount * LAMPORTS_PER_SOL
});

// 4. Build versioned transaction
const message = new TransactionMessage({
  payerKey: userAccount,
  recentBlockhash: blockhash,
  instructions: [instruction]
}).compileToV0Message();

const transaction = new VersionedTransaction(message);

// 5. Serialize and encode
const serialized = transaction.serialize();
const base64 = Buffer.from(serialized).toString('base64');

// 6. Return to client
return { type: "transaction", transaction: base64 };
```

---

## Appendix B: Error Codes Reference

| Code | HTTP | Meaning |
|------|------|---------|
| `INVALID_AMOUNT` | 400 | Amount outside configured bounds |
| `INVALID_ACCOUNT` | 400 | Public key format invalid |
| `RPC_FAILURE` | 502 | Cannot connect to RPC endpoint |
| `TX_BUILD_FAILURE` | 500 | Transaction construction failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Appendix C: References

- [Solana Actions Specification](https://solana.com/docs/core/actions)
- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Dialect Blinks Documentation](https://docs.dialect.to/blinks)
- [Express.js Guide](http://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Pino Logger](https://getpino.io/)

---

**Document Version:** 1.0  
**Last Updated:** April 20, 2026  
**Status:** Ready for Implementation
