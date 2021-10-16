import type { PublicKey } from "@solana/web3.js";
import { Pyth } from "./../components/Icons/pyth";
import Wallet from "@project-serum/sol-wallet-adapter";
import { Transaction } from "@solana/web3.js";
import { Button, Modal, InputNumber } from "antd";
import EventEmitter from "eventemitter3";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { notify } from "./../utils/notifications";
import sigFigs from "./../utils/sigFigs";
import { useLocalStorageState } from "./../utils/utils";
// import { InputNumber } from "./../components/Input/numeric";

const TransactionContext = React.createContext<{
  product?: object;
  selectTransaction: () => void;
}>({
  product: {},
  selectTransaction() {},
});

export function TransactionProvider({ children = null as any, product = {} as any }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectTransaction = useCallback(() => setIsModalVisible(true), []);
  const close = useCallback(() => setIsModalVisible(false), []);
  return (
    <TransactionContext.Provider
      value={{
        product,
        selectTransaction,
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
        {/* productAccountKey */}
        
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
       
        {/* Strike */}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Strike: 
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <InputNumber />
          </div>
        </div>

        {/* Expiry */}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Expiry:
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <InputNumber />
          </div>
        </div>

        {/* Quantity */}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Quantity: 
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <InputNumber />
          </div>
        </div>

        {/* Option price */}
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Option Price: 
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <InputNumber />
          </div>
        </div>
        
        <div className="transaction-modal-wrapper-button">
          <Button
            size="large"
            type={"primary"}
            className="transaction-modal-button-buy"
          >
            <Pyth /> Buy
          </Button>
          <Button
            size="large"
            type={"primary"}
            className="transaction-modal-button-sell"
          >
            Sell <Pyth />
          </Button>
        </div>
      </Modal>
    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const { product, selectTransaction } = useContext(TransactionContext);
  return {
    product,
    selectTransaction,
  };
}
