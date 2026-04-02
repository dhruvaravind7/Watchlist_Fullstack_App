import psycopg
import os

from dotenv import load_dotenv

load_dotenv()

def add_to_watchlist(user_id : int, tmdb_id : int, title : str, poster_path : str):
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        conn.execute("INSERT INTO watchlist(watcher_id, tmdb_id, title, poster_path) VALUES (%s, %s, %s, %s)",
                    (user_id, tmdb_id, title, poster_path))

def get_user_watchlist(watcher_id : int):
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        watchlist_movies = conn.execute("SELECT * FROM watchlist WHERE watcher_id = %s AND watched = False", (watcher_id,)).fetchall()
        return watchlist_movies
    
def add_rating(watcher_id : int, tmdb_id : int, rating : int):
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        conn.execute("UPDATE watchlist SET rating = %s WHERE watcher_id = %s AND tmdb_id = %s", 
                     (rating, watcher_id, tmdb_id))

def watched(watcher_id : int, tmdb_id : int):
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        conn.execute("UPDATE watchlist SET watched = %s WHERE watcher_id = %s AND tmdb_id = %s", 
                     (True, watcher_id, tmdb_id))