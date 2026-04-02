import httpx
import os
import json

from dotenv import load_dotenv

load_dotenv()

def search_movies(movie_name : str):
    url = "https://api.themoviedb.org/3/search/movie"
    parameters = {"query" : movie_name}
    headers = {
        "accept": "application/json",
        "Authorization": f'Bearer {os.getenv("TMDB_API_RAT")}'
    }
    r = httpx.get(url, params=parameters, headers=headers)
    results = r.json()['results']
    counter = 0
    while counter < len(results):
        if results[counter].get('popularity', 0) < 1:
            del results[counter]
        else:
            counter += 1
    return results

def search_similar(movie_id : int):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/similar"
    headers = {
        "accept": "application/json",
        "Authorization": f'Bearer {os.getenv("TMDB_API_RAT")}'
    }
    r = httpx.get(url, headers=headers)
    return r.json()['results']

def search_genre(genre_list : list[int]):
    genre_str = ",".join(str(g) for g in genre_list)
       
    url = "https://api.themoviedb.org/3/discover/movie"
    parameters = {"sort_by": "popularity.desc",
                  "with_genres": genre_str,
                  "with_original_language": "en"}
    headers = {
        "accept": "application/json",
        "Authorization": f'Bearer {os.getenv("TMDB_API_RAT")}'
    }
    r = httpx.get(url, params=parameters, headers=headers)
    print(r.url)
    return r.json()['results']