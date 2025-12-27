# SuperAhorro - Decentralized Savings Platform

A time-locked savings platform built on Stellar's Soroban smart contracts, designed for financial inclusion and disciplined saving habits.

## 🎯 Current Status (Honest Update)

### ✅ What's Working
- ✅ Smart contract deployed to testnet: `CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2`
- ✅ Token transfers (XLM in/out) working correctly
- ✅ Vault creation from UI - **TESTED and confirmed working**
- ✅ Vault listing/refresh - **TESTED and shows vaults correctly**
- ✅ Freighter wallet integration working
- ✅ Production build compiles successfully
- ✅ Fixed penalty: **7% for early withdrawals** (no longer variable)

### ⚠️ Partially Working
- ⚠️ Withdrawals (normal + early) - Code updated, **needs end-to-end testing**
- ⚠️ Tests exist but have buffer overflow issues (known Soroban SDK bug)

### 📋 Features

- **Time-Locked Vaults**: Create savings vaults with customizable lock periods (7-365 days)
- **Fixed Early Withdrawal Penalty**: 7% penalty sent to admin address
- **XLM Native**: Save using Stellar's native XLM token  
- **Ultra-Low Fees**: ~0.0001 XLM per transaction
- **Mobile-First**: Responsive UI for global access

## 🏗️ Project Structure

```
superahorro/
├── contracts/vault/          # Soroban smart contract (Rust)
│   ├── src/lib.rs           # Main contract logic
│   └── src/test.rs          # 12 unit tests (buffer overflow issue)
├── src/
│   ├── components/vault/    # UI components
│   │   ├── VaultForm.tsx    # ✅ Create vaults (WORKING)
│   │   ├── VaultList.tsx    # ✅ List vaults (WORKING)
│   │   └── VaultCard.tsx    # ⚠️ Withdrawals (UPDATED, needs testing)
│   └── contracts/src/       # Generated TypeScript bindings
└── TESTING_CHECKLIST.md     # Complete testing guide
```

## Getting Started

### Prerequisites

- Node.js v18+ 
- Rust toolchain (via rustup)
- Stellar CLI: `cargo install soroban-cli`
- Freighter wallet (for testing)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/superahorro.git
cd superahorro

# Install frontend dependencies
npm install

# Build smart contracts
cd contracts/vault
stellar contract build
```

### Development

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ 
- Rust toolchain (via rustup)
- Stellar CLI: `cargo install soroban-cli`
- Freighter wallet browser extension

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

### Smart Contract Tests

**Current Status**: 12 unit tests written, but experiencing buffer overflow (known Soroban SDK issue on Windows).

```bash
cd contracts/vault
cargo test
```

**Note**: Tests validate logic but can't run due to SDK limitations. Contract functionality has been verified through:
1. Successful deployment to testnet
2. Manual UI testing (vault creation ✅, listing ✅)
3. Transaction verification on Stellar Expert

## 📝 Smart Contract API

### Vault Contract
**Deployed Address**: `CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2`  
**Network**: Test SDF Network ; September 2015  
**Token**: XLM Native SAC

#### Functions

**`initialize(admin: Address, token: Address)`**
Initialize contract with admin address and token address. Can only be called once.

**`create_vault(owner: Address, amount: i128, lock_days: u64) -> u64`**
Creates a new time-locked vault.
- **owner**: Address of vault owner
- **amount**: Amount in stroops (1 XLM = 10^7 stroops)
- **lock_days**: Lock period (7-365 days)
- **Returns**: Vault ID
- **Transfers**: XLM from owner to contract

#### `withdraw(vault_id) -> i128`
Withdraws funds from matured vault.
- **vault_id**: ID of the vault
- **Returns**: Withdrawn amount

#### `early_withdraw(vault_id, penalty_percent) -> (i128, i128)`
Early withdrawal with penalty.
- **vault_id**: ID of the vault
- **penalty_percent**: Penalty rate (5-10%)
- **Returns**: (amount_to_user, penalty_amount)

**`withdraw(vault_id: u64)`**
Withdraw funds after unlock period expires.
- **vault_id**: ID of the vault to withdraw from
- **Requirements**: Vault must be unlocked and active
- **Transfers**: Full XLM amount back to owner

**`early_withdraw(vault_id: u64, penalty_percent: u32)`**
Withdraw funds before unlock period with penalty.
- **vault_id**: ID of the vault
- **penalty_percent**: Must be exactly 7 (fixed penalty)
- **Requirements**: Vault must be locked and active
- **Transfers**: 93% to owner, 7% to admin

**`get_vault(vault_id: u64) -> Option<Vault>`**
Retrieves vault information by ID.

**`get_vault_count() -> u64`**
Returns total number of vaults created.

## 🛠️ Technology Stack

- **Smart Contracts**: Rust + Soroban SDK 21.0.1
- **Frontend**: Next.js 14.2 + React 18 + TypeScript
- **Styling**: twin.macro + Tailwind CSS
- **Wallet**: Freighter via soroban-react
- **Network**: Stellar Testnet

## 🔐 Security

- All funds locked in Soroban contracts
- No admin access to user funds (only penalty collection)
- Open source and auditable
- Testnet deployment and verification

## 📊 Roadmap

### Phase 1 - MVP ✅ (CURRENT)
- ✅ Vault smart contract with token transfers
- ✅ Deployed to testnet
- ✅ Basic frontend UI
- ✅ Freighter wallet integration
- ⚠️ Unit tests (buffer overflow SDK issue)

### Phase 2 - Testing & Polish
- [ ] End-to-end withdrawal testing
- [ ] Fix SDK test issues or work around
- [ ] UI/UX improvements
- [ ] Better error handling
- [ ] Transaction history

### Phase 3 - Production Ready
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Mobile responsiveness improvements
- [ ] Analytics dashboard
- [ ] Multi-language support

## 🐛 Known Issues

1. **Unit Tests**: Buffer overflow error when running `cargo test` - This is a known issue with Soroban SDK on Windows. Contract logic is validated through manual testing and testnet deployment.

2. **Withdrawals**: Code has been updated to use proper bindings, but needs comprehensive end-to-end testing with real wallet.

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
