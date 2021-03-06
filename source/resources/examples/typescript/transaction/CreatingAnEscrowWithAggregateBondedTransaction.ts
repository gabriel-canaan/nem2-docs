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

import {
    Account, AggregateTransaction, Deadline, Listener, LockFundsTransaction,
    Mosaic, MosaicId, NetworkType, PlainMessage, PublicAccount, TransactionHttp,
    TransferTransaction, UInt64, XEM
} from 'nem2-sdk';



// Replace with private key
const alicePrivateKey = process.env.PRIVATE_KEY as string;

// Replace with public key
const ticketDistributorPublicKey = 'F82527075248B043994F1CAFD965F3848324C9ABFEC506BC05FBCF5DD7307C9D';

const aliceAccount = Account.createFromPrivateKey(alicePrivateKey, NetworkType.MIJIN_TEST);
const ticketDistributorPublicAccount = PublicAccount.createFromPublicKey( ticketDistributorPublicKey, NetworkType.MIJIN_TEST);

const aliceToTicketDistributorTx = TransferTransaction.create(
    Deadline.create(),
    ticketDistributorPublicAccount.address,
    [XEM.createRelative(100)],
    PlainMessage.create('send 100 nem:xem to distributor'),
    NetworkType.MIJIN_TEST,
);

const ticketDistributorToAliceTx = TransferTransaction.create(
    Deadline.create(),
    aliceAccount.address,
    [new Mosaic( new MosaicId('museum:ticket'), UInt64.fromUint(1))],
    PlainMessage.create('send 1 museum:ticket to alice'),
    NetworkType.MIJIN_TEST,
);

const aggregateTransaction = AggregateTransaction.createBonded(Deadline.create(),
    [
        aliceToTicketDistributorTx.toAggregate(aliceAccount.publicAccount),
        ticketDistributorToAliceTx.toAggregate(ticketDistributorPublicAccount),
    ],
    NetworkType.MIJIN_TEST);


const signedTransaction = aliceAccount.sign(aggregateTransaction);

// Creating the lock funds transaction

const lockFundsTransaction = LockFundsTransaction.create(
    Deadline.create(),
    XEM.createRelative(10),
    UInt64.fromUint(480),
    signedTransaction,
    NetworkType.MIJIN_TEST);

const lockFundsTransactionSigned = aliceAccount.sign(lockFundsTransaction);

const transactionHttp = new TransactionHttp('http://localhost:3000/');

// announce signed transaction
const listener = new Listener('http://localhost:3000');

listener.open().then(() => {

    transactionHttp.announce(lockFundsTransactionSigned).subscribe(x => console.log(x));

    listener.confirmed(aliceAccount.address).subscribe(transaction => {

        if (transaction.transactionInfo && transaction.transactionInfo.hash == lockFundsTransactionSigned.hash) {
            transactionHttp.announceAggregateBonded(signedTransaction).subscribe(x => console.log(x));
        }
    });
});