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

      const consultaUsuario = "SELECT * FROM usuarios WHERE id_user = ?;";
      const consultaGenero = "SELECT * FROM generos WHERE id_da_api = ?;";

      const [linhasUsuario, linhasGenero] = await Promise.all([
        query(consultaUsuario, [id_usuario]),
        query(consultaGenero, [id_genero]),
      ]);

      if (linhasUsuario.length === 0) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }

      if (linhasGenero.length === 0) {
        return res.status(404).json({ mensagem: "Gênero não encontrado." });
      }

      const dataAtual = new Date();
      
      // Finalizar a interação anterior do mesmo usuário (se existir)
      const atualizarInteracaoAnteriorQuery =
        "UPDATE tempo_interacao SET data_final = ? WHERE id_usuario = ? AND data_final IS NULL;";
      
      await query(atualizarInteracaoAnteriorQuery, [dataAtual, id_usuario]);

      const inserirInteracaoQuery =
        "INSERT INTO tempo_interacao (id_usuario, id_genero, data_inicio) VALUES (?, ?, ?);";

      await query(inserirInteracaoQuery, [id_usuario, id_genero, dataAtual]);

      res
        .status(201)
        .json({ mensagem: "Status atualizado e horário de início registrado." });
    } catch (erro) {
      lidarComErroDeBancoDeDados(res, erro);
    }
  }
);

controllerInteracao.put("/interacao/fim/:id_interacao", async (req, res) => {
  try {
    const { id_interacao } = req.params;
    const dataAtual = new Date();
    const atualizarStatusQuery =
      "UPDATE tempo_interacao SET data_final = ? WHERE id_interacao = ?;";
    const resultado = await query(atualizarStatusQuery, [dataAtual, id_interacao]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensagem: "ID não encontrado." });
    }

    res
      .status(200)
      .json({ mensagem: "Status atualizado e horário de término registrado." });
  } catch (erro) {
    lidarComErroDeBancoDeDados(res, erro);
  }
});


export default controllerInteracao;
