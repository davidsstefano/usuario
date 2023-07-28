import express from "express";
import cors from "cors";
import controllerUsuarios from "./src/controllers/controllers_usuarios.js";

const app = express();
const port = 3001;

// Middleware for parsing JSON requests
app.use(express.json());

// Middleware for handling Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Controller for handling user routes
app.use(controllerUsuarios);

// Route for the root URL
app.get("/", (req, res) => {
  res.send("Hello, World!"); // Send a simple response for the root URL
});

app.listen(port, () => {
  console.log("Server on");
});
