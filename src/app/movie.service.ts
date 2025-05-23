import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MovieDetail, MovieListItem, MovieSearchResult, TVShowDetail } from './movie-interfaces';

@Injectable({
  providedIn: 'root',
})
export class MovieService {
  private apiKey = '0785d26a8f49e5643080fed4531acdd7';
  private apiUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient) { }

  searchMovies(query: string): Observable<MovieListItem[]> {
    const params = new HttpParams().set('api_key', this.apiKey).set('query', query);
    return this.http
      .get<MovieSearchResult>(`${this.apiUrl}/search/movie`, { params })
      .pipe(map((data) => data.results));
  }

  searchTVShows(query: string): Observable<MovieListItem[]> {
    const params = new HttpParams().set('api_key', this.apiKey).set('query', query);
    return this.http
      .get<MovieSearchResult>(`${this.apiUrl}/search/tv`, { params })
      .pipe(map((data) => data.results));
  }

  getMovieDetails(id: number, type: 'movie' | 'tv'): Observable<MovieDetail | TVShowDetail> {
    const params = new HttpParams().set('api_key', this.apiKey);
    if (type === 'movie') {
      return this.http.get<MovieDetail>(`${this.apiUrl}/${type}/${id}`, { params });
    } else {
      return this.http.get<TVShowDetail>(`${this.apiUrl}/${type}/${id}`, { params });
    }
  }

  getImageUrl(path: string): string {
    return `${this.imageBaseUrl}${path}`;
  }
}
