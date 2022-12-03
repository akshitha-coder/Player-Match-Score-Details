const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running on http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Get all the details of players table
app.get("/players/", async (request, response) => {
  const getPlayerDetails = `
    SELECT *
    FROM player_details;
    `;

  const dbObject = await db.all(getPlayerDetails);
  console.log(dbObject);
  let arr = [];

  const convertSnakeCaseToCamelCase = (dbObj) => {
    return {
      playerId: dbObj.player_id,
      playerName: dbObj.player_name,
    };
  };

  for (let each of dbObject) {
    const a = convertSnakeCaseToCamelCase(each);
    arr.push(a);
  }
  response.send(arr);
});
