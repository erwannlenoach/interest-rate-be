const { createServer } = require("node:http");
const sequelize = require("./db");
const hostname = "127.0.0.1";
const port = 8800;
const { populateLoans } = require("./controllers/loan");

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync({ force: true }); 
    await populateLoans(); 
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

async function init() {
  await connectDB();
  try {
    const server = await createServer((req, res) => {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end("Hello World");
    });

    server.listen(port, hostname, () => {
      console.log(`Server running at http://${hostname}:${port}/`);
    });
  } catch (error) {
    console.error("Unable to launch the server", error);
  }
}

init();
