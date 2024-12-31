import { getContext, setContext } from "svelte";

// Reusable State Stores

// Navigation Drawer ---
type Drawer = { open: boolean };

const drawerKey = Symbol("drawer");

export const getDrawer = () => getContext<Drawer>(drawerKey);
export const setDrawer = (drawer: Drawer) => setContext(drawerKey, drawer);
