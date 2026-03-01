import axios from "axios";
import type { Movie } from "../types/movie";

type TmdbResponse = { results: Movie[] };

axios.defaults.baseURL = "https://api.themoviedb.org/3";
axios.defaults.headers.common.Authorization = `Bearer ${import.meta.env.VITE_API_KEY}`;

export async function fetchMovies(query: string): Promise<Movie[]> {
  const q = query.trim();

  try {
    const res = q
      ? await axios.get<TmdbResponse>("/search/movie", {
          params: { query: q, include_adult: false, language: "en-US", page: 1 },
        })
      : await axios.get<TmdbResponse>("/discover/movie", {
          params: {
            include_adult: false,
            include_video: false,
            language: "en-US",
            page: 1,
            sort_by: "popularity.desc",
          },
        });

    return res.data.results;
  } catch (err) {
    // логування можна залишити
    if (axios.isAxiosError(err)) {
      console.error("status:", err.response?.status);
      console.error("data:", err.response?.data);
      console.error("msg:", err.message);
    } else if (err instanceof Error) {
      console.error("msg:", err.message);
    } else {
      console.error("Unknown error:", err);
    }

    throw err; // <-- ключове: щоб App показав ErrorMessage
  }
}
