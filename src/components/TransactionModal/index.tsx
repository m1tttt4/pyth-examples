import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Token } from "@solana/spl-token";
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
import sigFigs from "../../utils/sigFigs";
import { DEVNET_KEYPAIR_A, DEVNET_KEYPAIR_B} from "../../utils/devnetKeypairs";
import { useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import { useTransaction } from "../../contexts/transaction";
import { ContractsTable } from "../ContractsTable";
import { SocketContext } from "../../contexts/socket";
import { MatchableContract, MatchableContractProvider, useMatchableContract } from "../../contexts/contracts";
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


const initializeBinaryOptTransaction = async (connection: Connection) => {

  let sourceAccount = new Keypair()

  let airdropSignature = await connection.requestAirdrop(
    sourceAccount.publicKey,
    LAMPORTS_PER_SOL,
  );

  await connection.confirmTransaction(airdropSignature);

  let token = await Token.createMint(
    connection,
    sourceAccount,
    sourceAccount.publicKey,
    null,
    9,
    TOKEN_PROGRAM_ID,
  );

  console.log(token)
  console.log("token pubkey: ", token.publicKey.toString());

  const pool = new Keypair()
  const longEscrow = new Keypair()
  const shortEscrow = new Keypair()
  const longMint = new Keypair()
  const shortMint = new Keypair()
  const poolAccount = pool.publicKey
  const escrowMintAccount = token.publicKey
  const escrowAccount = longEscrow.publicKey
  const longTokenMintAccount = longMint.publicKey
  const shortTokenMintAccount = shortMint.publicKey
  const mintAuthorityAccount = sourceAccount.publicKey
  const updateAuthorityAccount = sourceAccount.publicKey
  const tokenAccount = TOKEN_PROGRAM_ID
  const systemAccount = SYSTEM_PROGRAM_ID
  const rentAccount = SYSVAR_RENT_ID

  console.log(
    "sourceAccount", sourceAccount.publicKey.toString(),
    "\nlongMint", longMint.publicKey.toString(),
    "\nshortMint", shortMint.publicKey.toString(),
    "\nlongEscrow", longEscrow.publicKey.toString(),
    "\nshortEscrow", shortEscrow.publicKey.toString(),
    "\npool", pool.publicKey.toString()
  )
  const signers = [
    sourceAccount,
    longMint,
    shortMint,
    longEscrow,
    // shortEscrow,
    pool
  ]

  const decimals = 2
  const expiry = new Date().getTime() + 2000
  const strike = 56700
  const strikeExponent = 5

  const initBinaryOptionIx = initializeBinaryOptionInstruction(
    poolAccount,
    escrowMintAccount,
    escrowAccount,
    longTokenMintAccount,
    shortTokenMintAccount,
    mintAuthorityAccount,
    updateAuthorityAccount,
    tokenAccount,
    systemAccount,
    rentAccount,
    decimals,
    expiry,
    strike,
    strikeExponent
  )
  console.log(initBinaryOptionIx)
  
  let transaction = new Transaction().add(initBinaryOptionIx)

  // const txid = 
  await sendAndConfirmTransaction(connection, transaction, signers, {
    commitment: "confirmed"
  }).then((txid) => {
    const devTx = txid + '?cluster=devnet'
    notify({
      message: "Transaction executed on Solana",
      description: (
        <>
          <ExplorerLink address={devTx} type="transaction" />
        </>
      ),
      type: "success",
    });
  });
}

const initializeBinaryOptionInstruction = (
  poolAccount: PublicKey,
  escrowMintAccount: PublicKey,
  escrowAccount: PublicKey,
  longTokenMintAccount: PublicKey,
  shortTokenMintAccount: PublicKey,
  mintAuthorityAccount: PublicKey,
  updateAuthorityAccount: PublicKey,
  tokenAccount: PublicKey,
  systemAccount: PublicKey,
  rentAccount: PublicKey,
  decimals: number, // u8
  expiry: number, // u64
  strike: number, // u64
  strikeExponent: number // i64 - currently u64 for testing
): TransactionInstruction => {
  let data = Buffer.from(Uint8Array.of(
    0,
    decimals,
    ...new BN(expiry).toArray("le", 8),
    ...new BN(strike).toArray("le", 8),
    ...new BN(strikeExponent).toArray("le", 8)
  ))
  return new TransactionInstruction({
    programId: BINARY_OPTION_PROGRAM_ID,
    keys: [ // original
      { pubkey: poolAccount, isSigner: true, isWritable: true },
      { pubkey: escrowMintAccount, isSigner: false, isWritable: false },
      { pubkey: escrowAccount, isSigner: true, isWritable: true },
      { pubkey: longTokenMintAccount, isSigner: true, isWritable: true },
      { pubkey: shortTokenMintAccount, isSigner: true, isWritable: true },
      { pubkey: mintAuthorityAccount, isSigner: true, isWritable: false },
      { pubkey: updateAuthorityAccount, isSigner: true, isWritable: false },
      { pubkey: tokenAccount, isSigner: false, isWritable: false },
      { pubkey: systemAccount, isSigner: false, isWritable: false },
      { pubkey: rentAccount, isSigner: false, isWritable: false },
    ],
    data: data,
  })
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
  const [ inputPercent, setInputPercent ] = useState<number | undefined>(49);
  const [ inputVolume, setInputVolume ] = useState<number | undefined>(0);
  const [ sellerPercent, setSellerPercent ] = useState<number | undefined>(49);
  const [ sellerVolume, setSellerVolume ] = useState<number | undefined>(0);
  const [ buyerVolume, setBuyerVolume ] = useState<number | undefined>(0);
  const [ buyerPercent, setBuyerPercent ] = useState<number | undefined>(49);
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
    setInputVolume(0);
    setSellerPercent(50);
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
    initializeBinaryOptTransaction(connection)
  }

  function evaluateSubmitable(form: CurrentContractForm) {
    if ( isContractMatchable === false) {
      setSellerId(userWalletAddress)
    }
    if (matchableContracts?.length === 0) {
      console.log('matchableContracts? ', matchableContracts)
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
      setContractMatchable(false);
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
        setContractMatchable(false);

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

      {/* Inputs*/}

      {/* Strike */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Strike:
        </div>
        <div className='transaction-modal-input-number' >
          <InputNumber min={0.000000001} value={inputStrike} onChange={handleStrike}/>
        </div>
      </div>

      {/* Expiry */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Expiry:
        </div>
        <div className='transaction-modal-input-date' >
          <DatePicker value={inputExpiry} onChange={handleExpiry}/>
        </div>
      </div>

      {/* Quantity */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Quantity:
        </div>
        <div className='transaction-modal-input-number' >
          <InputNumber min={0} value={inputVolume} onChange={handleVolume}/>
        </div>
      </div>

      {/* Percent */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Percent Chance:
        </div>
        <div className='transaction-modal-input-number' >
          <InputNumber min={1} max={99} value={inputPercent} onChange={handlePercent}/>
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
  )
}
