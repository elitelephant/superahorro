import { useEffect, useState } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import { VaultCard } from './VaultCard'
import 'twin.macro'
import * as StellarSdk from '@stellar/stellar-sdk'

interface Vault {
  id: number
  owner: string
  amount: bigint
  unlockTime: number
  createdAt: number
  isActive: boolean
}

export const VaultList = () => {
  const { address, server } = useSorobanReact()
  const [vaults, setVaults] = useState<Vault[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVaults = async () => {
    if (!address || !server) return

    try {
      setIsLoading(true)
      setError(null)

      // This is a placeholder - actual implementation will query the contract
      // For now, we'll show instructions for when contract is deployed
      
      // const contractAddress = 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      // const contract = new StellarSdk.Contract(contractAddress)
      
      // 1. Get vault count
      // 2. Query each vault
      // 3. Filter vaults owned by connected address
      // 4. Update state

      // Placeholder: Show empty state
      setVaults([])
    } catch (err: any) {
      console.error('Error loading vaults:', err)
      setError(err?.message || 'Failed to load vaults')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVaults()
  }, [address, server])

  if (!address) {
    return (
      <div tw="bg-gray-800 rounded-lg p-6 text-center max-w-2xl w-full">
        <p tw="text-gray-400">Connect your wallet to view your vaults</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div tw="bg-gray-800 rounded-lg p-6 text-center max-w-2xl w-full">
        <div tw="animate-pulse">
          <div tw="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-4"></div>
          <div tw="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div tw="bg-gray-800 rounded-lg p-6 text-center max-w-2xl w-full">
        <p tw="text-red-400 mb-2">Error loading vaults</p>
        <p tw="text-sm text-gray-400">{error}</p>
        <button
          onClick={loadVaults}
          tw="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div tw="w-full max-w-2xl">
      <div tw="flex justify-between items-center mb-4">
        <h2 tw="text-2xl font-bold">Your Vaults</h2>
        <button
          onClick={loadVaults}
          tw="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Refresh
        </button>
      </div>

      {vaults.length === 0 ? (
        <div tw="bg-gray-800 rounded-lg p-8 text-center">
          <p tw="text-gray-400 mb-2">No vaults yet</p>
          <p tw="text-sm text-gray-500">
            Create your first savings vault to get started
          </p>
          <div tw="mt-4 p-4 bg-gray-700 rounded-lg text-left">
            <p tw="text-xs text-gray-400 mb-2">Note: Contract integration pending</p>
            <p tw="text-xs text-gray-500">
              Once the Vault contract is deployed to testnet, this section will display
              your active vaults with real-time data.
            </p>
          </div>
        </div>
      ) : (
        <div tw="grid gap-4 md:grid-cols-2">
          {vaults.map((vault) => (
            <VaultCard key={vault.id} vault={vault} onUpdate={loadVaults} />
          ))}
        </div>
      )}
    </div>
  )
}
