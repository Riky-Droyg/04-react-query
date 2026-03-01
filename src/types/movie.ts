export interface Movie {
	id: number;
	poster_path: string;
	backdrop_path: string;
	title: string;
	overview: string;
	release_date: string;
	vote_average: number;
	total_pages: number;
}

export interface TmdbResponse { results: Movie[]; total_pages: number };
