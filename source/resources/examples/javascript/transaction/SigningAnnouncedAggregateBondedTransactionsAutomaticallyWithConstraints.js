/*
 *
 * Copyright 2018 NEM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const nem2Sdk = require("nem2-sdk");
const Account = nem2Sdk.Account,
    NetworkType = nem2Sdk.NetworkType,
    Listener = nem2Sdk.AccountHttp,
    TransactionHttp = nem2Sdk.TransactionHttp,
    CosignatureTransaction = nem2Sdk.CosignatureTransaction;

const privateKey = process.env.PRIVATE_KEY;

const account = Account.createFromPrivateKey(privateKey, NetworkType.MIJIN_TEST);

const listener = new Listener('http://localhost:3000');

const transactionHttp = new TransactionHttp('http://localhost:3000');

listener.open().then(() => {

    listener.aggregateBondedAdded(account.address)
        .filter((_) => _.innerTransactions.length == 2)
        .filter((transaction) => !transaction.signedByAccount(account.publicAccount))
        .filter((_) => validTransaction(_.innerTransactions[0], account.publicAccount) || validTransaction(_.innerTransactions[1], account.publicAccount))
        .subscribe((aggregateTransaction) => {

            const cosignatureTransaction = CosignatureTransaction.create(aggregateTransaction);
            const cosignatureSignedTransaction = account.signCosignatureTransaction(cosignatureTransaction);
            transactionHttp.announceAggregateBondedCosignature(cosignatureSignedTransaction).subscribe(x => console.log(x));
        });
});

function validTransaction(transaction, publicAccount) {
    return transaction instanceof TransferTransaction &&
        transaction.signer.equals(publicAccount) &&
        transaction.mosaics.length == 1 &&
        transaction.mosaics[0].id.equals(XEM.MOSAIC_ID) &&
        transaction.mosaics[0].amount.compact() < XEM.createRelative(100).amount.compact();
}