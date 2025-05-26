import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
import { MovieService } from '../movie.service';
import { Router } from '@angular/router';
import { Subject, of, Observable } from 'rxjs';
import { debounceTime, switchMap, tap, distinctUntilChanged } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieListItem, PagedResponse } from '@app/movie-interfaces';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; // Import MatPaginatorModule
import { ProgressBarMode, MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [FormsModule, CommonModule, MatTabsModule, MatInputModule, MatListModule, MatPaginatorModule, MatProgressBarModule, RouterModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnInit {
  searchTerm = new Subject<string>();
  searchResults: MovieListItem[] = [];
  searchType: 'movie' | 'tv' = 'movie'; // Default search type is movie
  page = 1;
  totalResults = 0;
  protected searched = false;
  protected searching = false;
  searchText = '';
  protected mode: ProgressBarMode = 'indeterminate';

  constructor(private movieService: MovieService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.searchTerm
      .pipe(
        debounceTime(300), // Espera 300ms después de cada pulsación de tecla
        distinctUntilChanged(), // Solo emite si el término de búsqueda actual es diferente del anterior
        tap(term => { // Efecto secundario para manejar el estado de búsqueda y reseteos
          const trimmedTerm = term.trim();
          if (!trimmedTerm) {
            this.resetSearchState();
          } else {
            this.searching = true;
          }
        }),
        switchMap((term: string) => this.executeSearch(term.trim(), this.page))
      )
      .subscribe({next: response => this.handleSearchResponse(response), error: err => this.handleSearchError(err)});
  }

  private executeSearch(term: string, page: number): Observable<PagedResponse<MovieListItem>> {
    if (!term) {
      return of({ results: [], page: 1, total_pages: 0, total_results: 0 });
    }
    // this.searching = true; // Ya se maneja en el 'tap' o al inicio de pageChanged
    return this.searchType === 'movie'
      ? this.movieService.searchMovies(term, page)
      : this.movieService.searchTVShows(term, page);
  }

  private handleSearchResponse(response: PagedResponse<MovieListItem>): void {
    this.searching = false;
    this.searchResults = response.results;
    this.totalResults = response.total_results;
    this.searched = this.searchText.trim().length > 0;
  }

  private handleSearchError(err: any): void {
    console.error('Search failed:', err);
    this.searching = false;
    this.searchResults = [];
    this.totalResults = 0;
    this.searched = this.searchText.trim().length > 0; // A search was attempted
  }

  private resetSearchState(): void {
    this.searching = false;
    this.searchResults = [];
    this.totalResults = 0;
    this.searched = false;
  }

  search(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.searchTerm.next((event.target as HTMLInputElement).value);
    this.page = 1; // Reset page on new search
  }

  toggleSearchType(index: number): void {
    this.searchType = index === 0 ? 'movie' : 'tv';
    this.searchResults = [];
    this.searchText = '';
    this.page = 1; // Reset page on tab change
    this.searched = false;
    this.totalResults = 0;
    this.resetSearchState();
    // Para asegurar que el pipe de searchTerm procese el estado vacío
    // si el input no se limpia automáticamente
    this.searchTerm.next('');
  }

  pageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.searching = true;
    this.executeSearch(this.searchText.trim(), this.page)
      .subscribe(response => this.handleSearchResponse(response),
                 error => this.handleSearchError(error));
  }
}
