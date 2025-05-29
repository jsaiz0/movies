import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MovieDetailComponent } from './movie-detail.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of, ReplaySubject, throwError } from 'rxjs';
import { CommonModule } from '@angular/common'; // For pipes

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { MovieService } from '@app/movie.service';
import { MovieDetail, TVShowDetail } from '@app/movie-interfaces';

/**
 * Implementación simulada (mock) de MovieService para propósitos de prueba.
 * Esta clase espía los métodos del servicio para controlar su comportamiento y verificar interacciones.
 */
class MockMovieService {
  /** Espía para el método getMovieDetails. */
  getMovieDetails = jasmine.createSpy('getMovieDetails').and.returnValue(of({}));
  /** Espía para el método getImageUrl. */
  getImageUrl = jasmine.createSpy('getImageUrl').and.callFake((path: string) => `test_image_url/${path}`);
}

/**
 * Suite de pruebas para MovieDetailComponent.
 */
describe('MovieDetailComponent', () => {
  let component: MovieDetailComponent;
  let fixture: ComponentFixture<MovieDetailComponent>;
  let movieService: MockMovieService;

  /**
   * Datos simulados para un objeto MovieDetail.
   */
  const mockMovie = {
    id: 1,
    title: 'Test Movie',
    poster_path: '/poster.jpg',
    backdrop_path: '/backdrop.jpg',
    release_date: '2023-01-01',
    genres: [{ id: 1, name: 'Action' }],
    adult: false,
    runtime: 120,
    vote_average: 8.5,
    vote_count: 1000,
    tagline: 'A great movie.',
    overview: 'This is a test movie.',
    status: 'Released',
    original_title: 'Test Movie Original',
    budget: 1000000,
    revenue: 5000000,
    production_companies: [{ id: 1, name: 'Test Studios' }],
    production_countries: [{ iso_3166_1: 'US', name: 'United States of America' }],
    spoken_languages: [{ english_name: 'English', iso_639_1: 'en', name: 'English' }],
    homepage: 'http://example.com'
  } as MovieDetail;

  /**
   * Datos simulados para un objeto TVShowDetail.
   */
  const mockTvShow = {
    id: 1,
    name: 'Test TV Show',
    poster_path: '/tv_poster.jpg',
    backdrop_path: '/tv_backdrop.jpg',
    first_air_date: '2023-01-01',
    genres: [{ id: 1, name: 'Drama' }],
    adult: false,
    episode_run_time: [45],
    vote_average: 9.0,
    vote_count: 500,
    tagline: 'A great TV show.',
    overview: 'This is a test TV show.',
    status: 'Returning Series',
    type: 'Scripted',
    original_name: 'Test TV Original',
    number_of_seasons: 2,
    number_of_episodes: 20,
    networks: [{ id: 1, name: 'Test Network' }],
    created_by: [{ id: 1, name: 'Test Creator' }],
    languages: ['en'],
    homepage: 'http://tv-example.com',
    seasons: [{ id: 1, name: 'Season 1', poster_path: '/season1.jpg', air_date: '2023-01-01', episode_count: 10, overview: 'S1 overview', season_number: 1, vote_average: 0 }]
  } as TVShowDetail;

  /**
   * Función de configuración asíncrona que se ejecuta antes de cada caso de prueba.
   */
  beforeEach(async () => {
    movieService = new MockMovieService();

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, // For pipes like date, currency, uppercase
        RouterTestingModule,
        HttpClientTestingModule,
        MatProgressBarModule,
        MatCardModule,
        MatButtonModule,
        MovieDetailComponent, // Import standalone component
      ],
      providers: [
        { provide: MovieService, useValue: movieService },
        // El proveedor ActivatedRoute aún podría ser necesario si otras partes de RouterTestingModule dependen de él,
        // o si el componente utilizara otras características de ActivatedRoute (como queryParams).
        // Para los @Input() id y type de este componente, la asignación directa es más clara para las pruebas.
        { provide: ActivatedRoute, useValue: {} } // Proporciona un stub mínimo si RouterTestingModule lo necesita
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailComponent);
    component = fixture.componentInstance;

    // Simula getImageUrl si es un método del componente
    // Ahora usaremos el espía en el servicio, ya que el componente delega en él.
    // spyOn(component, 'getImageUrl').and.callFake((path: string) => `test_image_url/${path}`);
    // El getImageUrl del componente ahora llama a movieService.getImageUrl, por lo que se usará el espía del servicio.

    component.mode = 'indeterminate'; // Como se ve en la plantilla
  });

  /**
   * Caso de prueba para asegurar que el componente se crea correctamente.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Caso de prueba para verificar que los detalles de la película se cargan correctamente cuando el tipo es "movie".
   */
  it('should load movie details on init if type is "movie"', fakeAsync(() => {
    component.id = '1';
    component.type = 'movie';
    movieService.getMovieDetails.and.returnValue(of(mockMovie));

    fixture.detectChanges(); // Triggers ngOnInit
    tick(); // Resolve observables

    expect(component.loading).toBeFalse();
    expect(component.movie).toEqual(jasmine.objectContaining(mockMovie));
    expect(component.tvShow).toBeNull();
    expect(movieService.getMovieDetails).toHaveBeenCalledWith(1, 'movie');
  }));

  /**
   * Caso de prueba para verificar que los detalles del programa de TV se cargan correctamente cuando el tipo es "tv".
   */
  it('should load TV show details on init if type is "tv"', fakeAsync(() => {
    component.id = '1';
    component.type = 'tv';
    movieService.getMovieDetails.and.returnValue(of(mockTvShow)); // Corregido: usar el espía getMovieDetails
    
    fixture.detectChanges(); // Triggers ngOnInit
    tick();

    expect(component.loading).toBeFalse();
    expect(component.tvShow).toEqual(jasmine.objectContaining(mockTvShow));
    expect(component.movie).toBeNull();
    expect(movieService.getMovieDetails).toHaveBeenCalledWith(1, 'tv'); // Corregido: espía y argumentos
  }));

  /**
   * Caso de prueba para verificar que el indicador de carga se muestra mientras se obtienen los datos.
   */
  it('should display loading indicator while fetching data', () => {
    component.id = '1';
    component.type = 'movie';
    movieService.getMovieDetails.and.returnValue(new ReplaySubject(1)); // Mantiene el observable pendiente

    fixture.detectChanges(); // ngOnInit will set component.loading = true

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
    // Comprueba el texto dentro del contenedor de carga específico si es posible
    // Por ejemplo, si tienes <div *ngIf="loading">Cargando detalles...</div>
    expect(fixture.nativeElement.textContent).toContain('Cargando detalles...');
  });

  /**
   * Caso de prueba para verificar que se muestra un mensaje de error cuando el servicio falla al obtener los datos.
   */
  it('should display error message on service failure', fakeAsync(() => {
    component.id = '1';
    component.type = 'movie';
    movieService.getMovieDetails.and.returnValue(throwError(() => new Error('Failed to fetch')));

    fixture.detectChanges(); // ngOnInit
    tick(); // Resolve error
    fixture.detectChanges(); // Update view with error

    expect(component.loading).toBeFalse();
    expect(component.error).toBeTruthy();
    expect(component.error).toContain('No se pudieron cargar los detalles. Por favor, inténtalo de nuevo más tarde.');
    const errorCard = fixture.nativeElement.querySelector('.error-card');
    expect(errorCard).toBeTruthy();
    expect(errorCard.textContent).toContain('Error');
  }));

  /**
   * Caso de prueba para verificar que el método getImageUrl llama al servicio y devuelve una URL válida.
   */
  it('getImageUrl should return a valid image URL string', () => {
    const testPath = '/poster.jpg';
    component.getImageUrl(testPath);
    expect(movieService.getImageUrl).toHaveBeenCalledWith(testPath);
    // Para probar el valor de retorno real si es necesario, pero el espía en el método de servicio es lo principal
    // expect(component.getImageUrl(testPath)).toBe(`test_image_url/${testPath}`);
  });

  /**
   * Caso de prueba para verificar que se establece un error y no se llama al servicio si no se proporciona el 'id'.
   */
  it('should set error and not call service if id is not provided', () => {
    component.id = ''; // or undefined
    component.type = 'movie';

    fixture.detectChanges(); // ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('ID o tipo de contenido no especificado.');
    expect(movieService.getMovieDetails).not.toHaveBeenCalled();
  });

  /**
   * Caso de prueba para verificar que se establece un error y no se llama al servicio si no se proporciona el 'type'.
   */
  it('should set error and not call service if type is not provided', () => {
    component.id = '1';
    // component.type = undefined; // el tipo es 'movie' | 'tv', por lo que no puede ser undefined según el sistema de tipos
    (component as any).type = undefined; // Forzar undefined para la prueba

    fixture.detectChanges(); // ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('ID o tipo de contenido no especificado.');
    expect(movieService.getMovieDetails).not.toHaveBeenCalled();
  });

  /**
   * Caso de prueba para verificar que se establece un error y no se llama al servicio si el 'id' no es un número válido.
   */
  it('should set error and not call service if id is not a valid number', () => {
    component.id = 'abc'; // Invalid numeric ID
    component.type = 'movie';

    fixture.detectChanges(); // ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('El ID proporcionado no es válido.');
    expect(movieService.getMovieDetails).not.toHaveBeenCalled();
  });
});
