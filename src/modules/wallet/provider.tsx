import type { WalletProviderProps } from '@solana/wallet-adapter-react'
import { WalletProvider } from '@solana/wallet-adapter-react'
import {
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
} from '@solana/wallet-adapter-wallets'
import type { ReactNode } from 'react'
import { useMemo } from 'react'

export default function ClientWalletProvider(
  props: Omit<WalletProviderProps, 'wallets'> & { children: ReactNode }
): JSX.Element {
  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getLedgerWallet(),
      getSolongWallet(),
      getMathWallet(),
      getSolletWallet(),
    ],
    []
  )

  return <WalletProvider wallets={wallets} {...props} />
}