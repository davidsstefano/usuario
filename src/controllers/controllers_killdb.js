import { Router } from "express";
import db from "../config/database.js";


const controllerkilldb = Router();


controllerkilldb.get("/kill", function (request, response) {
     
     let checkConnectionsSql = "SELECT id FROM information_schema.processlist WHERE user='hiddenwolf'";
     
     db.query(checkConnectionsSql, function (err, result) {
       if (err) {
         return response.status(500).send(err);
       } else {
         if (result.length > 5) {
           let killedConnections = [];
   
           for (let i = 0; i < result.length; i++) {
             let killQuery = `KILL ${result[i].id}`;
   
             db.query(killQuery, function (err, killResult) {
               if (err) {
                 return response.status(500).send(err);
               }
             });
   
             killedConnections.push(result[i].id);
           }
           
           return response.status(200).json({
             message: "Connections killed.",
             killedConnections: killedConnections
           });
         } else {
           return response.status(200).json({
             message: "No connections to kill.",
             activeConnections: result.length
           });
         }
       }
     });
   });
   
   

export default controllerkilldb;