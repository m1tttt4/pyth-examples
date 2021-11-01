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

export interface CurrentContractForm {
  symbol: string | undefined,
  symbol_key: string,
  expiry: Moment | null | undefined | string,
  strike: number | undefined,
  buyer_id: string | undefined,
  buyer_volume: number | undefined,
  buyer_percent: number | undefined,
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
 

  const [ isContractListable, setContractListable ] = useState(false);
  const [ isContractMatchable, setContractMatchable ] = useState(false);
  const [ inputExpiry, setInputExpiry ] = useState<Moment | null | undefined>(moment());
  const [ inputStrike, setInputStrike ] = useState<number | undefined>(Math.round(productPrice!));
  const [ inputPercent, setInputPercent ] = useState<number | undefined>(0);
  const [ inputVolume, setInputVolume ] = useState<number | undefined>(0);
  const [ sellerPercent, setSellerPercent ] = useState<number | undefined>(0);
  const [ sellerVolume, setSellerVolume ] = useState<number | undefined>(0);
  const [ buyerVolume, setBuyerVolume ] = useState<number | undefined>(0);
  const [ buyerPercent, setBuyerPercent ] = useState<number | undefined>(0);
  const [ buyerId, setBuyerId ] = useState<string | undefined>();
  const [ sellerId, setSellerId ] = useState<string | undefined>();
  const [ existingContracts, setExistingContracts ] = useState<CurrentContractForm[]>([]);
  const [ matchingContracts, setMatchingContracts ] = useState<MatchableContract[]>([{} as MatchableContract]);
  const [ currentContract, setCurrentContract ] = useState<CurrentContractForm>({
    symbol: productSymbol,
    symbol_key: productAccountKey,
    expiry: inputExpiry,
    strike: inputStrike,
    buyer_id: buyerId,
    buyer_volume: buyerVolume,
    buyer_percent: buyerPercent,
    seller_id: sellerId,
    seller_percent: sellerPercent,
    seller_volume: sellerVolume
  });
  const [ currentContracts, setCurrentContracts ] = useState<CurrentContractForm[]>(existingContracts);

  const setCurrentToMatched = useCallback((contract) => {
    console.log("setCurrentToMatched: before: ", currentContract)
    console.log("setCurrentToMatched", contract)
    setCurrentContract({
      ...contract,
      buyer_id: userWalletAddress,
      buyer_volume: contract.seller_volume,
      buyer_percent: 100 - contract.seller_percent
    })
    setContractMatchable(true)
    setCurrentContracts([contract])
    setInputExpiry(moment(contract.expiry, 'YYYYMMDD'))
    setInputPercent(100 - contract.seller_percent)
    setInputStrike(contract.strike)
    setInputVolume(contract.seller_volume)
    setBuyerId(userWalletAddress)
    setBuyerPercent(100 - contract.seller_percent)
    setBuyerVolume(contract.seller_volume)
    setSellerId(contract.seller_id)
    setSellerPercent(contract.seller_percent)
    setSellerVolume(contract.seller_volume)
  }, [
      currentContract,
      setCurrentContracts,
      setContractMatchable,
      setInputExpiry,
      setInputStrike,
      setInputVolume,
      setBuyerVolume, 
      setSellerVolume,
      setSellerId,
      setBuyerId,
      setSellerPercent,
      setBuyerPercent,
      userWalletAddress
    ]
  )


  const [ newListableContract, setNewListableContract ] = useState<CurrentContractForm>({
    symbol: productSymbol,
    symbol_key: productAccountKey,
    expiry: inputExpiry,
    strike: inputStrike,
    buyer_id: undefined,
    buyer_volume: undefined,
    buyer_percent: undefined,
    seller_id: userWalletAddress,
    seller_percent: sellerPercent,
    seller_volume: sellerVolume
  });

  function handleReset(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    setInputExpiry(moment());
    setInputStrike(Math.round(productPrice));
    setSellerPercent(0);
    setSellerVolume(0);
    setBuyerPercent(0);
    setBuyerVolume(0);
    setContractListable(false);
    setContractMatchable(false);
  }

  function handlePercent(value: number | string | undefined) {
    setInputPercent(value as number)
    setNewListableContract({ ...newListableContract, seller_percent: value as number });
    evaluateSubmitable({ ...newListableContract, seller_percent: value as number });
  }

  function handleStrike(value: number | string | undefined) {
    setInputStrike(value as number)
    setNewListableContract({ ...newListableContract, strike: value as number });
    evaluateSubmitable({ ...newListableContract, strike: value as number });
  }

  function handleExpiry(value: Moment | null | undefined) {
    setInputExpiry((value as Moment));
    setNewListableContract({ ...newListableContract, expiry: (value as Moment)});
    evaluateSubmitable({ ...newListableContract, expiry: (value as Moment)});
  }

  function handleVolume(value: number | string | undefined) {
    setInputVolume(value as number);
    setNewListableContract({ ...newListableContract, seller_volume: value as number });
    evaluateSubmitable({ ...newListableContract, seller_volume: value as number });
  }

  function handleListContract(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
    evaluateSubmitable(newListableContract);
    if ( isContractListable === false && isContractMatchable === false) {
      return
    }
    const submitContract = {
      ...newListableContract,
      expiry: (newListableContract['expiry']! as Moment).format('YYYYMMDD')
    };
    console.log("Submitting: ", submitContract);
    socket.emit("createContract", submitContract);
  }

  function handleBuyContract(event: React.MouseEvent<HTMLElement, MouseEvent>) {
    event.preventDefault();
    console.log("handleBuyContract", currentContract)
  }

  function evaluateSubmitable(form: CurrentContractForm) {
    if ( isContractMatchable === false) {
      setSellerId(userWalletAddress)
    }
    if (matchableContracts?.length === 0) {
      setContractMatchable(false)
    }

    if (
      !form.expiry ||
      typeof form.expiry !== "object" ||
      !Object.getPrototypeOf(form.expiry).hasOwnProperty("format") ||
      !wallet
    ){
      console.log('evaluateSubmitable - bad expiry or match found or no wallet: ', form)
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
        setContractListable(true)
        console.log('evalSubmit good')
      } else {
        setContractListable(false)
        console.log('evalSubmit bad', form)
      };
      const submitContract = {
        ...form,
        expiry: (form.expiry as Moment).format('YYYYMMDD')
      };
      socket.emit("findMatchingContracts", submitContract)
      console.log('evalSubmit default', form)
    };
  };

  const getContracts = useCallback((productAccountKey) => {
    console.log('getContracts', productSymbol)
    socket.emit("getContracts", productAccountKey);
  }, [socket, productSymbol]);

  const populateContracts = useCallback((contracts) => {
    console.log('populateContracts', contracts)
    setExistingContracts(contracts);
    setCurrentContracts(contracts);

  }, [setExistingContracts]);

  const populateMatchingContracts = useCallback((contracts) => {
    console.log('populateMatchingContracts', contracts)
    setMatchingContracts(contracts);
    setCurrentContracts(contracts);
  }, [setMatchingContracts]);

  useEffect(() => {
    if (isModalVisible !== true) { return };
    setNewListableContract({
      symbol: productSymbol,
      symbol_key: productAccountKey,
      expiry: inputExpiry,
      strike: inputStrike,
      buyer_id: buyerId,
      buyer_volume: buyerVolume,
      buyer_percent: buyerPercent,
      seller_id: sellerId,
      seller_percent: sellerPercent,
      seller_volume: sellerVolume
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
      inputStrike,
      sellerId,
      sellerPercent,
      sellerVolume,
      buyerId,
      buyerVolume,
      buyerPercent,
      productAccountKey,
      productSymbol,
      isModalVisible,
      isContractMatchable,
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
          ghost={!isContractListable && !isContractMatchable}
          disabled={!isContractListable && !isContractMatchable}
          onClick={isContractMatchable ? handleBuyContract : isContractListable ? handleListContract: undefined}
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
        <MatchableContractProvider matchableContracts={currentContracts} selectContract={setCurrentToMatched}>
          <ContractsTable />
        </MatchableContractProvider>
      </div>
    </Modal>
  );
}
