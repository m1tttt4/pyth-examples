import type { PublicKey } from "@solana/web3.js";

import Wallet from "@project-serum/sol-wallet-adapter";
import { Transaction } from "@solana/web3.js";
import { Button, Modal } from "antd";
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
import { NumericInput } from "./../components/Input/numeric";

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
  console.log(product)
  return (
    <TransactionContext.Provider
      value={{
        product,
        selectTransaction,
      }}
    >
      {children}
      <Modal
        title="Modal title"
        okText="Connect"
        visible={isModalVisible}
        okButtonProps={{ style: { display: "none" } }}
        onCancel={close}
        width={450}
      >
        <div style={{ display: 'inline-block', alignItems: 'center', width: '100%', marginBottom: '1em'}}>
          <div style={{ width: '100%', textAlign: 'center', textDecorationLine: 'underline' }}>
            PRODUCTACCOUNTKEY
          </div>
          <div style={{ width: '100%', textAlign: 'center' }}>
            {product.price.productAccountKey.toString()}
          </div>
        </div>
        
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

        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            CURRENT_PRICE:
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            {`$${sigFigs(product.price.price)}`}
          </div>
        </div>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            CONFIDENCE:
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            {`\xB1$${sigFigs(product.price.confidence)}`}
          </div>
        </div>
        
        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Strike: 
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <NumericInput />
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Expiry:
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <NumericInput />
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Quantity: 
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <NumericInput />
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
          <div style={{ float: 'left', width: 'auto' }}>
            Option Price: 
          </div>
          <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
            <NumericInput />
          </div>
        </div>

        <Button
          size="large"
          type={"primary"}
          icon={
            <img
              width={20}
              height={20}
              alt=""
              style={{ marginRight: 8 }}
            />
          }
          style={{
            display: "block",
            width: "100%",
            textAlign: "left",
            marginBottom: 8,
          }}
        >
        </Button>
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
