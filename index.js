import express from "express";
import cors from "cors";
import controllerUsuarios from "./src/controllers/controllers_usuarios.js";
import controllerFavoritos from "./src/controllers/controllers_favoritos.js";
import controllerInteracao from "./src/controllers/controllers_interacao.js";

const app = express();
const port = 3001;

app.use(express.json());

app.use(cors());

app.use(controllerUsuarios);
app.use(controllerFavoritos);
app.use(controllerInteracao);


app.get("/", (req, res) => {
  res.send("Hello, World!"); 
});

app.listen(port, () => {
  console.log("Server on");
});
