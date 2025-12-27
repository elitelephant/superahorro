import { Card, Link } from '@chakra-ui/react'
import { useSorobanReact } from '@soroban-react/core'
import { type FC, useEffect, useState } from 'react'
import { HiOutlineExternalLink } from 'react-icons/hi'
import 'twin.macro'

interface ChainInfo {
  Chain: string | undefined,
  PassPhrase: string,
  NetworkURL: string,
  sorobanURL: string | undefined
} 
export const ChainInfo: FC = () => {
  const sorobanContext = useSorobanReact();
  // const { api, activeChain } = 
  const [chainInfo, setChainInfo] = useState<ChainInfo>()

  // Fetch Chain Info
  const fetchChainInfo = () => {
    // if (!api) {
    //   setChainInfo(undefined)
    //   return
    // }

    const chain = sorobanContext.activeChain ?? {name:"", networkPassphrase:"",networkUrl:"",sorobanRpcUrl:""}
    // const version = (await api.rpc.system.version())?.toString() || ''
    // const properties = ((await api.rpc.system.properties())?.toHuman() as any) || {}
    // const tokenSymbol = properties?.tokenSymbol?.[0] || 'UNIT'
    // const tokenDecimals = properties?.tokenDecimals?.[0] || 12
    const chainInfo = {
      Chain: chain.name,
      PassPhrase: chain.networkPassphrase,
      NetworkURL: chain.networkUrl,
      sorobanURL: chain.sorobanRpcUrl
      // Token: `${tokenSymbol} (${tokenDecimals} Decimals)`,
    }
    setChainInfo(chainInfo)
  }
  useEffect(fetchChainInfo, [sorobanContext])

  // Connection Loading Indicator
  // if (!api)
  //   return (
  //     <div tw="mt-8 mb-4 flex flex-col items-center justify-center space-y-3 text-center font-mono text-sm text-gray-400 sm:(flex-row space-x-3 space-y-0)">
  //       <Spinner size="sm" />
  //       <div>
  //         Connecting to {activeChain?.name} ({activeChain?.rpcUrls?.[0]})
  //       </div>
  //     </div>
  //   )

  return (
    <>
      <Card variant="outline" p={6} bgColor="whiteAlpha.100" maxW="md" w="full">
        <h2 tw="text-xl font-bold mb-4 text-center">Chain Info</h2>

        {/* Metadata */}
        <div tw="space-y-3">
          {Object.entries(chainInfo ?? {}).map(([key, value]:[string, string]) => (
            <div key={key} tw="text-sm leading-7">
              {key}:
              <strong tw="float-right ml-6 truncate max-w-[15rem]" title={value}>
                {value}
              </strong>
            </div>
          ))}
        </div>

        {/* Explorer Link */}
        <div tw="mt-4 pt-4 border-t border-gray-700">
          <Link
            href={"https://stellar.expert/explorer/testnet/"}
            target="_blank"
            tw="flex items-center justify-center gap-1 text-center text-sm text-gray-400 hover:text-white"
          >
            TestNet Explorer <HiOutlineExternalLink />
          </Link>
        </div>
      </Card>
    </>
  )
}
