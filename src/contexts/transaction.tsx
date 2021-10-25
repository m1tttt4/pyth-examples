import React, {
  useCallback,
  useContext,
  useState
} from "react";
import type { PublicKey } from "@solana/web3.js";

export interface ProductObject {
  price: {
    confidence: number,
    price: number,
    productAccountKey: PublicKey | undefined;
  },
  product: {
    symbol: string | undefined,
  }
};

export interface TransactionProps {
  product: ProductObject;
  selectTransaction: () => void;
  isModalVisible: boolean;
}


const TransactionContext = React.createContext<TransactionProps>({
  product: {
    price: {
      confidence: 999999999999,
      price: 99999999999999,
      productAccountKey: undefined,
    },
    product: {
      symbol: undefined,
    },
  },
  selectTransaction() {},
  isModalVisible: false,
});

export function TransactionProvider({
    children = null as any,
    product = {} as ProductObject,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectTransaction = useCallback(() => {
    setIsModalVisible(!isModalVisible);
  }, [isModalVisible]);

  
  return (
    <TransactionContext.Provider
      value={{
        isModalVisible,
        product,
        selectTransaction,
      }}
    >
      {children}

    </TransactionContext.Provider>
  );
}

export function useTransaction() {
  const { 
    isModalVisible,
    product,
    selectTransaction
  } = useContext(TransactionContext);
  return {
    isModalVisible,
    product,
    selectTransaction,
  };
}
