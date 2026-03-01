import css from "./App.module.css";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Loader from "../Loader/Loader";

import { fetchMovies } from "../../services/movieService";
import type { Movie, TmdbResponse } from "../../types/movie";

export default function App() {
  const [searchData, setSearchData] = useState("");
  const [page, setPage] = useState(1); // ✅ додали
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const q = searchData.trim();

  const { data, error, isLoading, isError } = useQuery<TmdbResponse, Error>({
    queryKey: ["myQueryKey", q, page],        // ✅ додали page в key
    queryFn: () => fetchMovies(q, page),      // ✅ передаємо page
    enabled: q.length > 0,
  });

  return (
    <>
      <Toaster />

      <SearchBar
        onSubmit={(value) => {
          setSearchData(value);
          setPage(1); // ✅ новий пошук -> на 1 сторінку
        }}
      />

      {isLoading && <Loader />}

      {isError ? (
        <ErrorMessage message={error.message} />
      ) : (
        data?.results?.length ? (
          <MovieGrid movies={data.results} onSelect={setSelectedMovie} />
        ) : null
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}

      {/* ✅ Пагінація тільки коли є data і сторінок > 1 */}
      {data && data.total_pages > 1 && (
        <ReactPaginate
          pageCount={data.total_pages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)} // 0-based -> 1-based
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
    </>
  );
}