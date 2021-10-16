import React from 'react';

export const devnetTransaction = (txid: number) => {
  return (
    <>
      <a
        href={`https://explorer.solana.com/tx/${txid}?cluster=devnet`}
      >
        Explorer Link
      </a>
    </>
  );
}
