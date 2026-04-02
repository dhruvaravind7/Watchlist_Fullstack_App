CREATE TABLE movie_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password TEXT NOT NULL,
    email VARCHAR(100) NOT NULL
);

CREATE TABLE watchlist (
    id SERIAL PRIMARY KEY,
    watcher_id INT REFERENCES movie_users(id),
    tmdb_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    poster_path VARCHAR(255),
    watched BOOLEAN DEFAULT FALSE,
    rating INT CHECK (rating BETWEEN 1 AND 10)
);

CREATE INDEX idx_watcher_id ON watchlist(watcher_id);