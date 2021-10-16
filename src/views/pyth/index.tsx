import React from "react";
import { DataTable } from "../../components/DataTable";
import { useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";


export const PythView = () => {
  const { wallet, connect, connected } = useWallet();
  const connection = useConnection();
  return (
    <>
      <div className="pythWrapper">
        <div style={{ display: 'inline-block', alignItems: 'center', width: '100%' }}>
          Prices do not refresh, yet...
        </div>
        <DataTable 
          connect={connect}
          connected={connected}
          connection={connection}
          wallet={wallet}
        />
      </div>
    </>
  );
};
