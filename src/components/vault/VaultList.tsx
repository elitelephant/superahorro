import { useState, useEffect } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import { VaultCard } from './VaultCard'
import toast from 'react-hot-toast'
import 'twin.macro'
import { Client } from '@/contracts/src/index'
import { Card } from '@chakra-ui/react'

interface Vault {
  id: number
  owner: string
  amount: bigint
  unlockTime: number
  createdAt: number
  isActive: boolean
}

export const VaultList = () => {
  const { address } = useSorobanReact()
  const [vaults, setVaults] = useState<Vault[]>([])
  const [loading, setLoading] = useState(false)

  const loadVaults = async () => {
    if (!address) return

    try {
      setLoading(true)
      
      const client = new Client({
        publicKey: address,
        contractId: 'CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2',
        networkPassphrase: 'Test SDF Network ; September 2015',
        rpcUrl: 'https://soroban-testnet.stellar.org'
      })

      // Get total vault count
      const countTx = await client.get_vault_count()
      const count = Number(countTx.result)

      if (count === 0) {
        setVaults([])
        return
      }

      // Fetch all vaults and filter by owner
      const userVaults: Vault[] = []
      for (let i = 1; i <= count; i++) {
        try {
          const vaultTx = await client.get_vault({ vault_id: BigInt(i) })
          const vaultData = vaultTx.result
          
          if (vaultData && vaultData.owner === address) {
            userVaults.push({
              id: i,
              owner: vaultData.owner,
              amount: vaultData.amount,
              unlockTime: Number(vaultData.unlock_time),
              createdAt: Number(vaultData.created_at),
              isActive: vaultData.is_active
            })
          }
        } catch (err) {
          // Vault doesn't exist or error, skip
          console.log(`Vault ${i} not found or error`)
        }
      }

      setVaults(userVaults)
    } catch (error: any) {
      console.error('Error loading vaults:', error)
      toast.error('Failed to load vaults')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadVaults()
  }, [address])

  return (
    <div tw="w-full max-w-6xl mx-auto">
      <div tw="flex justify-between items-center mb-6">
        <h2 tw="text-3xl font-bold">Your Vaults</h2>
        <button
          onClick={() => void loadVaults()}
          disabled={loading || !address}
          tw="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {!address ? (
        <Card variant="outline" p={8} bgColor="whiteAlpha.100" textAlign="center">
          <p tw="text-gray-400">Connect your wallet to view your vaults</p>
        </Card>
      ) : loading ? (
        <Card variant="outline" p={8} bgColor="whiteAlpha.100" textAlign="center">
          <p tw="text-gray-400">Loading your vaults...</p>
        </Card>
      ) : vaults.length === 0 ? (
        <Card variant="outline" p={8} bgColor="whiteAlpha.100">
          <p tw="text-gray-400 text-center mb-4">No vaults yet</p>
          <p tw="text-sm text-gray-500 text-center">
            Create your first savings vault to get started
          </p>
        </Card>
      ) : (
        <div tw="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vaults.map((vault) => (
            <VaultCard
              key={vault.id}
              vault={vault}
              onUpdate={() => void loadVaults()}
            />
          ))}
        </div>
      )}
    </div>
  )
}
