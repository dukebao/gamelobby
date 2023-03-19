import sqlite3

def create_lobby_table(table_name):
    conn = sqlite3.connect('database.db')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS {0} (
            name TEXT PRIMARY KEY,
            player1_id INTEGER REFERENCES users(id),
            player2_id INTEGER REFERENCES users(id),
            player3_id INTEGER REFERENCES users(id),
            player4_id INTEGER REFERENCES users(id)
        )
    '''.format(table_name))
    conn.commit()
    conn.close()

def create_lobby(table_name, lobby_name):
    conn = sqlite3.connect('database.db')
    conn.execute("""
        INSERT INTO {0} (name, player1_id, player2_id, player3_id, player4_id)
        VALUES (?, ?, ?, ?, ?)
    """.format(table_name), ( lobby_name,'', '', '', ''))
    conn.commit()
    conn.close()

def insert_player(lobby_name, lobbyplayer, player_id, table_name='lobby'):
    """
    table_name: is the lobby table name
    lobbyplayer: is the player number in the lobby table
    player_id: is the player id in the users table
    """
    conn = sqlite3.connect('database.db')
    conn.execute(
        """
        Update {0} set player{1}_id = {2} where name = '{3}'
        """.format(table_name, lobbyplayer, player_id, lobby_name)
    )
    conn.commit()
    conn.close()

def return_player_id(player_name):
    conn = sqlite3.connect('database.db')
    cursor = conn.execute(
        """
        SELECT id FROM users WHERE name = '{0}'
        """.format(player_name)
    )
    player_id = cursor.fetchone()[0]
    conn.close()
    return player_id

if __name__ == '__main__':
    # create_lobby('lobby', 'Baos Lobby')
    # insert_lobby('lobby', 1, 1)
    # insert_player(
    #     lobby_name= 'Baos Lobby',
    #     lobbyplayer=1,
    #     player_id = 6
    # )
    print(return_player_id('player1'))