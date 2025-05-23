export interface MovieSearchResult {
  results: MovieListItem[];
}

export interface MovieListItem {
  id: number;
  title: string;
  name: string;
  poster_path: string;
}

export interface MovieDetail {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
  budget?: number;
  genres: { id: number; name: string }[];
  homepage: string | null;
  id: number;
  imdb_id?: string;
  original_language: string;
  original_title?: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  release_date?: string;
  revenue?: number;
  runtime?: number;
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  status?: string;
  tagline: string | null;
  title?: string;
  video?: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TVShowDetail {
  adult: boolean;
  backdrop_path: string | null;
  created_by?: { id: number; credit_id: string; name: string; original_name: string; gender: number | null; profile_path: string | null }[];
  episode_run_time?: number[];
  first_air_date?: string;
  genres: { id: number; name: string }[];
  homepage: string | null;
  id: number;
  in_production?: boolean;
  languages?: string[];
  last_air_date?: string;
  last_episode_to_air?: { id: number; name: string; overview: string | null; vote_average: number; vote_count: number; air_date: string; episode_number: number; episode_type: string; production_code: string; runtime: number; season_number: number; show_id: number; still_path: string | null } | null;
  name?: string;
  next_episode_to_air?: any | null;
  networks?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  origin_country?: string[];
  original_language: string;
  original_name?: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies?: { id: number; logo_path: string | null; name: string; origin_country: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  seasons?: { air_date: string | null; episode_count: number; id: number; name: string; overview: string | null; poster_path: string | null; season_number: number; vote_average: number }[];
  spoken_languages?: { english_name: string; iso_639_1: string; name: string }[];
  status?: string;
  tagline: string | null;
  type?: string;
  vote_average: number;
  vote_count: number;
}
