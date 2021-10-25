const pool = require("./pool");

/* SOCKET DB */
// Gets all contracts matching underlyer's public key as a string
const getContracts = (symbol_key) => {
  return new Promise((resolve) => {
    pool.query(
      "SELECT * FROM contracts_test WHERE symbol_key = $1 ORDER BY id",
      [symbol_key],
      (error, results) => {
        if (error) {
          throw error;
        }
        resolve(results.rows);
      }
    );
  });
};

// Creates a new contract with null buyer_id and buyer_volume
const createSeller = (seller) => {
  return new Promise((resolve) => {
    pool.query(
      `INSERT INTO contracts_test 
      (symbol, symbol_key, expiry, strike, seller_id, seller_percent, seller_volume)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING symbol, symbol_key, expiry, strike, seller_id, seller_percent, seller_volume, created_at`,
      [
        seller.symbol,
        seller.symbol_key,
        seller.expiry,
        seller.strike,
        seller.seller_id,
        seller.seller_percent,
        seller.seller_volume
      ],
      (error, results) => {
        if (error) {
          throw error;
        }
        resolve(results.rows);
      }
    );
  });
};

module.exports = {
  getContracts,
  createSeller,
};
