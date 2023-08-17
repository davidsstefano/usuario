import { Router } from "express";
import db from "../config/database.js";

const controllerInteracao = Router();

controllerInteracao.get("/interacao", function (request, response) {
  let sql = "SELECT * FROM tempo_interacao";
  db.query(sql, function (err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.status(200).json(result);
    }
  });
});

controllerInteracao.get("/interacao/:id_user", function (request, response) {
  let sql =
    "SELECT usu.nome_user, ge.nome_genero, SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(ti.data_final, ti.data_inicio)))) AS total_diferenca FROM tempo_interacao ti INNER JOIN usuarios usu ON ti.id_usuario = usu.id_user LEFT JOIN generos ge ON ge.id_da_api = ti.id_genero WHERE usu.id_user = ? GROUP BY usu.nome_user, ge.nome_genero;";
  db.query(sql, [request.params.id_user], function (err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.status(200).json(result);
    }
  });
});

controllerInteracao.post(
  "/interacao/inicio/:id_usuario/:id_genero",
  async (req, res) => {
    try {
      const id_genero = req.params.id_genero;
      const id_usuario = req.params.id_usuario;
      const currentDate = new Date();
      const insertStatusQuery = `INSERT INTO tempo_interacao (id_usuario, id_genero,data_inicio) VALUES (?, ?, ?);`;
      db.query(
        insertStatusQuery,
        [id_usuario, id_genero, currentDate],
        async (err, statusResult) => {
          if (err) {
            console.error("Erro ao atualizar status:", err);
            return res
              .status(500)
              .json({ message: "Erro interno do servidor" });
          }

          if (statusResult.affectedRows === 0) {
            return res.status(404).json({ message: "Erro ao cadastrar!!!" });
          }
          return res.status(201).json({
            message: "Status atualizado e data inicial registrada",
          });
        }
      );
    } catch (err) {
      console.error("Erro ao processar requisição:", err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);

controllerInteracao.put("/interacao/fim/:id_interacao", async (req, res) => {
  try {
    const id_interacao = req.params.id_interacao;
    const currentDate = new Date();
    const updateStatusQuery = `UPDATE tempo_interacao SET data_final = ? WHERE id_interacao = ?;`;

    const updateStatusPromise = () => {
      return new Promise((resolve, reject) => {
        db.query(
          updateStatusQuery,
          [currentDate, id_interacao],
          (err, statusResult) => {
            if (err) {
              console.error("Erro ao atualizar status:", err);
              reject(err);
            } else {
              resolve(statusResult);
            }
          }
        );
      });
    };

    const statusResult = await updateStatusPromise();

    if (statusResult.affectedRows === 0) {
      return res.status(404).json({ message: "ID não encontrado" });
    }

    return res.status(200).json({
      message: "Status atualizado e data de atualização registrada",
    });
  } catch (err) {
    console.error("Erro ao processar requisição:", err);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

export default controllerInteracao;