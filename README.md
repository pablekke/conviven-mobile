# 📱 Expo Starter Auth NativeWind

A modern, type-safe starter template for building cross-platform mobile applications with Expo, featuring authentication and clean architecture principles.

<p align="center">
  <a href="https://docs.expo.dev/">
    <img alt="Supports Expo iOS" longdesc="Supports Expo iOS" src="https://img.shields.io/badge/iOS-4630EB.svg?style=flat-square&logo=APPLE&labelColor=999999&logoColor=fff" />
    <img alt="Supports Expo Android" longdesc="Supports Expo Android" src="https://img.shields.io/badge/Android-4630EB.svg?style=flat-square&logo=ANDROID&labelColor=A4C639&logoColor=fff" />
    <img alt="Supports Expo Web" longdesc="Supports Expo Web" src="https://img.shields.io/badge/web-4630EB.svg?style=flat-square&logo=GOOGLE-CHROME&labelColor=4285F4&logoColor=fff" />
  </a>
</p>

## 📚 Stack

- [**Expo**](https://docs.expo.dev/) - Universal React platform
- [**Expo Router**](https://docs.expo.dev/router/introduction/) - File-based routing system
- [**NativeWind**](https://www.nativewind.dev/) - Tailwind CSS for React Native
- [**TypeScript**](https://www.typescriptlang.org/) - Type safety
- [**Clean Architecture**](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Scalable and maintainable project structure

## ✨ Features

- 🔐 **Authentication Ready** - Secure authentication flow with proper state management
- 🎨 **Modern UI** - Beautiful, responsive UI with NativeWind (Tailwind CSS)
- 📱 **Cross Platform** - Works seamlessly on iOS, Android, and Web
- 🏗️ **Clean Architecture** - Domain-driven design with clear separation of concerns
- 📁 **File-based Routing** - Intuitive routing with Expo Router
- 💪 **Type Safety** - Full TypeScript support
- 🔄 **State Management** - Efficient and predictable state handling
- 🧪 **Testing Setup** - Ready for implementing your test suite

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/)
- iOS/Android Simulator or physical device

### Installation

```bash
# Clone the repository
git clone https://github.com/ecrindigital/expo-starter-auth-nativewind.git

# Navigate to the project directory
cd expo-starter-auth-nativewind

# Install dependencies
npm install
# or
yarn install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm start
# or
yarn start
```

## 📁 Estructura del Proyecto

El proyecto sigue una **arquitectura modular** donde cada módulo (tab) es independiente y autónomo:

```
conviven-mobile/
├── app/
│   ├── (app)/                    # Pantallas principales (protegidas)
│   │   ├── chat/                 # Módulo de Chat
│   │   │   ├── components/       # Componentes específicos
│   │   │   ├── hooks/            # Hooks personalizados
│   │   │   ├── services/         # Lógica de negocio
│   │   │   ├── types/            # Tipos TypeScript
│   │   │   ├── constants/        # Constantes
│   │   │   └── index.tsx         # Pantalla principal
│   │   ├── profile/              # Módulo de Perfil
│   │   ├── index/                # Módulo de Swipe/Match
│   │   └── settings/             # Módulo de Configuración
│   ├── auth/                     # Pantallas de autenticación
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── _layout.tsx               # Layout principal
├── components/                   # Componentes globales reutilizables
│   ├── Button.tsx
│   ├── Spinner.tsx
│   ├── LoadingScreen.tsx
│   └── index.ts                  # Exportaciones centrales
├── context/                      # Contextos de React
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── services/                     # Servicios globales
│   ├── apiClient.ts
│   ├── authService.ts
│   └── userService.ts
├── types/                        # Tipos globales
└── utils/                        # Utilidades

```

### Arquitectura Modular

Cada módulo sigue esta estructura consistente:

- **`components/`** - Componentes específicos del módulo
- **`hooks/`** - Hooks personalizados para lógica de estado
- **`services/`** - Lógica de negocio y llamadas a API
- **`types/`** - Tipos e interfaces TypeScript
- **`constants/`** - Constantes y datos mock
- **`index.tsx`** - Pantalla principal del módulo

**Ventajas:**

- ✅ Separación clara de responsabilidades
- ✅ Reutilización de componentes globales
- ✅ Fácil de escalar y mantener
- ✅ Equipos pueden trabajar en paralelo
- ✅ Testeo aislado de cada módulo

📖 **Para más detalles, consulta [ARQUITECTURA_MODULAR.md](ARQUITECTURA_MODULAR.md)**

### Crear un Nuevo Módulo

```bash
# Bash (Mac/Linux)
./scripts/create-module.sh nombre-modulo

# PowerShell (Windows)
.\scripts\create-module.ps1 nombre-modulo
```

📋 **Usa la plantilla en [TEMPLATE_MODULO.md](TEMPLATE_MODULO.md)** para implementar rápidamente

## 🛠️ Development

### Environment Variables

WIP

### Running on Different Platforms

```bash
# iOS
npm run ios
# or
yarn ios

# Android
npm run android
# or
yarn android

# Web
npm run web
# or
yarn web
```

## 📝 Notes

- This template follows Clean Architecture principles for better scalability and maintainability
- Authentication flow is implemented using industry best practices
- NativeWind v4 is configured for styling with Tailwind CSS
- The project structure is optimized for large-scale applications

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
