import { useState } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import toast from 'react-hot-toast'
import 'twin.macro'
import { Client } from '@/contracts/src/index'
import { rpc } from '@/contracts/src/index'

export const VaultForm = () => {
  const { address, server, connectors } = useSorobanReact()
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState('30')
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateVault = async () => {
    if (!address || !server) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const days = parseInt(lockDays)
    if (days < 7 || days > 365) {
      toast.error('Lock duration must be between 7 and 365 days')
      return
    }

    try {
      setIsLoading(true)
      
      // Convert XLM to stroops (7 decimals)
      const amountInStroops = BigInt(Math.floor(parseFloat(amount) * 10_000_000))
      
      const client = new Client({
        publicKey: address,
        contractId: 'CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2',
        networkPassphrase: 'Test SDF Network ; September 2015',
        rpcUrl: 'https://soroban-testnet.stellar.org'
      })
      
      toast.loading('Preparing transaction...')
      
      // Build transaction using generated client
      const tx = await client.create_vault({
        owner: address,
        amount: amountInStroops,
        lock_duration_days: BigInt(days)
      })
      
      // Get connector to sign
      const connector = connectors?.[0]
      if (!connector) {
        throw new Error('No wallet connector found')
      }
      
      toast.loading('Please sign in Freighter...')
      
      // Sign and send
      const result = await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const signedXdr = await connector.signTransaction(xdr, {
            networkPassphrase: 'Test SDF Network ; September 2015'
          })
          return {
            signedTxXdr: signedXdr
          }
        }
      })
      
      toast.success('Vault created successfully!')
      setAmount('')
      setLockDays('30')
    } catch (error: any) {
      console.error('Error creating vault:', error)
      toast.error(error?.message || 'Failed to create vault')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div tw="bg-gray-800 rounded-lg p-6 max-w-md w-full">
      <h2 tw="text-2xl font-bold mb-4">Create Savings Vault</h2>
      
      <div tw="space-y-4">
        <div>
          <label tw="block text-sm font-medium text-gray-300 mb-2">
            Amount (XLM)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            min="0"
            step="0.01"
            disabled={isLoading}
            tw="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label tw="block text-sm font-medium text-gray-300 mb-2">
            Lock Duration (days)
          </label>
          <select
            value={lockDays}
            onChange={(e) => setLockDays(e.target.value)}
            disabled={isLoading}
            tw="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">7 days (1 week)</option>
            <option value="14">14 days (2 weeks)</option>
            <option value="30">30 days (1 month)</option>
            <option value="60">60 days (2 months)</option>
            <option value="90">90 days (3 months)</option>
            <option value="180">180 days (6 months)</option>
            <option value="365">365 days (1 year)</option>
          </select>
        </div>

        <button
          onClick={handleCreateVault}
          disabled={isLoading || !address}
          tw="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Vault'}
        </button>

        {!address && (
          <p tw="text-sm text-gray-400 text-center">
            Connect your wallet to create a vault
          </p>
        )}
      </div>
    </div>
  )
}
