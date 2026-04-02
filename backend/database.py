import psycopg
import os

from dotenv import load_dotenv

load_dotenv()

def clear_tables():
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        conn.execute("TRUNCATE TABLE movie_users RESTART IDENTITY CASCADE")