import FormNeighborhoodSearch from "./FormNeighborhoodSearch";
import { SelectOption } from "../../../components/Select";
import { RegisterCredentials } from "../types";
import FormDatePicker from "./FormDatePicker";
import { Gender } from "../../../types/user";
import PasswordField from "./PasswordField";
import { useRegisterForm } from "../hooks";
import SubmitButton from "./SubmitButton";
import FormSelect from "./FormSelect";
import { View, TextInput } from "react-native";
import FormField from "./FormField";

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
  onInputFocus?: (inputRef: TextInput | null, extraOffset?: number) => void;
}

const GENDER_OPTIONS: SelectOption[] = [
  { label: "Masculino", value: Gender.MALE },
  { label: "Femenino", value: Gender.FEMALE },
  { label: "No binario", value: Gender.NON_BINARY },
  { label: "Prefiero no decir", value: Gender.UNSPECIFIED },
];

export default function RegisterForm({ onSubmit, onInputFocus }: RegisterFormProps) {
  const { state, actions, errors, loading } = useRegisterForm({ onSubmit });

  return (
    <View className="w-full rounded-2xl">
      <FormField
        label="Nombre"
        value={state.firstName}
        onChangeText={actions.setFirstName}
        placeholder="Escribí tu nombre"
        error={errors.firstName}
        autoCapitalize="words"
        maxLength={12}
        onFocus={onInputFocus}
      />

      <FormField
        label="Apellido"
        value={state.lastName}
        onChangeText={actions.setLastName}
        placeholder="Escribí tu apellido"
        error={errors.lastName}
        autoCapitalize="words"
        onFocus={onInputFocus}
      />

      <FormDatePicker
        label="Fecha de nacimiento"
        value={state.birthDate}
        onValueChange={actions.setBirthDate}
        placeholder="Seleccioná tu fecha de nacimiento"
        error={!!errors.birthDate}
        errorMessage={errors.birthDate}
        maximumDate={(() => {
          const today = new Date();
          return new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
        })()}
        minimumDate={new Date(new Date().getFullYear() - 100, 0, 1)}
        initialDate={new Date(2000, 0, 1)}
      />

      <FormSelect
        label="Género"
        options={GENDER_OPTIONS}
        selectedValue={state.gender}
        onValueChange={actions.setGender}
        placeholder="Seleccioná tu género"
        error={!!errors.gender}
        errorMessage={errors.gender}
      />

      <FormNeighborhoodSearch
        label="Barrio"
        onSelect={actions.handleNeighborhoodSelect}
        error={errors.neighborhood}
        selectedNeighborhoodName={state.neighborhoodName}
      />

      <FormField
        label="Correo electrónico"
        value={state.email}
        onChangeText={actions.setEmail}
        placeholder="diego.forlan@email.com"
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        onFocus={onInputFocus}
      />

      <PasswordField
        label="Contraseña"
        value={state.password}
        onChangeText={actions.setPassword}
        placeholder="Mínimo 8 caracteres"
        error={errors.password}
        onFocus={inputRef => onInputFocus?.(inputRef, 130)}
      />

      <PasswordField
        label="Confirmar contraseña"
        value={state.confirmPassword}
        onChangeText={actions.setConfirmPassword}
        placeholder="Repetí tu contraseña"
        error={errors.confirmPassword}
        confirmPassword={state.password}
        isConfirmField
        onFocus={onInputFocus}
      />

      <SubmitButton label="Registrarse" onPress={actions.handleSubmit} isLoading={loading.form} />
    </View>
  );
}
