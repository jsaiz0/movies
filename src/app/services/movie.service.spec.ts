import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { environment } from '../env/env';
import { MovieDetail, PagedResponse, MovieListItem, TVShowDetail } from '../movie-interfaces';

/**
 * Suite de pruebas para el servicio MovieService.
 */
describe('MovieService', () => {
  // Declaración de variables que se utilizarán en las pruebas.
  let service: MovieService;
  let httpMock: HttpTestingController;
  // Constantes para la configuración de la API, obtenidas del entorno.
  const apiKey = environment.tmdbApiKey;
  const apiUrl = 'https://api.themoviedb.org/3';
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  /**
   * Configuración que se ejecuta antes de cada prueba (it).
   */
  beforeEach(() => {
    // Configura el módulo de pruebas de Angular.
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Importa HttpClientTestingModule para simular peticiones HTTP.
      providers: [MovieService] // Provee el servicio que se va a probar.
    });
    // Inyecta el servicio y el controlador de pruebas HTTP.
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * Limpieza que se ejecuta después de cada prueba (it).
   */
  afterEach(() => {
    httpMock.verify(); // Asegura que no haya solicitudes pendientes.
  });

  /**
   * Prueba básica para asegurar que el servicio se crea correctamente.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchMovies', () => {
    it('should return a PagedResponse of MovieListItems', () => {
      const mockQuery = 'Inception';
      const mockPage = 1;
      // Objeto simulado (mock) para la respuesta de búsqueda de películas.
      // La interfaz MovieListItem tiene 'title' y 'name'. Para películas, 'title' es el primario.
      // 'name' se incluye aquí para cumplir con la interfaz, pero podría ser opcional o undefined
      // si la interfaz lo permite y el componente lo maneja.
      const mockResponse: PagedResponse<MovieListItem> = {
        page: 1,
        results: [{
          id: 1,
          title: 'Inception', // Específico de película
          name: 'Inception', // Añadido para cumplir con la interfaz
          poster_path: '/inception.jpg',
          // Asumiendo que MovieListItem puede tener estos campos, basado en MovieListComponent
          // overview: 'A mind-bending thriller.',
          // vote_average: 8.8
        }],
        total_pages: 1,
        total_results: 1
      };

      // Llama al método del servicio.
      service.searchMovies(mockQuery, mockPage).subscribe(response => {
        // Verifica que la respuesta del servicio sea igual al mock.
        expect(response).toEqual(mockResponse);
      });

      // Espera una petición HTTP a la URL correcta.
      const req = httpMock.expectOne(
        `${apiUrl}/search/movie?api_key=${apiKey}&query=${mockQuery}&page=${mockPage}`
      );
      expect(req.request.method).toBe('GET'); // Verifica que el método HTTP sea GET.
      req.flush(mockResponse);
    });
  });

  describe('searchTVShows', () => {
    it('should return a PagedResponse of MovieListItems for TV shows', () => {
      const mockQuery = 'Friends';
      const mockPage = 1;
      // Objeto simulado (mock) para la respuesta de búsqueda de series de TV.
      // Para series, 'name' es el primario. 'title' se incluye para cumplir con la interfaz.
      const mockResponse: PagedResponse<MovieListItem> = {
        page: 1,
        results: [{
          id: 2,
          title: 'Friends', // Añadido para cumplir con la interfaz, aunque para TV 'name' es el principal.
          name: 'Friends', // Específico de serie
          poster_path: '/friends.jpg',
          // Asumiendo que MovieListItem puede tener estos campos
          // overview: 'Six friends living in New York.',
          // vote_average: 8.9
        }],
        total_pages: 1,
        total_results: 1
      };

      // Llama al método del servicio.
      service.searchTVShows(mockQuery, mockPage).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      // Espera una petición HTTP a la URL correcta.
      const req = httpMock.expectOne(
        `${apiUrl}/search/tv?api_key=${apiKey}&query=${mockQuery}&page=${mockPage}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getMovieDetails', () => {
    it('should return MovieDetail when type is "movie"', () => {
      const mockId = 123;
      const mockType = 'movie';
      // Objeto simulado (mock) para los detalles de una película.
      const mockResponse: MovieDetail = {
        id: mockId,
        title: 'Test Movie',
        adult: false,
        overview: 'Test overview',
        popularity: 10,
        vote_average: 7,
        vote_count: 100,
        genres: [{ id: 28, name: 'Action' }],
        poster_path: '/test_poster.jpg',
        backdrop_path: '/test_backdrop.jpg',
        release_date: '2023-01-01',
        original_language: 'en', tagline: 'Test tagline', homepage: 'http://test.com'
      };

      // Llama al método del servicio.
      service.getMovieDetails(mockId, mockType).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      // Espera una petición HTTP a la URL correcta.
      const req = httpMock.expectOne(
        `${apiUrl}/${mockType}/${mockId}?api_key=${apiKey}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return TVShowDetail when type is "tv"', () => {
      const mockId = 456;
      const mockType = 'tv';
      // Objeto simulado (mock) para los detalles de una serie de TV.
      const mockResponse: TVShowDetail = {
        id: mockId,
        name: 'Test TV Show',
        adult: false,
        overview: 'Test overview',
        popularity: 10,
        vote_average: 8,
        vote_count: 200,
        genres: [{ id: 10759, name: 'Action & Adventure' }],
        poster_path: '/tv_poster.jpg',
        backdrop_path: '/tv_backdrop.jpg',
        first_air_date: '2023-01-01',
        original_language: 'en', tagline: 'Test TV tagline', homepage: 'http://tvtest.com'
      };

      // Llama al método del servicio.
      service.getMovieDetails(mockId, mockType).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      // Espera una petición HTTP a la URL correcta.
      const req = httpMock.expectOne(
        `${apiUrl}/${mockType}/${mockId}?api_key=${apiKey}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getImageUrl', () => {
    /**
     * Prueba que el método devuelve la URL completa de la imagen.
     */
    it('should return the full image URL', () => {
      const mockPath = '/test_image.jpg';
      const expectedUrl = `${imageBaseUrl}${mockPath}`;
      expect(service.getImageUrl(mockPath)).toBe(expectedUrl);
    });

    /**
     * Prueba cómo maneja el método las rutas sin la barra inclinada inicial.
     * Aunque la API de TMDB usualmente provee la barra.
     */
    it('should handle paths without leading slash consistently (though API usually provides it)', () => {
      const mockPath = 'test_image_no_slash.jpg';
      const expectedUrl = `${imageBaseUrl}test_image_no_slash.jpg`; // Asume que el servicio concatena directamente.
      expect(service.getImageUrl(mockPath)).toBe(expectedUrl);
    });

    /**
     * Prueba el comportamiento del método si se le pasa un path nulo.
     */
    it('should return base URL concatenated with null if path is null (or handle as defined)', () => {
      const mockPath = null as any; // Simular un path nulo
      const expectedUrl = `${imageBaseUrl}null`; // El comportamiento actual del servicio sería concatenar "null".
      expect(service.getImageUrl(mockPath)).toBe(expectedUrl);
    });
  });
});
