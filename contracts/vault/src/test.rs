#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Ledger}, Address, Env};

fn create_test_env() -> (Env, Address, VaultContractClient<'static>) {
    let env = Env::default();
    env.mock_all_auths(); // Mock authentication for testing
    
    let contract_id = env.register_contract(None, VaultContract);
    let client = VaultContractClient::new(&env, &contract_id);
    
    let user = Address::generate(&env);
    
    (env, user, client)
}

// ========================================
// MODULE: VAULT CREATION
// Basic creation and validation tests
// ========================================

#[test]
fn test_01_create_vault_basic_success() {
    let (env, user, client) = create_test_env();
    
    let amount = 1_000_0000000; // 1000 USDC (with 7 decimals)
    let lock_days = 30u64;
    
    let vault_id = client.create_vault(&user, &amount, &lock_days);
    
    assert_eq!(vault_id, 1);
    
    // Verify vault was created correctly
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.owner, user);
    assert_eq!(vault.amount, amount);
    assert_eq!(vault.is_active, true);
    
    // Check unlock time (30 days = 2,592,000 seconds)
    let expected_unlock = env.ledger().timestamp() + (30 * 24 * 60 * 60);
    assert_eq!(vault.unlock_time, expected_unlock);
}

#[test]
fn test_02_create_multiple_vaults_different_amounts() {
    let (env, user, client) = create_test_env();
    
    let vault_id_1 = client.create_vault(&user, &500_0000000, &30);
    let vault_id_2 = client.create_vault(&user, &1000_0000000, &60);
    let vault_id_3 = client.create_vault(&user, &2000_0000000, &90);
    
    assert_eq!(vault_id_1, 1);
    assert_eq!(vault_id_2, 2);
    assert_eq!(vault_id_3, 3);
    assert_eq!(client.get_vault_count(), 3);
}

// ========================================
// MODULE: INPUT VALIDATION
// Tests for rejection of invalid parameters
// ========================================

#[test]
#[should_panic(expected = "Amount must be positive")]
fn test_03_reject_zero_amount() {
    let (_env, user, client) = create_test_env();
    client.create_vault(&user, &0, &30);
}

#[test]
#[should_panic(expected = "Amount must be positive")]
fn test_04_reject_negative_amount() {
    let (_env, user, client) = create_test_env();
    client.create_vault(&user, &-100, &30);
}

#[test]
#[should_panic(expected = "Lock duration must be between 7 and 365 days")]
fn test_05_reject_duration_below_minimum() {
    let (_env, user, client) = create_test_env();
    client.create_vault(&user, &1000_0000000, &5); // Less than 7 days
}

#[test]
#[should_panic(expected = "Lock duration must be between 7 and 365 days")]
fn test_06_reject_duration_above_maximum() {
    let (_env, user, client) = create_test_env();
    client.create_vault(&user, &1000_0000000, &400); // More than 365 days
}

// ========================================
// MODULE: NORMAL WITHDRAWALS
// Tests for withdrawal after unlock period
// ========================================

#[test]
fn test_07_withdraw_after_unlock_period() {
    let (env, user, client) = create_test_env();
    
    let amount = 1000_0000000;
    let vault_id = client.create_vault(&user, &amount, &30);
    
    // Fast-forward time to after unlock
    env.ledger().with_mut(|li| {
        li.timestamp = li.timestamp + (31 * 24 * 60 * 60); // 31 days later
    });
    
    let withdrawn_amount = client.withdraw(&vault_id);
    assert_eq!(withdrawn_amount, amount);
    
    // Verify vault is now inactive
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.is_active, false);
}

#[test]
#[should_panic(expected = "Vault still locked")]
fn test_08_withdraw_before_unlock() {
    let (env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    // Try to withdraw immediately
    client.withdraw(&vault_id);
}

#[test]
#[should_panic(expected = "Vault already withdrawn")]
fn test_09_withdraw_twice() {
    let (env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    // Fast-forward time
    env.ledger().with_mut(|li| {
        li.timestamp = li.timestamp + (31 * 24 * 60 * 60);
    });
    
    client.withdraw(&vault_id); // First withdrawal OK
    client.withdraw(&vault_id); // Second should panic
}

// ========================================
// MODULE: EARLY WITHDRAWALS
// Tests for early withdrawal with penalties
// ========================================

#[test]
fn test_10_early_withdraw_with_5_percent_penalty() {
    let (_env, user, client) = create_test_env();
    
    let amount = 1000_0000000; // 1000 USDC
    let vault_id = client.create_vault(&user, &amount, &30);
    
    let penalty_percent = 5u32;
    let (amount_to_user, penalty) = client.early_withdraw(&vault_id, &penalty_percent);
    
    // 5% penalty = 50 USDC
    assert_eq!(penalty, 50_0000000);
    assert_eq!(amount_to_user, 950_0000000); // 950 USDC
    
    // Verify vault is inactive
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.is_active, false);
}

#[test]
fn test_11_early_withdraw_with_10_percent_penalty() {
    let (_env, user, client) = create_test_env();
    
    let amount = 2000_0000000; // 2000 USDC
    let vault_id = client.create_vault(&user, &amount, &90);
    
    let penalty_percent = 10u32;
    let (amount_to_user, penalty) = client.early_withdraw(&vault_id, &penalty_percent);
    
    // 10% penalty = 200 USDC
    assert_eq!(penalty, 200_0000000);
    assert_eq!(amount_to_user, 1800_0000000); // 1800 USDC
}

#[test]
#[should_panic(expected = "Penalty must be between 5 and 10 percent")]
fn test_12_early_withdraw_penalty_too_low() {
    let (_env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    client.early_withdraw(&vault_id, &3); // 3% is too low
}

#[test]
#[should_panic(expected = "Penalty must be between 5 and 10 percent")]
fn test_13_early_withdraw_penalty_too_high() {
    let (_env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    client.early_withdraw(&vault_id, &15); // 15% is too high
}

#[test]
#[should_panic(expected = "Vault already withdrawn")]
fn test_14_early_withdraw_twice() {
    let (_env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    client.early_withdraw(&vault_id, &5); // First withdrawal OK
    client.early_withdraw(&vault_id, &5); // Second should panic
}

// ========================================
// MODULE: QUERIES AND UTILITIES
// Tests for data retrieval and utility functions
// ========================================

#[test]
#[should_panic(expected = "Vault not found")]
fn test_15_get_nonexistent_vault() {
    let (_env, _user, client) = create_test_env();
    
    client.get_vault(&999).unwrap(); // Vault doesn't exist
}

#[test]
fn test_16_get_vault_count_empty() {
    let (_env, _user, client) = create_test_env();
    
    let count = client.get_vault_count();
    assert_eq!(count, 0);
}

#[test]
fn test_17_multiple_users() {
    let (env, user1, client) = create_test_env();
    let user2 = Address::generate(&env);
    
    // User 1 creates vaults
    let vault1 = client.create_vault(&user1, &1000_0000000, &30);
    let vault2 = client.create_vault(&user1, &500_0000000, &60);
    
    // User 2 creates vault
    let vault3 = client.create_vault(&user2, &2000_0000000, &90);
    
    // Verify ownership
    assert_eq!(client.get_vault(&vault1).unwrap().owner, user1);
    assert_eq!(client.get_vault(&vault2).unwrap().owner, user1);
    assert_eq!(client.get_vault(&vault3).unwrap().owner, user2);
}

// ========================================
// MODULE: TIMING AND PRECISION
// Tests for time calculations and numeric precision
// ========================================

#[test]
fn test_18_vault_timing_exact_unlock() {
    let (env, user, client) = create_test_env();
    
    let amount = 1000_0000000;
    let vault_id = client.create_vault(&user, &amount, &30);
    
    // Fast-forward to EXACTLY unlock time (not before, not after)
    let vault = client.get_vault(&vault_id).unwrap();
    env.ledger().with_mut(|li| {
        li.timestamp = vault.unlock_time;
    });
    
    // Should be able to withdraw at exact unlock time
    let withdrawn = client.withdraw(&vault_id);
    assert_eq!(withdrawn, amount);
}

#[test]
fn test_19_vault_created_at_timestamp() {
    let (env, user, client) = create_test_env();
    
    let start_time = env.ledger().timestamp();
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.created_at, start_time);
}

#[test]
fn test_20_early_withdraw_calculation_precision() {
    let (_env, user, client) = create_test_env();
    
    // Test with odd amount to verify precision
    let amount = 1337_0000000; // 1337 USDC
    let vault_id = client.create_vault(&user, &amount, &30);
    
    let penalty_percent = 7u32;
    let (amount_to_user, penalty) = client.early_withdraw(&vault_id, &penalty_percent);
    
    // 7% of 1337 = 93.59 USDC = 93_5900000 stroops
    assert_eq!(penalty, 93_5900000);
    assert_eq!(amount_to_user, 1243_4100000); // 1243.41 USDC (1337 - 93.59)
    assert_eq!(amount_to_user + penalty, amount); // Total should equal original
}

// ========================================
// MODULE: STATE CHANGES
// Tests for vault state transitions
// ========================================

#[test]
fn test_21_withdraw_changes_vault_state() {
    let (env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    // Verify vault is active before withdrawal
    let vault_before = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault_before.is_active, true);
    
    // Fast-forward and withdraw
    env.ledger().with_mut(|li| {
        li.timestamp = li.timestamp + (31 * 24 * 60 * 60);
    });
    client.withdraw(&vault_id);
    
    // Verify vault is now inactive
    let vault_after = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault_after.is_active, false);
    assert_eq!(vault_after.amount, vault_before.amount); // Amount unchanged
    assert_eq!(vault_after.owner, vault_before.owner); // Owner unchanged
}

#[test]
fn test_22_early_withdraw_changes_vault_state() {
    let (_env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    // Verify active before
    assert_eq!(client.get_vault(&vault_id).unwrap().is_active, true);
    
    // Early withdraw
    client.early_withdraw(&vault_id, &5);
    
    // Verify inactive after
    assert_eq!(client.get_vault(&vault_id).unwrap().is_active, false);
}

// ========================================
// MODULE: BOUNDARIES AND LIMITS
// Tests for edge cases and boundary conditions
// ========================================

#[test]
fn test_23_minimum_lock_duration_boundary() {
    let (_env, user, client) = create_test_env();
    
    // 7 days is minimum - should work
    let vault_id = client.create_vault(&user, &1000_0000000, &7);
    assert_eq!(vault_id, 1);
}

#[test]
fn test_24_maximum_lock_duration_boundary() {
    let (_env, user, client) = create_test_env();
    
    // 365 days is maximum - should work
    let vault_id = client.create_vault(&user, &1000_0000000, &365);
    assert_eq!(vault_id, 1);
}

#[test]
fn test_25_minimum_penalty_boundary() {
    let (_env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    // 5% is minimum penalty - should work
    let (amount_to_user, penalty) = client.early_withdraw(&vault_id, &5);
    assert_eq!(penalty, 50_0000000); // 5% of 1000
    assert_eq!(amount_to_user, 950_0000000);
}

#[test]
fn test_26_maximum_penalty_boundary() {
    let (_env, user, client) = create_test_env();
    
    let vault_id = client.create_vault(&user, &1000_0000000, &30);
    
    // 10% is maximum penalty - should work
    let (amount_to_user, penalty) = client.early_withdraw(&vault_id, &10);
    assert_eq!(penalty, 100_0000000); // 10% of 1000
    assert_eq!(amount_to_user, 900_0000000);
}

// ========================================
// MODULE: SCALABILITY
// Tests for large amounts and multiple operations
// ========================================

#[test]
fn test_27_large_amount_vault() {
    let (env, user, client) = create_test_env();
    
    // Test with large amount (1 million USDC)
    let large_amount = 1_000_000_0000000i128;
    let vault_id = client.create_vault(&user, &large_amount, &90);
    
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.amount, large_amount);
    
    // Test early withdrawal with large amount
    let (amount_to_user, penalty) = client.early_withdraw(&vault_id, &5);
    assert_eq!(penalty, 50_000_0000000); // 5% = 50,000 USDC
    assert_eq!(amount_to_user, 950_000_0000000); // 950,000 USDC
}

#[test]
fn test_28_small_amount_vault() {
    let (_env, user, client) = create_test_env();
    
    // Test with small amount (1 USDC)
    let small_amount = 1_0000000i128;
    let vault_id = client.create_vault(&user, &small_amount, &30);
    
    let vault = client.get_vault(&vault_id).unwrap();
    assert_eq!(vault.amount, small_amount);
}

#[test]
fn test_29_sequential_vault_ids() {
    let (_env, user, client) = create_test_env();
    
    let id1 = client.create_vault(&user, &100_0000000, &7);
    let id2 = client.create_vault(&user, &200_0000000, &14);
    let id3 = client.create_vault(&user, &300_0000000, &21);
    let id4 = client.create_vault(&user, &400_0000000, &28);
    
    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(id3, 3);
    assert_eq!(id4, 4);
}

#[test]
fn test_30_vault_timing_after_unlock() {
    let (env, user, client) = create_test_env();
    
    let amount = 500_0000000;
    let vault_id = client.create_vault(&user, &amount, &30);
    
    // Fast-forward way past unlock (60 days instead of 30)
    env.ledger().with_mut(|li| {
        li.timestamp = li.timestamp + (60 * 24 * 60 * 60);
    });
    
    // Should still be able to withdraw
    let withdrawn = client.withdraw(&vault_id);
    assert_eq!(withdrawn, amount);
}
