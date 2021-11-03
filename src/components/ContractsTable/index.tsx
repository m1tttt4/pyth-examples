import React, { useMemo } from "react";
import { Button, Col, Row, Table } from "antd";
import { MatchableContract, MatchableContractProvider, useMatchableContract } from "../../contexts/contracts";
import { Pyth } from "../Icons/pyth";


const MatchableButton = () => {

	const { contract, selectContract } = useMatchableContract()

	const handleUseMatch = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
		console.log("handleUseMatch", contract)
		selectContract(contract);
	}

	return (
		<div className="transaction-modal-wrapper-button">
			<Button
				size="large"
				type={"primary"}
				className="transaction-modal-button-sell"
				onClick={handleUseMatch}
			>
				<Pyth />
			</Button>
		</div>
	);
};

export const ContractsTable = () => {
  const columnWidth = "auto" as string;
  const columnClassName = "table-column";
	const { matchableContracts, selectContract } = useMatchableContract()
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
      render: (value: MatchableContract) => (
      <>
        <MatchableContractProvider contract={value} selectContract={selectContract}  key={value?.toString()}>
					<MatchableButton />
        </MatchableContractProvider>
      </>
      ),
    },
  ];

  const contracts: object[] = useMemo(
    () =>
      Object.keys(matchableContracts!)
        .sort()
        .map((c: any) => matchableContracts![c]),
    [matchableContracts]
  );
  // console.log(contracts)
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
