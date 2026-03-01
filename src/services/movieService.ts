import axios from "axios";
import type { Movie } from "../types/movie";

axios.defaults.baseURL = "https://api.themoviedb.org/3";
axios.defaults.headers.common.Authorization = `Bearer ${import.meta.env.VITE_API_KEY}`;

export interface TmdbResponse {
	results: Movie[];
	total_pages: number;
}

export async function fetchMovies(query: string, page: number): Promise<TmdbResponse> {
	const q = query.trim();

	try {
		const res = q
			? await axios.get<TmdbResponse>("/search/movie", { params: { query: q, include_adult: false, language: "en-US", page: page } })
			: await axios.get<TmdbResponse>("/discover/movie", { params: { include_adult: false, include_video: false, language: "en-US", page: page, sort_by: "popularity.desc" } });

		return {
			results: res.data.results,
			total_pages: res.data.total_pages,
		};
	} catch (err) {
		if (axios.isAxiosError(err)) {
			throw new Error(err.response?.data?.status_message ?? err.message);
		}
		throw err;
	}
}
