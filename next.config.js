const withAntdLess = require('next-plugin-antd-less');

/* eslint-disable @typescript-eslint/no-var-requires */
const withTM = require('next-transpile-modules')([
  '@solana/wallet-adapter-base',
  '@solana/wallet-adapter-bitpie',
  '@solana/wallet-adapter-coin98',
  '@solana/wallet-adapter-ledger',
  '@solana/wallet-adapter-mathwallet',
  '@solana/wallet-adapter-phantom',
  '@solana/wallet-adapter-react',
  '@solana/wallet-adapter-solflare',
  '@solana/wallet-adapter-sollet',
  '@solana/wallet-adapter-solong',
  '@solana/wallet-adapter-torus',
  '@solana/wallet-adapter-wallets',
  '@project-serum/sol-wallet-adapter',
])

module.exports = withAntdLess({
  reactStrictMode: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }

    return config
  },  
  lessVarsFilePath: './ant-theme.less',
})