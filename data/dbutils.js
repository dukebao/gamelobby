const sqlite3 = require('sqlite3').verbose();

function create_lobby_table(table_name) {
  const db = new sqlite3.Database('database.db');
  db.run(`
    CREATE TABLE IF NOT EXISTS ${table_name} (
      name TEXT PRIMARY KEY,
      player1_id INTEGER REFERENCES users(id),
      player2_id INTEGER REFERENCES users(id),
      player3_id INTEGER REFERENCES users(id),
      player4_id INTEGER REFERENCES users(id)
    )
  `);
  db.close();
}
function createLobby(lobby_name) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.run(`
      INSERT INTO lobby (name, player1_id, player2_id, player3_id, player4_id)
      VALUES (?, ?, ?, ?, ?)
    `, [lobby_name, '', '', '', ''], function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function insert_player(lobby_name, lobbyplayer, player_id, table_name='lobby') {
  const db = new sqlite3.Database('database.db');
  db.run(`
    UPDATE ${table_name} SET player${lobbyplayer}_id = ${player_id} WHERE name = '${lobby_name}'
  `);
  db.close();
}

function delete_player(lobby_name, player_pos, table_name='lobby') {
  const db = new sqlite3.Database('database.db');
  db.run(`
    UPDATE ${table_name} SET ${player_pos}_id = NULL WHERE name = '${lobby_name}'
  `);
  db.close();
}

function return_player_id(player_name) {
  const db = new sqlite3.Database('database.db');
  db.get(`
    SELECT id FROM users WHERE name = '${player_name}'
  `, [], (err, row) => {
    if (err) {
      console.error(err.message);
      return;
    }
    db.close();
    return row.id;
  });
}

function getLobbyList() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.all(`SELECT * FROM lobby`, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      db.close();
      resolve(rows);
    });
  });
}



function deleteLobby(lobby_name) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.run(`
      DELETE FROM lobby WHERE name = '${lobby_name}'
    `, function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function createUser(name, points){
  return new Promise((resolve, reject)=> {
    const db = new sqlite3.Database('database.db');
    db.run(`
      INSERT INTO users (name, points)
      VALUES (?, 0)
    `, [name, points], function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });

  });
}

function getNameList(){
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.all(`SELECT id, name , points FROM users`, [], (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      db.close();
      resolve(rows);
    });
  });
}

function getPlayerPoints(player_name){
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.get(`SELECT points FROM users WHERE name = '${player_name}'`, [], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      db.close();
      resolve(row);
    });
  });
}


async function getLobbyListwithName() {
  try {
    let lobbyList = await getLobbyList();
    let nameList = await getNameList();
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

    return lobbyListwithNames;
  } catch (error) {
    console.error(error);
    // handle the error appropriately
  }
}

function nextplayerspot(lobby_name) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.get(`
      SELECT player1_id, player2_id, player3_id, player4_id FROM lobby WHERE name = '${lobby_name}'
    `, [], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      db.close();
      console.log(row)
      if (row.player1_id == '' || row.player1_id == null) {
        resolve(1);
      } else if (row.player2_id == ''|| row.player2_id == null) {
        resolve(2);
      } else if (row.player3_id == ''|| row.player3_id == null) {
        resolve(3);
      } else if (row.player4_id == ''|| row.player4_id == null) {
        resolve(4);
      } else {
        resolve(0);
      }
    });
  });
}


async function addPlayerToLobby(lobby_name, player_name, playerspot) {
  console.log('print from addPlayerToLobby');
  console.log(lobby_name , player_name);
  console.log('adding to spot :' + playerspot)
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.get(`
      SELECT id FROM users WHERE name = '${player_name}'
    `, [], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      db.close();
      insert_player(lobby_name, playerspot, row.id);
      resolve();
    });
  });
}

async function deletePlayerFromLobby(lobby_name, player_name, player_pos) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db'); 
    db.get(`
      SELECT id FROM users WHERE name = '${player_name}'
    `, [], (err, row) => {
      if (err) {
        console.error(err.message);
        reject(err);
        return;
      }
      console.log(row.id)
      delete_player(lobby_name,player_pos);
      db.close();
      resolve();
    });
  });
}

async function deletePlayer(player_name) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.run(`DELETE from users where name == '${player_name}'`
    , function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function addPlayerScore(player_name, score) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('database.db');
    db.run(`UPDATE users SET points = points + ${score} WHERE name = '${player_name}'`
    , function(err) {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}



module.exports = {
    create_lobby_table,
    createLobby,
    insert_player,
    return_player_id,
    getLobbyList,
    deleteLobby,
    getNameList,
    getLobbyListwithName,
    getPlayerPoints,
    addPlayerToLobby,
    nextplayerspot,
    deletePlayerFromLobby,
    createUser,
    deletePlayer,
    addPlayerScore,
};