const pool = require("./pool");

const getOptions = (request, response) => {
  pool.query(
    "SELECT * FROM options_test ORDER BY id",
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

// CREATE BUYER
const createBuyer = (request, response) => {
  const { option_id, buyer_id, buyer_percent, buyer_volume } = request.body;
  pool.query(
    `INSERT INTO options_test 
    (option_id, buyer_id, buyer_percent, buyer_volume)
    VALUES ($1, $2, $3, $4)
    RETURNING option_id, buyer_id, buyer_percent, buyer_volume, created_at`,
    [option_id, buyer_id, buyer_percent, buyer_volume],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(results.rows);
    }
  );
};

/* SOCKET DB */
const getSocketOptions = () => {
  return new Promise((resolve) => {
    pool.query(
      "SELECT * FROM options_test ORDER BY id",
      (error, results) => {
        if (error) {
          throw error;
        }
        resolve(results.rows);
      }
    );
  });
};
const createSocketBuyer = (buyer) => {
  return new Promise((resolve) => {
    pool.query(
      `INSERT INTO options_test 
      (option_id, buyer_id, buyer_percent, buyer_volume)
      VALUES ($1, $2, $3, $4)
      RETURNING option_id, buyer_id, buyer_percent, buyer_volume, created_at`,
      [buyer.option_id, buyer.buyer_id, buyer.buyer_percent, buyer.buyer_volume],
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
  getOptions,
  getSocketOptions,
  createBuyer,
  createSocketBuyer
};
