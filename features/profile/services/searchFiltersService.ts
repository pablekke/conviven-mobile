import { BaseApiService } from "../../../services/apiHelper";

export interface SearchFilters {
  id: string;
  userId: string;
  mainPreferredNeighborhoodId: string | null;
  genderPref: string[] | null;
  minAge: number | null;
  maxAge: number | null;
  budgetMin: string | null;
  budgetMax: string | null;
  onlyWithPhoto: boolean | null;
  preferredNeighborhoods?: { id: string; neighborhoodId: string; neighborhood?: any }[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSearchFiltersRequest {
  genderPref?: string[];
  minAge?: number;
  maxAge?: number;
  budgetMin?: number;
  budgetMax?: number;
  onlyWithPhoto?: boolean;
}

export interface SearchFiltersFormData {
  genderPref: string[];
  minAge: number;
  maxAge: number;
  budgetMin: number;
  budgetMax: number;
  onlyWithPhoto: boolean;
}

class SearchFiltersService extends BaseApiService {
  constructor() {
    super("/search-filters");
  }

  async getSearchFilters(): Promise<SearchFilters> {
    return this.get<SearchFilters>("me");
  }

  async upsertSearchFilters(filters: UpdateSearchFiltersRequest): Promise<SearchFilters> {
    return this.put<SearchFilters>("me", filters);
  }

  async deleteSearchFilters(): Promise<void> {
    return this.delete<void>("me");
  }
}

const searchFiltersService = new SearchFiltersService();
export default searchFiltersService;
