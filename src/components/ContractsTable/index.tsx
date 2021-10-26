import React, { useMemo, useState } from "react";
import { PriceStatus } from "@pythnetwork/client";
import { Button, Col, Row, Table } from "antd";
import { Link } from "react-router-dom";
import { sendTransaction, useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import { PYTH_HELLO_WORLD } from "../../utils/ids";
import { notify } from "../../utils/notifications";
import sigFigs from "../../utils/sigFigs";
import { ProductObject, TransactionProvider } from "../../contexts/transaction";
import { TransactionButton } from "../../components/TransactionButton";
import { AvailableContractForm } from "../../components/TransactionModal";
import { Pyth } from "../Icons/pyth";

export interface ContractsTableProps {
  contracts: AvailableContractForm[] | undefined,
  handleSubmitPurchase: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void
}

export const ContractsTable = (props: ContractsTableProps) => {
  const columnWidth = "auto" as string;
  const columnClassName = "table-column";

  const columns = [
    {
      title: "Symbol",
      dataIndex: ["symbol"],
      width: `${columnWidth}`,
      className: `${columnClassName}`,
    },
    {
      title: "Strike",
      dataIndex: ["strike"],
      width: `${columnWidth}`,
      className: `${columnClassName}`,
    },
    {
      title: "Expiry",
      dataIndex: ["expiry"],
      width: `${columnWidth}`,
      className: `${columnClassName}`,
    },
    {
      title: "Quantity",
      dataIndex: ["seller_volume"],
      width: `${columnWidth}`,
      className: `${columnClassName}`,
    },
    {
      title: "%",
      dataIndex: ["seller_percent"],
      width: `${columnWidth}`,
      className: `${columnClassName}`,
    },
    {
      title: "Buy Match",
      align: "right" as "right",
      width: `${columnWidth}`,
      className: `${columnClassName}`,
      render: () => (
      <>
        <div className="transaction-modal-wrapper-button">
          <Button
            size="large"
            type={"primary"}
            className="transaction-modal-button-sell"
            onClick={props.handleSubmitPurchase}
          >
            <Pyth />
          </Button>
        </div>
      </>
      ),
    },
  ];
  const contracts: object[] = useMemo(
    () =>
      Object.keys(props!.contracts!)
        .sort()
        .map((c: any) => props!.contracts![c]),
    [props]
  );
  // console.log(products)
  return (
    <>
      <div className="tableWrapper">
        <Row gutter={[16, 16]} align="middle">
          <Col span={24}>
            <Table
                dataSource={contracts}
                columns={columns} 
                onRow={(record, rowIndex) => {
                  return {
                    onClick: (e) => { e.preventDefault() }, // click row
                    onDoubleClick: (e) => { e.preventDefault(); },
                    onContextMenu: (e) => { e.preventDefault(); console.log('right click') },
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
