import { Component, OnInit } from '@angular/core';
import { MovieService } from '../movie.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MovieListItem } from '@app/movie-interfaces';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
})
export class MovieListComponent implements OnInit {
  searchTerm = new Subject<string>();
  searchResults: MovieListItem[] = [];
  searchType: 'movie' | 'tv' = 'movie'; // Default search type is movie

  constructor(private movieService: MovieService, private router: Router) { }

  ngOnInit(): void {
    this.searchTerm
      .pipe(
        debounceTime(300), // Espera 300ms después de cada pulsación de tecla
        distinctUntilChanged(), // Solo emite si el valor ha cambiado
        switchMap((term: string) => {
          if (!term.trim()) {
            return []; // Si el término de búsqueda está vacío, no se hace nada
          }
          return this.searchType === 'movie'
            ? this.movieService.searchMovies(term)
            : this.movieService.searchTVShows(term);
        })
      )
      .subscribe((results) => {
        this.searchResults = results;
      });
  }

  search(event: Event): void {
    this.searchTerm.next((event.target as HTMLInputElement).value);
  }

  showDetails(movie: MovieListItem, type: 'movie' | 'tv'): void {
    this.router.navigate([`/${type}`, movie.id]);
  }

  toggleSearchType(type: 'movie' | 'tv'): void {
    this.searchType = type;
    this.searchResults = []; // Clear previous results when switching type
    this.searchTerm.next(''); // Clear the search term
  }
}
