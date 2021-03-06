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
    Account, Deadline, Id, NamespaceId, NetworkType, RegisterNamespaceTransaction, Transaction,
    TransactionHttp
} from "nem2-sdk";

// Replace with private key
const privateKey = process.env.PRIVATE_KEY as string;

const account = Account.createFromPrivateKey(privateKey, NetworkType.MIJIN_TEST);

//Replace with root namespace name
const rootNamespaceName = 'foo';

//Replace with subnamespace name
const subnamespace = 'bar';

const registerNamespaceTransaction = RegisterNamespaceTransaction.createSubNamespace(
    Deadline.create(),
    subnamespace,
    rootNamespaceName,
    NetworkType.MIJIN_TEST
);

const signedTransaction = account.sign(registerNamespaceTransaction);

const transactionHttp = new TransactionHttp('http://localhost:3000');

transactionHttp.announce(signedTransaction).subscribe(x => console.log(x));