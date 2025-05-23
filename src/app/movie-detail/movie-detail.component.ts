import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MovieService} from '../movie.service';
import { MovieDetail,TVShowDetail } from '../movie-interfaces';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
})
export class MovieDetailComponent implements OnInit {
  movie: MovieDetail | null = null;
  tvShow: TVShowDetail | null = null;
  type: 'movie' | 'tv' = 'movie';

  constructor(private route: ActivatedRoute, private movieService: MovieService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          this.type = this.route.snapshot.url[0].path === 'movie' ? 'movie' : 'tv';
          if (id) {
            return this.movieService.getMovieDetails(id, this.type);
          }
          return of(null);
        })
      )
      .subscribe((data) => {
        if (this.type === 'movie' && data) {
          this.movie = data as MovieDetail;
          this.tvShow = null;
        } else if (this.type === 'tv' && data) {
          this.tvShow = data as TVShowDetail;
          this.movie = null;
        } else {
          this.movie = null;
          this.tvShow = null;
        }
        this.cdr.detectChanges(); // Fuerza la detección de cambios
      });
  }

  getImageUrl(path: string | undefined): string | undefined {
    if (path) {
      return this.movieService.getImageUrl(path);
    }
    return undefined;
  }
}
