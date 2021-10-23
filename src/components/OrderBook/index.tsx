import { PriceStatus } from "@pythnetwork/client";
import { Account, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Button, Col, Row, Table } from "antd";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sendTransaction, useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import usePyth from "../../hooks/usePyth";
import { PYTH_HELLO_WORLD } from "../../utils/ids";
import { notify } from "../../utils/notifications";
import sigFigs from "../../utils/sigFigs";
import { TransactionProvider } from "../../contexts/transaction";
import { TransactionButton } from "../../components/TransactionButton";

const handleClick = (e: React.MouseEvent<HTMLElement>) => {
  switch (e.detail) {
    case 1:
      console.log("click");
      break;
    case 2:
      console.log("double click");
      break;
    case 3:
      console.log("triple click");
      break;
  }
};

export const OrderBook = () => {
  const { symbolMap } = usePyth();
  const { wallet, connected, connect } = useWallet();
  const connection = useConnection();
  const columnWidth = "auto" as string;
  const columnClassName = "table-column";

  const columns = [
    {
      title: "Symbol",
      dataIndex: ["product", "symbol"],
      width: `${columnWidth}`,
      className: `${columnClassName}`,
    },
    {
      title: "Asset Type",
      dataIndex: ["product", "asset_type"],
      width: `${columnWidth}`,
      className: `${columnClassName}`,
    },
    {
      title: "Status",
      dataIndex: ["price", "status"],
      width: `${columnWidth}`,
      className: `${columnClassName}`,
      render: (value: number) => PriceStatus[value],
    },
    {
      title: "Price",
      dataIndex: ["price", "price"],
      align: "right" as "right",
      width: `${columnWidth}`,
      className: `${columnClassName}`,
      render: (value: number) => `$${sigFigs(value)}`,
    },
    {
      title: "Confidence",
      dataIndex: ["price", "confidence"],
      align: "right" as "right",
      width: `${columnWidth}`,
      className: `${columnClassName}`,
      render: (value: number) => `\xB1$${sigFigs(value)}`,
    },
    {
      title: "Options",
      align: "right" as "right",
      width: `${columnWidth}`,
      className: `${columnClassName}`,
      render: (value: string) => (
      <>
        <TransactionProvider product={value}>
          <TransactionButton />
        </TransactionProvider>
      </>
      ),
    },
  ];

  const products: object[] = useMemo(
    () =>
      Object.keys(symbolMap)
        .sort()
        .map((s) => symbolMap[s]),
    [symbolMap]
  );
  return (
    <>
      <div className="tableWrapper">
        <Row gutter={[16, 16]} align="middle">
          <Col span={24}>
            <Table
                dataSource={products}
                columns={columns} 
                onRow={(record, rowIndex) => {
                  return {
                    onClick: (e) => { e.preventDefault(); handleClick(e) }, // click row
                    onDoubleClick: (e) => { e.preventDefault(); },
                    onContextMenu: (e) => { e.preventDefault(); console.log('right click') }, // right button click row
                    onMouseEnter: (e) => {}, // mouse enter row
                    onMouseLeave: (e) => {}, // mouse leave row
                  };
                }}
            />
          </Col>
        </Row>
      </div>
    </>
  );
};
