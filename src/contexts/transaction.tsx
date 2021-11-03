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

// long_escrow: new account at initialize time

export interface BinaryOptInstructionProps {
  program_id: PublicKey; // application
  pool_account: PublicKey; // new account at initialize time
  escrow_mint: PublicKey; // mint Token account
  escrow_account: PublicKey; // PublicKey of the long_escrow account
  long_token_mint: PublicKey; // new account at initialize time
  short_token_mint: PublicKey; // new account at initialize time
  mint_authority: PublicKey; // binary option Account [new account at initialize time]
  update_authority: PublicKey; // binary option Account [new account at initialize time]
  token_account: PublicKey; // System Token Program ID
  system_account: PublicKey; // System Token Program ID
  rent_account: PublicKey; // System Rent ID
  instruction_enum: number; // long long
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
