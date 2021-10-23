import React, { useEffect, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { OrderBook } from "../../components/OrderBook";
import TransactionsView from "../../components/TransactionsView";
import { useWallet } from "../../contexts/wallet";
import { useConnection } from "../../contexts/connection";
import { getTransactions, SignedTransaction } from "../../utils/transactions";

export const PythView = () => {
  const [transactions, setTransactions] =
    useState<Array<SignedTransaction>>();
  const connection = useConnection();
  const { wallet, connected, connect } = useWallet();

  useEffect(() => {
    
    if (wallet!.publicKey) {
      getTransactions(connection, wallet!.publicKey).then((trans) => {
        setTransactions(trans);
      });
     }
  });

  return (
    <>
      <div className="pythWrapper">
        <div style={{ display: 'inline-block', alignItems: 'center', width: '100%' }}>
          Prices do not refresh, yet...
        </div>
        <DataTable />
        {/* <OrderBook /> */}
        <TransactionsView transactions={transactions} />
      </div>
    </>
  );
};
