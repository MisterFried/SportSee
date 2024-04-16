// ** Import core packages
import ReactDOM from "react-dom/client";

// ** Import sub pages / sections
import Header from "./components/header/Header";
import Sidebar from "./components/sidebar/sidebar";
import Dashboard from "./pages/dashboard/Dashboard";

// ** Import styles
import "./styles/styles.scss";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<>
		<Header />
		<Sidebar />
		<Dashboard />
	</>
);
