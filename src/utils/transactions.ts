import { Connection, PublicKey, ConfirmedTransaction } from "@solana/web3.js";

export class SignedTransaction {
  constructor(
    public signature: string,
    public confirmedTransaction: ConfirmedTransaction) {}
}
export async function getTransactions(
  connection: Connection,
  address: PublicKey
): Promise<Array<SignedTransaction>> {
  const transactionSignatures = await connection.getConfirmedSignaturesForAddress2(address);
  const transactions = new Array<SignedTransaction>();
  for (let i = 0; i < transactionSignatures.length; i++) {
    const signature = transactionSignatures[i].signature;
    const confirmedTransaction = await connection.getConfirmedTransaction(
      signature
    );
    if (confirmedTransaction) {
      const signedTransaction = new SignedTransaction(
        signature,
        confirmedTransaction
      );
      console.log(signedTransaction);
      transactions.push(signedTransaction);
    }
  }
  return transactions;
}
