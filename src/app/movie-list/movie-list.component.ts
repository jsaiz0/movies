import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MovieService } from '../movie.service';
import { Router } from '@angular/router';
import { Subject, of, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieListItem, PagedResponse } from '@app/movie-interfaces';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator'; // Import MatPaginatorModule
import { ProgressBarMode, MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [FormsModule, CommonModule, MatTabsModule, MatInputModule, MatListModule, MatPaginatorModule, MatProgressBarModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnInit {
  searchTerm = new Subject<string>();
  searchResults: MovieListItem[] = [];
  searchType: 'movie' | 'tv' = 'movie'; // Default search type is movie
  page = 1;
  totalResults = 0;
  searched = false;
  searching = false;
  searchText = '';
  mode: ProgressBarMode = 'indeterminate';

  constructor(private movieService: MovieService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.page = 1;
    this.totalResults = 0;
    this.searched = false;
    this.searching = false;
    this.searchResults = [];
    this.searchTerm
      .pipe(
        debounceTime(300), // Espera 300ms después de cada pulsación de tecla
        switchMap((term: string): Observable<PagedResponse<MovieListItem>> => {
          this.searching = true;
          if (!term.trim()) {
            return of({ results: [], page: 0, total_pages: 0, total_results: 0 }); // Si el término de búsqueda está vacío, no se hace nada
          }
          return this.searchType === 'movie'
            ? this.movieService.searchMovies(term, this.page)
            : this.movieService.searchTVShows(term, this.page);
        })
      )
      .subscribe((response: PagedResponse<MovieListItem>) => {
        this.searched = true;
        this.searching = false;
        this.searchResults = response.results;
        this.totalResults = response.total_results;
        this.cdr.detectChanges(); // Manually trigger change detection
      });
  }

  search(event: Event): void {
    this.searchText = (event.target as HTMLInputElement).value;
    this.searchTerm.next((event.target as HTMLInputElement).value);
    this.page = 1; // Reset page on new search
  }

  showDetails(movie: MovieListItem, type: 'movie' | 'tv'): void {
    this.router.navigate([`/${type}`, movie.id]);
  }

  toggleSearchType(index: number): void {
    this.searchType = index === 0 ? 'movie' : 'tv';
    this.searchResults = [];
    this.searchTerm.next('');
    this.page = 1; // Reset page on tab change
    this.searched = false;
  }
  pageChanged(event: PageEvent): void {
    this.searching = true;
    this.page = event.pageIndex + 1;
    this.searchTerm.next(this.searchText); // Trigger search with new page
  }
}
