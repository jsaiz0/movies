
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule} from '@angular/forms';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {of, throwError, Subscription} from 'rxjs'; // Importar Subject y Subscription
import {ChangeDetectorRef} from '@angular/core';
import {PageEvent} from '@angular/material/paginator';
import {Router} from '@angular/router'; // Importar Router

import {MovieListComponent} from './movie-list.component';
import {MovieService} from '../movie.service';
import {MovieListItem, PagedResponse} from '@app/movie-interfaces';

// Importaciones de Material (solo las necesarias para que el componente compile si se renderizara)
// Para componentes standalone, las importaciones se manejan directamente en el componente.
// No todas son necesarias para pruebas de lógica pura, pero es bueno tenerlas si se testeara la interacción con el template.
import {MatTabsModule} from '@angular/material/tabs';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let mockMovieService: jasmine.SpyObj<MovieService>;
  // Router no se usa directamente en los métodos probados, pero es una dependencia inyectada.
  let mockRouter: jasmine.SpyObj<Router>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockMovieResponse: PagedResponse<MovieListItem> = {
    page: 1,
    results: [{id: 1, title: 'Test Movie', name: 'Test Movie', poster_path: '/test.jpg'} as MovieListItem],
    total_pages: 1,
    total_results: 1,
  };

  const mockTvResponse: PagedResponse<MovieListItem> = {
    page: 1,
    results: [{id: 2, title: 'Test TV Show', name: 'Test TV Show', poster_path: '/testtv.jpg'} as MovieListItem],
    total_pages: 1,
    total_results: 1,
  };

  const emptyPagedResponse: PagedResponse<MovieListItem> = {
    page: 1,
    results: [],
    total_pages: 0,
    total_results: 0,
  };

  beforeEach(async () => {
    mockMovieService = jasmine.createSpyObj('MovieService', ['searchMovies', 'searchTVShows', 'getImageUrl']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockChangeDetectorRef = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      // El componente es standalone, así que se importa directamente.
      // Los módulos de Angular Material también se importan aquí porque son parte del `imports` del componente.
      imports: [
        MovieListComponent,
        FormsModule, // Necesario para ngModel
        RouterTestingModule, // Para routerLink
        NoopAnimationsModule, // Para componentes de Material que podrían tener animaciones
        MatTabsModule,
        MatInputModule,
        MatListModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatCardModule,
      ],
      providers: [
        {provide: MovieService, useValue: mockMovieService},
        {provide: Router, useValue: mockRouter},
        // Proveemos el mock de ChangeDetectorRef. El componente lo inyectará.
        {provide: ChangeDetectorRef, useValue: mockChangeDetectorRef},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;

    // Configuración por defecto de los spies del servicio
    mockMovieService.searchMovies.and.returnValue(of(mockMovieResponse));
    mockMovieService.searchTVShows.and.returnValue(of(mockTvResponse));
    mockMovieService.getImageUrl.and.callFake((path: string) => `http://image.tmdb.org/t/p/w500${path}`);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize searchTerm subscription and handle search term emission', fakeAsync(() => {
      const searchTerm = 'inception';
      mockMovieService.searchMovies.and.returnValue(of(mockMovieResponse)); // Asegurar que el mock está listo

      component.ngOnInit(); // ngOnInit es llamado por Angular, pero para probar el pipe, lo llamamos aquí.

      component.searchTerm.next(searchTerm);
      tick(300); // debounceTime

      expect(component.searching).withContext('searching should be true after tap before switchMap resolves').toBeTrue();
      expect(component.page).withContext('page should be reset to 1 for new search').toBe(1);
      expect(mockMovieService.searchMovies).toHaveBeenCalledWith(searchTerm, 1);

      // Simular la resolución de la búsqueda
      fixture.detectChanges(); // Para que el subscribe se ejecute y actualice el estado

      expect(component.searchResults).toEqual(mockMovieResponse.results);
      expect(component.totalResults).toBe(mockMovieResponse.total_results);
      expect(component.searching).withContext('searching should be false after search response').toBeFalse();
      expect(component.searched).toBeTrue();
      expect(component.error).toBeNull();
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    }));

    it('should reset search state if search term is empty or whitespace', fakeAsync(() => {
      spyOn(component as any, 'resetSearchState').and.callThrough();
      component.ngOnInit();

      component.searchTerm.next('  '); // Término con solo espacios
      tick(300); // debounceTime

      expect((component as any).resetSearchState).toHaveBeenCalled();
      expect(component.searching).toBeFalse();
      expect(component.searchResults.length).toBe(0);
      expect(component.totalResults).toBe(0);
      expect(component.searched).toBeFalse();
      expect(component.error).toBeNull();
      // executeSearch devolverá un of(emptyResponse) que llamará a handleSearchResponse
      // handleSearchResponse llamará a cdr.detectChanges()
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    }));

    it('should handle search error from API correctly', fakeAsync(() => {
      const errorResponse = {message: 'API Error'};
      mockMovieService.searchMovies.and.returnValue(throwError(() => errorResponse));
      component.searchText = 'error_test'; // Para que `searched` se ponga a true
      component.ngOnInit();

      component.searchTerm.next('error_test');
      tick(300); // debounceTime

      expect(component.searching).toBeFalse();
      expect(component.searchResults.length).toBe(0);
      expect(component.totalResults).toBe(0);
      expect(component.error).toBe('Error en la búsqueda. Por favor, inténtalo de nuevo.');
      expect(component.searched).toBeTrue(); // Porque se intentó una búsqueda con 'error_test'
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    }));
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from searchSubscription if it exists', () => {
      // Simular una suscripción activa
      component.ngOnInit(); // Esto crea la suscripción
      const mockSubscription = (component as any).searchSubscription as Subscription;
      spyOn(mockSubscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should not throw if searchSubscription is undefined', () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('search method', () => {
    it('should set searching to true and emit current searchText to searchTerm Subject', () => {
      spyOn(component.searchTerm, 'next');
      component.searchText = 'Matrix';

      component.search();

      expect(component.searching).toBeTrue();
      expect(component.searchTerm.next).toHaveBeenCalledWith('Matrix');
    });
  });

  describe('toggleSearchType', () => {
    it('should switch to TV search, reset state, and emit empty search term', () => {
      spyOn(component.searchTerm, 'next');
      spyOn(component as any, 'resetSearchState').and.callThrough();

      // Estado inicial
      component.searchType = 'movie';
      component.searchText = 'Old search';
      component.searchResults = [{} as MovieListItem];
      component.page = 2;
      component.searched = true;
      component.totalResults = 10;
      component.error = 'Some error';

      component.toggleSearchType(1); // 1 para TV

      expect(component.searchType).toBe('tv');
      expect(component.searchText).toBe('');
      expect(component.page).toBe(1);
      expect((component as any).resetSearchState).toHaveBeenCalled();
      // resetSearchState se encarga de:
      expect(component.searching).toBeFalse();
      expect(component.searchResults.length).toBe(0);
      expect(component.totalResults).toBe(0);
      expect(component.searched).toBeFalse();
      expect(component.error).toBeNull();

      expect(component.searchTerm.next).toHaveBeenCalledWith('');
    });

    it('should switch to Movie search and reset state similarly', () => {
      spyOn(component.searchTerm, 'next');
      spyOn(component as any, 'resetSearchState').and.callThrough();
      component.searchType = 'tv'; // Empezar como tv

      component.toggleSearchType(0); // 0 para Movie

      expect(component.searchType).toBe('movie');
      expect((component as any).resetSearchState).toHaveBeenCalled();
      expect(component.searchTerm.next).toHaveBeenCalledWith('');
    });
  });

  describe('pageChanged method', () => {
    beforeEach(() => {
      component.searchText = 'Test Query'; // Necesario para que executeSearch funcione
    });

    it('should update page, set searching flag, call executeSearch, and handle successful response', fakeAsync(() => {
      const pageEvent: PageEvent = {pageIndex: 1, pageSize: 20, length: 100}; // pageIndex 1 significa página 2
      component.searchType = 'movie';
      mockMovieService.searchMovies.and.returnValue(of(mockMovieResponse));

      component.pageChanged(pageEvent);
      // No es necesario tick() aquí si executeSearch devuelve of() que es síncrono
      // pero si searchMovies fuera asíncrono (ej. con delay), tick() sería necesario.

      expect(component.page).toBe(2);
      expect(component.searching).withContext('searching should be true before API call resolves').toBeTrue();

      // La suscripción dentro de pageChanged es síncrona si el observable lo es.
      // handleSearchResponse se llamará inmediatamente.
      expect(mockMovieService.searchMovies).toHaveBeenCalledWith('Test Query', 2);
      expect(component.searching).withContext('searching should be false after response').toBeFalse();
      expect(component.searchResults).toEqual(mockMovieResponse.results);
      expect(component.totalResults).toEqual(mockMovieResponse.total_results);
      expect(component.error).toBeNull();
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    }));

    it('should handle API error during pageChanged', fakeAsync(() => {
      const pageEvent: PageEvent = {pageIndex: 1, pageSize: 20, length: 100};
      const errorResponse = {message: 'Paging Error'};
      component.searchType = 'tv';
      mockMovieService.searchTVShows.and.returnValue(throwError(() => errorResponse));

      component.pageChanged(pageEvent);

      expect(component.page).toBe(2);
      expect(component.searching).withContext('searching should be true before API call resolves').toBeTrue();

      // handleSearchError se llamará inmediatamente.
      expect(mockMovieService.searchTVShows).toHaveBeenCalledWith('Test Query', 2);
      expect(component.searching).withContext('searching should be false after error').toBeFalse();
      expect(component.searchResults.length).toBe(0);
      expect(component.totalResults).toBe(0);
      expect(component.error).toBe('Error en la búsqueda. Por favor, inténtalo de nuevo.');
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    }));
  });

  describe('getUrlImage method', () => {
    it('should call movieService.getImageUrl with the provided poster_path', () => {
      const posterPath = '/path.jpg';
      const expectedUrl = `http://image.tmdb.org/t/p/w500${posterPath}`;
      mockMovieService.getImageUrl.and.returnValue(expectedUrl);

      const actualUrl = component.getUrlImage(posterPath);

      expect(mockMovieService.getImageUrl).toHaveBeenCalledWith(posterPath);
      expect(actualUrl).toBe(expectedUrl);
    });
  });

  // Pruebas para métodos privados (a través de su uso en métodos públicos)
  describe('internal search logic (via executeSearch)', () => {
    it('executeSearch should call searchMovies for "movie" type with term and page', (done) => {
      component.searchType = 'movie';
      (component as any).executeSearch('test movie', 1).subscribe((response: PagedResponse<MovieListItem>) => {
        expect(mockMovieService.searchMovies).toHaveBeenCalledWith('test movie', 1);
        expect(response).toEqual(mockMovieResponse);
        done();
      });
    });

    it('executeSearch should call searchTVShows for "tv" type with term and page', (done) => {
      component.searchType = 'tv';
      (component as any).executeSearch('test tv', 1).subscribe((response: PagedResponse<MovieListItem>) => {
        expect(mockMovieService.searchTVShows).toHaveBeenCalledWith('test tv', 1);
        expect(response).toEqual(mockTvResponse);
        done();
      });
    });

    it('executeSearch should return observable of empty results if term is empty or whitespace', (done) => {
      (component as any).executeSearch('   ', 1).subscribe((response: PagedResponse<MovieListItem>) => {
        expect(response.results.length).toBe(0);
        expect(response.total_results).toBe(0);
        expect(mockMovieService.searchMovies).not.toHaveBeenCalled();
        expect(mockMovieService.searchTVShows).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('internal state handlers', () => {
    it('handleSearchResponse should update state correctly on successful search', () => {
      component.searching = true; // Simular estado previo
      component.searchText = 'ValidSearch';
      component.error = 'Previous error'; // Simular error previo

      (component as any).handleSearchResponse(mockMovieResponse);

      expect(component.searching).toBeFalse();
      expect(component.searchResults).toEqual(mockMovieResponse.results);
      expect(component.totalResults).toBe(mockMovieResponse.total_results);
      expect(component.searched).toBeTrue();
      expect(component.error).withContext('error should be null on success').toBeNull(); // Asumimos que se limpia, aunque el código actual no lo hace explícitamente aquí.
      // La lógica de limpieza de error está más en ngOnInit y pageChanged.
      // Si se espera que handleSearchResponse limpie el error, se debe añadir.
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('handleSearchResponse should set searched to false if searchText was empty/whitespace', () => {
      component.searchText = '  ';
      (component as any).handleSearchResponse(emptyPagedResponse);
      expect(component.searched).toBeFalse();
    });

    it('handleSearchError should update state correctly on search error', () => {
      component.searching = true;
      component.searchResults = [{} as MovieListItem];
      component.totalResults = 10;
      component.searchText = 'ErrorCausingSearch';

      (component as any).handleSearchError({message: 'Test Error'});

      expect(component.searching).toBeFalse();
      expect(component.searchResults.length).toBe(0);
      expect(component.totalResults).toBe(0);
      expect(component.searched).toBeTrue();
      expect(component.error).toBe('Error en la búsqueda. Por favor, inténtalo de nuevo.');
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('resetSearchState should reset all relevant search properties', () => {
      // Configurar un estado inicial "sucio"
      component.searching = true;
      component.searchResults = [{} as MovieListItem];
      component.totalResults = 10;
      component.searched = true;
      component.error = 'An error';

      (component as any).resetSearchState();

      expect(component.searching).toBeFalse();
      expect(component.searchResults.length).toBe(0);
      expect(component.totalResults).toBe(0);
      expect(component.searched).toBeFalse();
      expect(component.error).toBeNull();
    });
  });
});
