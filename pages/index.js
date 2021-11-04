import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Head from 'next/head'

const address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const abi = [
  {
    'inputs': [
      {
        'internalType': 'string',
        'name': '_greeting',
        'type': 'string'
      }
    ],
    'stateMutability': 'nonpayable',
    'type': 'constructor'
  },
  {
    'inputs': [],
    'name': 'greet',
    'outputs': [
      {
        'internalType': 'string',
        'name': '',
        'type': 'string'
      }
    ],
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'inputs': [
      {
        'internalType': 'string',
        'name': '_greeting',
        'type': 'string'
      }
    ],
    'name': 'setGreeting',
    'outputs': [],
    'stateMutability': 'nonpayable',
    'type': 'function'
  }
]

const styles = {
  accountDisconnected: [
    'bg-blue-500',
    'hover:bg-blue-700',
    'text-white',
    'font-bold',
    'py-2',
    'px-4',
    'rounded',
    'focus:outline-none',
    'focus:shadow-outline'
  ].join(' '),
  accountConnected: [
    'bg-transparent',
    'hover:bg-blue-500',
    'text-blue-700',
    'font-semibold',
    'hover:text-white',
    'py-2',
    'px-4',
    'border',
    'border-blue-500',
    'hover:border-transparent',
    'rounded'
  ].join(' '),
  input: [
    'appearance-none',
    'bg-transparent',
    'border-none',
    'w-full',
    'text-gray-700',
    'mr-3',
    'py-1',
    'px-2',
    'leading-tight',
    'focus:outline-none'
  ].join(' '),
  submit: [
    'bg-blue-500',
    'hover:bg-blue-700',
    'text-white',
    'font-bold',
    'py-2',
    'px-4',
    'rounded',
    'disabled:opacity-50',
    'focus:outline-none',
    'focus:shadow-outline'
  ].join(' '),
  refresh: [
    'bg-blue-500',
    'hover:bg-blue-700',
    'text-white',
    'font-bold',
    'py-2',
    'px-4',
    'rounded',
    'focus:outline-none',
    'focus:shadow-outline'
  ].join(' '),
  greeting: [
    'bg-blue-100',
    'border-blue-500',
    'text-blue-700',
    'px-4',
    'py-3',
    'mb-6'
  ].join(' '),
  noGreeting: [
    'bg-red-100',
    'border-red-500',
    'text-red-700',
    'px-4',
    'py-3',
    'mb-6'
  ].join(' ')
}

const Account = props => {
  const connect = () => {
    ethereum.request({
      method: 'eth_requestAccounts'
    }).then(accounts => {
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.')
      } else if (accounts[0] !== props.currentAccount) {
        props.setCurrentAccount(accounts[0])
      }
    }).catch(error => {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.')
      } else {
        console.error(error)
      }
    })
  }

  if (props.currentAccount) {
    return (
      <div className={styles.accountConnected}>
        {props.currentAccount}
      </div>
    )
  } else {
    return (
      <button type="button" className={styles.accountDisconnected} onClick={connect}>
        Conectar
      </button>
    )
  }
}

export default function Home() {
  const [currentAccount, setCurrentAccount]   = useState()
  const [currentGreeting, setCurrentGreeting] = useState()

  let provider
  let contract
  let signer

  const getProvider = () => {
    if (! provider) {
      provider = new ethers.providers.Web3Provider(window.ethereum)
    }

    return provider
  }

  const getContract = () => {
    if (! contract) {
      const provider = getProvider()

      contract = new ethers.Contract(address, abi, provider)
    }

    return contract
  }

  const getSigner = () => {
    if (! signer) {
      const provider = getProvider()

      signer = provider.getSigner()
    }

    return signer
  }

  const refreshGreeting = async () => {
    const contract = getContract()

    setCurrentGreeting(await contract.greet())
  }

  const setGreeting = event => {
    event.preventDefault()

    if (currentAccount) {
      const greeting = event.target.greeting.value
      const contract = getContract()
      const signer   = getSigner()

      contract.connect(signer).setGreeting(greeting).then(() => {
        event.target.greeting.value = ''
      })
    }
  }

  useEffect(() => {
    refreshGreeting()
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Bienvenidos</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-6">
          ¡Bienvenidos!
        </h1>

        <div className="mb-6">
          <Account currentAccount={currentAccount} setCurrentAccount={setCurrentAccount} />
        </div>

        <form className="w-full max-w-sm mb-6" onSubmit={setGreeting}>
          <div className="flex items-center border-b border-teal-500 py-2">
            <input name="greeting"
                   type="text"
                   className={styles.input}
                   placeholder="Escriba un nuevo mensaje"
                   autoComplete="off"
                   disabled={! currentAccount} />
              <button type="submit" className={styles.submit} disabled={! currentAccount}>
                Modificar
              </button>
            </div>
        </form>

        <div className={currentGreeting ? styles.greeting : styles.noGreeting}>
          {currentGreeting || 'No hay ningún mensaje establecido'}
        </div>

        <p>
          <button type="button" className={styles.refresh} onClick={refreshGreeting}>
            Refrescar saludo
          </button>
        </p>
      </main>
    </div>
  )
}
