import { Router } from "express";
import db from "../config/database.js";

const controllerFavoritos = Router();

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
    let sql = "SELECT * FROM favoritos_filmes WHERE id_usuario_fm = ?";
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
      const currentDate = new Date();

      const status = 1;

      const sql =
        "INSERT INTO favoritos_generos (id_usuario_fg, id_genero_fg, data_atualizaçao_fg, status_ativacao_fg) VALUES (?, ?, ?, ?)";
      db.query(
        sql,
        [request.body.id_usuario_fg, request.body.id_genero_fg, currentDate, status],
        function (err, result) {
          if (err) {
            return response.status(500).send(err);
          } else {
            return response.status(201).json({ id_cadastro: result.insertId });
          }
        }
      );
    } catch (error) {
      console.error("Error during user registration:", error);
      return response.status(500).json({ message: "Internal Server Error" });
    }
  }
);

controllerFavoritos.post(
  "/filmes_favoritos/cadastro",
  async function (request, response) {
    try {
      const currentDate = new Date();

      const status = 1;

      const sql =
        "INSERT INTO favoritos_filmes (id_usuario_fm, id_filme_fm, data_atualizaçao_fm, status_ativacao_fm) VALUES (?, ?, ?, ?)";
      db.query(
        sql,
        [request.body.id_usuario_fm, request.body.id_filme_fm, currentDate, status],
        function (err, result) {
          if (err) {
            return response.status(500).send(err);
          } else {
            return response.status(201).json({ id_cadastro: result.insertId });
          }
        }
      );
    } catch (error) {
      console.error("Error during user registration:", error);
      return response.status(500).json({ message: "Internal Server Error" });
    }
  }
);


export default controllerFavoritos;
