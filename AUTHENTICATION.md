# Authentication System Documentation

Este documento describe el sistema de autenticación implementado en esta aplicación Expo.

## Panorama general

El sistema de autenticación cubre el flujo completo de acceso de usuarios, incluyendo:

- Formularios de login y registro
- Rutas protegidas con redirección automática
- Gestión de sesión con persistencia de token JWT
- Manejo de errores para las operaciones de autenticación
- Navegación tabular para usuarios autenticados

## Arquitectura

La implementación sigue una arquitectura limpia con los siguientes componentes:

### 1. Servicio de autenticación

Ubicado en `services/authService.ts`, concentra todas las operaciones contra el backend real (`https://conviven-backend.onrender.com/api`):

- Login (`POST /auth/login`)
- Registro (`POST /users/register`)
- Logout (limpieza local de credenciales)
- Verificación de sesión
- Obtención del perfil (`GET /users/me`)
- Refresh de tokens (`POST /auth/refresh`)

El servicio persiste el token JWT junto con el refresh token en AsyncStorage, recupera el perfil actual desde el backend y lo cachea para acceso offline básico. Al expirar el access token, automáticamente solicita uno nuevo mediante el refresh token y reintenta obtener el perfil. Los errores HTTP se traducen a mensajes legibles para la interfaz.

### 2. Contexto de autenticación

Definido en `context/AuthContext.tsx`, expone mediante React Context:

- Información del usuario autenticado
- Estado de autenticación
- Estados de carga y error
- Operaciones de login, registro y logout

Los componentes acceden a este estado a través del hook `useAuth`.

### 3. Flujo con Expo Router

`app/_layout.tsx` implementa un layout protegido que:

- Redirige usuarios no autenticados a las pantallas de login/registro
- Evita que usuarios autenticados vuelvan a las pantallas públicas
- Gestiona estados de carga al restaurar la sesión
- Separa claramente la navegación pública de la privada

### 4. Componentes de UI

- `LoginForm.tsx`: formulario de ingreso
- `RegisterForm.tsx`: formulario de registro con todos los campos requeridos por el backend
- `LoadingScreen.tsx`: indicador durante operaciones de autenticación
- `Button.tsx`: botón reutilizable con distintos estados

## Uso

### Acceder al estado de autenticación

```tsx
import { useAuth } from "../context/AuthContext";

function MiComponente() {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  // Consumir estado de autenticación
}
```

### Operaciones de autenticación

```tsx
import { useAuth } from "../context/AuthContext";

function MiComponente() {
  const { login, register, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: "firulete@ejemplo.com", password: "contraseña123" });
    } catch (error) {
      // Manejar errores devueltos por el backend
    }
  };

  const handleRegister = async () => {
    await register({
      email: "firulete@ejemplo.com",
      password: "contraseña123",
      firstName: "kamicaze",
      lastName: "fernanDeZ",
      birthDate: "2001-06-28",
      gender: "MALE",
      departmentId: "a2f0e079-c922-44f2-8712-e2710fad74e3",
      neighborhoodId: "23a75a72-2deb-4fd0-b8bb-98c48b03fa14",
    });
  };
}
```

### Rutas protegidas

Las rutas se organizan mediante grupos en Expo Router:

- `(app)/*`: rutas privadas, requieren autenticación
- `auth/*`: pantallas públicas de login/registro

La navegación entre ambos grupos se resuelve automáticamente según el estado de sesión.

## Manejo de errores

El servicio de autenticación convierte respuestas HTTP no exitosas en instancias de `Error` con mensajes proporcionados por el backend cuando están disponibles. Estos mensajes se propagan al contexto y pueden mostrarse en pantalla para brindar feedback claro.

## Próximos pasos sugeridos

1. Agregar recuperación de contraseña
2. Validar y formatear datos adicionales del perfil (p. ej. nombres de departamento/barrios)
3. Considerar almacenamiento seguro del token (SecureStore) para builds de producción
