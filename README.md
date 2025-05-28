# Movies App

## Descripción

Esta aplicación muestra una lista de películas populares y permite a los usuarios ver detalles de cada película. Utiliza la API de [The Movie Database (TMDB)](https://www.themoviedb.org/) para obtener los datos de las películas.

## Capturas de Pantalla

*(Aquí puedes agregar capturas de pantalla de tu aplicación)*

### Lista de Películas
<!-- ![Placeholder Lista de Películas](URL_A_TU_CAPTURA_LISTA_PELICULAS) -->

### Detalles de Película
<!-- ![Placeholder Detalles de Película](URL_A_TU_CAPTURA_DETALLES_PELICULA) -->

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:
- [Node.js](https://nodejs.org/) (que incluye npm)
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`

## Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO_DE_TU_PROYECTO>
    cd movies
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura la API Key de TMDB:**
    Crea un archivo `env.ts` dentro de la carpeta `src/app/env/` con el siguiente contenido, reemplazando `<TU_API_KEY_DE_TMDB>` con tu clave de API real:
    ```typescript
    // src/app/env/env.ts
    export const env = {
      // Ejemplo: production: false, (si tienes otras variables de entorno)
      apiKey: '<TU_API_KEY_DE_TMDB>'
    };
    ```
    Puedes obtener una API key registrándote en TMDB.

4.  **Ejecuta la aplicación en modo de desarrollo:**
    ```bash
    ng serve
    ```
    Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias alguno de los archivos fuente.

## Cómo Funciona

La aplicación está construida con Angular y utiliza varios componentes y servicios para funcionar:

-   **`AppComponent`**: Es el componente raíz de la aplicación y el `<router-outlet>` donde se cargan los demás componentes según la ruta.
-   **`MovieListComponent`**: Muestra una lista de películas (posiblemente paginada) obtenidas de TMDB. Cada película en la lista es un enlace a su vista de detalle.
-   **`MovieDetailComponent`**: Muestra información detallada sobre una película específica, como su sinopsis, fecha de lanzamiento, calificación, póster, etc.
-   **`MovieService`**: Este servicio es responsable de realizar las llamadas a la API de TMDB para obtener la lista de películas y los detalles de una película específica. Utiliza la `apiKey` configurada en `src/app/env/env.ts`.
-   **Enrutamiento**: Angular Router se utiliza para gestionar la navegación entre la lista de películas y las vistas de detalle de cada película. Las rutas principales se definen en `src/app/app.routes.ts`.
-   **Estilos**: La aplicación utiliza Angular Material para los componentes de la interfaz de usuario y tiene un tema personalizado definido en `src/movie-theme.scss` y aplicado globalmente en `src/styles.scss`.

### Flujo Básico:
1.  El usuario accede a la aplicación, generalmente a la ruta raíz que muestra `MovieListComponent`.
2.  `MovieListComponent` utiliza `MovieService` para solicitar una lista de películas populares a la API de TMDB.
3.  Las películas se muestran en una lista.
4.  El usuario puede hacer clic en una película para navegar a la vista de detalles (`MovieDetailComponent`).
5.  `MovieDetailComponent` obtiene el ID de la película de los parámetros de la ruta y utiliza `MovieService` para solicitar los detalles completos de esa película a TMDB.
6.  Se muestra la información detallada de la película.

