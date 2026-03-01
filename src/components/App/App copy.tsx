import "./App.module.css";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";

import { fetchMovies } from "../../services/movieService";
import type { Movie } from "../../types/movie";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Loader from "../Loader/Loader";

export default function App() {
	const [searchData, setSearchData] = useState("");
	const [movies, setMovies] = useState<Movie[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
	const [error, setError] = useState(false);

	const reqId = useRef(0);

	useEffect(() => {
		const q = searchData.trim();
		if (!q) return;

		const id = ++reqId.current;
		let active = true;

		const run = async () => {
			setLoading(true);
			setError(false);
			setMovies([]);
			setSelectedMovie(null);

			try {
				const data = await fetchMovies(q);
				if (!active || reqId.current !== id) return;

				setMovies(data);

				if (data.length === 0) {
					toast.error("No movies found for your request.", { position: "top-right" });
				}
			} catch {
				if (!active || reqId.current !== id) return;
				setError(true);
				setMovies([]);
			} finally {
				if (active && reqId.current === id) setLoading(false);
			}
		};

		run();

		return () => {
			active = false;
		};
	}, [searchData]);

	return (
		<>
			<Toaster />
			<SearchBar onSubmit={setSearchData} />

			{loading && <Loader />}

			{error ? (
				<ErrorMessage />
			) : (
				movies &&
				movies.length > 0 && (
					<MovieGrid
						movies={movies}
						onSelect={setSelectedMovie}
					/>
				)
			)}

			{selectedMovie && (
				<MovieModal
					movie={selectedMovie}
					onClose={() => setSelectedMovie(null)}
				/>
			)}
		</>
	);
}
