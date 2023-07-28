import { Router } from "express";
import db from "../config/database.js";


const controllerUsuarios = Router();


controllerUsuarios.get("/usuarios", function (request, response) {
  let sql = "SELECT * FROM usuarios";
  db.query(sql, function (err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.status(200).json(result);
    }
  });
});

controllerUsuarios.get("/usuarios/:user_id", function (request, response) {
  let sql = "SELECT * FROM usuarios WHERE id_user = ?";
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


controllerUsuarios.post("/usuarios/login", function (request, response) {
  let sql = "SELECT id_user, nome_user  FROM usuarios WHERE email_user = ? and senha_user = ?";
  db.query(
    sql,
    [request.body.email_user, request.body.senha_user],
    function (err, result) {
      if (err) {
        return response.status(500).send(err);
      } else {
        return response.status(result.length > 0 ? 200 : 401).json(result[0]);
      }
    }
  );
}); 




controllerUsuarios.post("/usuarios/cadastro", async function (request, response) {
  try {
    
    const sql = "INSERT INTO usuarios (nome_user, email_user, senha_user) VALUES (?, ?, ?)";
    db.query(sql, [request.body.nome_user, request.body.email_user, request.body.senha_user], function (err, result) {
      if (err) {
        return response.status(500).send(err);
      } else {
        return response.status(201).json({ id_user: result.insertId });
      }
    });
  } catch (error) {
    return response.status(500).send(error);
  }
});




export default controllerUsuarios;
