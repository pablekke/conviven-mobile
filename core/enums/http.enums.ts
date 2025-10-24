// Métodos HTTP centralizados

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

// Útil donde sólo se aceptan métodos no-GET (e.g., colas de escritura)
export type NonGetHttpMethod = Exclude<HttpMethod, HttpMethod.GET>;
