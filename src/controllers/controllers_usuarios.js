import { Router } from "express";
import db from "../config/database.js";
import bcrypt from "bcrypt";
import CryptoJS from 'crypto-js';
import {v4 as uuidv4} from "uuid"

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



controllerUsuarios.post("/usuarios/login", async function (request, response) {
  try {
    const md5Hash = CryptoJS.MD5(request.body.senha_user).toString();
  
    console.log(md5Hash);

    const sql = "SELECT id_user, nome_user FROM usuarios WHERE email_user = ? and senha_user = ?";
    db.query(
      sql,
      [request.body.email_user, md5Hash],
      
      function (err, result) {
        if (err) {
          return response.status(500).send(err);
        } else {
          return response.status(result.length > 0 ? 200 : 401).json(result[0]);
          
        }
      }
      
    );
  } catch (err) {
    console.error("Error during login:", err);
    return response.status(500).json({ message: "Internal Server Error" });
  }
});




controllerUsuarios.post("/usuarios/cadastro", async function (request, response) {
  try {
    const currentDate = new Date();
  
    const token_user = uuidv4();

    const md5Hash = CryptoJS.MD5(request.body.senha_user).toString();

    const sql =
      "INSERT INTO usuarios (nome_user, email_user, senha_user, token_user, data_cadastro_user) VALUES (?, ?, ?, ?, ?)";
    db.query(
      sql,
      [
        request.body.nome_user,
        request.body.email_user,
        md5Hash,
        token_user,
        currentDate,
      ],
      function (err, result) {
        if (err) {
          return response.status(500).send(err);
        } else {
          return response.status(201).json({ user_id: result.insertId });
        }
      }
    );
  } catch (error) {
    console.error("Error during user registration:", error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
});




export default controllerUsuarios;
