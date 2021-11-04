
import type { AppProps } from 'next/app'
import React, { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import dynamic from 'next/dynamic'
import { Layout } from 'antd'
import { clusterApiUrl } from '@solana/web3.js'
const { Header, Footer, Content } = Layout
import * as anchor from "@project-serum/anchor"
import { ConnectionProvider } from "@solana/wallet-adapter-react"
import '../styles/globals.css'

const treasury = new anchor.web3.PublicKey("EGdr1dBAj6HR9Pswy4RvoxPwC2HYZGycXtEE65bq72ai")

const config = new anchor.web3.PublicKey("GqNkzyWXsdA1zE82ZtaKncZpWfie7DgiGwX134JfHnq6")

const candyMachineId = new anchor.web3.PublicKey("GYH4cUHSpyXKd79w79r1fCULQBxK2HVqbG9k3STf9KDR")

const rpcHost = "https://holaplex.rpcpool.com/"
const connection = new anchor.web3.Connection(rpcHost)

const startDateSeed = parseInt("996649200", 10)

const txTimeout = 30000

const queryClient = new QueryClient()

const WalletProvider = dynamic(() => import('@/modules/wallet/provider'), {
  ssr: false,
})

function MyApp({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Mainnet;
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
