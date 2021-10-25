import React, { useMemo, useState } from "react";
import { PriceStatus } from "@pythnetwork/client";
import { Account, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { Button, Col, Row, Table } from "antd";
import { Link } from "react-router-dom";
import { sendTransaction, useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import usePyth from "../../hooks/usePyth";
import { PYTH_HELLO_WORLD } from "../../utils/ids";
import { notify } from "../../utils/notifications";
import sigFigs from "../../utils/sigFigs";
import { ProductObject, TransactionProvider } from "../../contexts/transaction";
import { TransactionButton } from "../../components/TransactionButton";
import { TransactionModal } from "../../components/TransactionModal";

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



export const DataTable = () => {
  const { symbolMap } = usePyth();
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
      render: (value: ProductObject) => (
      <>
        <TransactionProvider product={value} >
          <TransactionButton />
          <TransactionModal />
        </TransactionProvider>
      </>
      ),
    },
  ];

      // <>
        // <TransactionProvider product={value} >
          // <TransactionButton />
          // <TransactionModal />
        // </TransactionProvider>
      // </>
  const products: object[] = useMemo(
    () =>
      Object.keys(symbolMap)
        .sort()
        .map((s) => symbolMap[s]),
    [symbolMap]
  );
  // console.log(products)
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
                    onClick: (e) => { handleClick(e) }, // click row
                    onDoubleClick: (e) => { e.preventDefault(); },
                    onContextMenu: (e) => { e.preventDefault(); console.log('right click') }, // right button click row
                    onMouseEnter: (e) => {}, // mouse enter row
                    onMouseLeave: (e) => {}, // mouse leave row
                  };
                }}
            />
          </Col>
          <Col span={24}>
            <Link to="/">
              <Button>Back</Button>
            </Link>
          </Col>
          <Col span={24}>
            <div className="builton" />
          </Col>
        </Row>
      </div>
    </>
  );
};
