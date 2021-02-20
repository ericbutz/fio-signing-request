const { Fio } = require('@fioprotocol/fiojs');
const { TextEncoder, TextDecoder } = require('text-encoding');
const fetch = require('isomorphic-fetch') // or 'node-fetch'
const testnet = require('./config-keys.js');

const httpEndpoint = 'http://testnet.fioprotocol.io'

// Testnet keypair
const user = {
  privateKey: testnet.privateKey,
  publicKey: testnet.publicKey,
  account: testnet.account,
  domain: testnet.domain, 
  address: testnet.address,
}

const fioAddPublicAddress = async () => {
  info = await (await fetch(httpEndpoint + '/v1/chain/get_info')).json();
  blockInfo = await (await fetch(httpEndpoint + '/v1/chain/get_block', {body: `{"block_num_or_id": ${info.last_irreversible_block_num}}`, method: 'POST'})).json()
  chainId = info.chain_id;
  currentDate = new Date();
  timePlusTen = currentDate.getTime() + 10000;
  timeInISOString = (new Date(timePlusTen)).toISOString();
  expiration = timeInISOString.substr(0, timeInISOString.length - 1);
  
  transaction = {
     expiration,
     ref_block_num: blockInfo.block_num & 0xffff,
     ref_block_prefix: blockInfo.ref_block_prefix,
     actions: [{
         account: 'fio.address',
         name: 'addaddress',
         authorization: [{
             actor: user.account,
             permission: 'active',
         }],
         data: {
            fio_address: user.address,
            public_addresses: [
              {
                chain_code: 'BCH',
                token_code: 'BCH',
                public_address: 'bitcoincash:asdfasdfasdf',
              },
              {
                chain_code: 'DASH',
                token_code: 'DASH',
                public_address: 'asdfasdfasdf',
              }
            ],
            max_fee: 600000000,
            tpid: 'rewards@wallet',
            actor: user.account,
         },
     }]
  };

  const account = 'fio.address'
  abi = await (await fetch(httpEndpoint + '/v1/chain/get_abi', {body: `{"account_name": "${account}"}`, method: 'POST'})).json()
  console.log('abi: ', abi.abi);

  abiMap = new Map()
  tokenRawAbi = await (await fetch(httpEndpoint + '/v1/chain/get_raw_abi', {body: `{"account_name": "fio.address"}`, method: 'POST'})).json()
  console.log('tokenRawAbi: ', tokenRawAbi);

  abiMap.set('fio.address', tokenRawAbi)

  console.log('abiMap: ', abiMap);
   /**
    abiMap:

    Map {
      'fio.address' => { 
        account_name: 'fio.address',
        code_hash: '0aacfee458bee8aa4ba6773bfcf05f9d3565a12e2ea03dfa4124aa32672d6948',
        abi_hash: '0dca0ca50be70bb04a84c2494e3eecdf72c083498a3acdbe0ed7ebc4a89d8ad9',
        abi: 'DmVvc2lvOjphYmkvMS4wABMHZmlvbmFtZQAJAmlkBnVpbnQ2NAR... etc ...FpbgBANTJPTREyA2k2NAEHYWNjb3VudAEGdWludDY0CmVvc2lvX25hbWUAAAAA=' 
      } 
    }

  */
 
  var privateKeys = [user.privateKey];
  
  const tx = await Fio.prepareTransaction({
    transaction,
    chainId,
    privateKeys,
    abiMap,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });

  console.log('tx: ', tx);
  /**
    tx:  
    { signatures: [ 'SIG_K1_KkxZUPZucyD8kV54S4WYuoYPLGMNZUky8nuSzHDmhdHihns42UrEX9TKwqJPmqLqA2GRt4hpdLi4bAW6J1oETozr2WJFnT' ],
      compression: 0,
      packed_context_free_data: '',
      packed_trx: 'fe3a3160aad4a829196f0000000001003056372503a85b0000c6eaa664523201b0bb16f856dde77200000000a8ed32326a116574657374364066696f746573746e657402034243480342434818626974636f696e636173683a617364666173646661736466044441534804444153480c6173646661736466617364660046c32300000000b0bb16f856dde7720e726577617264734077616c6c657400' 
    }
  */

  pushResult = await fetch(httpEndpoint + '/v1/chain/add_pub_address', {
      body: JSON.stringify(tx),
      method: 'POST',
  });
  
  //json = await pushResult.json();

  if (json.transaction_id) {
    console.log('Success. Transaction ID: ', json.transaction_id);
  } else if (json.code) {
    console.log('Error: ', json.error);
  } else {
    console.log('Error: ', json)
  }

};

fioAddPublicAddress();

