import { toast } from 'react-hot-toast'
import * as StellarSdk from '@stellar/stellar-sdk'
import { SorobanRpc } from '@stellar/stellar-sdk'

export const contractTxWithToast = async (
  address: string,
  tx: StellarSdk.Transaction,
  server: SorobanRpc.Server,
  loadingMessage: string = 'Sending transaction...'
) => {
  return toast.promise(
    submitTransaction(address, tx, server),
    {
      loading: loadingMessage,
      success: 'Transaction successful!',
      error: (err) => `Transaction failed: ${err.message || 'Unknown error'}`,
    }
  )
}

async function submitTransaction(
  address: string,
  tx: StellarSdk.Transaction,
  server: SorobanRpc.Server
): Promise<SorobanRpc.Api.GetSuccessfulTransactionResponse> {
  // Sign transaction with Freighter
  const signedTx = await signTransactionWithFreighter(tx.toXDR())
  
  // Submit to network
  const transactionToSubmit = StellarSdk.TransactionBuilder.fromXDR(
    signedTx,
    StellarSdk.Networks.TESTNET
  )
  
  const response = await server.sendTransaction(transactionToSubmit as StellarSdk.Transaction)
  
  if (response.status === 'PENDING') {
    // Poll for result
    let txResponse = await server.getTransaction(response.hash)
    
    while (txResponse.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      txResponse = await server.getTransaction(response.hash)
    }
    
    if (txResponse.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
      return txResponse as SorobanRpc.Api.GetSuccessfulTransactionResponse
    }
  }
  
  throw new Error('Transaction failed')
}

async function signTransactionWithFreighter(xdr: string): Promise<string> {
  if (typeof window === 'undefined' || !(window as any).freighter) {
    throw new Error('Freighter wallet not found')
  }
  
  const freighter = (window as any).freighter
  const { signTransaction } = freighter
  
  const signedXdr = await signTransaction(xdr, {
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
  
  return signedXdr
}
