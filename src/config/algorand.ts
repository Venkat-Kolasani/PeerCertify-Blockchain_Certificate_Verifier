import algosdk from 'algosdk';

export interface AlgorandConfig {
  network: string;
  nodeUrl: string;
  indexerUrl: string;
  port: number;
  apiKey?: string;
}

export const getAlgorandConfig = (): AlgorandConfig => {
  return {
    network: import.meta.env.VITE_ALGORAND_NETWORK || 'testnet',
    nodeUrl: import.meta.env.VITE_ALGORAND_NODE_URL || 'https://testnet-api.algonode.cloud',
    indexerUrl: import.meta.env.VITE_ALGORAND_INDEXER_URL || 'https://testnet-idx.algonode.cloud',
    port: parseInt(import.meta.env.VITE_ALGORAND_PORT || '443'),
    apiKey: import.meta.env.VITE_ALGORAND_API_KEY,
  };
};

export const createAlgodClient = (): algosdk.Algodv2 => {
  const config = getAlgorandConfig();
  const token = config.apiKey || '';
  
  return new algosdk.Algodv2(token, config.nodeUrl, config.port);
};

export const createIndexerClient = (): algosdk.Indexer => {
  const config = getAlgorandConfig();
  const token = config.apiKey || '';
  
  return new algosdk.Indexer(token, config.indexerUrl, config.port);
};