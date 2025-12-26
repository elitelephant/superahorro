# Testing Strategy - StellarSavings

## Overview
Esta estrategia define cómo testearemos cada componente de StellarSavings para asegurar calidad y seguridad.

## 1. Smart Contract Testing (Rust)

### Unit Tests
**Ubicación**: `contracts/*/src/test.rs`

**Qué testear**:
- ✅ Funciones individuales del contrato
- ✅ Validación de inputs
- ✅ Manejo de errores
- ✅ Cálculos de penalties
- ✅ Lógica de time-locks

**Ejemplo para Vault Contract**:
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
    // Test que no se puede retirar antes del unlock
}
```

**Comando**: `cd contracts/vault && cargo test`

---

### Integration Tests
**Ubicación**: `contracts/*/integration_tests/`

**Qué testear**:
- ✅ Interacción entre Vault y Penalty Pool
- ✅ Flow completo: create → deposit → early withdraw → penalty aplicado
- ✅ Distribución de rewards del pool
- ✅ Múltiples usuarios interactuando

**Tools**: Soroban SDK test utilities

---

## 2. Frontend Testing (TypeScript/React)

### Component Tests
**Framework**: Jest + React Testing Library

**Qué testear**:
- ✅ Renderizado de componentes
- ✅ Interacciones del usuario (clicks, forms)
- ✅ Estados de loading/error
- ✅ Validación de formularios

**Ejemplo**:
```typescript
// VaultForm.test.tsx
test('validates USDC amount input', () => {
  render(<VaultForm />);
  const input = screen.getByLabelText(/amount/i);
  
  fireEvent.change(input, { target: { value: '-100' } });
  expect(screen.getByText(/must be positive/i)).toBeInTheDocument();
});
```

**Comando**: `npm test`

---

### E2E Tests (End-to-End)
**Framework**: Playwright o Cypress

**Qué testear**:
- ✅ Conexión de wallet completa
- ✅ Crear vault desde UI → firma transacción → confirmación
- ✅ Dashboard muestra vaults correctamente
- ✅ Flow de early withdrawal con penalty

**Ejemplo flow**:
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
**Red**: Testnet (Test SDF Network ; September 2015)

**Proceso**:
1. Deploy contract a Testnet
2. Verificar en Stellar Explorer
3. Probar funciones vía CLI:
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

4. Probar desde dApp en localhost

### Futurenet Testing (Opcional)
Para features experimentales usar Futurenet.

---

## 4. Security Testing

### Audit Checklist
- [ ] Reentrancy attacks - ¿puede llamarse recursivamente?
- [ ] Integer overflow - ¿usamos checked arithmetic?
- [ ] Authorization - ¿verificamos ownership correctamente?
- [ ] Time manipulation - ¿depende solo de timestamps on-chain?
- [ ] Penalty calculation - ¿puede explotarse matemática?

### Tools
- `cargo clippy` - Linter para bugs comunes
- `cargo audit` - Vulnerabilidades en deps
- Manual code review

---

## 5. Performance Testing

### Gas/Fee Optimization
Medir fees de cada operación:
- Create vault: ~0.0001 XLM
- Early withdrawal: ~0.0002 XLM
- Distribute rewards: ¿Escala con usuarios?

**Objetivo**: Todas las ops < 0.001 XLM

---

## 6. User Acceptance Testing (UAT)

### Beta Testers
- 5-10 usuarios reales en Testnet
- Feedback sobre UX, clarity, bugs

### Metrics
- ¿Cuánto tiempo toma crear primer vault?
- ¿Usuarios entienden el penalty system?
- ¿Confusión con Freighter?

---

## Testing Timeline

### Fase MVP:
- **Week 1**: Unit tests para Vault contract
- **Week 2**: Integration tests Vault + Pool
- **Week 3**: Frontend component tests
- **Week 4**: Testnet deployment + manual testing
- **Week 5**: UAT + fixes

### CI/CD (Future):
- GitHub Actions:
  - Run `cargo test` en PRs
  - Run `npm test` en PRs
  - Deploy automático a Testnet en merge a `develop`

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
- **SIEMPRE** testear en Testnet antes de mainnet
- Usar Friendbot para fondos de test gratis
- Mantener tests actualizados con features nuevas
- Documentar casos edge en tests
