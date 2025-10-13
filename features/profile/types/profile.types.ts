export type SelectionType = "department" | "city" | "neighborhood";

export interface EditForm {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  location: string;
  departmentId: string;
  cityId: string;
  neighborhoodId: string;
}

export interface LocationLabels {
  department: string;
  city: string;
  neighborhood: string;
}

export interface SearchStatusMeta {
  label: string;
  description: string;
  accent: string;
  textColor: string;
}

export interface VerificationBadge {
  icon: "mail" | "shield" | "phone" | "users" | "award";
  label: string;
  tone: "success" | "pending";
}

export interface PreferenceSection {
  id: string;
  icon:
    | "broom"
    | "clock-outline"
    | "paw"
    | "account-heart-outline"
    | "music"
    | "smoking"
    | "glass-wine";
  title: string;
  summary: string;
  details: string;
}

export interface MatchSignal {
  id: string;
  icon: "sun" | "shield" | "message-circle";
  label: string;
  value: number;
  description: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  helper: string;
  completed: boolean;
}

export interface QuickAction {
  id: string;
  icon: "share-2" | "users" | "sliders";
  label: string;
  helper: string;
  action: () => void;
}

export interface MenuOption {
  id: string;
  label: string;
  icon: "edit-3" | "settings" | "refresh-ccw";
  helper?: string;
  onPress: () => void;
}

export interface ProfileFormState {
  form: EditForm;
  locationLabels: LocationLabels;
  savingProfile: boolean;
  catalogLoading: boolean;
  photoUploading: boolean;
}
