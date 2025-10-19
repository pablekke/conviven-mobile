import { apiPost } from "../../../services/apiHelper";
import { RegisterCredentials } from "../types";

interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    departmentId: string;
    cityId: string;
    neighborhoodId: string;
  };
  token: string;
}

class RegisterService {
  /**
   * Registra un nuevo usuario
   * Endpoint: POST /api/auth/register
   *
   * @param credentials - Datos de registro del usuario
   * @returns Datos del usuario creado y token de autenticación
   * @throws Error si el registro falla
   */
  async register(credentials: RegisterCredentials): Promise<RegisterResponse> {
    try {
      const response = await apiPost<RegisterResponse>("/auth/register", credentials);
      return response;
    } catch (error) {
      console.error("Error en registro:", error);
      throw error;
    }
  }
}

export default new RegisterService();
