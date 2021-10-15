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
import { useLocalStorageState } from "./../utils/utils";

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
        width={400}
      >
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
