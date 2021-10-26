import type { PublicKey } from "@solana/web3.js";
import { Pyth } from "../Icons/pyth";
import type { Moment } from "moment";
import { Button, DatePicker, Modal, Input, InputNumber } from "antd";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import sigFigs from "../../utils/sigFigs";
import { SocketContext } from "../../contexts/socket";
import { useWallet } from "../../contexts/wallet";
import { useTransaction } from "../../contexts/transaction";
import { ContractsTable } from "../ContractsTable";

export interface AvailableContractForm {
  symbol: string | undefined,
  symbol_key: string,
  expiry: Moment | null | undefined | string,
  strike: number | undefined,
  seller_id: string | undefined,
  seller_percent: number | undefined,
  seller_volume: number | undefined
}

export interface TransactionModalProps {

}

export const TransactionModal = (props: TransactionModalProps) => {
  const [isSubmitable, setIsSubmitable] = useState(false);
  const { wallet } = useWallet();
  console.log(wallet);
  const userWalletAddress = wallet?.publicKey?.toBase58();

  const { isModalVisible, product, selectTransaction } = useTransaction();
  const productSymbol = product.product.symbol;
  const productPrice = product.price.price;
  const productAccountKey = product!.price!.productAccountKey!.toBase58();
  const productConfidence = product.price.confidence;


  const [ inputExpiry, setInputExpiry ] = useState<Moment | null | undefined>();
  const [ inputStrike, setInputStrike ] = useState<number | undefined>();
  const [ inputPercent, setInputPercent ] = useState<number | undefined>();
  const [ inputVolume, setInputVolume ] = useState<number | undefined>();
  const [ existingContracts, setExistingContracts ] = useState<AvailableContractForm[]>();
  const [ matchingContracts, setMatchingContracts ] = useState<AvailableContractForm[]>([]);

  const [ newAvailableContract, setNewAvailableContract ] = useState<AvailableContractForm>({
    symbol: productSymbol,
    symbol_key: productAccountKey,
    expiry: inputExpiry,
    strike: inputStrike,
    seller_id: userWalletAddress,
    seller_percent: inputPercent,
    seller_volume: inputVolume
  });
  // console.log(newAvailableContract)
  const socket = useContext(SocketContext);
  
  const getContracts = useCallback(() => {
    socket.emit("getContracts", productAccountKey);
  }, [socket, productAccountKey]);
  
  const populateContracts = useCallback((contracts) => {
    setExistingContracts(contracts);
  }, [setExistingContracts]);

  const updateNewContract = useCallback(() => {
    setNewAvailableContract({
      ...newAvailableContract,
      symbol: productSymbol,
      symbol_key: productAccountKey,
      seller_id: userWalletAddress
    });
  }, [setNewAvailableContract, newAvailableContract, productSymbol, productAccountKey, userWalletAddress]);

  const handleMatchingContracts = useCallback((contracts) => {
    setMatchingContracts(contracts);
  }, [setMatchingContracts]);

  function handlePercent(value: number | string | undefined) {
    setInputPercent(value as number)
    setNewAvailableContract({ ...newAvailableContract, seller_percent: value as number });
    evaluateSubmitable({ ...newAvailableContract, seller_percent: value as number });
  }

  function handleStrike(value: number | string | undefined) {
    setInputStrike(value as number)
    setNewAvailableContract({ ...newAvailableContract, strike: value as number });
    evaluateSubmitable({ ...newAvailableContract, strike: value as number });
  }

  function handleExpiry(value: Moment | null | undefined) {
    setInputExpiry((value as Moment));
    setNewAvailableContract({ ...newAvailableContract, expiry: (value as Moment)});
    evaluateSubmitable({ ...newAvailableContract, expiry: (value as Moment)});
  }
  function handleVolume(value: number | string | undefined) {
    setInputVolume(value as number);
    setNewAvailableContract({ ...newAvailableContract, seller_volume: value as number });
    evaluateSubmitable({ ...newAvailableContract, seller_volume: value as number });
  }
  function handleSubmitPurchase(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
    evaluateSubmitable(newAvailableContract);
    if (isSubmitable) {
      const submitContract = {
        ...newAvailableContract,
        expiry: (newAvailableContract['expiry']! as Moment).format('YYYYMMDD')
      };
      console.log("Submitting: ", submitContract);
      socket.emit("createContract", submitContract);
    }
  }

  function evaluateSubmitable(form: AvailableContractForm) {
    if ( 
      !form.expiry ||
      typeof form.expiry !== "object" ||
      !Object.getPrototypeOf(form.expiry).hasOwnProperty("format") ||
      matchingContracts.length > 0
    ){
      setIsSubmitable(false);
      return
    }
    if ( 
        form.symbol &&
        form.symbol_key &&
        form.expiry &&
        form.strike &&
        form.seller_id &&
        form.seller_percent &&
        form?.seller_percent! >= 0 &&
        form?.seller_percent! <= 100 &&
        form?.seller_volume &&
        form?.seller_volume! > 0
    ) {
      console.log(form.expiry)
      const submitContract = {
        ...form,
        expiry: (form.expiry as Moment).format('YYYYMMDD')
      };
      setIsSubmitable(true) 
      socket.emit("findMatchingContracts", submitContract)
    } else {
      console.log(form.expiry)
      const submitContract = {
        ...form,
        expiry: (form.expiry as Moment).format('YYYYMMDD')
      };
      setIsSubmitable(false)
      socket.emit("findMatchingContracts", submitContract)
    }
  }


  
  useEffect(() => {
    socket.on("TX_CONFIRMED", selectTransaction);
    socket.on("getContracts", populateContracts);
    socket.on("findMatchingContracts", handleMatchingContracts);
    getContracts();
    updateNewContract();

    return () => {
      socket.off("TX_CONFIRMED", selectTransaction);
      socket.off("getContracts", populateContracts);
      socket.off("findMatchingContracts", handleMatchingContracts);
    }
  }, [getContracts, populateContracts, product, selectTransaction, socket])
  // }, [getContracts, populateContracts, product, updateNewContract, selectTransaction, socket])
  // TODO: fix this


  // console.log(product)
  return (
    <Modal
      title={
        <div className="transaction-modal-title">
          {productAccountKey}
        </div>
      }  
      className="transaction-modal"
      okText="Connect"
      visible={isModalVisible}
      okButtonProps={{ style: { display: "none" } }}
      onCancel={selectTransaction}
      width={450}
    >
      {/* Symbol */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          SYMBOL:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          {productSymbol}
        </div>
      </div>

      {/* Current Price */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          CURRENT_PRICE:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          {`$${sigFigs(productPrice)}`}
        </div>
      </div>
      
      {/* Confidence */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          CONFIDENCE:
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          {`\xB1$${sigFigs(productConfidence)}`}
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

      {/* Percent */}
      <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
        <div style={{ float: 'left', width: 'auto' }}>
          Percent Chance: 
        </div>
        <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
          <InputNumber value={inputPercent} onChange={handlePercent}/>
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
          <Pyth /> List new contract
        </Button>
      </div>

      {/*
      <div className="contracts-matching">
        Matching contracts for {productSymbol}
        <ContractsTable contracts={matchingContracts} handleSubmitPurchase={handleSubmitPurchase}/>
      </div>
      */}

      <div className="contracts-existing">
        All contracts for {productSymbol}
        <ContractsTable contracts={existingContracts} handleSubmitPurchase={handleSubmitPurchase}/>
      </div>
    </Modal>
  );
}
