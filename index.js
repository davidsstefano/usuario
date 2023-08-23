import express from "express";
import cors from "cors";
import controllerUsuarios from "./src/controllers/controllers_usuarios.js";
import controllerFavoritos from "./src/controllers/controllers_favoritos.js";
import controllerInteracao from "./src/controllers/controllers_interacao.js";
import controllerIndicacao from "./src/controllers/controllers_indicacao.js";
import controllerkilldb from "./src/controllers/controllers_killdb.js";

const app = express();
const port = 3001;

app.use(express.json());

app.use(cors());

app.use(controllerUsuarios);
app.use(controllerFavoritos);
app.use(controllerInteracao);
app.use(controllerIndicacao);
app.use(controllerkilldb)


app.get("/", (req, res) => {
  res.send("Hello, World!"); 
});

app.listen(port, () => {
  console.log("Server on");
});
