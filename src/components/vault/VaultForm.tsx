import { useState } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import toast from 'react-hot-toast'
import 'twin.macro'
import * as StellarSdk from '@stellar/stellar-sdk'

export const VaultForm = () => {
  const { address, activeChain, server } = useSorobanReact()
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
      
      // Convert USDC to stroops (7 decimals)
      const amountInStroops = Math.floor(parseFloat(amount) * 10_000_000)
      
      // Get contract address from deployments
      const contractAddress = 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' // Will be updated after deployment
      
      // Build transaction
      const contract = new StellarSdk.Contract(contractAddress)
      const account = await server.getAccount(address)
      
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: activeChain?.networkPassphrase || '',
      })
        .addOperation(
          contract.call(
            'create_vault',
            StellarSdk.Address.fromString(address).toScVal(),
            StellarSdk.nativeToScVal(amountInStroops, { type: 'i128' }),
            StellarSdk.nativeToScVal(days, { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build()

      await contractTxWithToast(address, tx, server, 'Creating vault...')
      
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
            Amount (USDC)
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
