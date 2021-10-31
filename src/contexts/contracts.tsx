import React, {
  useCallback,
  useContext,
  useState
} from "react";
import type { PublicKey } from "@solana/web3.js";
import type { Moment } from "moment";

export interface MatchableContract {
  symbol: string | undefined,
  symbol_key: string,
  expiry: Moment | null | undefined | string,
  strike: number | undefined,
  seller_id: string | undefined,
  seller_percent: number | undefined,
  buyer_id: string | undefined,
  buyer_percent: number | undefined,
  buyer_volume: number | undefined,
}

export interface MatchableContractProps {
  contract: MatchableContract | undefined
}

const MatchableContractContext = React.createContext<MatchableContractProps>({
  contract: undefined
});

export function MatchableContractProvider({
    children = null as any,
    contract = {} as MatchableContract,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selectContract = useCallback(() => {
    setIsModalVisible(!isModalVisible);
  }, [isModalVisible]);

  
  return (
    <MatchableContractContext.Provider
      value={{
        contract
      }}
    >
      {children}
    </MatchableContractContext.Provider>
  );
}

export function useContract() {
  const { 
    contract,
  } = useContext(MatchableContractContext);
  return {
    contract,
  };
}
