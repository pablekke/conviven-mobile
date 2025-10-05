// API Endpoints
export const API = {
  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",

  // User
  USER_PROFILE: "/user/profile",
  USER_DELETE: "/user/delete",
  USER_AVATAR: "/user/avatar",

  // Locations
  DEPARTMENTS: "/locations/departments",
  CITIES: "/locations/cities",
  NEIGHBORHOODS: "/locations/neighborhoods",
  DEPARTMENT_BY_ID: (id: string) => `/locations/departments/${id}`,
  CITY_BY_ID: (id: string) => `/locations/cities/${id}`,
  NEIGHBORHOOD_BY_ID: (id: string) => `/locations/neighborhoods/${id}`,
  CITIES_BY_DEPT: (deptId: string) => `/locations/cities?departmentId=${deptId}`,
  NEIGHBORHOODS_BY_CITY: (cityId: string) => `/locations/neighborhoods?cityId=${cityId}`,

  // Messages
  MESSAGES: "/messages",

  // Users (for admin)
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_REGISTER: (role: string) => `/users/register/${role}`,
} as const;
