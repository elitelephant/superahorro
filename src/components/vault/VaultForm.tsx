import { useState, useEffect } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import toast from 'react-hot-toast'
import 'twin.macro'
import { Card } from '@chakra-ui/react'
import {
  CONTRACT_ID,
  Address,
  nativeToScVal,
  Contract,
  TransactionBuilder,
  BASE_FEE,
  Operation,
  rpc,
  xdr
} from '@/contracts/src/index'

const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015'
const RPC_URL = 'https://soroban-testnet.stellar.org'
const HORIZON_URL = 'https://horizon-testnet.stellar.org'
const STROOPS_PER_XLM = 10_000_000

// Helper to copy text to clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  toast.success('Dirección copiada al portapapeles')
}

export const VaultForm = () => {
  const { address, server, connectors } = useSorobanReact()
  const [amount, setAmount] = useState('')
  const [lockDays, setLockDays] = useState('30')
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState<string>('0')

  // Fetch user balance on wallet connection
  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return
      
      try {
        const response = await fetch(`${HORIZON_URL}/accounts/${address}`)
        const accountData = await response.json()
        const xlmBalance = accountData.balances.find((b: any) => b.asset_type === 'native')
        
        if (xlmBalance) {
          setBalance(parseFloat(xlmBalance.balance).toFixed(2))
        }
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }
    
    void fetchBalance()
  }, [address])

  const handleCreateVault = async () => {
    // Validation
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
    const days = parseInt(lockDays)

    if (balanceNum > 0 && amountNum > balanceNum) {
      toast.error(`Balance insuficiente. Tienes ${balance} XLM pero intentas guardar ${amount} XLM`)
      return
    }
    
    if (days < 7 || days > 365) {
      toast.error('La duración debe estar entre 7 y 365 días')
      return
    }

    try {
      setIsLoading(true)
      toast.loading('Preparing transaction...')
      
      // Setup
      const rpcServer = new rpc.Server(RPC_URL)
      const contract = new Contract(CONTRACT_ID)
      const sourceAccount = await rpcServer.getAccount(address)
      const amountInStroops = BigInt(Math.floor(amountNum * STROOPS_PER_XLM))
      
      // Build contract call parameters
      const params = [
        Address.fromString(address).toScVal(),
        nativeToScVal(amountInStroops, { type: 'i128' }),
        nativeToScVal(BigInt(days), { type: 'u64' })
      ]
      
      // Create the contract operation
      const operation = contract.call('create_vault', ...params)
      
      // Build and simulate transaction using fetch (bypass SDK type conflicts)
      const builtTx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE
      })
        .addOperation(operation)
        .setTimeout(30)
        .build()
      
      // Simulate via direct RPC call
      const simulateResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'simulateTransaction',
          params: {
            transaction: builtTx.toXDR()
          }
        })
      })
      
      const simulateData = await simulateResponse.json()
      
      if (simulateData.error) {
        throw new Error(`Simulation failed: ${simulateData.error.message}`)
      }
      
      const simulationResult = simulateData.result
      
      console.log('🔍 Simulation result:', simulationResult)
      
      if (simulationResult.error) {
        throw new Error(`Simulation error: ${simulationResult.error}`)
      }
      
      // Check if simulation has what we need
      if (!simulationResult.transactionData) {
        throw new Error('Simulation did not return transaction data')
      }
      
      console.log('✅ Transaction data:', simulationResult.transactionData)
      console.log('✅ Min resource fee:', simulationResult.minResourceFee)
      console.log('✅ Auth entries:', simulationResult.results?.[0]?.auth)
      
      // Use assembleTransaction to properly combine the simulation results
      // This handles soroban data, auth entries, and fees automatically
      const assembledTx = rpc.assembleTransaction(builtTx, simulationResult).build()
      
      console.log('✅ Assembled transaction ready')
      
      const txToSign = assembledTx
      
      // Sign transaction
      const connector = connectors?.[0]
      if (!connector) {
        throw new Error('No wallet connector found')
      }
      
      toast.loading('Please sign in Freighter...')
      
      const signedXdr = await connector.signTransaction(txToSign.toXDR(), {
        networkPassphrase: NETWORK_PASSPHRASE
      })
      
      // Submit transaction directly via RPC HTTP API (bypass SDK type issues)
      const sendResponse = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sendTransaction',
          params: {
            transaction: signedXdr
          }
        })
      })
      
      const sendData = await sendResponse.json()
      
      if (sendData.error) {
        throw new Error(sendData.error.message || 'Send transaction failed')
      }
      
      const sendResult = sendData.result
      
      // Wait for confirmation
      if (sendResult.status === 'PENDING' || sendResult.status === 'SUCCESS') {
        const txHash = sendResult.hash
        let attempts = 0
        let confirmed = false
        
        while (!confirmed && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const statusResponse = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getTransaction',
              params: {
                hash: txHash
              }
            })
          })
          
          const statusData = await statusResponse.json()
          
          if (statusData.result?.status === 'SUCCESS') {
            confirmed = true
            toast.dismiss()
            toast.success('Vault created successfully!')
            setAmount('')
            setLockDays('30')
            
            // Refresh balance
            try {
              const response = await fetch(`${HORIZON_URL}/accounts/${address}`)
              const accountData = await response.json()
              const xlmBalance = accountData.balances.find((b: any) => b.asset_type === 'native')
              if (xlmBalance) {
                setBalance(parseFloat(xlmBalance.balance).toFixed(2))
              }
            } catch (err) {
              console.error('Error refreshing balance:', err)
            }
          } else if (statusData.result?.status === 'FAILED') {
            throw new Error('Transaction failed on chain')
          }
          
          attempts++
        }
        
        if (!confirmed) {
          throw new Error('Transaction confirmation timeout')
        }
      } else {
        throw new Error(`Unexpected status: ${sendResult.status}`)
      }
    } catch (error: any) {
      console.error('Error creating vault:', error)
      toast.dismiss()
      
      // User-friendly error messages
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

        {/* Contract Address */}
        <div tw="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
          <div tw="text-xs text-gray-400 mb-1">Contract Address</div>
          <div tw="flex items-center gap-2">
            <code tw="text-xs text-gray-300 break-all flex-1 font-mono">{CONTRACT_ID}</code>
            <button
              onClick={() => copyToClipboard(CONTRACT_ID)}
              tw="p-2 hover:bg-gray-700 rounded transition-colors flex-shrink-0"
              title="Copy to clipboard"
            >
              <svg tw="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}
