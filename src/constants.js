import colors from './colors';

export const NetworkProtocols = Object.freeze({
  ETHEREUM: 'ethereum',
  SUBSTRATE: 'substrate'
});

// ethereumChainId is used as Network key for Ethereum networks
export const EthereumNetworkKeys = Object.freeze({
  FRONTIER: '1',
  ROPSTEN: '3',
  RINKEBY: '4',
  GOERLI: '5',
  KOVAN: '42',
  CLASSIC: '61',
});

// genesisHash is used as Network key for Substrate networks
export const SubstrateNetworkKeys = Object.freeze({
  // POLKADOT: '123',
  KUSAMA: '456',
  POLKADOT_TEST: '42',
});

const substrateNetworkBase = {
  [SubstrateNetworkKeys.KUSAMA]: {
    color: '#4C4646',
    genesisHash: SubstrateNetworkKeys.KUSAMA,
    prefix: 2,
    title: 'Kusama'
  },
  [SubstrateNetworkKeys.POLKADOT_TEST]: {
    color: '#ff8c00',
    genesisHash: SubstrateNetworkKeys.KUSAMA,
    prefix: 42,
    title: 'Polkadot Testnet'
  },
  // [SubstrateNetworkKeys.POLKADOT]: {
  //   color: '#e6007a',
  //   genesisHash: SubstrateNetworkKeys.POLKADOT,
  //   prefix: 0,
  //   title: 'Polkadot mainnet'
  // }
};

const ethereumNetworkBase = {
  [EthereumNetworkKeys.FRONTIER]: {
    color: '#977CF6',
    ethereumChainId: EthereumNetworkKeys.FRONTIER,
    secondaryColor: colors.card_bg,
    title: 'Ethereum'
  },
  [EthereumNetworkKeys.CLASSIC]: {
    color: '#8C7166',
    ethereumChainId: EthereumNetworkKeys.CLASSIC,
    secondaryColor: colors.card_bg,
    title: 'Ethereum Classic'
  },
  [EthereumNetworkKeys.ROPSTEN]: {
    ethereumChainId: EthereumNetworkKeys.ROPSTEN,
    title: 'Ropsten Testnet'
  },
  [EthereumNetworkKeys.GOERLI]: {
    ethereumChainId: EthereumNetworkKeys.GOERLI,
    title: 'Görli Testnet'
  },
  [EthereumNetworkKeys.KOVAN]: {
    ethereumChainId: EthereumNetworkKeys.KOVAN,
    title: 'Kovan Testnet'
  }
};

const ethereumDefaultValues = {
  color: '#F2E265',
  protocol: NetworkProtocols.ETHEREUM,
  secondaryColor: colors.card_text
};

const substrateDefaultValues = {
  color: '#4C4646',
  protocol: NetworkProtocols.SUBSTRATE,
  secondaryColor: colors.card_bg
}

function setDefault(networkBase, defaultProps) {
  return Object.keys(networkBase).reduce((acc,networkKey) => {
      return {
        ...acc,
        [networkKey]: {
          ...defaultProps,
          ...networkBase[networkKey]
        }
      }
    },{})
}

export const ETHEREUM_NETWORK_LIST = Object.freeze(setDefault(ethereumNetworkBase, ethereumDefaultValues));
export const SUBSTRATE_NETWORK_LIST = Object.freeze(setDefault(substrateNetworkBase, substrateDefaultValues));
export const NETWORK_LIST = Object.freeze(
  Object.assign({}, SUBSTRATE_NETWORK_LIST, ETHEREUM_NETWORK_LIST)
);
