import { Router } from "express";
import db from "../config/database.js";

const controllerInteracao_f = Router();
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
   
   controllerInteracao_f.get("/interacao-filme", async (req, res) => {
     try {
       const sql = "SELECT * FROM filme_tempo_interacao";
       const result = await query(sql);
       res.status(200).json(result);
     } catch (error) {
       handleDatabaseError(res, error);
     }
   });

   controllerInteracao_f.post(
     "/interacao-filme/inicio/:id_usuario/:id_movie",
     async (req, res) => {
       try {
         const { id_usuario, id_movie} = req.params;
     
   
         const consultaUsuario = "SELECT * FROM usuarios WHERE id_user = ?;";
         
   
         const [linhasUsuario] = await Promise.all([
           query(consultaUsuario, [id_usuario]),
          
         ]);
   
         if (linhasUsuario.length === 0) {
           return res.status(404).json({ mensagem: "Usuário não encontrado." });
         }
   
          
         const dataAtual = new Date();
       
         const atualizarInteracaoAnteriorQuery =
           "UPDATE tempo_interacao SET data_final = ? WHERE id_usuario = ? AND data_final IS NULL;";
         
         await query(atualizarInteracaoAnteriorQuery, [dataAtual, id_usuario]);
   
         const inserirInteracaoQuery =
           "INSERT INTO filme_tempo_interacao (id_usuario, id_filme, data_inicio) VALUES (?, ?, ?);";
   
         await query(inserirInteracaoQuery, [id_usuario, id_movie, dataAtual]);
   
         res
           .status(201)
           .json({ mensagem: "Status atualizado e horário de início registrado." });
       } catch (erro) {
         lidarComErroDeBancoDeDados(res, erro);
       }
     }
   );

   controllerInteracao_f.put("/interacao-filme/fim/:id_interacao", async (req, res) => {
     try {
       const { id_interacao } = req.params;
       const dataAtual = new Date();
       const atualizarStatusQuery =
         "UPDATE filme_tempo_interacao SET data_final = ? WHERE id_filme_tempo_interacao = ?;";
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
   


export default controllerInteracao_f;