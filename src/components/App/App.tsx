import css from "./App.module.css";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";

import SearchBar from "../SearchBar/SearchBar";
import MovieGrid from "../MovieGrid/MovieGrid";
import MovieModal from "../MovieModal/MovieModal";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Loader from "../Loader/Loader";

import { fetchMovies, type TmdbResponse } from "../../services/movieService";
import type { Movie } from "../../types/movie";

export default function App() {
  const [searchData, setSearchData] = useState("");
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const q = searchData.trim();

  const {
    data,
    error,
    isError,
    isSuccess,
    isPending,   // перше завантаження
    isFetching,  // повторні запити (пагінація/оновлення) без мерехтіння
  } = useQuery<TmdbResponse, Error>({
    queryKey: ["myQueryKey", q, page],
    queryFn: () => fetchMovies(q, page),
    enabled: q.length > 0,
    placeholderData: keepPreviousData, // ✅ безшовна пагінація
  });

  // ✅ toast, коли запит успішний, але нічого не знайдено
  useEffect(() => {
    if (!q) return;
    if (isSuccess && data && data.results.length === 0) {
      toast("Фільми не знайдено", { id: `no-results:${q}:${page}` });
    }
  }, [isSuccess, data, q, page]);

  return (
    <>
      <Toaster />

      <SearchBar
        onSubmit={(value) => {
          setSearchData(value);
          setPage(1);
        }}
      />

      {/* перший лоад */}
      {isPending && <Loader />}

      {/* фоновий фетч (наприклад, при кліку на сторінку) */}
      {isFetching && !isPending && <Loader />}

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

      {data && data.total_pages > 1 && (
        <ReactPaginate
          pageCount={data.total_pages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
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