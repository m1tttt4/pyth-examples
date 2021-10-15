import { PublicKey } from "@solana/web3.js";

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
export let TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export let LENDING_PROGRAM_ID = new PublicKey(
  "TokenLending1111111111111111111111111111111"
);

export let SWAP_PROGRAM_ID = new PublicKey(
  "SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8"
);

export let PYTH_HELLO_WORLD = new PublicKey(
  "BKYTayVSTcCWYm8Qzub8EGkr61Tsnepp4ioxbtVFBCFw"
);

export let BINARY_OPTIONS_ID = new PublicKey(
  "61CT8HS9jQvCjFL9i4V9RkAFqZfe8BQ2rdmMKvDXrcNL"
);

export const PROGRAM_IDS = [
  {
    name: "mainnet-beta",
  },
  {
    name: "testnet",
  },
  {
    name: "devnet",
  },
  {
    name: "localnet",
  },
];

export const setProgramIds = (envName: string) => {
  let instance = PROGRAM_IDS.find((env) => env.name === envName);
  if (!instance) {
    return;
  }
};

export const programIds = () => {
  return {
    token: TOKEN_PROGRAM_ID,
  };
};
