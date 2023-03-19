import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import mime from 'mime';

const dbutils = require('../data/dbutils');
declare const __dirname: string;
const fs = require('fs');
const infoData = JSON.parse(fs.readFileSync('data/staticdata/info.json', 'utf8'));

interface Player {
  name: string;
  points: number;
}

const players: Player[] = [];

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

// Add MIME type handling

app.put('/players/:name', (req, res) => {
  const name = req.params.name;
  const points = req.body.points;

  const player = players.find((p) => p.name === name);

  if (player) {
    player.points = points;
    res.json(player);
  } else {
    res.sendStatus(404);
  }
});

app.get('/info', (req, res) => {
  res.render('info', { infoData });
});

app.get('/lobby', async (req, res) => {
  try {
    let lobbyList = await dbutils.getLobbyList();
    let nameList = await dbutils.getNameList();
    let lobbyListwithNames = [];
    for (let i = 0; i < lobbyList.length; i++) {
      lobbyListwithNames.push({
        name: lobbyList[i].name,
        player1_name: nameList.find((name) => name.id === lobbyList[i].player1_id)?.name || "",
        player2_name: nameList.find((name) => name.id === lobbyList[i].player2_id)?.name || "",
        player3_name: nameList.find((name) => name.id === lobbyList[i].player3_id)?.name || "",
        player4_name: nameList.find((name) => name.id === lobbyList[i].player4_id)?.name || "",
        player_names: [
          nameList.find((name) => name.id === lobbyList[i].player1_id)?.name || "",
          nameList.find((name) => name.id === lobbyList[i].player2_id)?.name || "",
          nameList.find((name) => name.id === lobbyList[i].player3_id)?.name || "",
          nameList.find((name) => name.id === lobbyList[i].player4_id)?.name || ""
        ],
      });
    }
    res.render('lobbyMain', { lobbyList: lobbyListwithNames, nameList: nameList });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error retrieving lobby list');
  }
});

app.get('/lobby/:lobby_name', async (req, res) => {
  const lobby_name = req.params.lobby_name;
  console.log('retrieving lobby info')
  try {
    let lobbyListName = await dbutils.getLobbyListwithName(lobby_name);
    // find the lobby with the name
    // get the player names from the player table
    // render the lobby_detail page with the lobby name and the player names
    let players = [];
    for (let i = 0; i < lobbyListName.length; i++) {
      // if (!lobbyListName[i].player1_name === null) {
      //   console.log('not null')
      // } else {
      //   console.log(lobbyListName[i])
      // }
      if (lobbyListName[i].name === lobby_name) {

        players.push({
          player1_name: lobbyListName[i].player1_name,
          player2_name: lobbyListName[i].player2_name,
          player3_name: lobbyListName[i].player3_name,
          player4_name: lobbyListName[i].player4_name,
        });
      };
    }
    let player1point = await dbutils.getPlayerPoints(players[0].player1_name) || null;
    let player2point = await dbutils.getPlayerPoints(players[0].player2_name) || null;
    let player3point = await dbutils.getPlayerPoints(players[0].player3_name) || null;
    let player4point = await dbutils.getPlayerPoints(players[0].player4_name) || null;
    //get player point from player table with player name
    //create a new array with player name and point if player point is not null
    let playerPoint = [];
    if (player1point !== null) {
      playerPoint.push({
        player: players[0].player1_name,
        point: player1point['points'],
        player_pos: 'player1'
      });
    }
    if (player2point !== null) {
      playerPoint.push({
        player: players[0].player2_name,
        point: player2point['points'],
        player_pos: 'player2'
      });
    }
    if (player3point !== null) {
      playerPoint.push({
        player: players[0].player3_name,
        point: player3point['points'],
        player_pos: 'player3'
      });
    }
    if (player4point !== null) {
      playerPoint.push({
        player: players[0].player4_name,
        point: player3point['points'],
        player_pos: 'player4'
      });
    }
    let nameList = await dbutils.getNameList();
    res.render('lobby_detail', { lobby_name, playerPoint, nameList });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error retrieving lobby list');
  }

});

app.post('/lobby', async (req, res) => {
  const lobby_name = req.body.lobbyName;
  if (lobby_name === '') {
    res.status(400).send('Lobby name cannot be empty');
    return;
  }
  try {
    await dbutils.createLobby(lobby_name);
    res.redirect(`/lobby/${lobby_name}?` + Date.now());
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create lobby');
  }
});

app.get('/lobby/:lobby_name/delete', async (req, res) => {
  const lobby_name = req.params.lobby_name;
  try {
    await dbutils.deleteLobby(lobby_name);
    res.redirect('/lobby');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete lobby');
  }
});

app.post('/lobby/:lobby_name/addPlayer', async (req, res) => {
  console.log('endpoint hit')
  const lobby_name = req.params.lobby_name;
  const player_name = req.body.playerName;
  console.log(lobby_name, player_name)
  try {
    let playerspot = await dbutils.nextplayerspot(lobby_name);
    if (playerspot === 0) {
      res.status(500).send('Lobby is full');
      return;
    }
    await dbutils.addPlayerToLobby(lobby_name, player_name, playerspot);
    res.redirect(`/lobby/${lobby_name}?` + Date.now());
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add player to lobby');
  }
});

app.get('/lobby/:lobby_name/:username/:player_pos/delete', async (req, res) => {
  const lobby_name = req.params.lobby_name;
  const username = req.params.username;
  const player_pos = req.params.player_pos;
  try {
    await dbutils.deletePlayerFromLobby(lobby_name, username, player_pos);
    res.redirect(`/lobby/${lobby_name}?` + Date.now());
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete player from lobby');
  }
});

app.post('/createPlayer', async (req, res) => {
  const player_name = req.body.playerName;
  if (player_name === '') {
    res.status(400).send('Player name cannot be empty');
    return;
  }
  try {
    await dbutils.createUser(player_name);
    res.redirect(`/lobby`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to create player');
  }
});

app.get('/player/:player_name/delete', async (req, res) => {
  const player_name = req.params.player_name;
  console.log(player_name)
  try {
    await dbutils.deletePlayer(player_name);
    res.redirect(`/lobby`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to delete player');
  }
});

app.post('/player/:lobby_name/addScore', async (req, res) => {
  //console.log(req.body)
  try {
    const lobby_name = req.params.lobby_name;
    const score = req.body.score;
    const player_name = req.body.playerName;
    console.log('lobby name is ', lobby_name)
    console.log('player_name is:', player_name,'score is :', score)
    await dbutils.addPlayerScore(player_name, score);

    res.redirect(`/lobby/${lobby_name}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to add player score');
  }
});


const port = 4000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
