import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MovieService} from '../movie.service';
import { MovieDetail,TVShowDetail } from '../movie-interfaces';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { ProgressBarMode, MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * Componente encargado de mostrar los detalles de una película o programa de televisión.
 * Recibe el ID y el tipo ('movie' o 'tv') como parámetros de entrada a través de la ruta.
 */
@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatListModule, MatProgressBarModule],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss'],
})
export class MovieDetailComponent implements OnInit {
  /**
   * Almacena los detalles de la película si el tipo es 'movie'.
   * @type {MovieDetail | null}
   */
  movie: MovieDetail | null = null;

  /**
   * Almacena los detalles del programa de TV si el tipo es 'tv'.
   * @type {TVShowDetail | null}
   */
  tvShow: TVShowDetail | null = null;

  /**
   * Indica si los datos se están cargando actualmente.
   * @type {boolean}
   */
  loading: boolean = true;

  /**
   * Modo de la barra de progreso de Angular Material.
   * @type {ProgressBarMode}
   */
  mode: ProgressBarMode = 'indeterminate';

  /**
   * Almacena mensajes de error si ocurre algún problema durante la carga de datos.
   * @type {string | null}
   */
  error: string | null = null;

  /**
   * ID del contenido (película o programa de TV) obtenido de la ruta.
   * @input
   * @type {string}
   */
  @Input() id!: string; // Comes as string from route

  /**
   * Tipo de contenido ('movie' o 'tv') obtenido de la ruta.
   * @input
   * @type {'movie' | 'tv'}
   */
  @Input() type!: 'movie' | 'tv';

  /**
   * Constructor del componente.
   * @param {MovieService} movieService - Servicio para obtener datos de películas y programas de TV.
   * @param {ChangeDetectorRef} cdr - Referencia para el detector de cambios de Angular, útil para actualizar la vista manualmente.
   */
  constructor(private movieService: MovieService, private cdr: ChangeDetectorRef) { }

  /**
   * Hook del ciclo de vida de Angular que se llama después de que Angular ha inicializado
   * todas las propiedades vinculadas a datos de una directiva.
   * Aquí es donde se realiza la lógica para cargar los detalles del contenido.
   */
  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    this.movie = null;
    this.tvShow = null;

    // Valida que el ID y el tipo estén presentes.
    if (!this.id || !this.type) {
      console.warn('MovieDetailComponent initialized without ID or type.');
      this.error = 'ID o tipo de contenido no especificado.';
      this.loading = false;
      return;
    }
    // Convierte el ID (que viene como string de la ruta) a número.
    const numericId = parseInt(this.id, 10);
    // Valida si el ID es un número válido.
    if (isNaN(numericId)) {
      console.error('Invalid ID provided to MovieDetailComponent:', this.id);
      this.error = 'El ID proporcionado no es válido.';
      this.loading = false;
      return;
    }

    // Llama al servicio para obtener los detalles.
    this.movieService.getMovieDetails(numericId, this.type).subscribe({
      next: (data) => {
        // Asigna los datos al objeto correspondiente según el tipo.
        if (this.type === 'movie') {
          this.movie = data as MovieDetail;
        } else { // type === 'tv'
          this.tvShow = data as TVShowDetail;
        }
        this.loading = false;
        this.cdr.detectChanges(); // Notifica a Angular que actualice la vista.
      },
      error: (err) => {
        console.error(`Failed to load details for ${this.type} with id ${numericId}:`, err);
        this.error = 'No se pudieron cargar los detalles. Por favor, inténtalo de nuevo más tarde.';
        this.loading = false;
        this.cdr.detectChanges(); // Notifica a Angular que actualice la vista.
      }
    });
  }

  /**
   * Construye la URL completa para una imagen.
   * @param {string | undefined} path - La ruta relativa de la imagen obtenida de la API.
   * @returns {string | undefined} La URL completa de la imagen o undefined si la ruta no está definida.
   */
  getImageUrl(path: string | undefined): string | undefined {
    if (path) {
      return this.movieService.getImageUrl(path);
    }
    return undefined;
  }
}
