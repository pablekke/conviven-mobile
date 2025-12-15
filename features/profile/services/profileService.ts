import UserService from "../../../services/userService";
import { apiPatch } from "../../../services/apiHelper";
import { User } from "../../../types/user";

class ProfileService {
  /**
   * Obtiene el perfil del usuario actual
   * @returns Usuario actual
   */
  async getCurrent(): Promise<User> {
    return UserService.getCurrent();
  }

  /**
   * Actualiza el perfil del usuario
   * @param userId - ID del usuario
   * @param payload - Datos a actualizar
   * @returns Usuario actualizado
   */
  async update(userId: string, payload: any): Promise<User> {
    return UserService.update(userId, payload);
  }

  /**
   * Actualiza el perfil del usuario autenticado (PATCH /api/profiles/me)
   * Se usa, por ejemplo, para actualizar ubicación dentro del objeto user.
   */
  async updateMe(payload: any): Promise<User> {
    return apiPatch<User>("/profiles/me", payload);
  }

  /**
   * Actualiza el avatar del usuario
   * @param userId - ID del usuario
   * @param asset - Asset de la imagen
   * @returns Usuario actualizado
   */
  async updateAvatar(
    userId: string,
    asset: { uri: string; name?: string; type?: string },
  ): Promise<User> {
    return UserService.updateAvatar(userId, asset);
  }

  /**
   * Elimina la cuenta del usuario actual
   */
  async deleteCurrent(): Promise<void> {
    return UserService.deleteCurrent();
  }
}

export default new ProfileService();
