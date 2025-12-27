import React from 'react'
import {SorobanReactProvider} from '@soroban-react/core';
import {futurenet, sandbox, standalone, testnet} from '@soroban-react/chains';
import {freighter} from '@soroban-react/freighter';
import type {ChainMetadata, Connector} from "@soroban-react/types";

import deployments from '../../../contracts/deployments.json';

const chains: ChainMetadata[] = [sandbox, standalone, futurenet,testnet];
const connectors: Connector[] = [freighter()];  // Using only Freighter wallet


export default function MySorobanReactProvider({children}:{children: React.ReactNode}) {

    return (
      <SorobanReactProvider
        chains={chains}
        appName={"SuperAhorro - Savings Vault"}
        activeChain={testnet}
        connectors={connectors}
        deployments={deployments}>
          {children}
      </SorobanReactProvider>
    )
  }