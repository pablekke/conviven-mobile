import * as SecureStore from "expo-secure-store";

export const saveSecureItem = async (key: string, value: string) => {
  await SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
};

export const getSecureItem = async (key: string) => {
  return SecureStore.getItemAsync(key);
};

export const deleteSecureItem = async (key: string) => {
  await SecureStore.deleteItemAsync(key);
};
