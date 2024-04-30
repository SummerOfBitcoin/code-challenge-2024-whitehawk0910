const fs = require('fs');
const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// Read unspent transactions (simulation)
function getUnspentTransactions() {
    // This should be implemented based on the actual data storage and transaction format
    return []; // Placeholder
}

// Create a message from transaction data
function createMessage(transaction, unspent) {
    return crypto.createHash('sha256').update(JSON.stringify(transaction) + JSON.stringify(unspent)).digest('hex');
}

// Verify the signature of a transaction
function verifySignature(signature, publicKey, message) {
    const key = ec.keyFromPublic(publicKey, 'hex');
    return key.verify(message, Buffer.from(signature, 'hex'));
}

// Validate a single transaction
function validateTransaction(transaction) {
    const unspent = getUnspentTransactions();
    return transaction.inputs.every(input => {
        const details = unspent.find(tx => tx.id === input.id);
        if (!details) return false;
        const message = createMessage(transaction, details);
        return verifySignature(input.signature, details.publicKey, message);
    });
}

// Read transactions from the mempool and validate them
function readTransactions(mempoolDirectory) {
    const files = fs.readdirSync(mempoolDirectory);
    const transactions = [];

    files.forEach(filename => {
        const path = `${mempoolDirectory}/${filename}`;
        const data = fs.readFileSync(path, 'utf8');
        const transaction = JSON.parse(data);
        transactions.push(transaction);
    });

    return transactions;
}

// Create a simple coinbase transaction
function createCoinbaseTransaction(value, recipient) {
    return {
        inputs: [],
        outputs: [{ value, address: recipient }]
    };
}

// Compute a Merkle Root (placeholder for a real function)
function computeMerkleRoot(transactions) {
    return crypto.createHash('sha256').update(transactions.join('')).digest('hex');
}

// Mining a block satisfying the difficulty target
function mineBlock(transactions, previousHash, difficulty) {
    let nonce = 0;
    const target = BigInt('0x' + difficulty);

    while (true) {
        const timestamp = Date.now();
        const merkleRoot = computeMerkleRoot(transactions);
        const blockHeader = `0001|${previousHash}|${merkleRoot}|${timestamp}|${difficulty}|${nonce}`;
        const blockContent = `${blockHeader}\n${transactions.join('\n')}`;
        const hash = crypto.createHash('sha256').update(blockContent).digest('hex');

        if (BigInt('0x' + hash) < target) {
            return { nonce, hash, blockHeader, blockContent };
        }

        nonce++;
    }
}

// Main entry point
async function main() {
    const mempoolDirectory = './mempool'; // Update the directory path
    const transactionData = readTransactions(mempoolDirectory);
    const coinbase = createCoinbaseTransaction(50, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    transactionData.unshift(coinbase);

    const serializedTransactions = transactionData.map(serializeTransaction); // Serialize transactions
    const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const difficulty = '0000ffff00000000000000000000000000000000000000000000000000000000';
    const block = mineBlock(serializedTransactions, previousHash, difficulty);

    fs.writeFileSync('output.txt', `${block.blockHeader}\n${serializedTransactions.join('\n')}`);
    console.log(`Block mined! Nonce: ${block.nonce}, Hash: ${block.hash}`);
}

main().catch(console.error);
