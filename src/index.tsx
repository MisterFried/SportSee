import ReactDOM from "react-dom/client";
import "./styles/styles.scss";
import Header from "./components/header/header";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./components/dashboard/dashboard";
import { StrictMode, createContext } from "react";
import { GlobalUserData } from "./types/interfaces";

export const UserDataContext = createContext<undefined | GlobalUserData>(undefined);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Header />
		<Sidebar />
		<Dashboard />
	</StrictMode>
);
