import React, { useMemo, useState } from "react";
import { PriceStatus } from "@pythnetwork/client";
import { Button, Col, Row, Table, InputNumber } from "antd";
import { Link } from "react-router-dom";
import { sendTransaction, useConnection } from "../../contexts/connection";
import { useWallet } from "../../contexts/wallet";
import { PYTH_HELLO_WORLD } from "../../utils/ids";
import { notify } from "../../utils/notifications";
import sigFigs from "../../utils/sigFigs";
import { MatchableContract, MatchableContractProvider } from "../../contexts/contracts";
import { Pyth } from "../Icons/pyth";

export interface ContractsTableProps {
  contracts: MatchableContract[] | undefined,
  handleSubmitMatch: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void,
  isContractMatchable: boolean,
  handleBuyerVolume: (value: string | number | undefined) => void,
  inputBuyerVolume: number | undefined
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
      title: "buyer_volume",
      align: "right" as "right",
      width: `${columnWidth}`,
      className: `${columnClassName}`,
      render: (value: MatchableContract) => (
      <>
        <MatchableContractProvider contract={value} >
          <div style={{ display: 'inline-flex', alignItems: 'center', width: '100%' }}>
            <div style={{ float: 'left', width: 'auto' }}>
              Quantity:
            </div>
            <div style={{ float: 'right', marginLeft: 'auto', width: 'auto' }}>
              <InputNumber value={value.buyer_volume} onChange={props.handleBuyerVolume}/>
            </div>
          </div>
        </MatchableContractProvider>
      </>
      ),
    },
    {
      title: "Buy Match",
      align: "right" as "right",
      width: `${columnWidth}`,
      className: `${columnClassName}`,
      render: (value: MatchableContract) => (
      <>
        <MatchableContractProvider contract={value} >
          <div className="transaction-modal-wrapper-button">
            <Button
              size="large"
              type={"primary"}
              className="transaction-modal-button-sell"
              onClick={props.handleSubmitMatch}
              ghost={!props.isContractMatchable}
              disabled={!props.isContractMatchable}
            >
              <Pyth />
              {value.expiry}
            </Button>
          </div>
        </MatchableContractProvider>
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
  console.log(contracts)
  // const _contracts = contracts.map((c: any) => ({...c, key: {...c}}))
  // console.log(_contracts)
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
