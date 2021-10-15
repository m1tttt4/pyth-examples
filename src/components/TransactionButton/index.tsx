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
        {connected ? "Buy/Sell" : "Change wallet"}
      </Menu.Item>
    </Menu>
  );

  if (provider && !connected) {
    return (
      <Dropdown.Button
        onClick={connect}
        disabled={connected && disabled}
        overlay={menu}
      >
        {provider.name}
      </Dropdown.Button>
    );
  }
  if (provider && connected) {
    return (
      <Button
        {...rest}
        onClick={selectTransaction}
        disabled={connected && disabled}
      >
        Buy/Sell
      </Button>
    );
  }

  return (
    <Dropdown.Button
      onClick={connected ? selectTransaction : connect}
      disabled={connected && disabled}
      overlay={menu}
    >
      {connected ? "Buy/Sell" : "Connect"}
    </Dropdown.Button>
  );
};
