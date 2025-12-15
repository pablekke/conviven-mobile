import { City, Department, Neighborhood, User } from "../../../../types/user";
import { EditForm, LocationLabels, SelectionType } from "../../types";
import LocationService from "../../../../services/locationService";
import { DEFAULT_LOCATION_LABELS } from "../../constants";
import { useCallback, useMemo, useState } from "react";
import { formatLabel } from "../../utils/formatters";
import { Alert } from "react-native";

interface Params {
  user: User | null;
  form: EditForm;
  setForm: React.Dispatch<React.SetStateAction<EditForm>>;
  locationLabels: LocationLabels;
  setLocationLabels: React.Dispatch<React.SetStateAction<LocationLabels>>;
  setEditVisible: (visible: boolean) => void;
}

export function useProfileLocationCatalog({
  user,
  form,
  setForm,
  locationLabels,
  setLocationLabels,
  setEditVisible,
}: Params) {
  const [selectionType, setSelectionType] = useState<SelectionType | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

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
    [cities, departments, neighborhoods, setLocationLabels],
  );

  const openEditModal = useCallback(async () => {
    if (!user) return;

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
        deptList.find(dept => dept.id === (form.departmentId || user.location?.department?.id))
          ?.name ?? locationLabels.department;
      const cityName =
        cityList.find(city => city.id === (form.cityId || user.location?.city?.id))?.name ??
        locationLabels.city;
      const neighborhoodName =
        neighborhoodList.find(
          neigh => neigh.id === (form.neighborhoodId || user.location?.neighborhood?.id),
        )?.name ?? locationLabels.neighborhood;

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
    setEditVisible,
    setLocationLabels,
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
    [setForm, updateLocationLabels],
  );

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
    if (selectionType === "department") return form.departmentId;
    if (selectionType === "city") return form.cityId;
    if (selectionType === "neighborhood") return form.neighborhoodId;
    return undefined;
  }, [form.cityId, form.departmentId, form.neighborhoodId, selectionType]);

  return {
    selectionType,
    setSelectionType,
    catalogLoading,
    departments,
    cities,
    neighborhoods,
    openEditModal,
    handleSelect,
    handleSelectionOpen,
    selectionItems,
    selectedId,
  };
}
