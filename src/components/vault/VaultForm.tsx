import { useState, useEffect } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import toast from 'react-hot-toast'
import 'twin.macro'
import { Client } from '@/contracts/src/index'
import { rpc, Address } from '@/contracts/src/index'
import { Card } from '@chakra-ui/react'

export const VaultForm = () => {
  const { address, server, connectors } = useSorobanReact()
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState('30')
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<string>('0')

  // Fetch balance when address changes
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return
      try {
        // Use Horizon API directly for testnet balance
        const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`)
        const accountData = await response.json()
        const xlmBalance = accountData.balances.find((b: any) => b.asset_type === 'native')
        if (xlmBalance) {
          const balanceInXLM = (parseFloat(xlmBalance.balance)).toFixed(2)
          setBalance(balanceInXLM)
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }
    void fetchBalance()
  }, [address])

  const handleCreateVault = async () => {
    if (!address || !server) {
      toast.error('Please connect your wallet first')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Por favor ingresa una cantidad válida mayor a 0')
      return
    }

    const amountNum = parseFloat(amount)
    const balanceNum = parseFloat(balance)

    // Only check balance if we have a valid balance (not 0 or loading)
    if (balanceNum > 0 && amountNum > balanceNum) {
      toast.error(`Balance insuficiente. Tienes ${balance} XLM pero intentas guardar ${amount} XLM`)
      return
    }

    const days = parseInt(lockDays)
    
    if (days < 7 || days > 365) {
      toast.error('La duración debe estar entre 7 y 365 días')
      return
    }

    try {
      setIsLoading(true)
      
      // Convert XLM to stroops (7 decimals)
      const amountInStroops = BigInt(Math.floor(parseFloat(amount) * 10_000_000))
      
      console.log('Creating vault with:', { address, amountInStroops: amountInStroops.toString(), days })
      
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
          return signedXdr as any
        }
      })
      
      toast.dismiss()
      toast.success('Vault created successfully!')
      setAmount('')
      setLockDays('30')
      
      // Refresh balance using Horizon API
      try {
        const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`)
        const accountData = await response.json()
        const xlmBalance = accountData.balances.find((b: any) => b.asset_type === 'native')
        if (xlmBalance) {
          setBalance((parseFloat(xlmBalance.balance)).toFixed(2))
        }
      } catch (err) {
        console.error('Error refreshing balance:', err)
      }
    } catch (error: any) {
      console.error('Error creating vault:', error)
      toast.dismiss()
      
      // Specific error messages
      let errorMsg = 'Error al crear el vault'
      if (error?.message?.includes('insufficient')) {
        errorMsg = `Balance insuficiente. Necesitas ${amount} XLM + fees (~0.01 XLM)`
      } else if (error?.message?.includes('not found')) {
        errorMsg = 'Wallet no conectado correctamente. Reconecta Freighter'
      } else if (error?.message?.includes('timeout')) {
        errorMsg = 'Transacción expiró. Intenta nuevamente'
      } else if (error?.message) {
        errorMsg = error.message
      }
      
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card variant="outline" p={6} bgColor="whiteAlpha.100" maxW="md" w="full">
      <h2 tw="text-xl font-bold mb-4 text-center">Create Savings Vault</h2>
      
      <div tw="mb-3 p-2 bg-gray-900/50 border border-gray-700 rounded text-xs">
        <div tw="text-gray-400 mb-1">Contract Address:</div>
        <div tw="font-mono text-gray-300 break-all">CDPK7X...TCZD2</div>
      </div>
      
      {address && (
        <div tw="mb-4 p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
          <div tw="text-xs text-gray-400 mb-1">Available Balance</div>
          <div tw="text-lg font-semibold text-white">{balance} XLM</div>
        </div>
      )}
      
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
            Lock Duration
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
    </Card>
  )
}
