# SuperAhorro - Decentralized Savings Platform

A time-locked savings platform built on Stellar's Soroban smart contracts, designed for financial inclusion and disciplined saving habits.

## Features

- **Time-Locked Vaults**: Create savings vaults with customizable lock periods (7-365 days)
- **Early Withdrawal Penalties**: 5-10% penalty redirected to community rewards pool
- **Social Penalty Pool**: Disciplined savers earn rewards from early withdrawals
- **XLM Native**: Save using Stellar's native XLM token
- **Ultra-Low Fees**: ~0.0001 XLM per transaction
- **Mobile-First**: Responsive UI for global access

## Project Structure

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

## Testing

### Smart Contract Tests

The project includes **30 organized tests** covering all Vault contract functionalities.

**List all tests:**
```bash
cd contracts/vault
cargo test --lib -- --list
```

**Test categories:**
- **test_01-02**: Vault creation
- **test_03-06**: Invalid input validation
- **test_07-09**: Normal withdrawals
- **test_10-14**: Early withdrawals with penalties
- **test_15-17**: Queries and utilities
- **test_18-20**: Timing and precision
- **test_21-22**: State changes
- **test_23-26**: Boundaries and limits
- **test_27-30**: Scalability

**Ejecutar tests individuales:**
```bash
# Test específico por nombre completo
cargo test test_01_create_vault_basic_success

# Todos los tests de una categoría (por prefijo)
cargo test test_01  # Solo test 01
cargo test test_1   # Tests 10-19
cargo test test_2   # Tests 20-29
```

**Tests con nombres descriptivos:**
- `test_01_create_vault_basic_success` - Creación básica
- `test_02_create_multiple_vaults_different_amounts` - Múltiples bóvedas
- `test_07_withdraw_after_unlock_period` - Retiro normal
- `test_10_early_withdraw_with_5_percent_penalty` - Retiro anticipado 5%
- `test_20_early_withdraw_calculation_precision` - Precisión de cálculos
- `test_27_large_amount_vault` - Bóveda con 1M USDC

**⚠️ Importante para Windows**: 
Los tests con `#[should_panic]` (validación de errores) pueden fallar con `STATUS_STACK_BUFFER_OVERRUN` en Windows. Esto es un issue conocido del SDK de Soroban. 

**Solución**: Ejecuta solo tests positivos (test_01, test_02, test_07, test_10, test_11, test_16, test_17, test_18, test_19, test_20, test_21, test_22, test_23, test_24, test_25, test_26, test_27, test_28, test_29, test_30).

### Frontend Tests
```bash
npm test
```

### Documentación Completa
- [TESTING.md](TESTING.md) - Estrategia completa de testing
- [contracts/vault/README.md](contracts/vault/README.md) - Guía detallada del contrato Vault

## Smart Contract API

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

## Roadmap

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
