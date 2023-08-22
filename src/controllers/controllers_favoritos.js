import { Router } from "express";
import db from "../config/database.js";

const controllerFavoritos = Router();



//################################## ROTAS FILMES FAVORITOS #################################//

controllerFavoritos.get("/filmes_favoritos", function (request, response) {
  let sql = "SELECT * FROM favoritos_filmes";
  db.query(sql, function (err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.status(200).json(result);
    }
  });
});

controllerFavoritos.get(
  "/filmes_favoritos/:user_id",
  function (request, response) {
    let sql =
      "SELECT * FROM favoritos_filmes WHERE id_usuario_fm = ? AND status_ativacao_fm = 1";
    db.query(sql, [request.params.user_id], function (err, result) {
      if (err) {
        return response.status(500).send(err);
      } else {
        if (result.length > 0) {
          return response.status(200).json(result);
        } else {
          return response
            .status(404)
            .json({ message: "Nenhum filme favoritado." });
        }
      }
    });
  }
);

controllerFavoritos.post(
  "/filmes_favoritos/cadastro",
  async function (request, response) {
    try {
      const id_usuario_fm = request.body.id_usuario_fm;
      const id_filme_fm = request.body.id_filme_fm;
      const filme_titulo = request.body.title;
      const filme_poster = request.body.poster_path;
      const currentDate = new Date();
      const status = 1;

      const checkQuery =
        "SELECT * FROM favoritos_filmes WHERE id_usuario_fm = ? AND id_filme_fm = ?";
      db.query(
        checkQuery,
        [id_usuario_fm, id_filme_fm],
        function (err, results) {
          if (err) {
            return response.status(500).send(err);
          }

          if (results.length > 0) {
            const updateQuery =
              "UPDATE favoritos_filmes SET status_ativacao_fm = ?, data_atualizacao_fm = ? WHERE id_usuario_fm = ? AND id_filme_fm = ?";
            db.query(
              updateQuery,
              [status, currentDate, id_usuario_fm, id_filme_fm],
              function (err, updateResult) {
                if (err) {
                  return response.status(500).send(err);
                }
                return response
                  .status(200)
                  .json({ message: "Updated status." });
              }
            );
          } else {
            const insertQuery =
              "INSERT INTO favoritos_filmes (id_usuario_fm, id_filme_fm, data_atualizacao_fm, status_ativacao_fm, title, poster_path) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(
              insertQuery,
              [
                id_usuario_fm,
                id_filme_fm,
                currentDate,
                status,
                filme_titulo,
                filme_poster,
              ],
              function (err, insertResult) {
                if (err) {
                  return response.status(500).send(err);
                }
                return response
                  .status(201)
                  .json({ id_cadastro: insertResult.insertId });
              }
            );
          }
        }
      );
    } catch (error) {
      console.error("Error during user registration:", error);
      return response.status(500).json({ message: "Internal Server Error" });
    }
  }
);

controllerFavoritos.put(
  "/filmes_favoritos/status-now/:id_usuario/:id_filme",
  async (req, res) => {
    try {
      const id_filme = req.params.id_filme;
      const id_usuario = req.params.id_usuario;
      const currentDate = new Date();
      const updateStatusQuery = `UPDATE favoritos_filmes SET data_atualizacao_fm = ?, status_ativacao_fm = 2 WHERE id_filme_fm = ? AND id_usuario_fm = ?;`;
      db.query(
        updateStatusQuery,
        [currentDate, id_filme, id_usuario],
        async (err, statusResult) => {
          if (err) {
            console.error("Erro ao atualizar status:", err);
            return res
              .status(500)
              .json({ message: "Erro interno do servidor" });
          }

          if (statusResult.affectedRows === 0) {
            return res.status(404).json({ message: "Favorito não encontrado" });
          }
          return res.status(200).json({
            message: "Status atualizado e data de atualização registrada",
          });
        }
      );
    } catch (err) {
      console.error("Erro ao processar requisição:", err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);

controllerFavoritos.delete(
  "/filmes_favoritos/:id_favorito_filmes",
  async function (request, response) {
    try {
      const favoritoId = request.params.id_favorito_filmes;
      const sqlDelete =
        "DELETE FROM favoritos_filmes WHERE id_favorito_filmes = ?";

      db.query(sqlDelete, [favoritoId], function (err, result) {
        if (err) {
          return response
            .status(500)
            .json({ error: "Erro ao excluir favorito." });
        } else {
          if (result.affectedRows > 0) {
            response
              .status(200)
              .json({ message: "Favorito excluído com sucesso." });
          } else {
            response.status(404).json({ error: "Favorito não encontrado." });
          }
        }
      });
    } catch (err) {
      console.error("Error during deleting favorite:", err);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
);

//################################## ROTAS GENEROS FAVORITOS  #################################//

controllerFavoritos.get("/generos", function (request, response) {
  let sql = "SELECT * FROM generos";
  db.query(sql, function (err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.status(200).json(result);
    }
  });
});
controllerFavoritos.get("/generos/:id_genero", function (request, response) {
  let sql = "SELECT * FROM generos WHERE id_genero = ? ";
  db.query(sql, [request.params.id_genero], function (err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.status(200).json(result);
    }
  });
});

controllerFavoritos.get("/generos_favoritos", function (request, response) {
  let sql = "SELECT * FROM favoritos_generos";
  db.query(sql, function (err, result) {
    if (err) {
      return response.status(500).send(err);
    } else {
      return response.status(200).json(result);
    }
  });
});

controllerFavoritos.get(
  "/generos_favoritos/:user_id",
  function (request, response) {
    let sql = "SELECT * FROM favoritos_generos WHERE id_usuario_fg = ?";
    db.query(sql, [request.params.user_id], function (err, result) {
      if (err) {
        return response.status(500).send(err);
      } else {
        if (result.length > 0) {
          return response.status(200).json(result);
        } else {
          return response
            .status(404)
            .json({ message: "Usuário não encontrado" });
        }
      }
    });
  }
);

controllerFavoritos.post(
  "/generos_favoritos/cadastro",
  async function (request, response) {
    try {
      const id_usuario_fg = request.body.id_usuario_fg;
      const id_genero_fg = request.body.id_genero_fg;
      const currentDate = new Date();
      const status = 1;

      const checkQuery =
        "SELECT * FROM favoritos_generos WHERE id_usuario_fg = ? AND id_genero_fg = ?";
      db.query(
        checkQuery,
        [id_usuario_fg, id_genero_fg],
        function (err, results) {
          if (err) {
            return response.status(500).send(err);
          }

          if (results.length > 0) {
            const updateQuery =
              "UPDATE favoritos_generos SET status_ativacao_fg = ? WHERE id_usuario_fg = ? AND id_genero_fg = ?";
            db.query(
              updateQuery,
              [status, id_usuario_fg, id_genero_fg],
              function (err, updateResult) {
                if (err) {
                  return response.status(500).send(err);
                }
                return response
                  .status(200)
                  .json({ message: "Updated status." });
              }
            );
          } else {
            const insertQuery =
              "INSERT INTO favoritos_generos (id_usuario_fg, id_genero_fg, data_atualizacao_fg, status_ativacao_fg) VALUES (?, ?, ?, ?)";
            db.query(
              insertQuery,
              [id_usuario_fg, id_genero_fg, currentDate, status],
              function (err, insertResult) {
                if (err) {
                  return response.status(500).send(err);
                }
                return response
                  .status(201)
                  .json({ id_cadastro: insertResult.insertId });
              }
            );
          }
        }
      );
    } catch (error) {
      console.error("Error during user registration:", error);
      return response.status(500).json({ message: "Internal Server Error" });
    }
  }
);

controllerFavoritos.delete(
  "/generos_favoritos/:id_favorito_generos",
  async function (request, response) {
    try {
      const favoritoId = request.params.id_favorito_generos;
      const sqlDelete =
        "DELETE FROM favoritos_generos WHERE id_favorito_generos = ?";

      db.query(sqlDelete, [favoritoId], function (err, result) {
        if (err) {
          return response
            .status(500)
            .json({ error: "Erro ao excluir favorito." });
        } else {
          if (result.affectedRows > 0) {
            response
              .status(200)
              .json({ message: "Favorito excluído com sucesso." });
          } else {
            response.status(404).json({ error: "Favorito não encontrado." });
          }
        }
      });
    } catch (err) {
      console.error("Error during deleting favorite:", err);
      return response.status(500).json({ error: "Internal Server Error" });
    }
  }
);

export default controllerFavoritos;
