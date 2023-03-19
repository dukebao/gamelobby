import sqlite3

conn = sqlite3.connect('database.db')

# Create table
conn.execute('''CREATE TABLE IF NOT EXISTS users
                (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT UNIQUE
                  , points INTEGER)''')

conn.execute('''Insert into users (name, points) values ('admin', 99999)''')
conn.execute('''Insert into users (name, points) values ('player1', 0)''')
conn.execute('''Insert into users (name, points) values ('player2', 0)''')
conn.execute('''Insert into users (name, points) values ('player3', 0)''')
conn.execute('''Insert into users (name, points) values ('player4', 0)''')
# create lobby table 
#TODO add game type for this table 
conn.execute('''
    CREATE TABLE IF NOT EXISTS lobby (
        name TEXT PRIMARY KEY,
        player1_id INTEGER REFERENCES users(id),
        player2_id INTEGER REFERENCES users(id),
        player3_id INTEGER REFERENCES users(id),
        player4_id INTEGER REFERENCES users(id)
    )
''')

conn.commit()
conn.close()

