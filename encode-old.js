const { JsonRpc, Api } = require('eosjs')

const fetch = require('node-fetch')
const util = require('util')
const zlib = require('zlib')

const textEncoder = new util.TextEncoder()
const textDecoder = new util.TextDecoder()

const rpc = new JsonRpc('https://eos.greymass.com', {
    fetch // only needed if running in nodejs, not required in browsers
})

const eos = new Api({
    rpc,
    textDecoder,
    textEncoder,
})

const httpEndpoint = 'http://testnet.fioprotocol.io'
const testnet = require('./config-keys.js');
const user = {
    privateKey: testnet.privateKey,
    publicKey: testnet.publicKey,
    account: testnet.account,
    domain: testnet.domain, 
    address: testnet.address,
  }

const { SigningRequest } = require("eosio-signing-request")

// options for the signing request
const opts = {
    // string encoder
    textEncoder,
    // string decoder
    textDecoder,
    // zlib string compression (optional, recommended)
    zlib: {
        deflateRaw: (data) => new Uint8Array(zlib.deflateRawSync(Buffer.from(data))),
        inflateRaw: (data) => new Uint8Array(zlib.inflateRawSync(Buffer.from(data))),
    },
    //Customizable ABI Provider used to retrieve contract data
    abiProvider: {
        //getAbi: async (account) => (await eos.getAbi(account))
        getAbi: async (account) => (await fetch(httpEndpoint + '/v1/chain/get_abi', {body: `{"account_name": "${account}"}`, method: 'POST'})).json().then(response => {return response.abi})
    }
}

async function main() {
    //console.log('abiProvider: ', await eos.getAbi('eosio'))
    //console.log('abi: ', await opts.abiProvider.getAbi('fio.address'))
/*
    const actions = [{
        account: 'eosio',
        name: 'voteproducer',
        authorization: [{
          // '............1' = placeholder for signer account name
          actor: '............1',
          // '............2' = placeholder for signer account permission
          permission: '............2'
        }],
        data: {
            voter: '............1',
            proxy: 'greymassvote',
            producers: [],
        }
    }]
    */
    const actions = [{
        account: 'fio.address',
        name: 'regaddress',
        authorization: [{
            actor: '............1',
            permission: '............2'
        }],
        data: {
            fio_address: "etest6@fiotestnet",
            owner_fio_public_key: "FIO6TWRA6o5UNeMVwG8oGxedvhizd8UpfGbnGKaXEiPH2kUWEPiEb",
            max_fee: 40000000000,
            actor: "ifnxuprs2uxv",
            tpid: "rewards@wallet"
        }
    }]

    const request = await SigningRequest.create({ actions }, opts)
    console.log(util.inspect(request, false, null, true))

    // encode signing request as URI string
    const uri = request.encode();
    console.log(`\nURI: ${ uri }`)
}

main().catch(console.error)