import React from "react";
import { DataTable } from "../../components/DataTable";
import { SocketContext, socket } from "../../contexts/socket"
import "../../styles/PythView.less"

export const PythView = () => {
  return (
    <>
      <div className="pythWrapper">
        <div style={{ display: 'inline-block', alignItems: 'center', width: '100%' }}>
          Prices do not refresh, yet...
        </div>
        <SocketContext.Provider value={socket}>
          <DataTable />
        </SocketContext.Provider>
      </div>
    </>
  );
};
