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
  const { selectTransaction } = useTransaction();
  const { children, disabled, ...rest } = props;

  // only show if wallet selected or user connected

  const menu = (
    <Menu>
      <Menu.Item key="3" onClick={connected ? selectTransaction : select}>
        {connected ? "Buy/Sell" : "Connect"}
      </Menu.Item>
    </Menu>
  );

  if (provider) {
    return (
      <Button
        {...rest}
        onClick={connected ? selectTransaction : connect}
        disabled={connected && disabled}
      >
        {connected ? "Buy/Sell" : provider.name}
      </Button>
    );
  }

  return (
    <Dropdown.Button
      onClick={connected ? selectTransaction : connect}
      disabled={connected && disabled}
      overlay={menu}
    >
      {connected ? 'Buy/Sell' : 'Connect'}
    </Dropdown.Button>
  );
};
