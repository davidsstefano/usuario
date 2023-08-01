import mysql from "mysql";

const db = mysql.createPool({
  host: "hiddenwolf.mysql.dbaas.com.br",
  user: "hiddenwolf",
  password: "DW#X1SN89nYxrD",
  database: "hiddenwolf",
});

export default db;
