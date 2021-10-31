import { Account, TransactionInstruction } from "@solana/web3.js";
import { Pyth } from "../Icons/pyth";
import type { Moment } from "moment";
import moment from "moment";
import { BINARY_OPTIONS_ID } from "../../utils/ids";
import { notify } from "../../utils/notifications";
import { Button, DatePicker, Modal, InputNumber } from "antd";
import React, {
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";
import sigFigs from "../../utils/sigFigs";

import { sendTransaction, useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import { BinaryOptInstructionProps, useTransaction } from "../../contexts/transaction";
import { ContractsTable } from "../ContractsTable";
import { SocketContext } from "../../contexts/socket";
import { MatchableContract, MatchableContractProvider, useMatchableContract } from "../../contexts/contracts";

import {
  publicKey,
  uint64,
  uint128,
  rustString
} from "../../utils/layout";

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
  const connection = useConnection();
  const { isModalVisible, product, selectTransaction } = useTransaction();
  const { wallet } = useWallet();
  const socket = useContext(SocketContext);

  const productSymbol = product.product.symbol;
  const productPrice = product.price.price!;
  const productAccountKey = product!.price!.productAccountKey!.toBase58();
  const productConfidence = product.price.confidence!;
  const userWalletAddress = wallet?.publicKey?.toBase58();

  const { matchableContracts } = useMatchableContract()
 
  const [ currentContract, setCurrentContract ] = useState<MatchableContract>();

  const setCurrentToMatched = useCallback((contract) => {
    console.log("setCurrentToMatched", contract)
    setCurrentContract(contract)
  }, [])

  const [ isContractListable, setContractListable ] = useState(false);
  const [ isContractMatchable, setContractMatchable ] = useState(false);
  const [ inputExpiry, setInputExpiry ] = useState<Moment | null | undefined>(moment());
  const [ inputStrike, setInputStrike ] = useState<number | undefined>(Math.round(productPrice!));
  const [ inputPercent, setInputPercent ] = useState<number | undefined>(0);
  const [ inputVolume, setInputVolume ] = useState<number | undefined>(0);
  const [ inputBuyerVolume, setInputBuyerVolume ] = useState<number | undefined>(0);
  const [ existingContracts, setExistingContracts ] = useState<AvailableContractForm[]>([]);
  const [ matchingContracts, setMatchingContracts ] = useState<MatchableContract[]>([{} as MatchableContract]);

  const [ newAvailableContract, setNewAvailableContract ] = useState<AvailableContractForm>({
    symbol: productSymbol,
    symbol_key: productAccountKey,
    expiry: inputExpiry,
    strike: inputStrike,
    seller_id: userWalletAddress,
    seller_percent: inputPercent,
    seller_volume: inputVolume
  });

  const [ newMatchableContract, setNewMatchableContract ] = useState<MatchableContract>({
    symbol: productSymbol,
    symbol_key: productAccountKey,
    buyer_volume: inputBuyerVolume,
    expiry: undefined,
    strike: undefined,
    seller_id: undefined,
    seller_percent: undefined,
    buyer_id: undefined,
    buyer_percent: undefined,
  });

  
  function handleReset(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    setInputExpiry(moment());
    setInputStrike(Math.round(productPrice));
    setInputPercent(0);
    setInputVolume(0);
    setContractListable(false);
    setContractMatchable(false);
  }

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
    if ( isContractListable === false ) {
      if ( inputVolume! > 0 ) {
        return
      }
      return };
    const submitContract = {
      ...newAvailableContract,
      expiry: (newAvailableContract['expiry']! as Moment).format('YYYYMMDD')
    };
    console.log("Submitting: ", submitContract);
    socket.emit("createContract", submitContract);
  }

  function handleSubmitMatch(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
  }

  function evaluateSubmitable(form: AvailableContractForm) {
    if (
      !form.expiry ||
      typeof form.expiry !== "object" ||
      !Object.getPrototypeOf(form.expiry).hasOwnProperty("format") ||
      !wallet
    ){
      // console.log('evaluateSubmitable - bad expiry or match found or no wallet: ', form)
      setContractListable(false);
    } else {
      if (
          form.expiry &&
          form.seller_id &&
          form?.strike! >=0 &&
          form?.seller_percent! >= 0 &&
          form?.seller_percent! <= 100 &&
          form?.seller_volume! > 0
      ) {
        // console.log('evaluateSubmitable - looks good: ', form)
        const submitContract = {
          ...form,
          expiry: (form.expiry as Moment).format('YYYYMMDD')
        };
        setContractListable(true)
        socket.emit("findMatchingContracts", submitContract)
      } else {
        // console.log('evaluateSubmitable - looks bad: ', form)
        setContractListable(false)
      };
    };
  };

  function evaluateMatchable(form: MatchableContract) {
    if ( form.buyer_volume! > 0 ) {
      setContractMatchable(true);
    } else {
      setContractMatchable(false);
    }
  };

  const getContracts = useCallback((productAccountKey) => {
    console.log('getContracts', productSymbol)
    socket.emit("getContracts", productAccountKey);
  }, [socket, productSymbol]);

  const populateContracts = useCallback((contracts) => {
    console.log('populateContracts', contracts)
    setExistingContracts(contracts);
    setMatchingContracts(contracts);

  }, [setExistingContracts]);

  const populateMatchingContracts = useCallback((contracts) => {
    console.log('populateMatchingContracts', contracts)
    setMatchingContracts(contracts);
  }, [setMatchingContracts]);

  useEffect(() => {
    if (isModalVisible !== true) { return };
    setNewAvailableContract({
      symbol: productSymbol,
      symbol_key: productAccountKey,
      expiry: inputExpiry,
      strike: inputStrike,
      seller_id: userWalletAddress,
      seller_percent: inputPercent,
      seller_volume: inputVolume
    })

    socket.on("TX_CONFIRMED", selectTransaction);
    socket.on("getContracts", populateContracts);
    socket.on("findMatchingContracts", populateMatchingContracts);
    getContracts(productAccountKey);
    console.log('useEffectOn', currentContract)

    return () => {
      // console.log('useEffectOff', productSymbol)
      socket.off("TX_CONFIRMED", selectTransaction);
      socket.off("getContracts", populateContracts);
      socket.off("findMatchingContracts", populateMatchingContracts);
    }
  }, [
    currentContract,
    inputExpiry,
    inputPercent,
    inputStrike,
    inputVolume,
    userWalletAddress,
    productAccountKey,
    productSymbol,
    isModalVisible,
    getContracts,
    populateContracts,
    populateMatchingContracts,
    selectTransaction,
    socket
  ])

  const initializeBinaryOptTransaction = (
    props: BinaryOptInstructionProps
  ) => {
    if (!wallet) {
      return
    }
    const signers: Account[] = [];
    const instructions: TransactionInstruction[] = [];
    const buf: Buffer = Buffer.from([
      props.instruction_enum,
      props.decimals,
      props.expiry,
      props.strike,
      props.strike_exponent
    ]);


    instructions.push(
      new TransactionInstruction({
        keys: [
          {
            pubkey: props.pool_account,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: props.escrow_mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: props.escrow_account,
            isSigner: true,
            isWritable: true,
          },
          {
            pubkey: props.long_token_mint,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: props.short_token_mint,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: props.mint_authority,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: props.update_authority,
            isSigner: true,
            isWritable: false,
          },
          {
            pubkey: props.token_account,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: props.system_account,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: props.rent_account,
            isSigner: false,
            isWritable: false,
          },
        ],
        programId: props.program_id,
      })
    );
    return {instructions, signers};
  }

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
      width="auto"
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
          ghost={!isContractListable}
          disabled={!isContractListable}
          onClick={handleSubmitPurchase}
        >
          <Pyth />
          {isContractMatchable ? "Buy Match" : isContractListable ? "List": ""}
        </Button>
        <Button
          size="large"
          type={"dashed"}
          className="transaction-modal-button-reset"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>

      <div className="contracts-existing">
        All contracts for {productSymbol}
        <MatchableContractProvider matchableContracts={matchingContracts} selectContract={setCurrentToMatched}>
          <ContractsTable />
        </MatchableContractProvider>
      </div>
    </Modal>
  );
}
