import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ClassType } from "@/@types/ClassType";
import { useToast } from "@/contexts/Toast/ToastContext";

const useAsyncStorageClass = (key: any, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  const [onError, setOnError] = useState(false);
  const { addToast } = useToast();

  const saveValue = useCallback(
    async (value: any) => {
      try {
        const ClassArrayString = await AsyncStorage.getItem(key);
        if (!ClassArrayString) {
          console.log("entrou para criar o array vazio");
          const newArray: ClassType[] = [];
          newArray.push({ title: value });
          const jsonValue = JSON.stringify(newArray);
          await AsyncStorage.setItem(key, jsonValue);
          setStoredValue(jsonValue);
          return true;
        }
        const ConvertToArray: ClassType[] = JSON.parse(ClassArrayString);
        ConvertToArray.map((item: ClassType) => {
          if (item.title == value) {
            setOnError(true);
            setTimeout(() => setOnError(false), 3000);
            addToast({ message: "Essa turma ja existe!", type: "error" });
            throw new Error("item ja existe");
          }
        });
        ConvertToArray.push({ title: value });
        const jsonValue = JSON.stringify(ConvertToArray);
        await AsyncStorage.setItem(key, jsonValue);
        setStoredValue(jsonValue);
        addToast({ message: "Turma criada com sucesso", type: "success" });
        console.log(`Data saved to AsyncStorage with key: ${key}`);
      } catch (error) {
        console.error(
          `Error saving data to AsyncStorage with key: ${key}`,
          error,
        );
      }
    },
    [key],
  );

  const loadValue = useCallback(async () => {
    try {
      console.log("foi chamado loadValue");
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue != null) {
        const parsedValue = JSON.parse(jsonValue);
        setStoredValue(parsedValue);
        console.log(`Data loaded from AsyncStorage with key: ${key}`);
      }
    } catch (error) {
      console.error(
        `Error loading data from AsyncStorage with key: ${key}`,
        error,
      );
    }
  }, [key]);

  const removeOneValue = useCallback(
    async (value: any) => {
      try {
        const ClassArrayString = await AsyncStorage.getItem(key);
        if (!ClassArrayString) {
          setOnError(!onError);
          setTimeout(() => setOnError(!onError), 3000);
          throw new Error("erros ao buscar dados");
        }
        const ConvertToArray: ClassType[] = JSON.parse(ClassArrayString);
        ConvertToArray.map((item: ClassType) => {
          if (item.title == value) {
            setOnError(!onError);
            setTimeout(() => setOnError(!onError), 3000);
            throw new Error("item ja existe");
          }
        });
        console.log(`Data removed from AsyncStorage with key: ${key}`);
      } catch (error) {
        console.error(
          `Error removing data from AsyncStorage with key: ${key}`,
          error,
        );
      }
    },
    [key],
  );

  const removeAllValues = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setStoredValue(null);
      console.log(`Data removed from AsyncStorage with key: ${key}`);
    } catch (error) {
      console.error(
        `Error removing data from AsyncStorage with key: ${key}`,
        error,
      );
    }
  }, [key]);

  useEffect(() => {
    loadValue();
  }, [loadValue]);

  return {
    storedValue,
    saveValue,
    loadValue,
    removeAllValues,
    removeOneValue,
    onError,
  };
};

export default useAsyncStorageClass;