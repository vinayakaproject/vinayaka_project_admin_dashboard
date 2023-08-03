import { createContext, useContext } from "react";

export const MyGlobalContext = createContext({
  user: null,
  setUser: () => {},
});

export const useGlobalContext = () => useContext(MyGlobalContext);