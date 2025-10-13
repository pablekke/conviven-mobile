import { UpdateUserPayload, User } from "../../../types/user";
import UserService from "../../../services/userService";

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
  async update(userId: string, payload: UpdateUserPayload): Promise<User> {
    return UserService.update(userId, payload);
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
