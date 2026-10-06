import { createContext, useContext } from 'react';

/** Whether the page this component lives on is the one currently on stage. Looping visuals pause when false. */
export const PageActive = createContext(true);
export const usePageActive = () => useContext(PageActive);
