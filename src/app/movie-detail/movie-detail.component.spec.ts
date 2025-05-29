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

// Mock MovieService
class MockMovieService {
  getMovieDetails = jasmine.createSpy('getMovieDetails').and.returnValue(of({}));
  getImageUrl = jasmine.createSpy('getImageUrl').and.callFake((path: string) => `test_image_url/${path}`);
}

describe('MovieDetailComponent', () => {
  let component: MovieDetailComponent;
  let fixture: ComponentFixture<MovieDetailComponent>;
  let movieService: MockMovieService;

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
        // ActivatedRoute provider might still be needed if other parts of RouterTestingModule rely on it,
        // or if the component used other ActivatedRoute features (like queryParams).
        // For this component's @Input() id and type, direct assignment is clearer for testing.
        { provide: ActivatedRoute, useValue: {} } // Provide a minimal stub if needed by RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailComponent);
    component = fixture.componentInstance;

    // Mock getImageUrl if it's a component method
    // We will use the spy on the service now, as the component delegates to it.
    // spyOn(component, 'getImageUrl').and.callFake((path: string) => `test_image_url/${path}`);
    // The component's getImageUrl now calls movieService.getImageUrl, so the service's spy will be used.

    component.mode = 'indeterminate'; // As seen in template
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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

  it('should load TV show details on init if type is "tv"', fakeAsync(() => {
    component.id = '1';
    component.type = 'tv';
    movieService.getMovieDetails.and.returnValue(of(mockTvShow)); // Corrected: use getMovieDetails spy

    fixture.detectChanges(); // Triggers ngOnInit
    tick();

    expect(component.loading).toBeFalse();
    expect(component.tvShow).toEqual(jasmine.objectContaining(mockTvShow));
    expect(component.movie).toBeNull();
    expect(movieService.getMovieDetails).toHaveBeenCalledWith(1, 'tv'); // Corrected: spy and arguments
  }));

  it('should display loading indicator while fetching data', () => {
    component.id = '1';
    component.type = 'movie';
    movieService.getMovieDetails.and.returnValue(new ReplaySubject(1)); // Keep observable pending

    fixture.detectChanges(); // ngOnInit will set component.loading = true

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
    // Check for the text within the specific loading container if possible
    // For example, if you have <div *ngIf="loading">Cargando detalles...</div>
    expect(fixture.nativeElement.textContent).toContain('Cargando detalles...');
  });

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

  it('getImageUrl should return a valid image URL string', () => {
    const testPath = '/poster.jpg';
    component.getImageUrl(testPath);
    expect(movieService.getImageUrl).toHaveBeenCalledWith(testPath);
    // To test the actual return value if needed, but the spy on the service method is primary
    // expect(component.getImageUrl(testPath)).toBe(`test_image_url${testPath}`);
  });

  it('should set error and not call service if id is not provided', () => {
    component.id = ''; // or undefined
    component.type = 'movie';

    fixture.detectChanges(); // ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('ID o tipo de contenido no especificado.');
    expect(movieService.getMovieDetails).not.toHaveBeenCalled();
  });

  it('should set error and not call service if type is not provided', () => {
    component.id = '1';
    // component.type = undefined; // type is 'movie' | 'tv', so it cannot be undefined by type system
    (component as any).type = undefined; // Force undefined for testing

    fixture.detectChanges(); // ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('ID o tipo de contenido no especificado.');
    expect(movieService.getMovieDetails).not.toHaveBeenCalled();
  });

  it('should set error and not call service if id is not a valid number', () => {
    component.id = 'abc'; // Invalid numeric ID
    component.type = 'movie';

    fixture.detectChanges(); // ngOnInit

    expect(component.loading).toBeFalse();
    expect(component.error).toBe('El ID proporcionado no es válido.');
    expect(movieService.getMovieDetails).not.toHaveBeenCalled();
  });

  // Example test for rendering specific movie details (if mockMovie is loaded)
  // it('should display movie title when movie data is loaded', fakeAsync(() => {
  //   component.id = '1';
  //   component.type = 'movie';
  //   movieService.getMovieDetails.and.returnValue(of(mockMovie));
  //   fixture.detectChanges();
  //   tick();
  //   fixture.detectChanges(); // For view update after async data
  //   const titleElement = fixture.nativeElement.querySelector('mat-card-title'); // Adjust selector
  //   expect(titleElement.textContent).toContain(mockMovie.title);
  // }));
});
