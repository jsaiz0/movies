# Movies App

## Descripción del Proyecto

Esta aplicación muestra una lista de películas populares y permite a los usuarios ver detalles de cada película. Utiliza la API de [The Movie Database (TMDB)](https://www.themoviedb.org/) para obtener los datos de las películas.

## Capturas de Pantalla
### Pantalla de inicio

![alt text](image-3.png)

### Lista de Películas
![alt text](image-1.png)

### Detalles de Película
![alt text](image-2.png)

### Lista de Series
![alt text](image-4.png)

### Detalles de Serie
![alt text](image-5.png)

## Aspectos Generales

### Características Principales
*   Visualización de una lista de películas populares.
*   Visualización de detalles específicos de cada película (sinopsis, fecha de lanzamiento, calificación, póster, etc.).
*   Visualización de una lista de series populares.
*   Visualización de detalles específicos de cada serie.
*   Navegación intuitiva entre la lista y los detalles.
*   Interfaz de usuario moderna utilizando Angular Material.


### Arquitectura General
La aplicación está construida con Angular, siguiendo una arquitectura basada en componentes. Utiliza servicios para la lógica de negocio y la comunicación con APIs externas (TMDB). El enrutamiento se gestiona con Angular Router para una experiencia de navegación fluida (SPA - Single Page Application). Los estilos se manejan con SCSS y Angular Material para una interfaz de usuario consistente y atractiva.

## Aspectos Técnicos

### Tecnologías Utilizadas
*   **Framework Frontend:** [Angular](https://angular.io/) (19)
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
*   **Componentes UI:** [Angular Material](https://material.angular.io/)
*   **API Externa:** [The Movie Database (TMDB) API](https://www.themoviedb.org/)
*   **Enrutamiento:** Angular Router
*   **Estilos:** SCSS, Angular Material Theming
*   **Gestor de Paquetes/Bundler:** npm, [Bun.sh](https://bun.sh/) (opcional), Angular CLI
*   **Entorno de Ejecución (para desarrollo):** [Node.js](https://nodejs.org/)

### Instalación y Configuración

#### Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:
- [Node.js](https://nodejs.org/) (que incluye npm)
- [Angular CLI](https://angular.io/cli): `npm install -g @angular/cli`

#### Pasos de Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/jsaiz0/movies
    cd movies
    ```
2.  **Instala las dependencias:**
La Instalación de dependencias se ha usado [Bun.sh](https://bun.sh/) por su eficiencia y rapidez, pero se puede utilizar igualmente npm que es el método más común.

- Método NPM
    ```bash
    npm install
    ```
 - Método BUN
    ```bash
    curl -fsSL https://bun.sh/install | bash

    bun install
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
    ng serve -o
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
