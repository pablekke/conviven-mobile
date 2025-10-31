import AuthService from "@/services/authService";
import type { LoginCredentials, User } from "@/types/user";

export async function loginService(credentials: LoginCredentials): Promise<User> {
  return AuthService.login(credentials);
}
