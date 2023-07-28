import mysql from "mysql";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "projeto_estudos",
});

export default db;