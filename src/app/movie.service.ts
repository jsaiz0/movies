import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovieDetail, MovieListItem, MovieSearchResult, TVShowDetail, PagedResponse } from './movie-interfaces';
import { environment } from './env/env';

/**
 * Servicio para interactuar con la API de The Movie Database (TMDB).
 * Proporciona métodos para buscar películas, programas de TV y obtener detalles.
 */
@Injectable({
  providedIn: 'root', // Hace que el servicio esté disponible en toda la aplicación.
})
export class MovieService {
  /**
   * Clave de API para autenticarse con TMDB.
   * @private
   */
  private apiKey = environment.tmdbApiKey;

  /**
   * URL base para las peticiones a la API de TMDB.
   * @private
   */
  private apiUrl = 'https://api.themoviedb.org/3';

  /**
   * URL base para construir las rutas completas de las imágenes de TMDB.
   * @private
   */
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  /**
   * Constructor del servicio.
   * @param {HttpClient} http - Cliente HTTP de Angular para realizar peticiones.
   */
  constructor(private http: HttpClient) { }

  /**
   * Busca películas en TMDB según un término de búsqueda y un número de página.
   * @param {string} query - El término de búsqueda.
   * @param {number} page - El número de página de resultados a solicitar.
   * @returns {Observable<PagedResponse<MovieListItem>>} Un Observable que emite una respuesta paginada
   * conteniendo una lista de elementos de película.
   */
  searchMovies(query: string, page: number): Observable<PagedResponse<MovieListItem>> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString()); // El parámetro 'page' en la API espera un string.
    return this.http.get<PagedResponse<MovieListItem>>(`${this.apiUrl}/search/movie`, { params });
  }

  /**
   * Busca programas de TV en TMDB según un término de búsqueda y un número de página.
   * @param {string} query - El término de búsqueda.
   * @param {number} page - El número de página de resultados a solicitar.
   * @returns {Observable<PagedResponse<MovieListItem>>} Un Observable que emite una respuesta paginada
   * conteniendo una lista de elementos de programa de TV.
   */
  searchTVShows(query: string, page: number): Observable<PagedResponse<MovieListItem>> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('page', page.toString());
    return this.http.get<PagedResponse<MovieListItem>>(`${this.apiUrl}/search/tv`, { params });
  }

  /**
   * Obtiene los detalles de una película o programa de TV específico por su ID y tipo.
   * @param {number} id - El ID único del contenido en TMDB.
   * @param {'movie' | 'tv'} type - El tipo de contenido ('movie' o 'tv').
   * @returns {Observable<MovieDetail | TVShowDetail>} Un Observable que emite los detalles
   * de la película o del programa de TV.
   */
  getMovieDetails(id: number, type: 'movie' | 'tv'): Observable<MovieDetail | TVShowDetail> {
    const params = new HttpParams().set('api_key', this.apiKey);
    // El endpoint varía según el tipo de contenido.
    if (type === 'movie') {
      return this.http.get<MovieDetail>(`${this.apiUrl}/${type}/${id}`, { params });
    } else {
      return this.http.get<TVShowDetail>(`${this.apiUrl}/${type}/${id}`, { params });
    }
  }

  /**
   * Construye la URL completa para mostrar una imagen de TMDB.
   * @param {string} path - La ruta relativa de la imagen (ej. /xyz.jpg) obtenida de la API.
   * @returns {string} La URL completa de la imagen.
   */
  getImageUrl(path: string): string {
    return `${this.imageBaseUrl}${path}`;
  }
}
