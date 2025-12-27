import { HomePageTitle } from '@/components/home/HomePageTitle'
import { CenterBody } from '@/components/layout/CenterBody'
import { ChainInfo } from '@/components/web3/ChainInfo'
import { ConnectButton } from '@/components/web3/ConnectButton'
import { VaultForm } from '@/components/vault/VaultForm'
import { VaultList } from '@/components/vault/VaultList'
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

        <div tw="mt-10 flex w-full flex-wrap items-start justify-center gap-6">
          {/* Chain Metadata Information */}
          <ChainInfo />

          {/* Create Vault Form */}
          <VaultForm />
        </div>

        {/* Vault List */}
        <div tw="mt-10 w-full flex justify-center">
          <VaultList />
        </div>
      </CenterBody>
    </>
  )
}

export default HomePage
