import { Router } from "express";
import db from "../config/database.js";

const controllerInteracao = Router();

const handleDatabaseError = (res, error) => {
  console.error("Erro no banco de dados:", error);
  res
    .status(500)
    .json({ error: "Ocorreu um erro ao acessar o banco de dados." });
};

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

controllerInteracao.get("/interacao", async (req, res) => {
  try {
    const sql = "SELECT * FROM tempo_interacao";
    const result = await query(sql);
    res.status(200).json(result);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

controllerInteracao.get("/interacao/:id_user", async (req, res) => {
  try {
    const id_user = req.params.id_user;
    const userExistenceCheck = await query(
      "SELECT COUNT(*) AS userCount FROM usuarios WHERE id_user = ?",
      [id_user]
    );

    if (userExistenceCheck[0].userCount === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const sql = `
       SELECT
       usu.nome_user,
       ge.nome_genero,
       SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(ti.data_final, ti.data_inicio)))) AS total_diferenca
     FROM
       tempo_interacao ti
     INNER JOIN
       usuarios usu ON ti.id_usuario = usu.id_user
     LEFT JOIN
       generos ge ON ge.id_da_api = ti.id_genero
     WHERE
       usu.id_user = ?
     GROUP BY
       usu.nome_user, ge.nome_genero
       ORDER BY
       total_diferenca DESC
       `;

    const result = await query(sql, [id_user]);
    res.status(200).json(result);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

controllerInteracao.post(
  "/interacao/inicio/:id_usuario/:id_genero",
  async (req, res) => {
    try {
      const { id_usuario, id_genero } = req.params;

      const userQuery = "SELECT * FROM usuarios WHERE id_user = ?;";
      const genreQuery = "SELECT * FROM generos WHERE id_da_api = ?;";

      const [userRows, genreRows] = await Promise.all([
        query(userQuery, [id_usuario]),
        query(genreQuery, [id_genero]),
      ]);

      if (userRows.length === 0) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      if (genreRows.length === 0) {
        return res.status(404).json({ message: "Gênero não encontrado." });
      }

      const currentDate = new Date();
      const insertStatusQuery =
        "INSERT INTO tempo_interacao (id_usuario, id_genero, data_inicio) VALUES (?, ?, ?);";

      await query(insertStatusQuery, [id_usuario, id_genero, currentDate]);

      res
        .status(201)
        .json({ message: "Status atualizado e horário de início registrado." });
    } catch (error) {
      handleDatabaseError(res, error);
    }
  }
);

controllerInteracao.put("/interacao/fim/:id_interacao", async (req, res) => {
  try {
    const { id_interacao } = req.params;
    const currentDate = new Date();
    const updateStatusQuery =
      "UPDATE tempo_interacao SET data_final = ? WHERE id_interacao = ?;";
    const result = await query(updateStatusQuery, [currentDate, id_interacao]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "ID não encontrado." });
    }

    res
      .status(200)
      .json({ message: "Status atualizado e horário de término registrado." });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

export default controllerInteracao;
