import { useState, useEffect } from "react";
import.meta.env.VITE_API_URL


const POSTER_BASE = "https://image.tmdb.org/t/p/w300";

const GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

function Dashboard({ user }) {
  const [searchTab, setSearchTab] = useState("title");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [resultsLabel, setResultsLabel] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const fetchWatchlist = async () => {
    setWatchlistLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/watchlist?watcher_id=${user.id}`);
      const data = await res.json();
      setWatchlist(data);
    } catch (err) {
      console.error("Failed to fetch watchlist", err);
    }
    setWatchlistLoading(false);
  };

  const handleTitleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearchError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/search/exact?title=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setSearchError("Server error — check that the backend is running.");
      } else if (!Array.isArray(data)) {
        setSearchError("Unexpected response from server.");
      } else if (data.length === 0) {
        setSearchError(`No results found for "${searchQuery}".`);
      } else {
        setSearchResults(data);
        setResultsLabel(`Results for "${searchQuery}"`);
      }
    } catch (err) {
      setSearchError("Could not reach the server. Is the backend running?");
      console.error("Search failed", err);
    }
    setLoading(false);
  };

  const handleGenreSearch = async () => {
    if (selectedGenres.length === 0) return;
    setLoading(true);
    setSearchError("");
    try {
      const params = selectedGenres.map((id) => `genre_ids=${id}`).join("&");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/search/genre?${params}`);
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) {
        setSearchError("Server error — could not fetch genre results.");
      } else {
        setSearchResults(data);
        const names = GENRES.filter((g) => selectedGenres.includes(g.id))
          .map((g) => g.name)
          .join(", ");
        setResultsLabel(`Top picks in ${names}`);
      }
    } catch (err) {
      setSearchError("Could not reach the server. Is the backend running?");
      console.error("Genre search failed", err);
    }
    setLoading(false);
  };

  const handleSimilarSearch = async (tmdbId, title) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/search/similar?tmdb_id=${tmdbId}`);
      const data = await res.json();
      setSearchResults(data);
      setResultsLabel(`Similar to "${title}"`);
      setSearchTab("title");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Similar search failed", err);
    }
    setLoading(false);
  };

  const handleAddToWatchlist = async (movie) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/add/movie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdb_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path || "",
          watcher_id: user.id,
          rating: null,
        }),
      });
      if (!res.ok) {
        showNotification("Failed to add movie — try signing out and back in.");
        return;
      }
      showNotification(`"${movie.title}" added to watchlist!`);
      fetchWatchlist();
    } catch (err) {
      showNotification("Could not reach the server.");
      console.error("Failed to add movie", err);
    }
  };

  const handleMarkWatched = async (item) => {
    // item = [id, watcher_id, tmdb_id, title, poster_path, watched, rating]
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/add/watched`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watcher_id: item[1], tmdb_id: item[2], rating: null }),
      });
      showNotification(`"${item[3]}" marked as watched!`);
      fetchWatchlist();
    } catch (err) {
      console.error("Failed to mark watched", err);
    }
  };

  const handleRating = async (item, rating) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/add/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watcher_id: item[1],
          tmdb_id: item[2],
          rating: parseInt(rating),
        }),
      });
      showNotification(`Rated "${item[3]}" ${rating}/10!`);
      fetchWatchlist();
    } catch (err) {
      console.error("Failed to rate movie", err);
    }
  };

  const toggleGenre = (id) => {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const isInWatchlist = (tmdbId) => watchlist.some((item) => item[2] === tmdbId);

  return (
    <div className="dashboard">
      {notification && <div className="notification">{notification}</div>}

      {/* Search */}
      <section className="search-section">
        <h2>Discover Movies</h2>

        <div className="search-mode-tabs">
          <button
            className={`mode-tab ${searchTab === "title" ? "active" : ""}`}
            onClick={() => setSearchTab("title")}
          >
            Search by Title
          </button>
          <button
            className={`mode-tab ${searchTab === "genre" ? "active" : ""}`}
            onClick={() => setSearchTab("genre")}
          >
            Browse by Genre
          </button>
        </div>

        {searchError && <p className="search-error">{searchError}</p>}
      {searchTab === "title" ? (
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a movie title…"
              onKeyDown={(e) => e.key === "Enter" && handleTitleSearch()}
            />
            <button className="btn-search" onClick={handleTitleSearch} disabled={loading}>
              {loading ? "…" : "Search"}
            </button>
          </div>
        ) : (
          <div className="genre-section">
            <div className="genre-pills">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  className={`genre-pill ${selectedGenres.includes(g.id) ? "selected" : ""}`}
                  onClick={() => toggleGenre(g.id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
            <button
              className="btn-primary genre-search-btn"
              onClick={handleGenreSearch}
              disabled={loading || selectedGenres.length === 0}
            >
              {loading ? "Searching…" : "Find Movies"}
            </button>
          </div>
        )}
      </section>

      {/* Results */}
      {searchResults.length > 0 && (
        <section className="results-section">
          <div className="results-header">
            <h3>{resultsLabel}</h3>
            <span className="results-count">{searchResults.length} films</span>
          </div>
          <div className="movie-grid">
            {searchResults.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                inWatchlist={isInWatchlist(movie.id)}
                onAdd={() => handleAddToWatchlist(movie)}
                onSimilar={() => handleSimilarSearch(movie.id, movie.title)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Watchlist */}
      <section className="watchlist-section">
        <h2>My Watchlist</h2>
        {watchlistLoading ? (
          <p className="empty-text">Loading…</p>
        ) : watchlist.length === 0 ? (
          <p className="empty-text">Your watchlist is empty. Search above to add movies!</p>
        ) : (
          <div className="movie-grid">
            {watchlist.map((item) => (
              // item = [id, watcher_id, tmdb_id, title, poster_path, watched, rating]
              <WatchlistCard
                key={item[0]}
                item={item}
                onMarkWatched={() => handleMarkWatched(item)}
                onRate={(rating) => handleRating(item, rating)}
                onSimilar={() => handleSimilarSearch(item[2], item[3])}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MovieCard({ movie, inWatchlist, onAdd, onSimilar }) {
  return (
    <div className="movie-card">
      <div className="movie-poster">
        {movie.poster_path ? (
          <img src={`${POSTER_BASE}${movie.poster_path}`} alt={movie.title} />
        ) : (
          <div className="no-poster">No Image</div>
        )}
      </div>
      <div className="movie-info">
        <h4>{movie.title}</h4>
        <div className="movie-actions">
          <button
            className={`btn-add ${inWatchlist ? "in-list" : ""}`}
            onClick={onAdd}
            disabled={inWatchlist}
          >
            {inWatchlist ? "✓ In Watchlist" : "+ Watchlist"}
          </button>
          <button className="btn-similar" onClick={onSimilar}>
            Similar ›
          </button>
        </div>
      </div>
    </div>
  );
}

function WatchlistCard({ item, onMarkWatched, onRate, onSimilar }) {
  // item = [id, watcher_id, tmdb_id, title, poster_path, watched, rating]
  return (
    <div className="movie-card watchlist-card">
      <div className="movie-poster">
        {item[4] ? (
          <img src={`${POSTER_BASE}${item[4]}`} alt={item[3]} />
        ) : (
          <div className="no-poster">No Image</div>
        )}
        {item[6] && <div className="rating-badge">⭐ {item[6]}/10</div>}
      </div>
      <div className="movie-info">
        <h4>{item[3]}</h4>
        <div className="watchlist-actions">
          <select
            className="rating-select"
            defaultValue=""
            onChange={(e) => e.target.value && onRate(e.target.value)}
          >
            <option value="" disabled>Rate…</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} / 10</option>
            ))}
          </select>
          <button className="btn-watched" onClick={onMarkWatched}>✓ Watched</button>
          <button className="btn-similar" onClick={onSimilar}>Similar ›</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
