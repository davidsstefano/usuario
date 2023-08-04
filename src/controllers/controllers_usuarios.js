import { Router } from "express";
import db from "../config/database.js";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

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
  let sql = "SELECT nome_user FROM usuarios WHERE id_user = ?";
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

function validarCampos(body) {
  const { email_user, senha_user } = body;

  if (!email_user || email_user.indexOf("@") === -1) {
    return 'O campo "email" é inválido. Certifique-se de que contém um "@"';
  }

  if (!senha_user || senha_user.length < 5) {
    return 'O campo "senha" é inválido. A senha deve conter pelo menos 5 caracteres.';
  }

  return null; // Campos válidos
}

controllerUsuarios.post("/usuarios/login", async function (request, response) {
  try {
    const validationError = validarCampos(request.body);

    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    const md5Hash = CryptoJS.MD5(request.body.senha_user).toString();
    const sqlSelect =
      "SELECT id_user, nome_user, token_user FROM usuarios WHERE email_user = ? AND senha_user = ?";
    const sqlUpdate =
      "UPDATE usuarios SET data_ultimolog_user = ?, quantidade_acesso = quantidade_acesso + 1 WHERE id_user = ?";

    db.query(
      sqlSelect,
      [request.body.email_user, md5Hash],
      function (err, result) {
        if (err) {
          return response.status(500).send(err);
        } else {
          if (result.length > 0) {
            const user_id = result[0].id_user;
            const currentDate = new Date();
            db.query(
              sqlUpdate,
              [currentDate, user_id],
              function (updateErr, updateResult) {
                if (updateErr) {
                  return response
                    .status(500)
                    .json({ error: "Erro ao atualizar o usuário." });
                } else {
                  // Retorna os dados do usuário no formato JSON
                  response.setHeader("Content-Type", "application/json");
                  response.status(200).json(result[0]);
                }
              }
            );
          } else {
            response
              .status(401)
              .json({ error: "Nenhum resultado encontrado." });
          }
        }
      }
    );
  } catch (err) {
    console.error("Error during login:", err);
    return response.status(500).json({ message: "Internal Server Error" });
  }
});

controllerUsuarios.post(
  "/usuarios/cadastro",
  async function (request, response) {
    try {
      const validationError = validarCampos(request.body);
      console.log(request.body);
      if (validationError) {
        return response.status(400).json({ error: validationError });
      }

      const currentDate = new Date();
      const token_user = uuidv4();
      const md5Hash = CryptoJS.MD5(request.body.senha_user).toString();
      const acesso = 0;

      const sql = `INSERT INTO usuarios (nome_user, email_user, senha_user, token_user, data_cadastro_user, quantidade_acesso)
       VALUES (?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [
          request.body.nome_user,
          request.body.email_user,
          md5Hash,
          token_user,
          currentDate,
          acesso,
        ],
        (err, result) => {
          if (err) {
            return response.status(500).send(err);
          } else {
            return response.status(201).json({ user_id: result.insertId });
          }
        }
      );
    } catch (err) {
      console.error("Error during user registration:", err);
      return response.status(500).json({ message: "Internal Server Error" });
    }
  }
);

controllerUsuarios.delete(
  "/usuarios/:id_user",
  async function (request, response) {
    try {
      const usuarioId = request.body.id_user;
      const sqlDelete = "DELETE FROM usuarios WHERE id_user = ?";
      // console.log(usuarioId);

      db.query(sqlDelete, [usuarioId], function (err, result) {
        if (err) {
          return response
            .status(500)
            .json({ error: "Erro ao excluir usuario." });
        } else {
          if (result.affectedRows > 0) {
            // If at least one row was affected, it means the favorite was deleted successfully
            response
              .status(200)
              .json({ message: "Usuario excluído com sucesso." });
          } else {
            // If no rows were affected, the provided usuarioId might not exist in the database
            response.status(404).json({ error: "Usuario não encontrado." });
          }
        }
      });
    } catch (err) {
      console.error("Error during deleting favorite:", err);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default controllerUsuarios;
