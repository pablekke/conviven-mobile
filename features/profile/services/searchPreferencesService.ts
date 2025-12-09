import {
  SearchPreferences,
  CreateSearchPreferencesRequest,
  CreateRoommatePreferencesRequest,
} from "../interfaces";
import { BaseApiService } from "../../../services/apiHelper";

class SearchPreferencesService extends BaseApiService {
  constructor() {
    super("/search-preferences");
  }

  /**
   * Obtener las preferencias de búsqueda del usuario autenticado
   */
  async getSearchPreferences(): Promise<SearchPreferences> {
    return this.get<SearchPreferences>("me");
  }

  /**
   * Crear o actualizar las preferencias de búsqueda del usuario autenticado
   */
  async upsertSearchPreferences(
    preferences: CreateSearchPreferencesRequest | CreateRoommatePreferencesRequest,
  ): Promise<SearchPreferences> {
    return this.put<SearchPreferences>("me", preferences);
  }

  /**
   * Eliminar las preferencias de búsqueda del usuario autenticado
   */
  async deleteSearchPreferences(): Promise<void> {
    return this.delete<void>("me");
  }

  /**
   * Actualizar solo algunos campos de las preferencias
   */
  async updatePartialSearchPreferences(
    updates: Partial<CreateSearchPreferencesRequest>,
  ): Promise<SearchPreferences> {
    return this.upsertSearchPreferences(updates);
  }
}

export default new SearchPreferencesService();
