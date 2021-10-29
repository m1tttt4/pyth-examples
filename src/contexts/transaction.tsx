import React, {
  useCallback,
  useContext,
  useState
} from "react";
import type { PublicKey } from "@solana/web3.js";

export interface ProductObject {
  price: {
    confidence: number | undefined,
    price: number | undefined,
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

export interface BinaryOptionProps {



}

export interface BinaryOptInstructionProps {
  program_id: PublicKey;
  pool_account: PublicKey;
  escrow_mint: PublicKey;
  escrow_account: PublicKey;
  long_token_mint: PublicKey;
  short_token_mint: PublicKey;
  mint_authority: PublicKey;
  update_authority: PublicKey;
  token_account: PublicKey;
  system_account: PublicKey;
  rent_account: PublicKey;
  unknown_zero: number; // long long
  decimals: number; // uint8
  expiry: number; // uint64
  strike: number; // uint64
  strike_exponent: number; // int64
}

const TransactionContext = React.createContext<TransactionProps>({
  product: {
    price: {
      confidence: undefined,
      price: undefined,
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
