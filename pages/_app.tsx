
import type { AppProps } from 'next/app'
import React, { useMemo } from 'react';
import 'antd/dist/antd.css'
import { QueryClient, QueryClientProvider } from 'react-query'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import dynamic from 'next/dynamic'
import { Layout } from 'antd'
import { clusterApiUrl } from '@solana/web3.js'
const { Header, Footer, Content } = Layout
import * as anchor from "@project-serum/anchor"
import { ConnectionProvider } from "@solana/wallet-adapter-react"

const treasury = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_TREASURY_ADDRESS as string
)

const config = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_CANDY_MACHINE_CONFIG as string
)

const candyMachineId = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_CANDY_MACHINE_ID as string
)

const rpcHost = process.env.NEXT_PUBLIC_SOLANA_RPC_HOST as string
const connection = new anchor.web3.Connection(rpcHost)

const startDateSeed = parseInt(process.env.NEXT_PUBLIC_CANDY_START_DATE as string, 10)

const txTimeout = 30000

const queryClient = new QueryClient()

const WalletProvider = dynamic(() => import('@/modules/wallet/provider'), {
  ssr: false,
})

function MyApp({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider>
          <Layout>
            <Content>
              <Component
                {...pageProps}
                connection={connection}
                candyMachineId={candyMachineId}
                startDate={startDateSeed}
                txTimeout={txTimeout}
                config={config}
                treasury={treasury}
              />
            </Content>
          </Layout>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  )
}

export default MyApp
