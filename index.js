// const fs = require('fs');
// const crypto = require('crypto');
// const EC = require('elliptic').ec;
// const ec = new EC('secp256k1');

// // Read unspent transactions (simulation)
// function getUnspentTransactions() {
//     // This should be implemented based on the actual data storage and transaction format
//     return []; // Placeholder
// }

// // Create a message from transaction data
// function createMessage(transaction, unspent) {
//     return crypto.createHash('sha256').update(JSON.stringify(transaction) + JSON.stringify(unspent)).digest('hex');
// }

// // Verify the signature of a transaction
// function verifySignature(signature, publicKey, message) {
//     const key = ec.keyFromPublic(publicKey, 'hex');
//     return key.verify(message, Buffer.from(signature, 'hex'));
// }

// // Validate a single transaction
// function validateTransaction(transaction) {
//     const unspent = getUnspentTransactions();
//     return transaction.inputs.every(input => {
//         const details = unspent.find(tx => tx.id === input.id);
//         if (!details) return false;
//         const message = createMessage(transaction, details);
//         return verifySignature(input.signature, details.publicKey, message);
//     });
// }

// // Read transactions from the mempool and validate them
// // function readTransactions(mempool) {
// //     return fs.readdirSync(mempool).map(filename => {
// //         const path = `${mempool}`;
// //         const data = fs.readFileSync(path, 'utf8');
// //         const transaction = JSON.parse(data);
// //         return validateTransaction(transaction) ? transaction : null;
// //     }).filter(tx => tx != null);
// // }
// function readTransactions(mempoolDirectory) {
//     const files = fs.readdirSync(mempoolDirectory);
//     const transactions = [];

//     files.forEach(filename => {
//         const path = `${mempoolDirectory}/${filename}`;
//         const data = fs.readFileSync(path, 'utf8');
//         transactions.push(data); // Assuming data is already serialized
//     });

//     return transactions;
// }



// // Create a simple coinbase transaction
// function createCoinbaseTransaction(value, recipient) {
//     return {
//         inputs: [],
//         outputs: [{ value, address: recipient }]
//     };
// }

// // Serialize transactions


// // Compute a Merkle Root (placeholder for a real function)
// function computeMerkleRoot(transactions) {
//     return crypto.createHash('sha256').update(transactions.join('')).digest('hex');
// }

// // Mining a block satisfying the difficulty target
// function mineBlock(transactions, previousHash, difficulty) {
//     let nonce = 0;
//     const target = BigInt('0x' + difficulty);

//     while (true) {
//         const timestamp = Date.now();
//         const merkleRoot = computeMerkleRoot(transactions);
//         const blockHeader = `0001|${previousHash}|${merkleRoot}|${timestamp}|${difficulty}|${nonce}`;
//         const blockContent = `${blockHeader}\n${transactions.join('\n')}`;
//         const hash = crypto.createHash('sha256').update(blockContent).digest('hex');

//         if (BigInt('0x' + hash) < target) {
//             return { nonce, hash, blockHeader, blockContent };
//         }

//         nonce++;
//     }
// }

// // Main entry point
// async function main() {
//     const transactionData = readTransactions('./mempool');
//     const coinbase = createCoinbaseTransaction(50, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
//     transactionData.unshift(coinbase);

   
//     const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
//     const difficulty = '0000ffff00000000000000000000000000000000000000000000000000000000';
//     const block = mineBlock(serializedTransactions, previousHash, difficulty);

//     fs.writeFileSync('output.txt', `${block.blockHeader}\n${serializedTransactions.join('\n')}`);
//     console.log(`Block mined! Nonce: ${block.nonce}, Hash: ${block.hash}`);
// }

// main().catch(console.error);
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
        transactions.push(data); // Assuming data is already serialized
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

// Serialize transactions
function serializeTransactions(transactions) {
    return transactions.map(tx => JSON.parse(tx)); // Parse each serialized transaction
}

// Compute a Merkle Root (placeholder for a real function)
function computeMerkleRoot(transactions) {
    return crypto.createHash('sha256').update(transactions.join('')).digest('hex');
}

// Mining a block satisfying the difficulty target
function mineBlock(transactions, previousHash, difficulty) {
    let nonce = 0;
    const target = BigInt('0x' + difficulty);
    const serializedTransactions = transactions.map(tx => JSON.stringify(tx)); // Serialize transactions

    while (true) {
        const timestamp = Date.now();
        const merkleRoot = computeMerkleRoot(serializedTransactions);
        const blockHeader = `0001|${previousHash}|${merkleRoot}|${timestamp}|${difficulty}|${nonce}`;
        const blockContent = `${blockHeader}\n${serializedTransactions.join('\n')}`;
        const hash = crypto.createHash('sha256').update(blockContent).digest('hex');

        if (BigInt('0x' + hash) < target) {
            return { nonce, hash, blockHeader, blockContent };
        }

        nonce++;
    }
}

// Main entry point
async function main() {
    const transactionData = readTransactions('./mempool');
    const coinbase = createCoinbaseTransaction(50, '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    transactionData.unshift(coinbase);

    const previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    const difficulty = '0000ffff00000000000000000000000000000000000000000000000000000000';
    const block = mineBlock(transactionData, previousHash, difficulty); // Pass transactionData instead of serializedTransactions

    fs.writeFileSync('output.txt', `${block.blockHeader}\n${block.blockContent}`); // Write blockContent instead of serializedTransactions
    console.log(`Block mined! Nonce: ${block.nonce}, Hash: ${block.hash}`);
}

main().catch(console.error);
