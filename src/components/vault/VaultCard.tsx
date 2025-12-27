import { useState } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import { contractTxWithToast } from '@/utils/contractTxWithToast'
import toast from 'react-hot-toast'
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

interface VaultCardProps {
  vault: Vault
  onUpdate?: () => void
}

export const VaultCard = ({ vault, onUpdate }: VaultCardProps) => {
  const { address, activeChain, server } = useSorobanReact()
  const [isLoading, setIsLoading] = useState(false)
  const [showEarlyWithdraw, setShowEarlyWithdraw] = useState(false)
  const [penaltyPercent, setPenaltyPercent] = useState('5')

  const now = Math.floor(Date.now() / 1000)
  const isUnlocked = now >= vault.unlockTime
  const timeRemaining = vault.unlockTime - now
  
  const formatAmount = (stroops: bigint) => {
    return (Number(stroops) / 10_000_000).toFixed(2)
  }

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Unlocked'
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const handleWithdraw = async () => {
    if (!address || !server) {
      toast.error('Please connect your wallet')
      return
    }

    if (!isUnlocked) {
      toast.error('Vault is still locked')
      return
    }

    try {
      setIsLoading(true)
      
      const contractAddress = 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      const contract = new StellarSdk.Contract(contractAddress)
      const account = await server.getAccount(address)
      
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: activeChain?.networkPassphrase || '',
      })
        .addOperation(
          contract.call(
            'withdraw',
            StellarSdk.nativeToScVal(vault.id, { type: 'u64' })
          )
        )
        .setTimeout(30)
        .build()

      await contractTxWithToast(address, tx, server, 'Withdrawing funds...')
      
      toast.success('Withdrawal successful!')
      onUpdate?.()
    } catch (error: any) {
      console.error('Error withdrawing:', error)
      toast.error(error?.message || 'Failed to withdraw')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEarlyWithdraw = async () => {
    if (!address || !server) {
      toast.error('Please connect your wallet')
      return
    }

    const penalty = parseInt(penaltyPercent)
    if (penalty < 5 || penalty > 10) {
      toast.error('Penalty must be between 5% and 10%')
      return
    }

    try {
      setIsLoading(true)
      
      const contractAddress = 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
      const contract = new StellarSdk.Contract(contractAddress)
      const account = await server.getAccount(address)
      
      const tx = new StellarSdk.TransactionBuilder(account, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: activeChain?.networkPassphrase || '',
      })
        .addOperation(
          contract.call(
            'early_withdraw',
            StellarSdk.nativeToScVal(vault.id, { type: 'u64' }),
            StellarSdk.nativeToScVal(penalty, { type: 'u32' })
          )
        )
        .setTimeout(30)
        .build()

      await contractTxWithToast(address, tx, server, 'Processing early withdrawal...')
      
      toast.success(`Early withdrawal completed with ${penalty}% penalty`)
      onUpdate?.()
    } catch (error: any) {
      console.error('Error with early withdrawal:', error)
      toast.error(error?.message || 'Failed to process early withdrawal')
    } finally {
      setIsLoading(false)
      setShowEarlyWithdraw(false)
    }
  }

  if (!vault.isActive) {
    return (
      <div tw="bg-gray-800 border border-gray-700 rounded-lg p-4 opacity-50">
        <div tw="flex justify-between items-center mb-2">
          <span tw="text-sm font-medium text-gray-400">Vault #{vault.id}</span>
          <span tw="text-xs bg-gray-700 px-2 py-1 rounded">Withdrawn</span>
        </div>
        <div tw="text-lg font-bold text-gray-500">{formatAmount(vault.amount)} USDC</div>
        <div tw="text-sm text-gray-500 mt-1">Completed</div>
      </div>
    )
  }

  return (
    <div tw="bg-gray-800 border border-gray-600 rounded-lg p-4">
      <div tw="flex justify-between items-center mb-2">
        <span tw="text-sm font-medium text-gray-400">Vault #{vault.id}</span>
        {isUnlocked ? (
          <span tw="text-xs px-2 py-1 rounded bg-green-900 text-green-300">
            Unlocked
          </span>
        ) : (
          <span tw="text-xs px-2 py-1 rounded bg-yellow-900 text-yellow-300">
            Locked
          </span>
        )}
      </div>

      <div tw="text-2xl font-bold text-white mb-1">
        {formatAmount(vault.amount)} USDC
      </div>

      <div tw="text-sm text-gray-400 space-y-1">
        <div>Created: {formatDate(vault.createdAt)}</div>
        <div>Unlocks: {formatDate(vault.unlockTime)}</div>
        {!isUnlocked && (
          <div tw="font-medium text-yellow-400">{formatTime(timeRemaining)}</div>
        )}
      </div>

      <div tw="mt-4 space-y-2">
        {isUnlocked ? (
          <button
            onClick={handleWithdraw}
            disabled={isLoading}
            tw="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Processing...' : 'Withdraw'}
          </button>
        ) : (
          <>
            {!showEarlyWithdraw ? (
              <button
                onClick={() => setShowEarlyWithdraw(true)}
                disabled={isLoading}
                tw="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Early Withdraw (with penalty)
              </button>
            ) : (
              <div tw="space-y-2">
                <div>
                  <label tw="block text-xs text-gray-400 mb-1">Penalty %</label>
                  <select
                    value={penaltyPercent}
                    onChange={(e) => setPenaltyPercent(e.target.value)}
                    disabled={isLoading}
                    tw="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
                  >
                    <option value="5">5% (Keep 95%)</option>
                    <option value="6">6% (Keep 94%)</option>
                    <option value="7">7% (Keep 93%)</option>
                    <option value="8">8% (Keep 92%)</option>
                    <option value="9">9% (Keep 91%)</option>
                    <option value="10">10% (Keep 90%)</option>
                  </select>
                </div>
                <div tw="flex gap-2">
                  <button
                    onClick={handleEarlyWithdraw}
                    disabled={isLoading}
                    tw="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {isLoading ? 'Processing...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowEarlyWithdraw(false)}
                    disabled={isLoading}
                    tw="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
