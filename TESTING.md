# Testing Strategy - SuperAhorro

## Overview
This strategy defines how to test each component of SuperAhorro to ensure quality and security.

## 1. Smart Contract Testing (Rust)

### Unit Tests
**Location**: `contracts/*/src/test.rs`

**What to test**:
- Individual contract functions
- Input validation
- Error handling
- Penalty calculations
- Time-lock logic

**Example for Vault Contract**:
```rust
#[test]
fn test_create_vault() {
    // Setup
    let env = Env::default();
    let contract = VaultContract::new(&env);
    
    // Execute
    let vault_id = contract.create_vault(
        &user_address,
        &1000_i128, // 1000 USDC
        &(env.ledger().timestamp() + 2592000) // 30 days
    );
    
    // Assert
    assert!(vault_id > 0);
}

#[test]
#[should_panic(expected = "Vault locked")]
fn test_early_withdrawal_fails() {
    // Test that withdrawal before unlock fails
}
```

**Useful Commands**:
```bash
# All tests
cd contracts/vault && cargo test

# Specific test
cargo test test_create_vault_success

# Tests with detailed output
cargo test -- --nocapture

# Tests containing a keyword
cargo test withdraw

# Compile without running
cargo test --no-run
```

**Windows Note**: Some tests with `#[should_panic]` may fail due to `STATUS_STACK_BUFFER_OVERRUN`. In that case, run individual tests:
```bash
cargo test test_create_vault_success
cargo test test_withdraw_success
cargo test test_vault_timing_exact_unlock
```

**Current Vault Contract Suite** (30+ tests):
- Vault creation (basic, multiple, limits)
- Normal withdrawals (after unlock)
- Early withdrawals (with 5-10% penalties)
- Precise timing (exact timestamp)
- Scalability (1 USDC to 1M USDC)
- Range validations (7-365 days)

---

### Integration Tests
**Location**: `contracts/*/integration_tests/`

**What to test**:
- Interaction between Vault and Penalty Pool
- Complete flow: create → deposit → early withdraw → penalty applied
- Reward distribution from pool
- Multiple users interacting

**Tools**: Soroban SDK test utilities

---

## 2. Frontend Testing (TypeScript/React)

### Component Tests
**Framework**: Jest + React Testing Library

**What to test**:
- Component rendering
- User interactions (clicks, forms)
- Loading/error states
- Form validation

**Example**:
```typescript
// VaultForm.test.tsx
test('validates USDC amount input', () => {
  render(<VaultForm />);
  const input = screen.getByLabelText(/amount/i);
  
  fireEvent.change(input, { target: { value: '-100' } });
  expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
});
```

**Command**: `npm test`

---

### E2E Tests (End-to-End)
**Framework**: Playwright or Cypress

**What to test**:
- Complete wallet connection
- Create vault from UI → sign transaction → confirmation
- Dashboard displays vaults correctly
- Early withdrawal flow with penalty

**Example flow**:
```typescript
test('create vault e2e', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('text=Connect Wallet');
  // Mock Freighter approval
  await page.fill('[name="amount"]', '500');
  await page.fill('[name="duration"]', '90');
  await page.click('text=Create Vault');
  
  await expect(page.locator('.vault-card')).toBeVisible();
});
```

---

## 3. Contract Deployment Testing

### Testnet Deployment
**Network**: Testnet (Test SDF Network ; September 2015)

**Process**:
1. Deploy contract to Testnet
2. Verify in Stellar Explorer
3. Test functions via CLI:
   ```bash
   stellar contract invoke \
     --id CDWGVPSUXXSGABQ663FVV4TZJH4Q2R3HVAKTKWFFFMWPF23O7KMNS4KU \
     --source my-account \
     --network testnet \
     -- \
     create_vault \
     --owner GABC... \
     --amount 1000 \
     --lock_until 1735000000
   ```

4. Test from dApp on localhost

### Futurenet Testing (Optional)
For experimental features, use Futurenet.

---

## 4. Security Testing

### Audit Checklist
- [ ] Reentrancy attacks - Can it be called recursively?
- [ ] Integer overflow - Are we using checked arithmetic?
- [ ] Authorization - Do we verify ownership correctly?
- [ ] Time manipulation - Does it only depend on on-chain timestamps?
- [ ] Penalty calculation - Can the math be exploited?

### Tools
- `cargo clippy` - Linter for common bugs
- `cargo audit` - Vulnerabilities in dependencies
- Manual code review

---

## 5. Performance Testing

### Gas/Fee Optimization
Measure fees for each operation:
- Create vault: ~0.0001 XLM
- Early withdrawal: ~0.0002 XLM
- Distribute rewards: Does it scale with users?

**Goal**: All operations < 0.001 XLM

---

## 6. User Acceptance Testing (UAT)

### Beta Testers
- 5-10 real users on Testnet
- Feedback on UX, clarity, bugs

### Metrics
- How long does it take to create first vault?
- Do users understand the penalty system?
- Any confusion with Freighter?

---

## Testing Timeline

### MVP Phase:
- **Week 1**: Unit tests for Vault contract
- **Week 2**: Integration tests Vault + Pool
- **Week 3**: Frontend component tests
- **Week 4**: Testnet deployment + manual testing
- **Week 5**: UAT + fixes

### CI/CD (Future):
- GitHub Actions:
  - Run `cargo test` on PRs
  - Run `npm test` on PRs
  - Auto-deploy to Testnet on merge to `develop`

---

## Quick Test Commands

```bash
# Smart Contracts
cd contracts/vault && cargo test
cd contracts/penalty_pool && cargo test

# Frontend
npm test
npm run test:e2e

# Lint & Format
cargo clippy --all-targets
npm run lint

# Build contracts
cd contracts/vault && stellar contract build
```

---

## Notes
- **ALWAYS** test on Testnet before mainnet
- Use Friendbot for free test funds
- Keep tests updated with new features
- Document edge cases in tests
