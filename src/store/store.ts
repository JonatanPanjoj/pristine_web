import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import customStorage from "./customStorage"; // Importa tu almacenamiento personalizado
import userReducer from "./userSlice";
import { combineReducers } from "redux";

// Configuración de persist con almacenamiento personalizado
const persistConfig = {
  key: "root",
  storage: customStorage, // Usa el almacenamiento personalizado con expiración
};

// Combina los reducers
const rootReducer = combineReducers({
  user: userReducer,
});

// Reducer persistente
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configura el store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/PURGE',
          'persist/FLUSH',
          'persist/PAUSE',
        ],
      },
    }),
});

// Configura el persistor
export const persistor = persistStore(store);

// Tipos personalizados de TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
