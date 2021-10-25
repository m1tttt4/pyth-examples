import type { PublicKey } from "@solana/web3.js";
import { Pyth } from "./../components/Icons/pyth";
import type { Moment } from "moment";
import { Button, DatePicker, Modal, Input, InputNumber } from "antd";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import sigFigs from "./../utils/sigFigs";
import { SocketContext } from "./socket";
import { WalletAdapter } from "./wallet";
import { useTransaction } from "../../contexts/transaction";

const TransactionModalContext = React.createContext<{
  product?: object;
  wallet: WalletAdapter | undefined;
  selectTransactionModal: () => void;
}>({
  product: {},
  wallet: undefined,
  selectTransactionModal() {},
});

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

export function TransactionProvider({
    children = null as any,
    product = {} as any,
    wallet = null as any
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitable, setIsSubmitable] = useState(false);
  const selectTransactionModal = useCallback(() => {
    setIsModalVisible(true);
    console.log("getContracts", product);
    console.log("getContracts", product.price.productAccountKey.toBase58());
    socket.emit("getContracts", product.price.productAccountKey.toBase58());
  }, []);
  const close = useCallback(() => setIsModalVisible(false), []);
  const [ purchaseOrder, setPurchaseOrder ] = useState<PurchaseContractForm>();
  const [ inputExpiry, setInputExpiry ] = useState<Moment | null | undefined>();
  const [ inputStrike, setInputStrike ] = useState<number>();
  const [ inputPercent, setInputPercent ] = useState<number>();
  const [ inputVolume, setInputVolume ] = useState<number>();
  const [ existingContracts, setExistingContracts ] = useState<AvailableContractForm[]>();

  const socket = useContext(SocketContext);

  const populateContracts = useCallback((contracts) => {
    console.log('populateContracts', contracts);
    setExistingContracts(contracts);
    console.log(wallet)
  }, []);


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
      "symbol": product.product.generic_symbol,
      "expiry": inputExpiry,
      "strike": inputStrike,
      "buyer_id": wallet.publicKey.toBase58(),
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
    socket.on("TX_CONFIRMED", close);
    socket.on("getContracts", populateContracts);

    return () => {
      socket.off("TX_CONFIRMED", close);
      socket.off("getContracts", populateContracts);
    }
  })


  // console.log(product)
  return (
    <TransactionModalContext.Provider
      value={{
        product,
        wallet,
        selectTransactionModal,
      }}
    >
      {children}
      <Modal
        title={
          <div className="transaction-modal-title">
            {product.price.productAccountKey.toBase58()}
          </div>
        }  
        okText="Connect"
        visible={isModalVisible}
        okButtonProps={{ style: { display: "none" } }}
        onCancel={close}
        width={450}
      >
        {/* All product keys */}
        {Object.keys(product.product).map((value: string) => (
          <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
            <div style={{ float: 'left', width: 'auto' }}>
              {value.toUpperCase()}:
            </div>
            <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
              {product.product[value]}
            </div>
          </div>
        ))}

        {/* Current Price */}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            CURRENT_PRICE:
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            {`$${sigFigs(product.price.price)}`}
          </div>
        </div>
        
        {/* Confidence */}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            CONFIDENCE:
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            {`\xB1$${sigFigs(product.price.confidence)}`}
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
            disabled={!isSubmitable}
            onClick={handleSubmitPurchase}
          >
            Sell <Pyth />
          </Button>
        </div>
        <div className="contracts-existing">
          { JSON.stringify(existingContracts) }
        </div>
      </Modal>
    </TransactionModalContext.Provider>
  );
}
