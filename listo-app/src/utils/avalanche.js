export const AVALANCHE_FUJI = {
  chainId: 43113,
  name: 'Avalanche Fuji Testnet',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  nativeCurrency: {
    name: 'Avalanche',
    symbol: 'AVAX',
    decimals: 18,
  },
  blockExplorer: 'https://testnet.snowtrace.io/',
  faucet: 'https://faucet.avax.network/',
};

export const USDC_FUJI = {
  // Correct Native USDC on Fuji
  address: '0x5425890298aed601595a70AB815c96711a31Bc65',
  decimals: 6,
  symbol: 'USDC',
};
