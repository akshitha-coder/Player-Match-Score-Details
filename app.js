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

//Get a player by playerId
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerId = `
    SELECT *
    FROM player_details
    WHERE player_id = ${playerId};
    `;
  const playerDetails = await db.get(getPlayerId);

  const convertSnakeCaseToCamelCase = (dbObj) => {
    return {
      playerId: dbObj.player_id,
      playerName: dbObj.player_name,
    };
  };

  response.send(convertSnakeCaseToCamelCase(playerDetails));
});

//Update a player details
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;

  const updatePlayerDetails = `
    UPDATE player_details
    SET player_name = '${playerName}'
    WHERE player_id = ${playerId};
    `;

  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//Get a specific match details
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchDetails = `
    SELECT *
    FROM match_details
    WHERE match_id = ${matchId};
    `;
  const dbResponse = await db.get(getMatchDetails);

  const convertSnakeCaseToCamelCase = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };
  response.send(convertSnakeCaseToCamelCase(dbResponse));
});

//Get a list of all matches of a player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getMatchDetails = `
    SELECT match_details.match_id, match, year
    FROM match_details INNER JOIN player_match_score ON match_details.match_id = player_match_score.match_id 
    WHERE player_match_score.player_id = ${playerId};
    `;
  const dbResponse = await db.all(getMatchDetails);

  const convertSnakeCaseTocamelCase = (dbObject) => {
    return {
      matchId: dbObject.match_id,
      match: dbObject.match,
      year: dbObject.year,
    };
  };
  let arr = [];
  for (let each of dbResponse) {
    const a = convertSnakeCaseTocamelCase(each);
    arr.push(a);
  }
  response.send(arr);
});

//Get a list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerDetails = `
    SELECT player_details.player_id, player_name
    FROM player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id 
    WHERE player_match_score.match_id = ${matchId};
    `;
  const dbResponse = await db.all(getPlayerDetails);

  const convertSnakeCaseTocamelCase = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
    };
  };
  let arr = [];
  for (let each of dbResponse) {
    const a = convertSnakeCaseTocamelCase(each);
    arr.push(a);
  }
  response.send(arr);
});
//get statistics of totalscore, fours and sixes based on playerId
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `
    SELECT player_details.player_id, player_name, SUM(score) AS totalScore, SUM(fours) AS totalFours, SUM(sixes) AS totalSixes
    FROM player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id 
    WHERE player_details.player_id = ${playerId};
    `;

  const dbResponse = await db.get(getQuery);

  const convertSnakeCaseToCamelCase = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      totalScore: dbObject.totalScore,
      totalFours: dbObject.totalFours,
      totalSixes: dbObject.totalSixes,
    };
  };
  response.send(convertSnakeCaseToCamelCase(dbResponse));
});

module.exports = app;
