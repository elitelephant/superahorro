import { HomePageTitle } from '@/components/home/HomePageTitle'
import { CenterBody } from '@/components/layout/CenterBody'
import { ChainInfo } from '@/components/web3/ChainInfo'
import { ConnectButton } from '@/components/web3/ConnectButton'
import type { NextPage } from 'next'
import 'twin.macro'

const HomePage: NextPage = () => {
  return (
    <>
      <CenterBody tw="mt-20 mb-10 px-5">
        {/* Title */}
        <HomePageTitle />

        {/* Connect Wallet Button */}
        <ConnectButton />

        <div tw="mt-10 flex w-full flex-wrap items-start justify-center gap-4">
          {/* Chain Metadata Information */}
          <ChainInfo />

          {/* Vault Contract Coming Soon */}
          <div tw="bg-gray-800 rounded-lg p-6 text-center max-w-md">
            <h2 tw="text-2xl font-bold mb-4">Savings Vault</h2>
            <p tw="text-gray-400 mb-4">
              Crea tu bóveda con bloqueo temporal y empieza a ahorrar con disciplina.
            </p>
            <p tw="text-sm text-gray-500">
              Interfaz en desarrollo...
            </p>
          </div>
        </div>
      </CenterBody>
    </>
  )
}

export default HomePage
