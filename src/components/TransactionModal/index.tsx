import { Account, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Pyth } from "../Icons/pyth";
import type { Moment } from "moment";
import moment from "moment";
import { BINARY_OPTIONS_ID } from "../../utils/ids";
import { notify } from "../../utils/notifications";
import { Button, DatePicker, Modal, InputNumber } from "antd";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import sigFigs from "../../utils/sigFigs";

import { sendTransaction, useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import { useTransaction } from "../../contexts/transaction";
import { ContractsTable } from "../ContractsTable";
import { SocketContext } from "../../contexts/socket";

export interface AvailableContractForm {
  symbol: string | undefined,
  symbol_key: string,
  expiry: Moment | null | undefined | string,
  strike: number | undefined,
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
  const productPrice = product.price.price;
  const productAccountKey = product!.price!.productAccountKey!.toBase58();
  const productConfidence = product.price.confidence;
  const userWalletAddress = wallet?.publicKey?.toBase58();

  const [ isContractListable, setContractListable ] = useState(false);
  const [ isContractMatchable, setContractMatchable ] = useState(false);
  const [ inputExpiry, setInputExpiry ] = useState<Moment | null | undefined>(moment());
  const [ inputStrike, setInputStrike ] = useState<number | undefined>(Math.round(productPrice));
  const [ inputPercent, setInputPercent ] = useState<number | undefined>(0);
  const [ inputVolume, setInputVolume ] = useState<number | undefined>(0);
  const [ existingContracts, setExistingContracts ] = useState<AvailableContractForm[]>([]);
  const [ matchingContracts, setMatchingContracts ] = useState<AvailableContractForm[]>([]);

  const [ newAvailableContract, setNewAvailableContract ] = useState<AvailableContractForm>({
    symbol: productSymbol,
    symbol_key: productAccountKey,
    expiry: inputExpiry,
    strike: inputStrike,
    seller_id: userWalletAddress,
    seller_percent: inputPercent,
    seller_volume: inputVolume
  });

  function handleReset(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    setInputExpiry(moment());
    setInputStrike(Math.round(productPrice));
    setInputPercent(0);
    setInputVolume(0);
    setContractListable(false);
  }
    
  function handlePercent(value: number | string | undefined) {
    setInputPercent(value as number)
    setNewAvailableContract({ ...newAvailableContract, seller_percent: value as number });
    evaluateSubmitable({ ...newAvailableContract, seller_percent: value as number });
  }

  function handleStrike(value: number | string | undefined) {
    setInputStrike(value as number)
    setNewAvailableContract({ ...newAvailableContract, strike: value as number });
    evaluateSubmitable({ ...newAvailableContract, strike: value as number });
  }

  function handleExpiry(value: Moment | null | undefined) {
    setInputExpiry((value as Moment));
    setNewAvailableContract({ ...newAvailableContract, expiry: (value as Moment)});
    evaluateSubmitable({ ...newAvailableContract, expiry: (value as Moment)});
  }

  function handleVolume(value: number | string | undefined) {
    setInputVolume(value as number);
    setNewAvailableContract({ ...newAvailableContract, seller_volume: value as number });
    evaluateSubmitable({ ...newAvailableContract, seller_volume: value as number });
  }

  function handleSubmitPurchase(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
    evaluateSubmitable(newAvailableContract);
    if ( isContractListable === false ) { return };
    const submitContract = {
      ...newAvailableContract,
      expiry: (newAvailableContract['expiry']! as Moment).format('YYYYMMDD')
    };
    console.log("Submitting: ", submitContract);
    socket.emit("createContract", submitContract);
  }

  function evaluateSubmitable(form: AvailableContractForm) {
    if ( 
      !form.expiry ||
      typeof form.expiry !== "object" ||
      !Object.getPrototypeOf(form.expiry).hasOwnProperty("format") ||
      matchingContracts.length > 0 ||
      !wallet
    ){
      console.log('evaluateSubmitable - bad expiry or match found or no wallet: ', form)
      setContractListable(false);
      return
    };

    if ( 
        form.expiry &&
        form.strike &&
        form.seller_id &&
        form?.seller_percent! >= 0 &&
        form?.seller_percent! <= 100 &&
        form?.seller_volume! > 0
    ) {
      console.log('evaluateSubmitable - looks good: ', form)
      const submitContract = {
        ...form,
        expiry: (form.expiry as Moment).format('YYYYMMDD')
      };
      setContractListable(true) 
      socket.emit("findMatchingContracts", submitContract)
    } else {
      console.log('evaluateSubmitable - looks bad: ', form)
      setContractListable(false)
    };
  };

  const getContracts = useCallback((productAccountKey) => {
    console.log('getContracts', productSymbol)
    socket.emit("getContracts", productAccountKey);
  }, [socket, productSymbol]);
  
  const populateContracts = useCallback((contracts) => {
    console.log('populateContracts', contracts)
    setExistingContracts(contracts);
  }, [setExistingContracts]);

  const populateMatchingContracts = useCallback((contracts) => {
    console.log('populateMatchingContracts', contracts)
    setMatchingContracts(contracts);
    setExistingContracts(contracts);
  }, [setMatchingContracts, setExistingContracts]);
  
  useEffect(() => {
    if (isModalVisible !== true) { return };
    setNewAvailableContract({
      symbol: productSymbol,
      symbol_key: productAccountKey,
      expiry: inputExpiry,
      strike: inputStrike,
      seller_id: userWalletAddress,
      seller_percent: inputPercent,
      seller_volume: inputVolume
    })

    
    socket.on("TX_CONFIRMED", selectTransaction);
    socket.on("getContracts", populateContracts);
    socket.on("findMatchingContracts", populateMatchingContracts);
    getContracts(productAccountKey);
    console.log('useEffectOn', productSymbol)

    return () => {
      console.log('useEffectOff', productSymbol)
      socket.off("TX_CONFIRMED", selectTransaction);
      socket.off("getContracts", populateContracts);
      socket.off("findMatchingContracts", populateMatchingContracts);
    }
  }, [
    inputExpiry,
    inputPercent,
    inputStrike,
    inputVolume,
    userWalletAddress,
    productAccountKey,
    productSymbol,
    isModalVisible,
    getContracts,
    populateContracts,
    populateMatchingContracts,
    selectTransaction,
    socket
  ])

  const submitTransaction = (publicKey0: PublicKey, publicKey1: PublicKey) => {
    if (!wallet) {
      return
    }
    const instructions: TransactionInstruction[] = [];
    const signers: Account[] = [];

    instructions.push(
      new TransactionInstruction({
        keys: [
          {
            pubkey: new PublicKey(publicKey0),
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: new PublicKey(publicKey1),
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: BINARY_OPTIONS_ID,
      })
    );


    sendTransaction(connection, wallet, instructions, signers).then((txid) => {
      notify({
        message: "Transaction executed on Solana",
        description: (
          <a
            href={`https://explorer.solana.com/tx/${txid}?cluster=devnet`}
            // eslint-disable-next-line react/jsx-no-target-blank
            target="_blank"
          >
            Explorer Link
          </a>
        ),
        type: "success",
      });
    });
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
      width={450}
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
          ghost={!isContractListable}
          disabled={!isContractListable}
          onClick={handleSubmitPurchase}
        >
          <Pyth /> List new contract
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

      {/*
      <div className="contracts-matching">
        Matching contracts for {productSymbol}
        <ContractsTable contracts={matchingContracts} handleSubmitPurchase={handleSubmitPurchase}/>
      </div>
      */}

      <div className="contracts-existing">
        All contracts for {productSymbol}
        <ContractsTable isContractMatchable={isContractMatchable} contracts={existingContracts} handleSubmitPurchase={handleSubmitPurchase}/>
      </div>
    </Modal>
  );
}
