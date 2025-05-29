import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { environment } from './env/env';
import { MovieDetail, PagedResponse, MovieListItem, TVShowDetail } from './movie-interfaces';


describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;
  const apiKey = environment.tmdbApiKey;
  const apiUrl = 'https://api.themoviedb.org/3';
  const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MovieService]
    });
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Asegura que no haya solicitudes pendientes.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchMovies', () => {
    it('should return a PagedResponse of MovieListItems', () => {
      const mockQuery = 'Inception';
      const mockPage = 1;
      const mockResponse: PagedResponse<MovieListItem> = {
        page: 1,
        results: [{ id: 1, title: 'Inception', name: 'Inception', poster_path: '/inception.jpg' }],
        total_pages: 1,
        total_results: 1
      };

      service.searchMovies(mockQuery, mockPage).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/search/movie?api_key=${apiKey}&query=${mockQuery}&page=${mockPage}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('searchTVShows', () => {
    it('should return a PagedResponse of MovieListItems for TV shows', () => {
      const mockQuery = 'Friends';
      const mockPage = 1;
      const mockResponse: PagedResponse<MovieListItem> = {
        page: 1,
        results: [{ id: 2, title: 'Friends', name: 'Friends', poster_path: '/friends.jpg' }],
        total_pages: 1,
        total_results: 1
      };

      service.searchTVShows(mockQuery, mockPage).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

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
      const mockResponse: MovieDetail = { id: mockId, title: 'Test Movie', adult: false, overview: 'Test overview', popularity: 10, vote_average: 7, vote_count: 100, genres: [], poster_path: null, backdrop_path: null, original_language: 'en', tagline: null, homepage: null };

      service.getMovieDetails(mockId, mockType).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${mockType}/${mockId}?api_key=${apiKey}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return TVShowDetail when type is "tv"', () => {
      const mockId = 456;
      const mockType = 'tv';
      const mockResponse: TVShowDetail = { id: mockId, name: 'Test TV Show', adult: false, overview: 'Test overview', popularity: 10, vote_average: 8, vote_count: 200, genres: [], poster_path: null, backdrop_path: null, original_language: 'en', tagline: null, homepage: null };

      service.getMovieDetails(mockId, mockType).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/${mockType}/${mockId}?api_key=${apiKey}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('getImageUrl', () => {
    it('should return the full image URL', () => {
      const mockPath = '/test_image.jpg';
      const expectedUrl = `${imageBaseUrl}${mockPath}`;
      expect(service.getImageUrl(mockPath)).toBe(expectedUrl);
    });

    it('should handle paths without leading slash consistently (though API usually provides it)', () => {
      const mockPath = 'test_image_no_slash.jpg';
      const expectedUrl = `${imageBaseUrl}test_image_no_slash.jpg`; // Assumes your service concatenates directly
      expect(service.getImageUrl(mockPath)).toBe(expectedUrl);
    });
  });
});
