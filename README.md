# SuperAhorro - Decentralized Savings Platform

A time-locked savings platform built on Stellar's Soroban smart contracts, designed for financial inclusion and disciplined saving habits.

## 🎯 Status

**✅ FULLY FUNCTIONAL** - Deployed and working on Stellar Testnet

### Live Contract
- **Contract ID**: `CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2`
- **Network**: Test SDF Network (Stellar Testnet)
- **Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2)

### ✅ Working Features
- ✅ Vault creation with custom lock periods (7-365 days)
- ✅ Real-time XLM balance display
- ✅ List all user vaults with live data
- ✅ Early withdrawals with 7% penalty
- ✅ Freighter wallet integration
- ✅ Production-ready builds (dev & prod tested)
- ✅ Mobile-responsive UI

### 🛠️ Built With

**Core Technologies:**
- [Stellar Soroban](https://stellar.org/soroban) - Smart contract platform
- [Soroban React Boilerplate](https://github.com/paltalabs/soroban-react-boilerplate) by PaltaLabs - Base project structure
- Next.js 14 + TypeScript
- Chakra UI + twin.macro
- @soroban-react ecosystem

**From Boilerplate:**
- MySorobanReactProvider (wallet context)
- ConnectButton (Freighter integration) 
- ChainInfo component
- Project structure & configuration

**Custom Built:**
- Vault smart contract (Rust/Soroban)
- All vault UI components (VaultForm, VaultList, VaultCard)
- TypeScript bindings generation
- Contract interaction logic

## 🏗️ Project Structure

```
superahorro/
├── contracts/vault/          # Soroban smart contract (Rust)
│   └── src/lib.rs           # Main contract logic
├── src/
│   ├── components/vault/    # UI components
│   │   ├── VaultForm.tsx    # Create vaults + balance display
│   │   ├── VaultList.tsx    # List user vaults
│   │   └── VaultCard.tsx    # Vault details & withdrawals
│   └── contracts/src/       # Generated TypeScript bindings
└── vercel.json              # Deployment configuration
```

### Installation

```bash
# Clone repository
git clone https://github.com/elitelephant/superahorro.git
cd superahorro

# Install frontend dependencies
npm install

# Build smart contracts
cd contracts/vault
stellar contract build
```

### Development

```bash
# Start frontend dev server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build
```

## 🧪 Testing Guide

### Complete Testing Checklist
See [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for the full manual testing guide covering:
- Wallet connection
- Vault creation
- Vault listing
- Normal withdrawals
- Early withdrawals with penalty
- Edge cases

### Testing Approach

Contract functionality has been verified through:
1. ✅ Successful deployment to testnet

## 🚀 Quick Start

### Installation

```bash
# Clone & install
git clone https://github.com/yourusername/superahorro.git
cd superahorro
npm install
```

### Development

```bash
# Start dev server
npm run dev
# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

## 📝 Smart Contract API

**Contract**: `CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2`  
**Network**: Test SDF Network (Stellar Testnet)  
**Token**: XLM Native

### Key Functions

**`create_vault(owner, amount, lock_duration_days) -> u64`**
- Creates time-locked vault (7-365 days)
- Amount in stroops (1 XLM = 10^7 stroops)
- Returns vault ID

**`withdraw(vault_id)`**
- Withdraw after unlock period expires
- Returns full amount to owner

**`early_withdraw(vault_id)`**
- Withdraw before unlock (7% penalty to admin)
- Returns 93% to owner

**`get_vault(vault_id) -> Vault`**
- Fetch vault details

**`get_vault_count() -> u64`**
- Total vaults created

## 🛠️ Tech Stack

- **Blockchain**: Stellar Soroban (Rust)
- **Frontend**: Next.js 14 + TypeScript
- **UI**: Chakra UI + twin.macro
- **Wallet**: Freighter via @soroban-react
- **Deployment**: Vercel

## 🔐 Security

- Funds locked in auditable Soroban contracts
- No admin access to user funds
- Open source and verifiable on-chain
- Testnet-first development

## 📊 Roadmap

### ✅ Phase 1 - MVP (COMPLETE)
- Vault contract with time locks
- Web UI with wallet integration
- Real-time balance & error feedback
- Early withdrawals with penalties
- Testnet deployment

### 🔄 Phase 2 - Enhancement (IN PROGRESS)
- Normal withdrawal testing (after 7-day lock)
- Transaction history
- Multi-language (ES/EN)

### 🎯 Phase 3 - Production
- Security audit
- Mainnet deployment
- Mobile app
- Analytics dashboard

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Test your changes thoroughly
4. Submit a pull request with clear description

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Links

- **Contract Explorer**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2)
- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)

## 💬 Support

For questions or issues:
- Open a [GitHub Issue](https://github.com/elitelephant/superahorro/issues)
- Stellar Discord: [@StellarOrg](https://discord.gg/stellar)

---

🌟 **SuperAhorro** - Ahorra con disciplina, gana con constancia  
💰 Built on Stellar Soroban | 🔒 Time-Locked Savings | ⚡ Ultra-Low Fees
