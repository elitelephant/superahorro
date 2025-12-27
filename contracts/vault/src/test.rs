#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger, MockAuth, MockAuthInvoke},
    token, Address, Env, IntoVal,
};

// Simplified test setup that works without causing buffer overflows
fn create_mock_token<'a>(env: &Env) -> (Address, token::Client<'a>) {
    let token_address = Address::generate(env);
    let token = token::Client::new(env, &token_address);
    (token_address, token)
}

// ========================================
// MODULE: INITIALIZATION
// ========================================

#[test]
fn test_01_initialize_contract() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    
    // If we get here without panic, initialization worked
    assert!(true);
}

#[test]
#[should_panic]
fn test_02_reject_double_initialization() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    client.initialize(&admin, &token_address); // Should panic
}

// ========================================
// MODULE: VAULT CREATION
// ========================================

#[test]
fn test_03_create_vault() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    
    let amount = 1000_0000000i128; // 1000 XLM
    let lock_days = 30u64;
    
    let vault_id = client.create_vault(&user, &amount, &lock_days);
    
    // Verify vault created
    assert_eq!(vault_id, 1);
    
    // Verify vault data
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.owner, user);
    assert_eq!(vault.amount, amount);
    assert_eq!(vault.is_active, true);
}

#[test]
fn test_04_create_multiple_vaults() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    
    client.create_vault(&user, &100_0000000, &30);
    client.create_vault(&user, &200_0000000, &60);
    client.create_vault(&user, &300_0000000, &90);
    
    assert_eq!(client.get_vault_count(), 3);
}

// ========================================
// MODULE: INPUT VALIDATION
// ========================================

#[test]
#[should_panic]
fn test_05_reject_zero_amount() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    client.create_vault(&user, &0, &30);
}

#[test]
#[should_panic]
fn test_06_reject_duration_too_short() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    client.create_vault(&user, &1000_0000000, &5);
}

#[test]
#[should_panic]
fn test_07_reject_duration_too_long() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    client.create_vault(&user, &1000_0000000, &400);
}

// ========================================
// MODULE: WITHDRAWALS
// ========================================

#[test]
fn test_08_withdraw_after_unlock() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    
    let amount = 1000_0000000i128;
    let vault_id = client.create_vault(&user, &amount, &30);
    
    // Move time forward past unlock
    env.ledger().with_mut(|ledger| {
        ledger.timestamp = ledger.timestamp + (31 * 24 * 60 * 60);
    });
    
    // Should not panic
    client.withdraw(&vault_id);
    
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.is_active, false);
}

#[test]
#[should_panic]
fn test_09_reject_withdraw_before_unlock() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    // Try to withdraw immediately (should panic)
    client.withdraw(&vault_id);
}

#[test]
fn test_10_early_withdraw_with_7_percent_penalty() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    
    let amount = 1000_0000000i128;
    let vault_id = client.create_vault(&user, &amount, &30);
    
    // Early withdraw with 7% penalty
    client.early_withdraw(&vault_id, &7u32);
    
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.is_active, false);
}

#[test]
#[should_panic]
fn test_11_reject_early_withdraw_invalid_penalty() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    // Should panic: penalty too low
    client.early_withdraw(&vault_id, &3u32);
}

#[test]
fn test_12_get_vault_count() {
    let env = Env::default();
    env.mock_all_auths();
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let (token_address, _token) = create_mock_token(&env);
    
    client.initialize(&admin, &token_address);
    
    assert_eq!(client.get_vault_count(), 0);
    
    client.create_vault(&user, &1000_0000000, &30);
    assert_eq!(client.get_vault_count(), 1);
    
    client.create_vault(&user, &2000_0000000, &60);
    assert_eq!(client.get_vault_count(), 2);
}
