import { Router } from "express";
import db from "../config/database.js";

const controllerIndicacao = Router();

controllerIndicacao.get("/indicacoes", function (request, response) {
     let sql = "SELECT * FROM indicacoes";
     
     db.query(sql, function (err, result) {
       if (err) {
         return response.status(500).send(err);
       } else {
         return response.status(200).json(result);
       }
     });
   });



export default controllerIndicacao;