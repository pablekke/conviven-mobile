import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { useAuth } from "../../../context/AuthContext";
import { City, Department, Neighborhood, UpdateUserPayload } from "../../../types/user";
import LocationService from "../../../services/locationService";
import UserService from "../../../services/userService";
import { EditForm, LocationLabels, SelectionType } from "../types";
import { DEFAULT_LOCATION_LABELS } from "../constants";
import { formatLabel } from "../utils/formatters";

export interface UseProfileFormReturn {
  form: EditForm;
  locationLabels: LocationLabels;
  savingProfile: boolean;
  catalogLoading: boolean;
  photoUploading: boolean;
  departments: Department[];
  cities: City[];
  neighborhoods: Neighborhood[];
  selectionType: SelectionType | null;
  editVisible: boolean;
  setEditVisible: (visible: boolean) => void;
  setSelectionType: (type: SelectionType | null) => void;
  updateForm: <K extends keyof EditForm>(field: K, value: EditForm[K]) => void;
  openEditModal: () => Promise<void>;
  handleSelect: (type: SelectionType, id: string) => Promise<void>;
  handleSaveProfile: () => Promise<void>;
  handleAvatarUpdate: () => Promise<void>;
  handleSelectionOpen: (type: SelectionType) => void;
  selectionItems: { id: string; label: string; helper?: string }[];
  selectedId: string | undefined;
}

export const useProfileForm = (): UseProfileFormReturn => {
  const { user, setUser, updateUser } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [selectionType, setSelectionType] = useState<SelectionType | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [locationLabels, setLocationLabels] = useState<LocationLabels>(DEFAULT_LOCATION_LABELS);
  const [form, setForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    phone: "",
    bio: "",
    location: "",
    departmentId: "",
    cityId: "",
    neighborhoodId: "",
  });

  useEffect(() => {
    if (!user || editVisible) {
      return;
    }

    setForm({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: user.phone ?? "",
      bio: user.bio ?? "",
      location: user.location ?? "",
      departmentId: user.departmentId ?? "",
      cityId: user.cityId ?? "",
      neighborhoodId: user.neighborhoodId ?? "",
    });
  }, [user, editVisible]);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      if (!user) {
        return;
      }

      try {
        if (user.neighborhoodId) {
          const neighborhood = await LocationService.getNeighborhood(user.neighborhoodId);
          if (!isMounted) {
            return;
          }

          const departmentName =
            neighborhood.city?.department?.name ??
            user.departmentName ??
            (neighborhood.city?.department ? neighborhood.city.department.name : undefined);
          const cityName = neighborhood.city?.name ?? user.cityName;
          const neighborhoodName = neighborhood.name ?? user.neighborhoodName;

          setLocationLabels({
            department: formatLabel(departmentName, DEFAULT_LOCATION_LABELS.department),
            city: formatLabel(cityName, DEFAULT_LOCATION_LABELS.city),
            neighborhood: formatLabel(neighborhoodName, DEFAULT_LOCATION_LABELS.neighborhood),
          });

          if (!editVisible) {
            setForm(prev => ({
              ...prev,
              departmentId:
                neighborhood.city?.department?.id ??
                neighborhood.city?.departmentId ??
                prev.departmentId,
              cityId: neighborhood.city?.id ?? prev.cityId,
              neighborhoodId: neighborhood.id ?? prev.neighborhoodId,
            }));
          }

          if ((!user.cityId || !user.cityName) && neighborhood.city?.id) {
            await updateUser({ cityId: neighborhood.city.id, cityName: neighborhood.city.name });
          }
        } else if (user.departmentId) {
          const department = await LocationService.getDepartment(user.departmentId);
          if (!isMounted) {
            return;
          }

          setLocationLabels(prev => ({
            department: formatLabel(department.name, prev.department),
            city: formatLabel(user.cityName, prev.city),
            neighborhood: formatLabel(user.neighborhoodName, prev.neighborhood),
          }));

          if (!editVisible) {
            setForm(prev => ({
              ...prev,
              departmentId: department.id,
            }));
          }
        }
      } catch (error) {
        console.error("Location fetch error", error);
      }
    };

    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, [
    user?.neighborhoodId,
    user?.departmentId,
    user?.cityId,
    user?.cityName,
    user?.neighborhoodName,
    editVisible,
    updateUser,
  ]);

  const updateForm = useCallback(<K extends keyof EditForm>(field: K, value: EditForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateLocationLabels = useCallback(
    (type: SelectionType, id: string) => {
      if (type === "department") {
        const department = departments.find(dept => dept.id === id);
        setLocationLabels(prev => ({
          ...prev,
          department: formatLabel(department?.name, prev.department),
          city: DEFAULT_LOCATION_LABELS.city,
          neighborhood: DEFAULT_LOCATION_LABELS.neighborhood,
        }));
      }

      if (type === "city") {
        const city = cities.find(item => item.id === id);
        setLocationLabels(prev => ({
          ...prev,
          city: formatLabel(city?.name, prev.city),
          neighborhood: DEFAULT_LOCATION_LABELS.neighborhood,
        }));
      }

      if (type === "neighborhood") {
        const neighborhood = neighborhoods.find(item => item.id === id);
        setLocationLabels(prev => ({
          ...prev,
          neighborhood: formatLabel(neighborhood?.name, prev.neighborhood),
        }));
      }
    },
    [cities, departments, neighborhoods],
  );

  const openEditModal = useCallback(async () => {
    if (!user) {
      return;
    }

    setEditVisible(true);
    setCatalogLoading(true);

    try {
      const [deptList, cityList, neighborhoodList] = await Promise.all([
        LocationService.listDepartments(),
        form.departmentId
          ? LocationService.listCities(form.departmentId)
          : Promise.resolve([] as City[]),
        form.cityId
          ? LocationService.listNeighborhoods(form.cityId)
          : Promise.resolve([] as Neighborhood[]),
      ]);

      setDepartments(deptList);
      setCities(cityList);
      setNeighborhoods(neighborhoodList);

      const departmentName =
        deptList.find(dept => dept.id === (form.departmentId || user.departmentId))?.name ??
        locationLabels.department;
      const cityName =
        cityList.find(city => city.id === (form.cityId || user.cityId))?.name ??
        locationLabels.city;
      const neighborhoodName =
        neighborhoodList.find(neigh => neigh.id === (form.neighborhoodId || user.neighborhoodId))
          ?.name ?? locationLabels.neighborhood;

      setLocationLabels({
        department: formatLabel(departmentName, locationLabels.department),
        city: formatLabel(cityName, locationLabels.city),
        neighborhood: formatLabel(neighborhoodName, locationLabels.neighborhood),
      });
    } catch (error) {
      console.error("Catalog load error", error);
      Alert.alert(
        "Ubicaciones",
        "No pudimos cargar las ubicaciones. Intenta nuevamente más tarde.",
      );
    } finally {
      setCatalogLoading(false);
    }
  }, [
    form.cityId,
    form.departmentId,
    form.neighborhoodId,
    locationLabels.city,
    locationLabels.department,
    locationLabels.neighborhood,
    user,
  ]);

  const handleSelect = useCallback(
    async (type: SelectionType, id: string) => {
      if (type === "department") {
        setForm(prev => ({ ...prev, departmentId: id, cityId: "", neighborhoodId: "" }));
        updateLocationLabels(type, id);
        setCatalogLoading(true);
        try {
          const cityList = await LocationService.listCities(id);
          setCities(cityList);
          setNeighborhoods([]);
        } catch (error) {
          console.error("City load error", error);
          Alert.alert("Ciudades", "No pudimos cargar las ciudades. Intenta nuevamente.");
        } finally {
          setCatalogLoading(false);
        }
        return;
      }

      if (type === "city") {
        setForm(prev => ({ ...prev, cityId: id, neighborhoodId: "" }));
        updateLocationLabels(type, id);
        setCatalogLoading(true);
        try {
          const neighborhoodList = await LocationService.listNeighborhoods(id);
          setNeighborhoods(neighborhoodList);
        } catch (error) {
          console.error("Neighborhood load error", error);
          Alert.alert("Barrios", "No pudimos cargar los barrios. Intenta nuevamente.");
        } finally {
          setCatalogLoading(false);
        }
        return;
      }

      setForm(prev => ({ ...prev, neighborhoodId: id }));
      updateLocationLabels(type, id);
    },
    [updateLocationLabels],
  );

  const handleSaveProfile = useCallback(async () => {
    if (!user) {
      return;
    }

    setSavingProfile(true);

    const payload: UpdateUserPayload = {
      firstName: form.firstName.trim() || undefined,
      lastName: form.lastName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      bio: form.bio.trim() || undefined,
      location: form.location.trim() || undefined,
      departmentId: form.departmentId || undefined,
      neighborhoodId: form.neighborhoodId || undefined,
    };

    try {
      const updatedUser = await UserService.update(user.id, payload);
      await setUser(updatedUser);
      setEditVisible(false);
      Alert.alert("Perfil actualizado", "Tus datos se guardaron correctamente.");
    } catch (error) {
      console.error("Update profile error", error);
      Alert.alert("Perfil", "No pudimos guardar los cambios. Intenta nuevamente.");
    } finally {
      setSavingProfile(false);
    }
  }, [
    form.bio,
    form.departmentId,
    form.firstName,
    form.lastName,
    form.location,
    form.neighborhoodId,
    form.phone,
    setUser,
    user,
  ]);

  const handleAvatarUpdate = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permisos", "Necesitamos acceso a tu galería para actualizar la foto.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      setPhotoUploading(true);

      const updatedUser = await UserService.updateAvatar(user.id, {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });

      await setUser(updatedUser);
      Alert.alert("Foto actualizada", "Tu foto de perfil se actualizó correctamente.");
    } catch (error) {
      console.error("Avatar update error", error);
      Alert.alert("Foto", "No pudimos actualizar tu foto. Intenta nuevamente.");
    } finally {
      setPhotoUploading(false);
    }
  }, [setUser, user]);

  const handleSelectionOpen = useCallback(
    (type: SelectionType) => {
      if (type === "city" && !form.departmentId) {
        Alert.alert("Ubicación", "Selecciona primero un departamento.");
        return;
      }

      if (type === "neighborhood" && !form.cityId) {
        Alert.alert("Ubicación", "Selecciona primero una ciudad.");
        return;
      }

      setSelectionType(type);
    },
    [form.cityId, form.departmentId],
  );

  const selectionItems = useMemo(() => {
    if (selectionType === "department") {
      return departments.map(dept => ({ id: dept.id, label: dept.name }));
    }

    if (selectionType === "city") {
      return cities.map(city => ({
        id: city.id,
        label: city.name,
        helper: departments.find(dept => dept.id === city.departmentId)?.name,
      }));
    }

    if (selectionType === "neighborhood") {
      return neighborhoods.map(neigh => ({
        id: neigh.id,
        label: neigh.name,
        helper: cities.find(city => city.id === neigh.cityId)?.name,
      }));
    }

    return [];
  }, [cities, departments, neighborhoods, selectionType]);

  const selectedId = useMemo(() => {
    if (selectionType === "department") {
      return form.departmentId;
    }
    if (selectionType === "city") {
      return form.cityId;
    }
    if (selectionType === "neighborhood") {
      return form.neighborhoodId;
    }
    return undefined;
  }, [form.cityId, form.departmentId, form.neighborhoodId, selectionType]);

  return {
    form,
    locationLabels,
    savingProfile,
    catalogLoading,
    photoUploading,
    departments,
    cities,
    neighborhoods,
    selectionType,
    editVisible,
    setEditVisible,
    setSelectionType,
    updateForm,
    openEditModal,
    handleSelect,
    handleSaveProfile,
    handleAvatarUpdate,
    handleSelectionOpen,
    selectionItems,
    selectedId,
  };
};
