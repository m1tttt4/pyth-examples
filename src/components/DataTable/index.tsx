import { PriceStatus } from "@pythnetwork/client";
import { Button, Col, Row, Table } from "antd";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import usePyth from "../../hooks/usePyth";
import sigFigs from "../../utils/sigFigs";
import { TransactionProvider } from "../../contexts/transaction";
import { TransactionButton } from "../../components/TransactionButton";
import { TestTransaction } from "../../utils/transactions";
import { Connection, PublicKey } from "@solana/web3.js";
import { WalletAdapter } from "../../contexts/wallet";

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

interface DataTableProps {
  connect: () => any;
  connected: boolean;
  connection: Connection;
  wallet: WalletAdapter | undefined;
}

export const DataTable = (props: DataTableProps) => {
  const { connect, connected, connection, wallet } = props;
  const { symbolMap } = usePyth();
  const columnWidth = "auto" as string;
  const columnClassName = "table-column";
  // const [filteredInfo, sortedInfo] = useState(Object);
  // const [order, columnKey] = useState();
  // const handleChange = (pagination: {}, filters: {}, sorter: {}) => {
    // filteredInfo(filters);
    // sortedInfo(sorter);
  // };
  // const clearFilters = () => {
    // filteredInfo(null);
  // };
  // const clearAll = () => {
    // filteredInfo(null);
    // sortedInfo(Function);
  // };

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
  // Google
  const productKey = new PublicKey("CpPmHbFqkfejPcF8cvxyDogm32Sqo3YGMFBgv3kR1UtG");
  const priceKey = new PublicKey("CpPmHbFqkfejPcF8cvxyDogm32Sqo3YGMFBgv3kR1UtG");
  const executeTest = () => TestTransaction(connection, wallet, productKey, priceKey);

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
          <Col span={24}>
            <Button onClick={connected ? executeTest : connect}>
              {connected ? "Execute Test Transaction" : "Connect Wallet"}
            </Button>
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
