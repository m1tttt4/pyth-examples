# Simple Options Complex Events
Work in progress for binary options on Solana.
Example instance can be found here: https://m4tt4ew.com/#/pyth

![image](https://user-images.githubusercontent.com/11201675/137568157-8357b8a7-4dbc-4600-b7b2-5a449f626e42.png) UI extends pyth-examples

# Quickstart

```bash
git clone https://github.com/m1tttt4/solana-soce-ui

cd solana-soce-ui
git submodule update --init --recursive
```

```bash

yarn

```

```bash

yarn start

```
![image](https://user-images.githubusercontent.com/11201675/137568095-3a25f0bd-1ff9-4610-b0a0-6e682fb5bdf9.png)
![image](https://user-images.githubusercontent.com/11201675/137568108-b699d26d-8020-43ff-a2e6-485f74660ec7.png)

# Environment Setup
1. Install Rust from https://rustup.rs/
2. Install Solana v1.6.7 or later from https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool
3. Install Node
4. Install NPM, Yarn

# Build Smart Contract (compiled for BPF)
Run the following from the program/solana-soce subdirectory:

```bash
$ cargo build-bpf
$ cargo test-bpf
```
# Directory structure

## program

Solana program template in Rust

### program/src/lib.rs
* process_instruction function is used to run all calls issued to the smart contract

## src/actions

Setup here actions that will interact with Solana programs using sendTransaction function

## src/contexts

React context objects that are used propagate state of accounts across the application

## src/hooks

Pyth hook
* usePyth - hook for fetching products and prices

Generic react hooks to interact with token program:
* useUserBalance - query for balance of any user token by mint, returns:
    - balance
    - balanceLamports
    - balanceInUSD
* useUserTotalBalance - aggregates user balance across all token accounts and returns value in USD
    - balanceInUSD
* useAccountByMint
* useTokenName
* useUserAccounts

## src/views

* home - main page for your app
* faucet - airdrops SOL on Testnet and Devnet
