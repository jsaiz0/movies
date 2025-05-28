import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MovieService } from '../movie.service';
import { Router, RouterModule } from '@angular/router';
import { Subject, of, Observable } from 'rxjs';
import { debounceTime, switchMap, tap, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

import { MovieListItem, PagedResponse } from '@app/movie-interfaces';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ProgressBarMode, MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';

/**
 * Componente encargado de mostrar una lista de películas o programas de TV.
 * Permite al usuario buscar y paginar a través de los resultados.
 */
@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [FormsModule, MatTabsModule, MatInputModule, MatListModule, MatPaginatorModule, MatProgressBarModule, RouterModule, MatCardModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnInit {
  /**
   * Subject de RxJS para manejar los términos de búsqueda introducidos por el usuario.
   * Actúa como un observable que emite los términos de búsqueda.
   * @type {Subject<string>}
   */
  searchTerm = new Subject<string>();

  /**
   * Array para almacenar los resultados de la búsqueda (películas o programas de TV).
   * @type {MovieListItem[]}
   */
  searchResults: MovieListItem[] = [];

  /**
   * Tipo de búsqueda actual, puede ser 'movie' para películas o 'tv' para programas de TV.
   * Por defecto es 'movie'.
   * @type {'movie' | 'tv'}
   */
  searchType: 'movie' | 'tv' = 'movie'; // Default search type is movie

  /**
   * Número de la página actual de resultados que se está mostrando o solicitando a la API.
   * @type {number}
   */
  page = 1;

  /**
   * Número total de resultados encontrados para la búsqueda actual.
   * Utilizado por el paginador.
   * @type {number}
   */
  totalResults = 0;

  /**
   * Indica si se ha realizado una búsqueda.
   * @protected
   * @type {boolean}
   */
  protected searched = false;

  /**
   * Indica si una búsqueda está actualmente en curso (cargando datos).
   * @protected
   * @type {boolean}
   */
  protected searching = false;

  /**
   * Almacena el texto de búsqueda actual introducido por el usuario.
   * @type {string}
   */
  searchText = '';

  /**
   * Modo de la barra de progreso de Angular Material.
   * @protected
   * @type {ProgressBarMode}
   */
  protected mode: ProgressBarMode = 'indeterminate';

  /**
 * Almacena mensajes de error si ocurre algún problema durante la carga de datos.
 * @type {string | null}
 */
  error: string | null = null;

  /**
   * Constructor del componente.
   * @param {MovieService} movieService - Servicio para interactuar con la API de películas.
   * @param {Router} router - Servicio de enrutamiento de Angular para la navegación.
   * @param {ChangeDetectorRef} cdr - Referencia para el detector de cambios de Angular.
   */
  constructor(private movieService: MovieService, private router: Router, private cdr: ChangeDetectorRef) { }

  /**
   * Hook del ciclo de vida de Angular. Se ejecuta cuando el componente se inicializa.
   */
  ngOnInit(): void {
    this.searchTerm
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(term => {
          const trimmedTerm = term.trim();
          if (!trimmedTerm) {
            this.resetSearchState();
          } else {
            this.searching = true;
            this.page = 1;
          }
        }),
        switchMap((term: string) => {
          return this.executeSearch(term.trim(), this.page);
        })
      )
      .subscribe({
        next: response => {
          this.handleSearchResponse(response);
        },
        error: err => {
          this.handleSearchError(err);
        }
      });
  }



  /**
   * Ejecuta la búsqueda de películas o programas de TV.
   * @private
   * @param {string} term - El término de búsqueda.
   * @param {number} page - El número de página a solicitar.
   * @returns {Observable<PagedResponse<MovieListItem>>} Un observable con la respuesta paginada.
   */
  private executeSearch(term: string, page: number): Observable<PagedResponse<MovieListItem>> {
    if (!term) {
      // Si el término está vacío, devuelve un observable con resultados vacíos.
      return of({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    return this.searchType === 'movie'
      ? this.movieService.searchMovies(term, page) // Llama al servicio para buscar películas.
      : this.movieService.searchTVShows(term, page); // Llama al servicio para buscar programas de TV.
  }

  /**
   * Maneja la respuesta exitosa de la API de búsqueda.
   * @private
   * @param {PagedResponse<MovieListItem>} response - La respuesta de la API.
   */
  private handleSearchResponse(response: PagedResponse<MovieListItem>): void {
    this.searching = false; // Marca que la búsqueda ha finalizado.
    this.searchResults = response.results; // Almacena los resultados.
    this.totalResults = response.total_results; // Almacena el total de resultados.
    this.searched = this.searchText.trim().length > 0; // Marca que se ha realizado una búsqueda si hay texto.
    this.cdr.detectChanges();
  }

  /**
   * Maneja los errores ocurridos durante la llamada a la API de búsqueda.
   * @private
   * @param {any} err - El objeto de error.
   */
  private handleSearchError(err: any): void {
    console.error('Search failed:', err);
    this.searching = false; // Marca que la búsqueda ha finalizado (con error).
    this.searchResults = []; // Limpia los resultados.
    this.totalResults = 0; // Resetea el total de resultados.
    // Indica que se intentó una búsqueda.
    this.searched = this.searchText.trim().length > 0;
    this.error = 'Error en la búsqueda. Por favor, inténtalo de nuevo.';
    this.cdr.detectChanges();
  }

  /**
   * Resetea la búsqueda
   * @private
   */
  private resetSearchState(): void {
    this.searching = false;
    this.searchResults = [];
    this.totalResults = 0;
    this.searched = false;
  }

  /**
   * Se llama cuando el usuario escribe en el campo de búsqueda.
   * Actualiza `searchText` y emite el nuevo valor a `searchTerm`.
   * @param {Event} event - El evento de input del campo de búsqueda.
   */
  search(event: Event): void {
    this.searching = true; // Marca que se está realizando una búsqueda.
    this.searchTerm.next(this.searchText); // Emite el valor de this.searchText (actualizado por ngModel).
  }

  /**
   * Cambia el tipo de búsqueda entre 'movie' y 'tv' cuando el usuario selecciona una pestaña.
   * @param {number} index - El índice de la pestaña seleccionada (0 para películas, 1 para TV).
   */
  toggleSearchType(index: number): void {
    this.searchType = index === 0 ? 'movie' : 'tv';
    this.searchResults = [];
    this.searchText = '';
    this.page = 1; // Reset page on tab change
    this.searched = false;
    this.totalResults = 0;
    this.resetSearchState();
    // Emite un término vacío para asegurar que el pipe de searchTerm procese el estado de reseteo,
    // especialmente si el input no se limpia automáticamente o si se quiere forzar una actualización.
    this.searchTerm.next('');
  }

  /**
   * Se llama cuando el usuario cambia de página utilizando el paginador.
   * @param {PageEvent} event - El evento emitido por el paginador.
   */
  pageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1; // Actualiza el número de página (pageIndex es base 0).
    this.searching = true; // Marca que se está cargando la nueva página.
    // Ejecuta la búsqueda para la nueva página con el término de búsqueda actual.
    this.executeSearch(this.searchText.trim(), this.page)
      .subscribe(
        response => this.handleSearchResponse(response), // Maneja la respuesta.
        error => this.handleSearchError(error) // Maneja errores.
      );
  }

  getUrlImage(poster_path: string) {
    return this.movieService.getImageUrl(poster_path);

  }
}
