import React, {
  useCallback,
  useContext,
  useState
} from "react";
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
  contract: MatchableContract,
  selectedContract: MatchableContract,
  matchableContracts: MatchableContract[] | undefined,
  selectContract: ((contract: MatchableContract) => void)
}

const MatchableContractContext = React.createContext<MatchableContractProps>({
  contract: {} as MatchableContract,
  selectedContract: {} as MatchableContract,
  matchableContracts: [{} as MatchableContract],
  selectContract() {}
});

export function MatchableContractProvider({
    children = null as any,
    contract = {} as MatchableContract,
    matchableContracts = [] as MatchableContract[],
    selectContract = (contract: MatchableContract) => {}
}) {
  const [selectedContract, setSelectedContract] = useState({} as MatchableContract);
  // const selectContract = useCallback((contract) => {
    // setSelectedContract(contract);
  // }, [setSelectedContract]);

  
  return (
    <MatchableContractContext.Provider
      value={{
        contract,
        matchableContracts,
        selectedContract,
        selectContract
      }}
    >
      {children}
    </MatchableContractContext.Provider>
  );
}

export function useMatchableContract() {
  const { 
    contract,
    matchableContracts,
    selectContract,
    selectedContract,
  } = useContext(MatchableContractContext);
  return {
    contract,
    matchableContracts,
    selectContract,
    selectedContract,
  };
}
