#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env};

/// Represents a single savings vault
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Vault {
    pub owner: Address,
    pub amount: i128,
    pub unlock_time: u64,
    pub created_at: u64,
    pub is_active: bool,
}

/// Contract for managing time-locked savings vaults
#[contract]
pub struct VaultContract;

#[contractimpl]
impl VaultContract {
    
    /// Initialize the contract with the token address (XLM native or USDC)
    /// Must be called once before using the contract
    pub fn initialize(env: Env, admin: Address, token: Address) {
        if env.storage().instance().has(&symbol_short!("INIT")) {
            panic!("Already initialized");
        }
        
        admin.require_auth();
        
        env.storage().instance().set(&symbol_short!("TOKEN"), &token);
        env.storage().instance().set(&symbol_short!("ADMIN"), &admin);
        env.storage().instance().set(&symbol_short!("INIT"), &true);
    }
    
    /// Creates a new vault for the caller
    /// 
    /// # Arguments
    /// * `owner` - Address of the vault owner
    /// * `amount` - Amount to lock (in stroops, 1 XLM/USDC = 10^7 stroops)
    /// * `lock_duration_days` - Number of days to lock funds
    /// 
    /// # Returns
    /// Vault ID (unique identifier)
    pub fn create_vault(
        env: Env,
        owner: Address,
        amount: i128,
        lock_duration_days: u64,
    ) -> u64 {
        // Verify owner is calling
        owner.require_auth();
        
        // Validate inputs
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        if lock_duration_days < 7 || lock_duration_days > 365 {
            panic!("Lock duration must be between 7 and 365 days");
        }
        
        // Get token contract
        let token_address: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("TOKEN"))
            .expect("Contract not initialized");
        
        let token = token::Client::new(&env, &token_address);
        
        // Transfer tokens from user to contract
        token.transfer(&owner, &env.current_contract_address(), &amount);
        
        // Calculate unlock time
        let current_time = env.ledger().timestamp();
        let lock_duration_seconds = lock_duration_days * 24 * 60 * 60;
        let unlock_time = current_time + lock_duration_seconds;
        
        // Generate unique vault ID
        let vault_count: u64 = env
            .storage()
            .instance()
            .get(&symbol_short!("COUNT"))
            .unwrap_or(0);
        let vault_id = vault_count + 1;
        
        // Create vault
        let vault = Vault {
            owner: owner.clone(),
            amount,
            unlock_time,
            created_at: current_time,
            is_active: true,
        };
        
        // Store vault
        env.storage().instance().set(&vault_id, &vault);
        env.storage().instance().set(&symbol_short!("COUNT"), &vault_id);
        
        vault_id
    }
    
    /// Retrieves vault information
    pub fn get_vault(env: Env, vault_id: u64) -> Option<Vault> {
        env.storage().instance().get(&vault_id)
    }
    
    /// Withdraws funds from a matured vault
    pub fn withdraw(env: Env, vault_id: u64) -> i128 {
        let mut vault: Vault = env
            .storage()
            .instance()
            .get(&vault_id)
            .expect("Vault not found");
        
        // Verify caller is owner
        vault.owner.require_auth();
        
        // Check if vault is active
        if !vault.is_active {
            panic!("Vault already withdrawn");
        }
        
        // Check if unlock time reached
        let current_time = env.ledger().timestamp();
        if current_time < vault.unlock_time {
            panic!("Vault still locked");
        }
        
        // Get token contract
        let token_address: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("TOKEN"))
            .expect("Contract not initialized");
        
        let token = token::Client::new(&env, &token_address);
        
        // Transfer full amount back to owner
        token.transfer(&env.current_contract_address(), &vault.owner, &vault.amount);
        
        // Mark as inactive
        vault.is_active = false;
        env.storage().instance().set(&vault_id, &vault);
        
        // Return amount (actual transfer would happen in integration with token contract)
        vault.amount
    }
    
    /// Early withdrawal with penalty
    /// Returns (amount_to_user, penalty_amount)
    pub fn early_withdraw(env: Env, vault_id: u64, penalty_percent: u32) -> (i128, i128) {
        let mut vault: Vault = env
            .storage()
            .instance()
            .get(&vault_id)
            .expect("Vault not found");
        
        // Verify caller is owner
        vault.owner.require_auth();
        
        // Check if vault is active
        if !vault.is_active {
            panic!("Vault already withdrawn");
        }
        
        // Validate penalty (5-10%)
        if penalty_percent < 5 || penalty_percent > 10 {
            panic!("Penalty must be between 5 and 10 percent");
        }
        
        // Calculate penalty
        let penalty = (vault.amount * penalty_percent as i128) / 100;
        let amount_to_user = vault.amount - penalty;
        
        // Get token contract
        let token_address: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("TOKEN"))
            .expect("Contract not initialized");
        
        let token = token::Client::new(&env, &token_address);
        
        // Get admin address to receive penalty
        let admin: Address = env
            .storage()
            .instance()
            .get(&symbol_short!("ADMIN"))
            .expect("Contract not initialized");
        
        // Transfer amount minus penalty to user
        token.transfer(&env.current_contract_address(), &vault.owner, &amount_to_user);
        
        // Transfer penalty to admin (in real implementation, would be a pool contract)
        token.transfer(&env.current_contract_address(), &admin, &penalty);
        
        // Mark as inactive
        vault.is_active = false;
        env.storage().instance().set(&vault_id, &vault);
        
        (amount_to_user, penalty)
    }
    
    /// Get total number of vaults created
    pub fn get_vault_count(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&symbol_short!("COUNT"))
            .unwrap_or(0)
    }
}

#[cfg(test)]
mod test;
