import { Router } from "express";
import db from "../config/database.js";


const controllerkilldb = Router();


controllerkilldb.get("/kill", function (request, response) {
     let checkConnectionsSql = "SELECT id FROM information_schema.processlist WHERE user='hiddenwolf'";
   
     db.query(checkConnectionsSql, function (err, result) {
       if (err) {
         return response.status(500).send(err);
       }
   
       if (result.length > 5) {
         let killedConnections = [];
   
         function killConnection(connectionId) {
           let killQuery = `KILL ${connectionId}`;
   
           db.query(killQuery, function (err) {
             if (err) {
               console.error(`Erro ao encerrar conexão ${connectionId}: ${err}`);
             } else {
               killedConnections.push(connectionId);
               if (killedConnections.length === result.length) {
                 return response.status(200).json({
                   message: "Conexões encerradas.",
                   conexoesEncerradas: killedConnections
                 });
               }
             }
           });
         }
   
         for (let i = 0; i < result.length; i++) {
           killConnection(result[i].id);
         }
       } else {
         return response.status(200).json({
           message: "Nenhuma conexão para encerrar.",
           conexoesAtivas: result.length
         });
       }
     });
   });
   
   
   

export default controllerkilldb;