import { Router } from "express";
import db from "../config/database.js";

const controllerIndicacao = Router();

controllerIndicacao.get("/indicacoes", function (request, response) {
     let sql = "SELECT * FROM indicacoes";
     
     db.query(sql, function (err, result) {
       if (err) {
         return response.status(500).send(err);
       } else {
         return response.status(200).json(result);
       }
     });
   });


   controllerIndicacao.post("/indicacao", async (request, response) => {
    try {
      const meuid = request.body.meuid;
      const id_indicado = request.body.id_indicado;
      const id_filme_fm = request.body.id_filme_fm;
      const currentDate = new Date();
  
      // Verifica se ambos os usuários existem
      const checkQuery = `
        SELECT 
          CASE 
            WHEN (SELECT COUNT(*) FROM usuarios WHERE id_user IN (?, ?)) = 2 THEN 1
            ELSE 0
          END AS both_users_present;
      `;
      const checkValues = [meuid, id_indicado];
  
      db.query(checkQuery, checkValues, (err, results) => {
        if (err) {
          console.error("Erro durante a verificação da existência do usuário:", err);
          return response.status(500).json({ mensagem: "Erro Interno do Servidor" });
        }
        const ambosUsuariosPresentes = results[0].both_users_present;
  
        if (!ambosUsuariosPresentes) {
          return response.status(400).json({ mensagem: "Um ou ambos os usuários não existem" });
        }
  
        // Verifica se a recomendação já existe na tabela de indicações
        const checkIndicacaoQuery = `
          SELECT COUNT(*) AS existing_indications
          FROM indicacoes
          WHERE id_user_ind = ? AND id_user_rec = ? AND id_filme = ?;
        `;
        const checkIndicacaoValues = [meuid, id_indicado, id_filme_fm];
  
        db.query(checkIndicacaoQuery, checkIndicacaoValues, (checkErr, checkResults) => {
          if (checkErr) {
            console.error("Erro durante a verificação da existência da recomendação:", checkErr);
            return response.status(500).json({ mensagem: "Erro Interno do Servidor" });
          }
          const existingIndications = checkResults[0].existing_indications;
  
          if (existingIndications > 0) {
            return response.status(400).json({ mensagem: "Essa recomendação já existe na tabela de indicações" });
          }
  
          // Insere a recomendação
          const insertQuery = `
            INSERT INTO indicacoes (id_user_ind, id_user_rec, id_filme, data_indicacao)
            VALUES (?, ?, ?, ?);
          `;
          const insertValues = [meuid, id_indicado, id_filme_fm, currentDate];
  
          db.query(insertQuery, insertValues, (insertErr, insertResult) => {
            if (insertErr) {
              console.error("Erro durante a inserção da recomendação:", insertErr);
              return response.status(500).json({ mensagem: "Erro Interno do Servidor" });
            }
            return response.status(201).json({ id_cadastro: insertResult.insertId });
          });
        });
      });
    } catch (error) {
      console.error("Erro durante a criação da recomendação:", error);
      return response.status(500).json({ mensagem: "Erro Interno do Servidor" });
    }
  });
   


export default controllerIndicacao;