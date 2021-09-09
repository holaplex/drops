
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

const treasury = new anchor.web3.PublicKey("H2jWAoW4bqeCByo2oepV5Rmqkc6rAaeWVp5TKU47BVHT")

const config = new anchor.web3.PublicKey("Vu68X5EuVvAWTmNQgYjK41JNC1mzoM32XYy3sAEXXMt")

const candyMachineId = new anchor.web3.PublicKey("5bVYkxwVy1po1sAq4JPwAdz27PEC7XRJKWzHS5VjBfZ8")

const rpcHost = "https://explorer-api.devnet.solana.com/"
const connection = new anchor.web3.Connection(rpcHost)

const startDateSeed = parseInt("996649200", 10)

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
