import psycopg2 as pg2
import click
import os

class Database:
    def __init__(self, db, username, password, port, host):
        self.db = db
        self.username = username
        self.password = password
        self.port = port
        self.host = host
        self.cur = None
        self.conn = None

    def connect(self):
        self.conn = pg2.connect(database=self.db, user=self.username, password=self.password, port=self.port, host=self.host)
        self.cur = self.conn.cursor()

    def execute_query(self, query):
        self.cur.execute(query)
        self.conn.commit()

    def execute_fetch(self, fetch):
        self.cur.execute(fetch)
        return self.cur.fetchall()

    def close(self):
        self.cur.close()
        self.conn.close()

env_db = "totorodb"#os.getenv("env_db")
env_username = "totoro"#os.getenv("env_username")
env_password = "password"#os.getenv("env_password")
env_port = "32123"#os.getenv("env_port")
env_host = "192.168.1.200"#os.getenv("env_host")
db = Database(db=env_db, username=env_username, password=env_password, port=env_port, host=env_host)

db.connect()
