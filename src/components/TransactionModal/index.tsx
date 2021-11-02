import {
  Commitment,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
  SYSTEM_INSTRUCTION_LAYOUTS
} from "@solana/web3.js";
import { Token, u64 } from "@solana/spl-token";
import { Pyth } from "../Icons/pyth";
import type { Moment } from "moment";
import moment from "moment";
import {
  BINARY_OPTION_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  SYSVAR_RENT_ID
} from "../../utils/ids";
import { notify } from "../../utils/notifications";
import { Button, DatePicker, Modal, InputNumber } from "antd";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import bs58 from "bs58";
import sigFigs from "../../utils/sigFigs";

import { getErrorForTransaction, sendTransaction, useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import { BinaryOptInstructionProps, useTransaction } from "../../contexts/transaction";
import { ContractsTable } from "../ContractsTable";
import { SocketContext } from "../../contexts/socket";
import { MatchableContract, MatchableContractProvider, useMatchableContract } from "../../contexts/contracts";


// export class u8 extends BN {
//     toBuffer(): Buffer;
//     static fromBuffer(buffer: Buffer): u8;
// };


import {
  publicKey,
  uint64,
  uint128,
  rustString
} from "../../utils/layout";

import { ExplorerLink } from "../ExplorerLink";
import BN from "bn.js";

export interface CurrentContractForm {
  symbol: string | undefined,
  symbol_key: string,
  expiry: Moment | null | undefined | string,
  strike: number | undefined,
  buyer_id: string | undefined,
  buyer_volume: number | undefined,
  buyer_percent: number | undefined,
  seller_id: string | undefined,
  seller_percent: number | undefined,
  seller_volume: number | undefined
}

export interface TransactionModalProps {

}

export const TransactionModal = (props: TransactionModalProps) => {
  const connection = useConnection();
  const { isModalVisible, product, selectTransaction } = useTransaction();
  const { wallet } = useWallet();
  const socket = useContext(SocketContext);

  const productSymbol = product.product.symbol;
  const productPrice = product.price.price!;
  const productAccountKey = product!.price!.productAccountKey!.toBase58();
  const productConfidence = product.price.confidence!;
  const userWalletAddress = wallet?.publicKey?.toBase58();

  const { matchableContracts } = useMatchableContract()
 

  const [ isContractListable, setContractListable ] = useState(false);
  const [ isContractMatchable, setContractMatchable ] = useState(false);
  const [ inputExpiry, setInputExpiry ] = useState<Moment | null | undefined>(moment());
  const [ inputStrike, setInputStrike ] = useState<number | undefined>(Math.round(productPrice!));
  const [ inputPercent, setInputPercent ] = useState<number | undefined>(0);
  const [ inputVolume, setInputVolume ] = useState<number | undefined>(0);
  const [ sellerPercent, setSellerPercent ] = useState<number | undefined>(0);
  const [ sellerVolume, setSellerVolume ] = useState<number | undefined>(0);
  const [ buyerVolume, setBuyerVolume ] = useState<number | undefined>(0);
  const [ buyerPercent, setBuyerPercent ] = useState<number | undefined>(0);
  const [ buyerId, setBuyerId ] = useState<string | undefined>();
  const [ sellerId, setSellerId ] = useState<string | undefined>();
  const [ existingContracts, setExistingContracts ] = useState<CurrentContractForm[]>([]);
  const [ matchingContracts, setMatchingContracts ] = useState<MatchableContract[]>([{} as MatchableContract]);
  const [ currentContract, setCurrentContract ] = useState<CurrentContractForm>({
    symbol: productSymbol,
    symbol_key: productAccountKey,
    expiry: inputExpiry,
    strike: inputStrike,
    buyer_id: buyerId,
    buyer_volume: buyerVolume,
    buyer_percent: buyerPercent,
    seller_id: sellerId,
    seller_percent: sellerPercent,
    seller_volume: sellerVolume
  });
  const [ currentContracts, setCurrentContracts ] = useState<CurrentContractForm[]>(existingContracts);

  const setCurrentToMatched = useCallback((contract) => {
    console.log("setCurrentToMatched: before: ", currentContract)
    console.log("setCurrentToMatched", contract)
    setCurrentContract({
      ...contract,
      buyer_id: userWalletAddress,
      buyer_volume: contract.seller_volume,
      buyer_percent: 100 - contract.seller_percent
    })
    setContractMatchable(true)
    setCurrentContracts([contract])
    setInputExpiry(moment(contract.expiry, 'YYYYMMDD'))
    setInputPercent(100 - contract.seller_percent)
    setInputStrike(contract.strike)
    setInputVolume(contract.seller_volume)
    setBuyerId(userWalletAddress)
    setBuyerPercent(100 - contract.seller_percent)
    setBuyerVolume(contract.seller_volume)
    setSellerId(contract.seller_id)
    setSellerPercent(contract.seller_percent)
    setSellerVolume(contract.seller_volume)
  }, [
      currentContract,
      setCurrentContracts,
      setContractMatchable,
      setInputExpiry,
      setInputStrike,
      setInputVolume,
      setBuyerVolume, 
      setSellerVolume,
      setSellerId,
      setBuyerId,
      setSellerPercent,
      setBuyerPercent,
      userWalletAddress
    ]
  )


  const [ newListableContract, setNewListableContract ] = useState<CurrentContractForm>({
    symbol: productSymbol,
    symbol_key: productAccountKey,
    expiry: inputExpiry,
    strike: inputStrike,
    buyer_id: undefined,
    buyer_volume: undefined,
    buyer_percent: undefined,
    seller_id: userWalletAddress,
    seller_percent: sellerPercent,
    seller_volume: sellerVolume
  });

  function handleReset(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    setInputExpiry(moment());
    setInputStrike(Math.round(productPrice));
    setSellerPercent(0);
    setSellerVolume(0);
    setBuyerPercent(0);
    setBuyerVolume(0);
    setContractListable(false);
    setContractMatchable(false);
  }

  function handlePercent(value: number | string | undefined) {
    setInputPercent(value as number)
    setNewListableContract({ ...newListableContract, seller_percent: value as number });
    evaluateSubmitable({ ...newListableContract, seller_percent: value as number });
  }

  function handleStrike(value: number | string | undefined) {
    setInputStrike(value as number)
    setNewListableContract({ ...newListableContract, strike: value as number });
    evaluateSubmitable({ ...newListableContract, strike: value as number });
  }

  function handleExpiry(value: Moment | null | undefined) {
    setInputExpiry((value as Moment));
    setNewListableContract({ ...newListableContract, expiry: (value as Moment)});
    evaluateSubmitable({ ...newListableContract, expiry: (value as Moment)});
  }

  function handleVolume(value: number | string | undefined) {
    setInputVolume(value as number);
    setNewListableContract({ ...newListableContract, seller_volume: value as number });
    evaluateSubmitable({ ...newListableContract, seller_volume: value as number });
  }

  function handleListContract(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
    evaluateSubmitable(newListableContract);
    if ( isContractListable === false && isContractMatchable === false) {
      return
    }
    const submitContract = {
      ...newListableContract,
      expiry: (newListableContract['expiry']! as Moment).format('YYYYMMDD')
    };
    console.log("Submitting: ", submitContract);
    socket.emit("createContract", submitContract);
  }

  function handleBuyContract(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
    console.log("handleBuyContract", currentContract)
    initializeBinaryOptTransaction()
  }

  function evaluateSubmitable(form: CurrentContractForm) {
    if ( isContractMatchable === false) {
      setSellerId(userWalletAddress)
    }
    if (matchableContracts?.length === 0) {
      setContractMatchable(false)
    }

    if (
      !form.expiry ||
      typeof form.expiry !== "object" ||
      !Object.getPrototypeOf(form.expiry).hasOwnProperty("format") ||
      !wallet
    ){
      console.log('evaluateSubmitable - bad expiry or match found or no wallet: ', form)
      setContractListable(false);
    } else { 
      if (
          form.expiry &&
          form.seller_id &&
          form?.strike! >=0 &&
          form?.seller_percent! >= 0 &&
          form?.seller_percent! <= 100 &&
          form?.seller_volume! > 0
      ) {
        setContractListable(true)
        console.log('evalSubmit good')
      } else {
        setContractListable(false)
        console.log('evalSubmit bad', form)
      };
      const submitContract = {
        ...form,
        expiry: (form.expiry as Moment).format('YYYYMMDD')
      };
      socket.emit("findMatchingContracts", submitContract)
      console.log('evalSubmit default', form)
    };
  };

  const getContracts = useCallback((productAccountKey) => {
    console.log('getContracts', productSymbol)
    socket.emit("getContracts", productAccountKey);
  }, [socket, productSymbol]);

  const populateContracts = useCallback((contracts) => {
    console.log('populateContracts', contracts)
    setExistingContracts(contracts);
    setCurrentContracts(contracts);

  }, [setExistingContracts]);

  const populateMatchingContracts = useCallback((contracts) => {
    console.log('populateMatchingContracts', contracts)
    setMatchingContracts(contracts);
    setCurrentContracts(contracts);
  }, [setMatchingContracts]);

  useEffect(() => {
    if (isModalVisible !== true) { return };
    setNewListableContract({
      symbol: productSymbol,
      symbol_key: productAccountKey,
      expiry: inputExpiry,
      strike: inputStrike,
      buyer_id: buyerId,
      buyer_volume: buyerVolume,
      buyer_percent: buyerPercent,
      seller_id: sellerId,
      seller_percent: sellerPercent,
      seller_volume: sellerVolume
    })

    socket.on("TX_CONFIRMED", selectTransaction);
    socket.on("getContracts", populateContracts);
    socket.on("findMatchingContracts", populateMatchingContracts);
    getContracts(productAccountKey);
    console.log('useEffectOn', currentContract)

    return () => {
      // console.log('useEffectOff', productSymbol)
      socket.off("TX_CONFIRMED", selectTransaction);
      socket.off("getContracts", populateContracts);
      socket.off("findMatchingContracts", populateMatchingContracts);
    }
  }, [
      currentContract,
      inputExpiry,
      inputStrike,
      sellerId,
      sellerPercent,
      sellerVolume,
      buyerId,
      buyerVolume,
      buyerPercent,
      productAccountKey,
      productSymbol,
      isModalVisible,
      isContractMatchable,
      getContracts,
      populateContracts,
      populateMatchingContracts,
      selectTransaction,
      socket
  ])

  const initializeBinaryOptTransaction = async (
    // props: BinaryOptInstructionProps
  ) => {
    if (!wallet) {
      return
    }
    // create_mint(
    //   cls,
    //   conn: Client,
    //   payer: Keypair,
    //   mint_authority: PublicKey,
    //   decimals: int,
    //   program_id: PublicKey,
    //   freeze_authority: Optional[PublicKey] = None,
    //   skip_confirmation: bool = False,
    //   recent_blockhash: Optional[Blockhash] = None,
    // ) -> Token:
        // """Create and initialize a token.
        // :param conn: RPC connection to a solana cluster.
        // :param payer: Fee payer for transaction.
        // :param mint_authority: Account or multisig that will control minting.
        // :param decimals: Location of the decimal place.
        // :param program_id: SPL Token program account.
        // :param freeze_authority: (optional) Account or multisig that can freeze token accounts.
        // :param skip_confirmation: (optional) Option to skip transaction confirmation.
        // :return: Token object for the newly minted token.
        // If skip confirmation is set to `False`, this method will block for at most 30 seconds
        // or until the transaction is confirmed.
        // """
        // # Allocate memory for the account
        // balance_needed = Token.get_min_balance_rent_for_exempt_for_mint(conn)
        // # Construct transaction
        // token, txn, payer, mint_account, opts = _TokenCore._create_mint_args(
        //     conn, payer, mint_authority, decimals, program_id, freeze_authority, skip_confirmation, balance_needed, cls
        // )
        // # Send the two instructions
        // conn.send_transaction(txn, payer, mint_account, opts=opts, recent_blockhash=recent_blockhash)
        // return cast(Token, token)

    // const mintWallet = Keypair.generate()
    // const source = mintWallet.publicKey
    // const source_account = Keypair.fromSecretKey(mintWallet.secretKey)
    // const fromAirdropSignature = await connection.requestAirdrop(
      // mintWallet.publicKey,
      // LAMPORTS_PER_SOL,
    // );
    // //wait for airdrop confirmation
    // await connection.confirmTransaction(fromAirdropSignature);

    // const mint = await Token.createMint(
      // connection,
      // mintWallet,
      // mintWallet.publicKey,
      // null,
      // 9,
      // TOKEN_PROGRAM_ID,
    // );
    // //get the token account of the fromWallet Solana address, if it does not exist, create it
    // const fromTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
      // mintWallet.publicKey,
    // );

    // // Generate a new wallet to receive newly minted token
    // var toWallet = Keypair.generate();

    // //get the token account of the toWallet Solana address, if it does not exist, create it
    // var toTokenAccount = await mint.getOrCreateAssociatedAccountInfo(
      // toWallet.publicKey,
    // );

    // //minting 1 new token to the "fromTokenAccount" account we just returned/created
    // await mint.mintTo(
      // fromTokenAccount.address, //who it goes to
      // mintWallet.publicKey, // minting authority
      // [], // multisig
      // 1000000000, // how many
    // );

    // await mint.setAuthority(
      // mint.publicKey,
      // null,
      // "MintTokens",
      // mintWallet.publicKey,
      // []
    // )

    // // Add token transfer instructions to transaction
    // var transaction = new Transaction().add(
      // Token.createTransferInstruction(
        // TOKEN_PROGRAM_ID,
        // fromTokenAccount.address,
        // toTokenAccount.address,
        // mintWallet.publicKey,
        // [],
        // 1,
      // ),
    // );

    // // Sign transaction, broadcast, and confirm
    // var signature = await sendAndConfirmTransaction(
      // connection,
      // transaction,
      // [mintWallet],
      // {commitment: 'confirmed'},
    // );
    // console.log('SIGNATURE', signature);

    
    const mintWallet = Keypair.generate()
    const source = mintWallet.publicKey
    const source_account = Keypair.fromSecretKey(mintWallet.secretKey)
    console.log(source_account.publicKey.toString())
    console.log(source.toString())
    const fromAirdropSignature = await connection.requestAirdrop(
      mintWallet.publicKey,
      LAMPORTS_PER_SOL,
    );
    //wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature);

    const escrow_mint = await Token.createMint(
      connection,
      mintWallet,
      mintWallet.publicKey,
      null,
      9,
      TOKEN_PROGRAM_ID,
    );
    const escrow_mint_account = new PublicKey(escrow_mint.publicKey)
    
    const pool = new Keypair()
    const long_escrow = new Keypair()
    const short_escrow = new Keypair()
    const long_mint = new Keypair()
    const short_mint = new Keypair()

    const pool_account = pool.publicKey
    const escrow_account = long_escrow.publicKey
    const long_token_mint_account = long_mint.publicKey
    const short_token_mint_account = short_mint.publicKey
    const mint_authority_account = source_account.publicKey
    const update_authority_account = source_account.publicKey
    const token_account = TOKEN_PROGRAM_ID
    const system_account = SYSTEM_PROGRAM_ID
    const rent_account = SYSVAR_RENT_ID

    const signers: Keypair[] = [
      source_account,
      long_mint,
      short_mint,
      long_escrow,
      source_account,
      // short_escrow, // not found?
      pool
    ];

    console.log("source_account:", source_account.publicKey?.toString())
    console.log("long_mint:", long_mint.publicKey?.toString())
    console.log("short_mint:", short_mint.publicKey?.toString())
    console.log("long_escrow:", long_escrow.publicKey?.toString())
    console.log("short_escrow:", short_escrow.publicKey?.toString())
    console.log("pool:", pool.publicKey?.toString())
    console.log("wallet:", wallet.publicKey?.toString())
    const instructions: TransactionInstruction[] = [];
    const currentTime = new Date().getTime() + 2000;
    let type = SYSTEM_INSTRUCTION_LAYOUTS.Transfer;
    let data = Buffer.from(Uint8Array.of(
      0,
      2,
      ...new BN(currentTime).toArray("le", 8),
      ...new BN(56700).toArray("le", 8),
      ...new BN(5).toArray("le", 8)
    ))

    console.log(data)
    instructions.push(
      new TransactionInstruction({
        programId: BINARY_OPTION_PROGRAM_ID,
        keys: [
          {
            pubkey: pool_account,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: escrow_mint_account,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: escrow_account,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: long_token_mint_account,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: short_token_mint_account,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: mint_authority_account,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: update_authority_account,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: token_account,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: system_account,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: rent_account,
            isSigner: false,
            isWritable: false,
          },
        ],
        data: data,
      })
    );
    if (!wallet?.publicKey) {
      throw new Error("Wallet is not connected");
    }
    console.log(instructions[0].data)
    console.info(instructions[0].keys[0].pubkey.toBytes())
    let transaction = new Transaction();
    // transaction.feePayer = wallet.publicKey
    transaction.feePayer = source_account.publicKey;
    instructions.forEach((instruction) => transaction.add(instruction))

    transaction.recentBlockhash = (
      await connection.getRecentBlockhash("max")
    ).blockhash;

    console.log(transaction)
    // transaction = await wallet.signTransaction(transaction);

    signers.forEach((s) => {
      console.log("signing with: ", s.publicKey.toString())
    });
    transaction.sign(...signers)
    console.log(transaction)

    const rawTransaction = transaction.serialize();

    let sendOptions = {
      skipPreflight: false,
      preflightCommitment: "confirmed" as Commitment,
    };

    let confirmOptions = {
      skipPreflight: true,
      commitment: "confirmed",
    };
    const txid = await connection.sendRawTransaction(rawTransaction, sendOptions);

    const awaitConfirmation = true;

    if (awaitConfirmation) {
      const status = (
        await connection.confirmTransaction(
          txid,
          confirmOptions && (confirmOptions.commitment as any)
        )
      ).value;
      console.log(status)
      if (status?.err) {
        const errors = await getErrorForTransaction(connection, txid);
        notify({
          message: "Transaction failed...",
          description: (
            <>
              {errors.map((err) => (
                <div>{err}</div>
              ))}
              <ExplorerLink address={txid} type="transaction" />
            </>
          ),
          type: "error",
        });
  
        throw new Error(
          `Raw transaction ${txid} failed (${JSON.stringify(status)})`
        );
      }
    }
  }

  return (
    <Modal
      title={
        <div className="transaction-modal-title">
          {productAccountKey}
        </div>
      }
      className="transaction-modal"
      okText="Connect"
      visible={isModalVisible}
      okButtonProps={{ style: { display: "none" } }}
      onCancel={selectTransaction}
      width="auto"
    >
      {/* Symbol */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          SYMBOL:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          {productSymbol}
        </div>
      </div>

      {/* Current Price */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          CURRENT_PRICE:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          {`$${sigFigs(productPrice)}`}
        </div>
      </div>

      {/* Confidence */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          CONFIDENCE:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          {`\xB1$${sigFigs(productConfidence)}`}
        </div>
      </div>

      {/* Input collection */}
      {/* Strike */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Strike:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          <InputNumber value={inputStrike} onChange={handleStrike}/>
        </div>
      </div>

      {/* Expiry */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Expiry:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          <DatePicker value={inputExpiry} onChange={handleExpiry}/>
        </div>
      </div>

      {/* Quantity */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Quantity:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          <InputNumber value={inputVolume} onChange={handleVolume}/>
        </div>
      </div>

      {/* Percent */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Percent Chance:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          <InputNumber value={inputPercent} onChange={handlePercent}/>
        </div>
      </div>

      <div className="transaction-modal-wrapper-button">
        <Button
          size="large"
          type={"primary"}
          className="transaction-modal-button-buy"
          ghost={!isContractListable && !isContractMatchable}
          disabled={!isContractListable && !isContractMatchable}
          onClick={isContractMatchable ? handleBuyContract : isContractListable ? handleListContract: undefined}
        >
          <Pyth />
          {isContractMatchable ? "Buy Match" : isContractListable ? "List": ""}
        </Button>
        <Button
          size="large"
          type={"dashed"}
          className="transaction-modal-button-reset"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>

      <div className="contracts-existing">
        All contracts for {productSymbol}
        <MatchableContractProvider matchableContracts={currentContracts} selectContract={setCurrentToMatched}>
          <ContractsTable />
        </MatchableContractProvider>
      </div>
    </Modal>
  );
}
