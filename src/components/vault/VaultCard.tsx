import { useState } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import toast from 'react-hot-toast'
import 'twin.macro'
import { Client } from '@/contracts/src/index'

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
  const FIXED_PENALTY = 7

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
      
      const contractAddress = 'CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2'
      const client = new Client({
        contractId: contractAddress,
        networkPassphrase: activeChain?.networkPassphrase || '',
        rpcUrl: server.serverURL.toString(),
      })

      const tx = await client.withdraw({
        vault_id: BigInt(vault.id),
      })

      const connector = (window as any).freighterApi
      
      if (!connector) {
        throw new Error('Freighter wallet not found')
      }

      toast.loading('Sign transaction in Freighter...')

      await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const signedXdr = await connector.signTransaction(xdr, {
            networkPassphrase: activeChain?.networkPassphrase || ''
          })
          return {
            signedTxXdr: signedXdr
          }
        }
      })
      
      toast.dismiss()
      toast.success('Withdrawal successful!')
      onUpdate?.()
    } catch (error: any) {
      console.error('Error withdrawing:', error)
      toast.dismiss()
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

    try {
      setIsLoading(true)
      
      const contractAddress = 'CDPK7XBPQKRYR75U7ETJQOHGYWPH5PUJRY2TXCI23DEGG4BCEXQTCZD2'
      const client = new Client({
        contractId: contractAddress,
        networkPassphrase: activeChain?.networkPassphrase || '',
        rpcUrl: server.serverURL.toString(),
      })

      const tx = await client.early_withdraw({
        vault_id: BigInt(vault.id),
        penalty_percent: FIXED_PENALTY,
      })

      const connector = (window as any).freighterApi
      
      if (!connector) {
        throw new Error('Freighter wallet not found')
      }

      toast.loading('Sign transaction in Freighter...')

      await tx.signAndSend({
        signTransaction: async (xdr: string) => {
          const signedXdr = await connector.signTransaction(xdr, {
            networkPassphrase: activeChain?.networkPassphrase || ''
          })
          return {
            signedTxXdr: signedXdr
          }
        }
      })
      
      toast.dismiss()
      toast.success(`Early withdrawal completed with ${FIXED_PENALTY}% penalty`)
      onUpdate?.()
    } catch (error: any) {
      console.error('Error with early withdrawal:', error)
      toast.dismiss()
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
        <div tw="text-lg font-bold text-gray-500">{formatAmount(vault.amount)} XLM</div>
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
        {formatAmount(vault.amount)} XLM
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
                Early Withdraw (7% penalty)
              </button>
            ) : (
              <div tw="space-y-2">
                <div tw="text-sm text-gray-300 mb-2">
                  Early withdrawal will deduct a 7% penalty.
                  <br />
                  You'll receive: {formatAmount(BigInt(Math.floor(Number(vault.amount) * 0.93)))} XLM
                </div>
                <div tw="flex gap-2">
                  <button
                    onClick={handleEarlyWithdraw}
                    disabled={isLoading}
                    tw="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    {isLoading ? 'Processing...' : 'Confirm 7% Penalty'}
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
