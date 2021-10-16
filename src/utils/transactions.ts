import { Account, Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { sendTransaction } from "../contexts/connection";
import { notify } from "./notifications";
import { devnetTransaction } from "../components/Notification";
import { PYTH_HELLO_WORLD } from "./ids";
import { WalletAdapter } from "../contexts/wallet";


export function TestTransaction(
    connection: Connection,
    wallet: WalletAdapter | undefined,
    productKey: PublicKey,
    priceKey: PublicKey) {
  if (!wallet) {
    return;
  }
	const instructions: TransactionInstruction[] = [];
	const signers: Account[] = [];
	instructions.push(
		new TransactionInstruction({
			keys: [
				{
					pubkey: productKey,
					isSigner: false,
					isWritable: false,
				},
				{
					pubkey: priceKey,
					isSigner: false,
					isWritable: false,
				},
			],
			programId: PYTH_HELLO_WORLD,
		})
	);
	sendTransaction(connection, wallet, instructions, signers).then((txid) => {
    notify({
      message: "Transaction executed on Solana",
      description: (
        {devnetTransaction}
      ),
      type: "success",
    });
	});
};
