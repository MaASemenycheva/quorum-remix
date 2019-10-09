import React from 'react'
import Web3 from 'web3'

export const Store = React.createContext()

const initialState = {
  network: {
    provider: 'none',
    details: {},
    endpoint: '',
    accounts: [],
    tesseraEndpoint: 'http://localhost:9001',
  },
  txMetadata: {
    gasLimit: 3000000,
    gasPrice: 0,
    value: 0,
    valueDenomination: 'wei',
  },
  compilation: {
    contracts: {}
  },
  deployedAddresses: [],
  deployedContracts: {},
}

function normalizeCompilationOutput (data) {
  if(data === null) {
    return {};
  }
  const contracts = {}
  Object.entries(data.contracts).forEach(([filename, fileContents]) => {
    Object.entries(fileContents).forEach(([contractName, contractData]) => {
      let name = `${contractName} - ${filename}`;
      contracts[name] = contractData
    })
  })
  return contracts
}

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_NETWORK':
      console.log(action.payload)
      const network = action.payload
      console.log('setting hardcoded tessera url')
      network.tesseraEndpoint = 'http://localhost:9001'
      let web3
      if (network.endpoint) {
        web3 = new Web3(network.endpoint)
      }
      return { ...state, network: network, web3 }

    case 'SELECT_ACCOUNT':
      return {
        ...state,
        txMetadata: {
          ...state.txMetadata,
          account: action.payload
        }
      }

    case 'FETCH_COMPILATION':
      const contracts = normalizeCompilationOutput(action.payload)
      console.log('comp', contracts)
      return {
        ...state,
        compilation: {
          ...state.compilation,
          contracts
        },
      }

    case 'SELECT_CONTRACT':
      return {
        ...state,
        compilation: {
          ...state.compilation,
          selectedContract: action.payload
        }
      }
    case 'ADD_CONTRACT':
      const contract = action.payload
      console.log('add contract', contract)
      return {
        ...state,
        deployedAddresses:
          [...state.deployedAddresses, contract.address],
        deployedContracts: {
          ...state.deployedContracts,
          [contract.address]: contract
        }
      }
    case 'UPDATE_PRIVATE_FOR':
      return {
        ...state,
        txMetadata: {
          ...state.txMetadata,
          privateFor: action.payload
        }
      }

    case 'METHOD_CALL':
      const { address, methodSignature, result } = action.payload
      const deployedContract = state.deployedContracts[address]
      return {
        ...state,
        deployedContracts: {
          ...state.deployedContracts,
          [address]: {
            ...deployedContract,
            results: {
              ...deployedContract.results,
              [methodSignature]: result,
            }
          }
        }
      }

    default:
      return state;
  }
}

export function StoreProvider (props) {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const store = { state, dispatch };

  return <Store.Provider
    value={store}>{props.children}</Store.Provider>
}
