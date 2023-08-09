import { Router } from "express";
import db from "../config/database.js";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import validator from "validator";



const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "testexmld@gmail.com",
    pass: "pegyjwolwncmfght",
  },
});
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
controllerUsuarios.get("/usuarios/:user_token", function (request, response) {
  let sql =
    "SELECT id_user,nome_user,token_user,email_user FROM usuarios WHERE token_user = ?";
  db.query(sql, [request.params.user_token], function (err, result) {
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
  if (!validator.isEmail(email_user)) {
    
    return "O campo (Email) é inválido. Certifique-se de que contém um e-mail válido.";
  }
  if (!senha_user || senha_user.length < 5) {
    return "O campo (Senha) é inválido. A senha deve conter pelo menos 5 caracteres.";
  }
  return null;
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
      if (validationError) {
        return response.status(400).json({ error: validationError });
      }
      const currentDate = new Date();
      const token_user = uuidv4();
      const md5Hash = CryptoJS.MD5(request.body.senha_user).toString();
      const acesso = 1;
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
            const mailOptions = {
              from: "testexmld@gmail.com",
              to: request.body.email_user,
              subject: "Cadastro realizado com sucesso",
              text: "Seu cadastro foi realizado com sucesso!",
            };
            transporter.sendMail(mailOptions, (emailError, emailInfo) => {
              if (emailError) {
                console.error("Erro ao enviar e-mail:", emailError);
              } else {
                console.log("E-mail enviado com sucesso:", emailInfo.response);
              }
            });
            return response.status(201).json({ user_id: result.insertId });
          }
        }
      );
    } catch (err) {
      console.error("Erro durante o cadastro de usuário:", err);
      return response.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);

controllerUsuarios.put("/usuario/gerar-codigo", async (req, res) => {
  try {
    const codigo = Math.floor(100000 + Math.random() * 900000);
    const userEmail = req.body.email;
    const sqlUpdate = `UPDATE usuarios SET troca_senha = ? WHERE email_user = ?`;
    db.query(sqlUpdate, [codigo, userEmail], async (err, result) => {
      if (err) {
        console.error("Erro ao atualizar código:", err);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }
      const mailOptions = {
        from: "testexmld@gmail.com",
        to: req.body.email,
        subject: "Código de Recuperação de Senha",
        text: `Seu código de recuperação de senha é: ${codigo}`,
      };
      try {
        const emailInfo = await transporter.sendMail(mailOptions);
        console.log("E-mail enviado com sucesso:", emailInfo.response);
        return res
          .status(200)
          .json({ message: "Código enviado para o e-mail fornecido" });
      } catch (emailError) {
        console.error("Erro ao enviar e-mail:", emailError);
        return res.status(500).json({ message: "Erro ao enviar e-mail" });
      }
    });
  } catch (err) {
    console.error("Erro ao gerar código:", err);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

controllerUsuarios.put("/usuario/troca_senha", async (req, res) => {
  try {
    const codigo = req.body.codigo; // Corrected variable name
    const troca_senha = CryptoJS.MD5(req.body.senha).toString();
    const confirma_senha = CryptoJS.MD5(req.body.confi_senha).toString();

    if (troca_senha !== confirma_senha) {
      return res.status(400).json({ message: "As senhas não coincidem" });
    }

    const sqlSelect = `SELECT id_user FROM usuarios WHERE troca_senha = ?`;
    db.query(sqlSelect, [codigo], async (err, results) => {
      if (err) {
        console.error("Erro ao selecionar usuário:", err);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Código de usuário não encontrado" });
      }

      const userId = results[0].id_user;

      const sqlUpdate = `UPDATE usuarios SET senha_user = ? WHERE id_user = ?`;
      db.query(sqlUpdate, [troca_senha, userId], async (err, result) => {
        if (err) {
          console.error("Erro ao trocar a senha:", err);
          return res.status(500).json({ message: "Erro interno do servidor" });
        }

        return res
          .status(200)
          .json({ message: "Senha atualizada com sucesso" });
      });
    });
  } catch (error) {
    console.error("Erro ao processar a requisição:", error);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

controllerUsuarios.delete(
  "/usuarios/:id_user",
  async function (request, response) {
    try {
      const usuarioId = request.body.id_user;
      const sqlDelete = "DELETE FROM usuarios WHERE id_user = ?";
      db.query(sqlDelete, [usuarioId], function (err, result) {
        if (err) {
          return response
            .status(500)
            .json({ error: "Erro ao excluir usuario." });
        } else {
          if (result.affectedRows > 0) {
            response
              .status(200)
              .json({ message: "Usuario excluído com sucesso." });
          } else {
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
