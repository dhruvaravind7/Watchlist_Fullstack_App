import bcrypt
import psycopg
import os

from dotenv import load_dotenv

load_dotenv()

def hashPassword(password : str):
    byte_password = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(byte_password, salt)
    return hashed_password.decode('utf-8')

def check_login(username : str, password : str):
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        stored_password = conn.execute("SELECT password FROM movie_users WHERE username = %s", (username,)).fetchone()[0].encode('utf-8')
        byte_password = password.encode('utf-8')
        if (bcrypt.checkpw(byte_password, stored_password)):
            return (True)
        return False
    
def add_user(username : str, password : str, email : str):
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        conn.execute("INSERT INTO movie_users(username, password, email) VALUES(%s, %s, %s)", (username, password, email))
        id = conn.execute("SELECT id FROM movie_users WHERE username = %s",
                    (username,)).fetchone()[0]
        return id
    
def get_user_table():
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        usernames = []
        usernames = conn.execute("SELECT * FROM movie_users").fetchall()
        return usernames


# Returns true if the inputted username exists already
def check_user_exists(username : str):
    '''
    Probably should be done in the frontend:
    if (username.contains(" ") or password.contains(" ")){
        return ("Username/Password cannot contain spaces")
    }
    if (username == "" or password == ""){
        return ("Username/Password cannot be empty")
    }'''
    with psycopg.connect(f'host = {os.getenv("DB_HOST")} port = {os.getenv("DB_PORT")} dbname={os.getenv("DB_NAME")} '
                         f'user={os.getenv("DB_USERNAME")} password = {os.getenv("DB_PASSWORD")} sslmode=require') as conn:
        username = conn.execute("SELECT COUNT(*) FROM movie_users WHERE username = %s", (username,)).fetchone()[0]
    if (username != 0):
        return (True)
    return (False)