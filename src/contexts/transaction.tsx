import type { PublicKey } from "@solana/web3.js";
import { Pyth } from "./../components/Icons/pyth";
import type { Moment } from "moment";
import { Button, DatePicker, Modal, Input, InputNumber, Space } from "antd";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import sigFigs from "./../utils/sigFigs";
import { SocketContext } from "./socket";

const TransactionModalContext = React.createContext<{
  product?: object;
  selectTransactionModal: () => void;
}>({
  product: {},
  selectTransactionModal() {},
});

export interface PurchaseOrderForm {
  option_id: {},
  buyer_id: PublicKey | undefined,
  buyer_percent: number | undefined,
  buyer_volume: number | undefined
}

export function TransactionProvider({ children = null as any, product = {} as any }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSubmitable, setIsSubmitable] = useState(false);
  const selectTransactionModal = useCallback(() => setIsModalVisible(true), []);
  const close = useCallback(() => setIsModalVisible(false), []);
  
  const [ purchaseOrder, setPurchaseOrder ] = useState<PurchaseOrderForm>();
  const [ optionId, setOptionId ] = useState({});
  const [ buyerId, setPurchaseId ] = useState<PublicKey | undefined>();
  const [ buyerPercent, setPurchasePercent ] = useState<number>();
  const [ buyerVolume, setPurchaseVolume ] = useState<number>();
  const [ buyerStrike, setPurchaseStrike ] = useState<number>();
  const [ buyerExpiry, setPurchaseExpiry ] = useState<Moment | null | undefined>();

  const socket = useContext(SocketContext);

  function handleOptionId(event: React.ChangeEvent<HTMLInputElement>) {
    setOptionId(product.product.symbol)
  }
  function handlePercent(value: number) {
    setPurchasePercent(value)
  }
  function handleStrike(value: number | string | undefined) {
    setPurchaseStrike(value as number)
  }
  function handleExpiry(value: Moment | null | undefined) {
    setPurchaseExpiry(value)
  }
  function handleVolume(value: number | string | undefined) {
    setPurchaseVolume(value as number)
    setPurchaseOrder({
      "option_id": optionId,
      "buyer_id": buyerId,
      "buyer_percent": buyerPercent,
      "buyer_volume": value as number
    });
    evaluateSubmitable();
  }
  function handleSubmitPurchase(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
    const submitPurchaseForm = {
      "option_id": optionId,
      "buyer_id": buyerId,
      "buyer_percent": buyerPercent,
      "buyer_volume": buyerVolume,
    }
    setPurchaseOrder(submitPurchaseForm);
    console.log(submitPurchaseForm);
  }

  function evaluateSubmitable() {
    // if ( optionId && buyerId && buyerPercent && buyerVolume ) {
    if ( buyerVolume ) {
      setIsSubmitable(true) 
    }
  }
  
  useEffect(() => {
    socket.on("TX_CONFIRMED", close)
  })

  console.log(product)
  return (
    <TransactionModalContext.Provider
      value={{
        product,
        selectTransactionModal,
      }}
    >
      {children}
      <Modal
        title={
          <div className="transaction-modal-title">
            {product.price.productAccountKey.toString()}
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
            <InputNumber value={buyerStrike} onChange={handleStrike}/>
          </div>
        </div>

        {/* Expiry */}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Expiry:
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <DatePicker value={buyerExpiry} onChange={handleExpiry}/>
          </div>
        </div>

        {/* Quantity */}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Quantity: 
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <InputNumber value={buyerVolume} onChange={handleVolume}/>
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
      </Modal>
    </TransactionModalContext.Provider>
  );
}

export function useTransaction() {
  const { product, selectTransactionModal } = useContext(TransactionModalContext);
  return {
    product,
    selectTransactionModal,
  };
}
