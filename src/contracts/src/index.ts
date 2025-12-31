import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2",
  }
} as const

// Export contract ID for easy access
export const CONTRACT_ID = networks.testnet.contractId


/**
 * Represents a single savings vault
 */
export interface Vault {
  amount: i128;
  created_at: u64;
  is_active: boolean;
  owner: string;
  unlock_time: u64;
}

export interface Client {
  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraws funds from a matured vault
   */
  withdraw: ({vault_id}: {vault_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_vault transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Retrieves vault information
   */
  get_vault: ({vault_id}: {vault_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Vault>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract with the token address (XLM native or USDC)
   * Must be called once before using the contract
   */
  initialize: ({admin, token}: {admin: string, token: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a create_vault transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Creates a new vault for the caller
   * 
   * # Arguments
   * * `owner` - Address of the vault owner
   * * `amount` - Amount to lock (in stroops, 1 XLM/USDC = 10^7 stroops)
   * * `lock_duration_days` - Number of days to lock funds
   * 
   * # Returns
   * Vault ID (unique identifier)
   */
  create_vault: ({owner, amount, lock_duration_days}: {owner: string, amount: i128, lock_duration_days: u64}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a early_withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Early withdrawal with penalty
   * Returns (amount_to_user, penalty_amount)
   */
  early_withdraw: ({vault_id, penalty_percent}: {vault_id: u64, penalty_percent: u32}, options?: MethodOptions) => Promise<AssembledTransaction<readonly [i128, i128]>>

  /**
   * Construct and simulate a get_vault_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total number of vaults created
   */
  get_vault_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

}
export class Client extends ContractClient {
  // Deploy method removed - contract already deployed to testnet
  // Contract ID: CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2
  
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAACFSZXByZXNlbnRzIGEgc2luZ2xlIHNhdmluZ3MgdmF1bHQAAAAAAAAAAAAABVZhdWx0AAAAAAAABQAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAApjcmVhdGVkX2F0AAAAAAAGAAAAAAAAAAlpc19hY3RpdmUAAAAAAAABAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAC3VubG9ja190aW1lAAAAAAY=",
        "AAAAAAAAACRXaXRoZHJhd3MgZnVuZHMgZnJvbSBhIG1hdHVyZWQgdmF1bHQAAAAId2l0aGRyYXcAAAABAAAAAAAAAAh2YXVsdF9pZAAAAAYAAAABAAAACw==",
        "AAAAAAAAABtSZXRyaWV2ZXMgdmF1bHQgaW5mb3JtYXRpb24AAAAACWdldF92YXVsdAAAAAAAAAEAAAAAAAAACHZhdWx0X2lkAAAABgAAAAEAAAPoAAAH0AAAAAVWYXVsdAAAAA==",
        "AAAAAAAAAHFJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIHRoZSB0b2tlbiBhZGRyZXNzIChYTE0gbmF0aXZlIG9yIFVTREMpCk11c3QgYmUgY2FsbGVkIG9uY2UgYmVmb3JlIHVzaW5nIHRoZSBjb250cmFjdAAAAAAAAAppbml0aWFsaXplAAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAABXRva2VuAAAAAAAAEwAAAAA=",
        "AAAAAAAAAPhDcmVhdGVzIGEgbmV3IHZhdWx0IGZvciB0aGUgY2FsbGVyCgojIEFyZ3VtZW50cwoqIGBvd25lcmAgLSBBZGRyZXNzIG9mIHRoZSB2YXVsdCBvd25lcgoqIGBhbW91bnRgIC0gQW1vdW50IHRvIGxvY2sgKGluIHN0cm9vcHMsIDEgWExNL1VTREMgPSAxMF43IHN0cm9vcHMpCiogYGxvY2tfZHVyYXRpb25fZGF5c2AgLSBOdW1iZXIgb2YgZGF5cyB0byBsb2NrIGZ1bmRzCgojIFJldHVybnMKVmF1bHQgSUQgKHVuaXF1ZSBpZGVudGlmaWVyKQAAAAxjcmVhdGVfdmF1bHQAAAADAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAASbG9ja19kdXJhdGlvbl9kYXlzAAAAAAAGAAAAAQAAAAY=",
        "AAAAAAAAAEZFYXJseSB3aXRoZHJhd2FsIHdpdGggcGVuYWx0eQpSZXR1cm5zIChhbW91bnRfdG9fdXNlciwgcGVuYWx0eV9hbW91bnQpAAAAAAAOZWFybHlfd2l0aGRyYXcAAAAAAAIAAAAAAAAACHZhdWx0X2lkAAAABgAAAAAAAAAPcGVuYWx0eV9wZXJjZW50AAAAAAQAAAABAAAD7QAAAAIAAAALAAAACw==",
        "AAAAAAAAACJHZXQgdG90YWwgbnVtYmVyIG9mIHZhdWx0cyBjcmVhdGVkAAAAAAAPZ2V0X3ZhdWx0X2NvdW50AAAAAAAAAAABAAAABg==" ]),
      options
    )
  }
  public readonly fromJSON = {
    withdraw: this.txFromJSON<i128>,
        get_vault: this.txFromJSON<Option<Vault>>,
        initialize: this.txFromJSON<null>,
        create_vault: this.txFromJSON<u64>,
        early_withdraw: this.txFromJSON<readonly [i128, i128]>,
        get_vault_count: this.txFromJSON<u64>
  }
}