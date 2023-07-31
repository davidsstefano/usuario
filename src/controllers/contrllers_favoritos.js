import { Router } from "express";
import db from "../config/database.js";

const controllerFavoritos = Router();


controllerFavoritos.get("/favoritos", function (request, response) {
  let sql = "SELECT * FROM favoritos";
  db.query(sql, function (err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.status(200).json(result);
    }
  });
});

controllerFavoritos.get("/favoritos/:user_id", function (request, response) {
     let sql = "SELECT * FROM favoritos WHERE id_usuario = ?";
     db.query(sql, [request.params.user_id], function (err, result) {
       if (err) {
         return response.status(500).send(err);
       } else {
         if (result.length > 0) {
           return response.status(200).json(result[0]);
         } else {
           return response.status(404).json({ message: "Usuário não encontrado" });
         }
       }
     });
   });

export default controllerFavoritos;
