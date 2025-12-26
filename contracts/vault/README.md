# Vault Smart Contract - SuperAhorro

Time-locked savings vault smart contract for SuperAhorro, built with Soroban SDK.

## Description

This contract allows users to create time-locked savings vaults. Funds remain locked until the unlock date, with penalties for early withdrawals.

## Main Functions

### `create_vault(owner: Address, amount: i128, lock_duration_days: u64) -> u64`
Creates a new time-locked vault.
- **owner**: Owner's address
- **amount**: Amount in stroops (1 USDC = 10^7 stroops)
- **lock_duration_days**: Lock duration (7-365 days)
- **Returns**: Created vault ID

### `withdraw(vault_id: u64) -> i128`
Withdraws funds from a vault that has reached its unlock date.
- **vault_id**: Vault ID
- **Returns**: Withdrawn amount

### `early_withdraw(vault_id: u64, penalty_percent: u64) -> (i128, i128)`
Early withdrawal with penalty.
- **vault_id**: Vault ID
- **penalty_percent**: Penalty percentage (5-10%)
- **Returns**: (amount_to_user, penalty_amount)

### `get_vault(vault_id: u64) -> Option<Vault>`
Retrieves vault information.

### `get_vault_count() -> u64`
Returns the total number of vaults created.

## Testing

### Prerequisites
```bash
# Install Rust and Soroban CLI
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install stellar-cli --version 23.4.0
```

### Build the Contract
```bash
cd contracts/vault
stellar contract build
```

This generates the WASM file at: `target/wasm32v1-none/release/vault.wasm`

### Run Tests

**All tests:**
```bash
cargo test
```

**Specific test:**
```bash
cargo test test_01_create_vault_basic_success
cargo test test_07_withdraw_after_unlock_time
cargo test test_20_early_withdraw_calculation_precision
```

**Tests with detailed output:**
```bash
cargo test -- --nocapture
```

**Tests ignoring known failures (Windows):**
```bash
# On Windows, some tests with #[should_panic] may fail
# Run individual positive test cases:
cargo test test_01
cargo test test_07
cargo test test_20
```

### Available Test Suite

#### Creation Tests
- `test_01_create_vault_basic_success` - Basic successful creation
- `test_02_create_multiple_vaults_different_amounts` - Multiple vaults per user
- `test_25_vault_with_minimum_lock_duration` - Minimum limit 7 days
- `test_26_vault_with_maximum_lock_duration` - Maximum limit 365 days

#### Normal Withdrawal Tests
- `test_07_withdraw_after_unlock_time` - Withdrawal after unlock
- `test_18_vault_timing_exact_unlock` - Withdrawal at exact timestamp
- `test_30_vault_timing_after_unlock` - Withdrawal after unlock period

#### Early Withdrawal Tests
- `test_10_early_withdraw_with_five_percent_penalty` - Early withdrawal
- `test_20_early_withdraw_calculation_precision` - Calculation precision
- `test_25_minimum_penalty_boundary` - Minimum penalty 5%
- `test_26_maximum_penalty_boundary` - Maximum penalty 10%

#### Scale Tests
- `test_27_large_amount_vault` - Vault with 1M USDC
- `test_28_small_amount_vault` - Vault with 1 USDC

### Windows Testing Note

Some tests with `#[should_panic]` may fail on Windows due to a known stack buffer issue. If you encounter `STATUS_STACK_BUFFER_OVERRUN` errors, run individual positive test cases.

## Deploy to Testnet

### 1. Generate Identity
```bash
stellar config identity generate deployer
```

### 2. Get Address
```bash
stellar config identity address deployer
```

### 3. Fund Account (Testnet)
Visit: https://friendbot.stellar.org/?addr=YOUR_ADDRESS

### 4. Deploy
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/vault.wasm \
  --source deployer \
  --network testnet
```

### 5. Invoke Functions
```bash
# Create vault (example)
stellar contract invoke \
  --id CONTRACT_ID \
  --source deployer \
  --network testnet \
  -- create_vault \
  --owner DEPLOYER_ADDRESS \
  --amount 10000000 \
  --lock_duration_days 30
```

## Code Structure

```
vault/
├── src/
│   ├── lib.rs          # Main contract
│   └── test.rs         # Test suite (30+ tests)
├── Cargo.toml          # Dependencies
└── README.md           # This documentation
```

## Technical Details

- **SDK**: soroban-sdk 21.0.1-preview.3
- **Target**: wasm32v1-none
- **Storage**: Persistent storage for vaults
- **Authentication**: `require_auth()` for sensitive operations
- **Timestamps**: Ledger timestamps for time-locks

## Resources

- [Soroban Documentation](https://soroban.stellar.org/)
- [Stellar CLI Reference](https://developers.stellar.org/docs/tools/developer-tools)
- [SuperAhorro Main Repo](https://github.com/elitelephant/superahorro)

## Contributing

To add new tests:
1. Add your test function in `src/test.rs`
2. Follow the existing pattern with `#[test]`
3. Run `cargo test` to verify
4. Commit with descriptive message

---

**Tip**: Check [TESTING.md](../../TESTING.md) in the main repository for the complete testing strategy.
