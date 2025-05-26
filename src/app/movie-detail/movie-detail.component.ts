import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieService} from '../movie.service';
import { MovieDetail,TVShowDetail } from '../movie-interfaces';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { ProgressBarMode, MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatListModule, MatProgressBarModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
})
export class MovieDetailComponent implements OnInit {
  movie: MovieDetail | null = null;
  tvShow: TVShowDetail | null = null;
  loading: boolean = true; // Explicit loading state
  mode: ProgressBarMode = 'indeterminate'; // Default mode for progress bar
  error: string | null = null; // To store error messages

  // Route parameters will be bound to these inputs
  @Input() id!: string; // Comes as string from route
  @Input() type!: 'movie' | 'tv';

  constructor(private movieService: MovieService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    this.movie = null;
    this.tvShow = null;

    if (!this.id || !this.type) {
      console.warn('MovieDetailComponent initialized without ID or type.');
      this.error = 'ID o tipo de contenido no especificado.';
      this.loading = false;
      return;
    }

    const numericId = parseInt(this.id, 10);

    if (isNaN(numericId)) {
      console.error('Invalid ID provided to MovieDetailComponent:', this.id);
      this.error = 'El ID proporcionado no es válido.';
      this.loading = false;
      return;
    }

    this.movieService.getMovieDetails(numericId, this.type).subscribe({
      next: (data) => {
        if (this.type === 'movie') {
          this.movie = data as MovieDetail;
        } else { // type === 'tv'
          this.tvShow = data as TVShowDetail;
        }
        this.loading = false;
        this.cdr.detectChanges(); // Fuerza la detección de cambios
      },
      error: (err) => {
        console.error(`Failed to load details for ${this.type} with id ${numericId}:`, err);
        this.error = 'No se pudieron cargar los detalles. Por favor, inténtalo de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges(); // Fuerza la detección de cambios
      }
    });
  }

  getImageUrl(path: string | undefined): string | undefined {
    if (path) {
      return this.movieService.getImageUrl(path);
    }
    return undefined;
  }
}
