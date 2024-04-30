const fs = require('fs');
const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

function getUnspentTransactions() {
    // Implementation might fetch real data from a JSON file or database
    return JSON.parse(fs.readFileSync('./mempool', 'utf8'));
}

function serializeTransaction(transaction) {
    const inputs = transaction.vin.map(vin => `${vin.txid}:${vin.vout}:${vin.scriptSig}`);
    const outputs = transaction.vout.map(vout => `${vout.value}:${vout.scriptpubkey}`);
    return `${transaction.version}:${inputs.join(',')}:${outputs.join(',')}:${transaction.locktime}`;
}

function createMessage(transaction) {
    return crypto.createHash('sha256').update(serializeTransaction(transaction)).digest('hex');
}

function verifySignature(signature, publicKey, message) {
    const key = ec.keyFromPublic(publicKey, 'hex');
    return key.verify(message, signature);
}

function validateTransaction(transaction, unspent) {
    return transaction.vin.every(input => {
        const utxo = unspent.find(utxo => utxo.txid === input.txid && utxo.index === input.vout);
        if (!utxo) return false;
        const msg = createMessage(transaction);
        return verifySignature(input.scriptSig, utxo.pubKey, msg);
    });
}

function readTransactions(mempoolDirectory) {
    return fs.readdirSync(mempoolDirectory).map(filename => {
        return JSON.parse(fs.readFileSync(`${mempoolDirectory}/${filename}`, 'utf8'));
        
    }).filter(tx => validateTransaction(tx, getUnspentTransactions()));
}

function createCoinbaseTransaction(value, recipient) {
    return {
        version: 1,
        vin: [{ txid: '', vout: 0, scriptSig: '', pubKey: '' }], // Coinbase has no input
        vout: [{ value: value, scriptpubkey: recipient }],
        locktime: 0
    };
}

function computeMerkleRoot(transactions) {
    let txids = transactions.map(tx => crypto.createHash('sha256').update(serializeTransaction(tx)).digest('hex'));
    while (txids.length > 1) {
        txids = txids.reduce((acc, _, i, arr) => i % 2 ? acc : [...acc, crypto.createHash('sha256').update(arr[i] + (arr[i + 1] || '')).digest('hex')], []);
    }
    return txids[0];
}

function mineBlock(transactions, previousHash, difficulty) {
    let nonce = 0;
    const target = BigInt('0x' + difficulty);
    let hash, header;

    // Loop until the hash meets the target
    do {
        nonce++;
        const merkleRoot = computeMerkleRoot(transactions);
        header = `${previousHash}${merkleRoot}${nonce}`;
        hash = crypto.createHash('sha256').update(header).digest('hex');
    } while (BigInt('0x' + hash) >= target);

    return { nonce, hash, header, transactions };
}
async function main() {
    const transactions = readTransactions('./mempool');
    const coinbase = createCoinbaseTransaction(50, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    transactions.unshift(coinbase);

    const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const difficulty = '0000ffff00000000000000000000000000000000000000000000000000000000';
    const block = mineBlock(transactions, previousHash, difficulty);

    const blockData = `Block Header: ${block.hash}\nCoinbase Transaction: ${serializeTransaction(coinbase)}\nTransactions:\n${block.transactions.map(tx => serializeTransaction(tx)).join('\n')}`;

    fs.writeFileSync('output.txt', blockData);
}

main();
