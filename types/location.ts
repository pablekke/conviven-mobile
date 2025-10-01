export interface Department {
  id: string;
  name: string;
}

export interface City {
  id: string;
  name: string;
  departmentId: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  cityId: string;
}
