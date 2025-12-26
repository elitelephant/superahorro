# SuperAhorro - Decentralized Savings Platform

A time-locked savings platform built on Stellar's Soroban smart contracts, designed for financial inclusion and disciplined saving habits.

## 🌟 Features

- **Time-Locked Vaults**: Create savings vaults with customizable lock periods (7-365 days)
- **Early Withdrawal Penalties**: 5-10% penalty redirected to community rewards pool
- **Social Penalty Pool**: Disciplined savers earn rewards from early withdrawals
- **USDC Native**: Stable savings using Circle's USDC on Stellar
- **Ultra-Low Fees**: ~0.0001 XLM per transaction
- **Mobile-First**: Responsive UI for global access

## 📦 Project Structure

```
superahorro/
├── contracts/           # Soroban smart contracts (Rust)
│   └── vault/          # Time-locked vault contract
├── src/                # Next.js frontend
│   ├── components/     # React components
│   ├── pages/          # App routes
│   └── utils/          # Helper functions
├── public/             # Static assets
└── TESTING.md          # Testing strategy
```

## 🚀 Getting Started

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

```bash
# Start frontend dev server
npm run dev

# Run contract tests
cd contracts/vault
cargo test

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32v1-none/release/vault.wasm \
  --source my-account \
  --network testnet
```

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts/vault
cargo test test_create_vault_success
cargo test test_withdraw_success
cargo test test_early_withdraw_calculation_precision
```

### Frontend Tests
```bash
npm test
```

See [TESTING.md](TESTING.md) for complete testing strategy.

## 📝 Smart Contract API

### Vault Contract

#### `create_vault(owner, amount, lock_duration_days) -> u64`
Creates a new time-locked vault.
- **owner**: Address of vault owner
- **amount**: Amount in USDC stroops (1 USDC = 10^7 stroops)
- **lock_duration_days**: Lock period (7-365 days)
- **Returns**: Vault ID

#### `withdraw(vault_id) -> i128`
Withdraws funds from matured vault.
- **vault_id**: ID of the vault
- **Returns**: Withdrawn amount

#### `early_withdraw(vault_id, penalty_percent) -> (i128, i128)`
Early withdrawal with penalty.
- **vault_id**: ID of the vault
- **penalty_percent**: Penalty rate (5-10%)
- **Returns**: (amount_to_user, penalty_amount)

#### `get_vault(vault_id) -> Option<Vault>`
Retrieves vault information.

#### `get_vault_count() -> u64`
Returns total number of vaults created.

## 🛠️ Technology Stack

- **Smart Contracts**: Rust + Soroban SDK
- **Frontend**: Next.js 14 + React 18
- **Styling**: Tailwind CSS + Chakra UI
- **Wallet**: Freighter integration
- **Network**: Stellar Testnet/Mainnet

## 🔐 Security

- All funds locked in Soroban contracts
- No admin keys or backdoors
- Open source and auditable
- Testnet deployment for validation

## 📊 Roadmap

### Phase 1 - MVP (Current)
- [x] Vault smart contract
- [x] Unit tests
- [ ] Testnet deployment
- [ ] Basic frontend UI
- [ ] Freighter wallet integration

### Phase 2 - Community Features
- [ ] Penalty Pool contract
- [ ] Reward distribution
- [ ] Social savings circles
- [ ] Multi-language support

### Phase 3 - Production
- [ ] Security audit
- [ ] Mainnet deployment
- [ ] Mobile app
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Links

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Smart Contracts](https://soroban.stellar.org/)

## 💬 Contact

For questions or support:
- GitHub Issues
- Stellar Discord: [@StellarOrg](https://discord.gg/stellar)

---

🌟 SuperAhorro - Ahorra con disciplina, gana con constancia
