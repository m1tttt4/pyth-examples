const Pool = require("pg").Pool;
const pool = new Pool({
  user: "<user>",
  host: "localhost",
  database: "<database>",
  password: "<password>",
  port: 5432,
});
