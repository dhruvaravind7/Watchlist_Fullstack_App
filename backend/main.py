import asyncio
import os
import json

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel

#import database
import tmdb
import users
import watchlist

load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class User(BaseModel):
    username: str
    password: str
    email: str | None = None
    
class Movie(BaseModel):
    tmdb_id: int | None = None
    title: str | None = None
    poster_path: str | None = None
    watcher_id: int  | None = None
    rating: int | None = None

logged_in_user = ""
response = {
    "message": ""
}

@app.post("/login")
async def login(user: User):
    global logged_in_user
    if (not users.check_user_exists(user.username)):
            response["message"] = "User does not exist"
            return response
    if users.check_login(user.username, user.password):
        response["message"] = "Logged in Successfully"
        logged_in_user = user.username
        
    else:
        response["message"] = "Incorrect Password"
    return response


@app.get("/")
async def root():
    return "Server is running"

@app.get("/search/exact")
async def search(title : str):
    result = tmdb.search_movies(title)
    return result

@app.post("/create-user")
async def create_user(user: User):
    if (logged_in_user != ""):
        response["message"] = "Already logged in"
        return response
    if (users.check_user_exists(user.username)):
        response["message"] = "Username already exists"
        return response
    hash_password = users.hashPassword(user.password)
    id = users.add_user(user.username, hash_password, user.email)
    response["message"] = f"Success! Your id is {id}"
    return response

@app.get("/get-all-users")
async def get_all_users():
    return(users.get_user_table())

@app.get("/search/similar")
async def search_similar_movies(tmdb_id : int):
    return tmdb.search_similar(tmdb_id)

@app.get("/search/genre")
async def search_movies_genre(genre_ids : list[int] = Query(...)):
    return tmdb.search_genre(genre_ids)

@app.post("/add/movie")
async def add_movie(movie: Movie):
    watchlist.add_to_watchlist(movie.watcher_id, movie.tmdb_id, movie.title, movie.poster_path)
    return ("Added movie to watchlist!")

@app.get("/watchlist")
async def get_watchlist(watcher_id : int):
    return watchlist.get_user_watchlist(watcher_id)

@app.post("/add/rating")
async def add_movie_rating(movie: Movie):
    watchlist.add_rating(movie.watcher_id, movie.tmdb_id, movie.rating)

@app.post("/add/watched")
async def add_movie_watched(movie: Movie):
    watchlist.watched(movie.watcher_id, movie.tmdb_id)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT"))
    #database.clear_tables()
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
    
