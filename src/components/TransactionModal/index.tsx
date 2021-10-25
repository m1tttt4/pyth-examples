import type { PublicKey } from "@solana/web3.js";
import { Pyth } from "../Icons/pyth";
import type { Moment } from "moment";
import { Button, DatePicker, Modal, Input, InputNumber } from "antd";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import sigFigs from "../../utils/sigFigs";
import { SocketContext } from "../../contexts/socket";
import { useWallet } from "../../contexts/wallet";
import { useTransaction } from "../../contexts/transaction";


export interface AvailableContractForm {
  symbol: string,
  expiry: Moment | string,
  strike: number,
  seller_id: PublicKey,
  seller_percent: number,
  seller_volume: number | undefined
}

export interface PurchaseContractForm {
  symbol: string,
  expiry: Moment | null | undefined,
  strike: number | undefined,
  buyer_id: PublicKey,
  buyer_percent: number,
  buyer_volume: number | undefined
}

export interface TransactionModalProps {

}

export const TransactionModal = (props: TransactionModalProps) => {
  const [isSubmitable, setIsSubmitable] = useState(false);
  const { wallet } = useWallet();
  const { isModalVisible, product, selectTransaction } = useTransaction();
  // console.log( isModalVisible, product, selectTransaction )
  const productSymbol = product.product.symbol;
  const productPrice = product.price.price;
  const productAccountKey = product!.price!.productAccountKey!.toBase58();
  const productConfidence = product.price.confidence;


  const [ purchaseOrder, setPurchaseOrder ] = useState<PurchaseContractForm>();
  const [ inputExpiry, setInputExpiry ] = useState<Moment | null | undefined>();
  const [ inputStrike, setInputStrike ] = useState<number>();
  const [ inputPercent, setInputPercent ] = useState<number>();
  const [ inputVolume, setInputVolume ] = useState<number>();
  const [ existingContracts, setExistingContracts ] = useState<AvailableContractForm[]>();

  const socket = useContext(SocketContext);
  const getContracts = useCallback(() => {
    // console.log("getContracts", product);
    socket.emit("getContracts", productAccountKey);
  }, []);
  const populateContracts = useCallback((contracts) => {
    // console.log('populateContracts', contracts);
    setExistingContracts(contracts);
  }, [setExistingContracts]);


  function handlePercent(value: number) {
    setInputPercent(value)
  }
  function handleStrike(value: number | string | undefined) {
    setInputStrike(value as number)
  }
  function handleExpiry(value: Moment | null | undefined) {
    setInputExpiry(value)
  }
  function handleVolume(value: number | string | undefined) {
    setInputVolume(value as number)
  }
  function handleSubmitPurchase(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
    const submitPurchaseForm = {
      "symbol": productSymbol,
      "expiry": inputExpiry,
      "strike": inputStrike,
      "buyer_id": wallet!.publicKey!.toBase58(),
      "buyer_percent": inputPercent,
      "buyer_volume": inputVolume,
    }
    // setPurchaseOrder(submitPurchaseForm);
    console.log(submitPurchaseForm);
  }

  function evaluateSubmitable() {
    // if ( optionId && buyerId && buyerPercent && buyerVolume ) {
    if ( inputVolume ) {
      setIsSubmitable(true) 
    }
  }

  
  useEffect(() => {
    socket.on("TX_CONFIRMED", selectTransaction);
    socket.on("getContracts", populateContracts);
    // console.log("Modal useEffect", productSymbol)
    getContracts();

    return () => {
      socket.off("TX_CONFIRMED", selectTransaction);
      socket.off("getContracts", populateContracts);
    }
  }, [getContracts, populateContracts, product, selectTransaction, socket])


  // console.log(product)
  return (
    <Modal
      title={
        <div className="transaction-modal-title">
          {productAccountKey}
        </div>
      }  
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

      <div className="transaction-modal-wrapper-button">
        <Button
          size="large"
          type={"primary"}
          className="transaction-modal-button-buy"
          ghost={!isSubmitable}
          disabled={!isSubmitable}
          onClick={handleSubmitPurchase}
        >
          <Pyth /> Buy
        </Button>
        <Button
          size="large"
          type={"primary"}
          className="transaction-modal-button-sell"
          ghost={!isSubmitable}
          disabled={isSubmitable}
          onClick={handleSubmitPurchase}
        >
          Sell <Pyth />
        </Button>
      </div>
      <div className="contracts-existing">
        { JSON.stringify(existingContracts) }
      </div>
    </Modal>
  );
}
