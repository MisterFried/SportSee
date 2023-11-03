import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/styles.scss";
import Header from "./components/header/header";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./components/dashboard/dashboard";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Header />
		<Sidebar />
		<Dashboard />
	</React.StrictMode>
);
