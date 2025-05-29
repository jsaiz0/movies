import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MovieListComponent } from './movie-list.component';
import { MovieService } from '../movie.service';
import { MovieListItem, PagedResponse } from '@app/movie-interfaces';

/**
 * Suite de pruebas para el componente MovieListComponent.
 */
describe('MovieListComponent', () => {
  // Declaración de variables que se utilizarán en las pruebas.
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let movieService: jasmine.SpyObj<MovieService>;
  let router: Router;
  let cdr: ChangeDetectorRef;

  /**
   * Objeto simulado (mock) para una respuesta paginada de la API.
   * Contiene datos de ejemplo para películas/series.
   */
  const mockPagedResponse: PagedResponse<MovieListItem> = {
    page: 1,
    total_pages: 1,
    total_results: 2,
    results: [
      // Es importante que la estructura de estos objetos coincida con la interfaz MovieListItem
      // y las propiedades que el componente espera y utiliza (ej. title, name, overview, vote_average).
      // Aquí se incluyen 'name' y 'title' para cubrir ambos casos (película/serie),
      // pero en un escenario real, cada item tendría uno u otro, no ambos.
      // Para pruebas más precisas, se podrían tener mocks separados para películas y series
      // o asegurar que el mock actual sea suficiente para las propiedades que se están probando.
      // Se añaden overview y vote_average para mayor completitud si el componente los usa.
      { id: 1, title: 'Movie 1', name: 'Movie 1', poster_path: '/path1' },
      { id: 2, title: 'Movie 2', name: 'Movie 2', poster_path: '/path2' }
    ]
  };

  beforeEach(waitForAsync(() => {
    const movieServiceSpy = jasmine.createSpyObj('MovieService', ['searchMovies', 'searchTVShows', 'getImageUrl']);
    // Configuración del módulo de pruebas de Angular.
    // waitForAsync se usa para código asíncrono en beforeEach (como compileComponents).
    TestBed.configureTestingModule({
      imports: [
        // MovieListComponent es un componente standalone, por lo que se importa directamente aquí
        // si se necesitara renderizar como parte de otro componente de prueba.
        // Sin embargo, como se crea con TestBed.createComponent(MovieListComponent),
        // no es estrictamente necesario listarlo en `imports` del TestBed.
        // Los módulos que MovieListComponent importa (FormsModule, Material modules, etc.) sí son importantes aquí.
        FormsModule,
        MatTabsModule,
        MatInputModule,
        MatListModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatCardModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule // Deshabilita las animaciones de Angular Material para pruebas más rápidas y predecibles.
      ],
      // declarations: [], // 'declarations' no se usa para componentes standalone en el TestBed.
      providers: [ // Proveedores de servicios para el entorno de pruebas.
        { provide: MovieService, useValue: movieServiceSpy },
        ChangeDetectorRef // Asegúrate de proveer ChangeDetectorRef
      ]
    }).compileComponents();

    movieService = TestBed.inject(MovieService) as jasmine.SpyObj<MovieService>;
  }));

  // Configuración síncrona que se ejecuta antes de cada prueba 'it'.
  beforeEach(() => {
    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    cdr = fixture.componentRef.injector.get(ChangeDetectorRef);
    movieService.getImageUrl.and.returnValue('image-url'); // Simula la respuesta del método getImageUrl.
    // fixture.detectChanges(); // No llamar a detectChanges aquí si ngOnInit tiene lógica compleja que se prueba específicamente.
  });

  /**
   * Prueba básica para asegurar que el componente se crea correctamente.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Pruebas para el método ngOnInit.
   */
  describe('ngOnInit', () => {
    /**
     * Prueba que el componente se suscribe a `searchTerm` y ejecuta la búsqueda después del debounce.
     */
    it('should subscribe to searchTerm and execute search after debounce', fakeAsync(() => {
      movieService.searchMovies.and.returnValue(of(mockPagedResponse));
      spyOn(component as any, 'executeSearch').and.callThrough();

      fixture.detectChanges(); // ngOnInit is called
      component.searchTerm.next('test');
      tick(300); // Wait for debounceTime
      // Verifica que se llamó a executeSearch y al servicio con los parámetros correctos.
      expect((component as any).executeSearch).toHaveBeenCalledWith('test', 1);
      expect(movieService.searchMovies).toHaveBeenCalledWith('test', 1);
      expect(component.searchResults).toEqual(mockPagedResponse.results);
      expect(component.totalResults).toBe(mockPagedResponse.total_results);
      expect(component.searching).toBeFalse();
    }));

    /**
     * Prueba que el estado de búsqueda se resetea si `searchTerm` está vacío.
     */
    it('should reset search state if searchTerm is empty', fakeAsync(() => {
      spyOn(component as any, 'resetSearchState').and.callThrough();
      fixture.detectChanges();

      component.searchTerm.next('');
      tick(300);

      // Verifica que se llamó a resetSearchState y que las propiedades se resetearon.
      expect((component as any).resetSearchState).toHaveBeenCalled();
      expect(component.searchResults).toEqual([]);
      expect(component.totalResults).toBe(0);
      expect(component.searched).toBeFalse();
    }));

    it('should handle search error', fakeAsync(() => {
      /**
       * Prueba el manejo de errores cuando la búsqueda falla.
       */
      movieService.searchMovies.and.returnValue(throwError(() => new Error('Search Error')));
      spyOn(component as any, 'handleSearchError').and.callThrough();
      fixture.detectChanges();

      component.searchTerm.next('error');
      tick(300);

      // Verifica que se llamó a handleSearchError y que el estado refleja el error.
      expect((component as any).handleSearchError).toHaveBeenCalled();
      expect(component.searching).toBeFalse();
      expect(component.searchResults).toEqual([]);
      expect(component.totalResults).toBe(0);
      expect(component.error).toBe('Error en la búsqueda. Por favor, inténtalo de nuevo.');
    }));
  });

  describe('search', () => {
    /**
     * Pruebas para el método `search`.
     */
    it('should update searchText and trigger searchTerm', () => {
      /**
       * Prueba que el método `search` actualiza `searchText` y emite un valor a `searchTerm`.
       */
      spyOn(component.searchTerm, 'next');
      component.searchText = 'new search';
      component.search();

      expect(component.searching).toBeTrue();
      expect(component.searchTerm.next).toHaveBeenCalledWith('new search');
    });
  });

  describe('toggleSearchType', () => {
    /**
     * Pruebas para el método `toggleSearchType`.
     */
    it('should change searchType to tv and reset state when index is 1', () => {
      /**
       * Prueba que `toggleSearchType` cambia a 'tv' y resetea el estado cuando el índice es 1.
       */
      spyOn(component as any, 'resetSearchState').and.callThrough();
      spyOn(component.searchTerm, 'next');

      component.toggleSearchType(1);

      expect(component.searchType).toBe('tv');
      expect((component as any).resetSearchState).toHaveBeenCalled();
      expect(component.searchTerm.next).toHaveBeenCalledWith('');
    });

    it('should change searchType to movie and reset state when index is 0', () => {
      /**
       * Prueba que `toggleSearchType` cambia a 'movie' y resetea el estado cuando el índice es 0.
       */
      spyOn(component as any, 'resetSearchState').and.callThrough();
      spyOn(component.searchTerm, 'next');

      component.toggleSearchType(0);

      expect(component.searchType).toBe('movie');
      expect((component as any).resetSearchState).toHaveBeenCalled();
      expect(component.searchTerm.next).toHaveBeenCalledWith('');
    });
  });

  describe('pageChanged', () => {
    /**
     * Pruebas para el método `pageChanged`.
     */
    it('should update page and execute search with new page', () => {
      /**
       * Prueba que `pageChanged` actualiza la página y ejecuta una nueva búsqueda.
       */
      spyOn(component as any, 'executeSearch').and.returnValue(of(mockPagedResponse));

      const pageEvent: PageEvent = { pageIndex: 2, pageSize: 10, length: 100 };
      component.searchText = 'page search';
      component.pageChanged(pageEvent);

      expect(component.page).toBe(3);
      // Dado que el mock service devuelve of(), la operación de búsqueda es síncrona,
      // por lo que `searching` se establece en false inmediatamente dentro del `subscribe`.
      expect(component.searching).toBeFalse();
      expect((component as any).executeSearch).toHaveBeenCalledWith('page search', 3);
    });
  });

  describe('getUrlImage', () => {
    /**
     * Pruebas para el método `getUrlImage`.
     */
    it('should call movieService.getImageUrl with the provided path', () => {
      // Prueba que `getUrlImage` llama al método correspondiente del servicio.
      const path = '/test-path';
      component.getUrlImage(path);
      expect(movieService.getImageUrl).toHaveBeenCalledWith(path);
    });
  });

  describe('executeSearch', () => {
    /**
     * Pruebas para el método privado `executeSearch`.
     * Se accede a él mediante `(component as any)`.
     */
    it('should call searchMovies if searchType is movie', () => {
      // Prueba que se llama a `searchMovies` si `searchType` es 'movie'.
      movieService.searchMovies.and.returnValue(of(mockPagedResponse));
      component.searchType = 'movie';

      (component as any).executeSearch('movie search', 1).subscribe();

      expect(movieService.searchMovies).toHaveBeenCalledWith('movie search', 1);
    });

    it('should call searchTVShows if searchType is tv', () => {
      // Prueba que se llama a `searchTVShows` si `searchType` es 'tv'.
      movieService.searchTVShows.and.returnValue(of(mockPagedResponse));
      component.searchType = 'tv';

      (component as any).executeSearch('tv search', 1).subscribe();

      expect(movieService.searchTVShows).toHaveBeenCalledWith('tv search', 1);
    });

    it('should return empty results if term is empty', () => {
      // Prueba que devuelve resultados vacíos si el término de búsqueda está vacío.
      (component as any).executeSearch('', 1).subscribe((response: PagedResponse<MovieListItem>) => {
        expect(response).toEqual({ results: [], page: 1, total_pages: 0, total_results: 0 });
      });
    });
  });

  describe('handleSearchResponse', () => {
    /**
     * Pruebas para el método privado `handleSearchResponse`.
     */
    it('should update component properties with the response data', () => {
      /**
       * Prueba que las propiedades del componente se actualizan correctamente con la respuesta.
       */
      component.searchText = 'test';
      (component as any).handleSearchResponse(mockPagedResponse);

      expect(component.searching).toBeFalse();
      expect(component.searchResults).toEqual(mockPagedResponse.results);
      expect(component.totalResults).toBe(mockPagedResponse.total_results);
      expect(component.searched).toBe(true);
    });
  });

  describe('handleSearchError', () => {
    /**
     * Pruebas para el método privado `handleSearchError`.
     */
    it('should update component properties on error', () => {
      /**
       * Prueba que las propiedades del componente se actualizan correctamente en caso de error.
       */
      spyOn(console, 'error');
      component.searchText = 'test';
      (component as any).handleSearchError('test error');

      expect(console.error).toHaveBeenCalledWith('Search failed:', 'test error');
      expect(component.searching).toBeFalse();
      expect(component.searchResults).toEqual([]);
      expect(component.totalResults).toBe(0);
      expect(component.searched).toBe(true);
      expect(component.error).toBe('Error en la búsqueda. Por favor, inténtalo de nuevo.');
    });
  });

  describe('resetSearchState', () => {
    /**
     * Pruebas para el método privado `resetSearchState`.
     */
    it('should reset component properties to initial state', () => {
      /**
       * Prueba que las propiedades del componente se resetean a sus valores iniciales.
       */
      component.searching = true;
      component.searchResults = mockPagedResponse.results;
      component.totalResults = mockPagedResponse.total_results;
      component.searched = true;
      component.error = 'some error';

      (component as any).resetSearchState();

      expect(component.searching).toBeFalse();
      expect(component.searchResults).toEqual([]);
      expect(component.totalResults).toBe(0);
      expect(component.searched).toBeFalse();
      expect(component.error).toBeNull();
    });
  });

  describe('ngOnDestroy', () => {
    /**
     * Pruebas para el método `ngOnDestroy`.
     */
    it('should unsubscribe from searchTerm', () => {
      /**
       * Prueba que el componente se desuscribe de `searchTerm` al destruirse.
       */
      const subscription = component['searchSubscription'] = new Subject<string>().subscribe();
      spyOn(subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });
  });
});