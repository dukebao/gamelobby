"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const path_1 = __importDefault(require("path"));
const dbutils = require('../data/dbutils');
const fs = require('fs');
const infoData = JSON.parse(fs.readFileSync('data/staticdata/info.json', 'utf8'));
const players = [];
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(body_parser_1.default.json());
app.use(express_1.default.static('public'));
app.set('view engine', 'ejs');
app.use(body_parser_1.default.urlencoded({ extended: false }));
// Add MIME type handling
app.put('/players/:name', (req, res) => {
    const name = req.params.name;
    const points = req.body.points;
    const player = players.find((p) => p.name === name);
    if (player) {
        player.points = points;
        res.json(player);
    }
    else {
        res.sendStatus(404);
    }
});
app.get('/info', (req, res) => {
    res.render('info', { infoData });
});
app.get('/lobby', async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    try {
        let lobbyList = await dbutils.getLobbyList();
        let nameList = await dbutils.getNameList();
        let lobbyListwithNames = [];
        for (let i = 0; i < lobbyList.length; i++) {
            lobbyListwithNames.push({
                name: lobbyList[i].name,
                player1_name: ((_a = nameList.find((name) => name.id === lobbyList[i].player1_id)) === null || _a === void 0 ? void 0 : _a.name) || "",
                player2_name: ((_b = nameList.find((name) => name.id === lobbyList[i].player2_id)) === null || _b === void 0 ? void 0 : _b.name) || "",
                player3_name: ((_c = nameList.find((name) => name.id === lobbyList[i].player3_id)) === null || _c === void 0 ? void 0 : _c.name) || "",
                player4_name: ((_d = nameList.find((name) => name.id === lobbyList[i].player4_id)) === null || _d === void 0 ? void 0 : _d.name) || "",
                player_names: [
                    ((_e = nameList.find((name) => name.id === lobbyList[i].player1_id)) === null || _e === void 0 ? void 0 : _e.name) || "",
                    ((_f = nameList.find((name) => name.id === lobbyList[i].player2_id)) === null || _f === void 0 ? void 0 : _f.name) || "",
                    ((_g = nameList.find((name) => name.id === lobbyList[i].player3_id)) === null || _g === void 0 ? void 0 : _g.name) || "",
                    ((_h = nameList.find((name) => name.id === lobbyList[i].player4_id)) === null || _h === void 0 ? void 0 : _h.name) || ""
                ],
            });
        }
        res.render('lobbyMain', { lobbyList: lobbyListwithNames, nameList: nameList });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Error retrieving lobby list');
    }
});
app.get('/lobby/:lobby_name', async (req, res) => {
    const lobby_name = req.params.lobby_name;
    console.log('retrieving lobby info');
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
            }
            ;
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
    }
    catch (err) {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Failed to create lobby');
    }
});
app.get('/lobby/:lobby_name/delete', async (req, res) => {
    const lobby_name = req.params.lobby_name;
    try {
        await dbutils.deleteLobby(lobby_name);
        res.redirect('/lobby');
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Failed to delete lobby');
    }
});
app.post('/lobby/:lobby_name/addPlayer', async (req, res) => {
    console.log('endpoint hit');
    const lobby_name = req.params.lobby_name;
    const player_name = req.body.playerName;
    console.log(lobby_name, player_name);
    try {
        let playerspot = await dbutils.nextplayerspot(lobby_name);
        if (playerspot === 0) {
            res.status(500).send('Lobby is full');
            return;
        }
        await dbutils.addPlayerToLobby(lobby_name, player_name, playerspot);
        res.redirect(`/lobby/${lobby_name}?` + Date.now());
    }
    catch (err) {
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
    }
    catch (err) {
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
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Failed to create player');
    }
});
app.get('/player/:player_name/delete', async (req, res) => {
    const player_name = req.params.player_name;
    console.log(player_name);
    try {
        await dbutils.deletePlayer(player_name);
        res.redirect(`/lobby`);
    }
    catch (err) {
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
        console.log('lobby name is ', lobby_name);
        console.log('player_name is:', player_name, 'score is :', score);
        await dbutils.addPlayerScore(player_name, score);
        res.redirect(`/lobby/${lobby_name}`);
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Failed to add player score');
    }
});
const port = 4000;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
//# sourceMappingURL=index.js.map