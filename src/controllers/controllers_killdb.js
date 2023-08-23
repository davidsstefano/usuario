import { Router } from "express";
import db from "../config/database.js";

const controllerkilldb = Router();

controllerkilldb.get("/kill", function (request, response) {
     let sql = "SELECT CONCAT('KILL ',id,';') AS run_this FROM information_schema.processlist WHERE user='hiddenwolf'";
     
     db.query(sql, function (err, result) {
       if (err) {
         return response.status(500).send(err);
       } else {
         return response.status(200).json(result);
       }
     });
   });



export default controllerkilldb;