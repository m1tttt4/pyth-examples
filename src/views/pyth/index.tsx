import React from "react";
import { DataTable } from "../../components/DataTable";

export const PythView = () => {
  return (
    <>
      <div className="pythWrapper">
        <div style={{ display: 'inline-block', alignItems: 'center', width: '100%' }}>
          Prices do not refresh, yet...
        </div>
        <DataTable />
      </div>
    </>
  );
};
