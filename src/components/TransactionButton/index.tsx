import { Button, Dropdown, Menu } from "antd";
import { ButtonProps } from "antd/lib/button";
import React from "react";
import { LABELS } from "../../constants";
import { useWallet } from "../../contexts/wallet";
import { useTransaction } from "../../contexts/transaction";

export interface TransactionButtonProps
  extends ButtonProps,
    React.RefAttributes<HTMLElement> {
}

export const TransactionButton = (props: TransactionButtonProps) => {
  const { connected, connect, provider, select } = useWallet();
  const { selectTransactionModal } = useTransaction();
  const { children, disabled, ...rest } = props;

  // only show if wallet selected or user connected

  const menu = (
    <Menu>
      <Menu.Item key="3" onClick={select}>
        {"Change wallet"}
      </Menu.Item>
    </Menu>
  );

  if (provider) {
    return (
      <Dropdown.Button
        onClick={connected ? selectTransactionModal : connect}
        disabled={connected && disabled}
        overlay={menu}
        className="table-button-dropdown"
      >
        {connected ? "Buy/Sell" : provider.name}
      </Dropdown.Button>
    );
  }

  return (
    <Dropdown.Button
      onClick={connected ? selectTransactionModal : connect}
      disabled={connected && disabled}
      overlay={menu}
        className="table-button-dropdown"
    >
      {connected ? "Buy/Sell" : "Connect"}
    </Dropdown.Button>
  );
};
