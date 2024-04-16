// ** Import core packages
import { useEffect, useState } from "react";

// ** Import components
import DashboardLoading from "./DashboardLoading.tsx";
import DashboardDisplay from "./DashboardDisplay.tsx";
import DashboardError from "./DashboardError.tsx";

// ** Import utils / lib
import user1 from "../../data/users/user1.json";

// ** Import styles
import "./dashboard.scss";

// ** Import Types
import { UserInterface } from "../../types/user.interface.ts";

/**
 * Fetch the user data from an API (fake in this case). Handle the different states and display the dashboard accordingly
 * (loading, error, or display the data).
 * @returns The correct dashboard component according to the state
 */
export default function Dashboard() {
	const [user, setUser] = useState<UserInterface>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<null | string>(null);

	// Simulate data fetching from an API with some delay
	useEffect(() => {
		async function simulateApiCall() {
			try {
				setLoading(true);
				await new Promise(resolve => setTimeout(resolve, Math.random() * 0));
				setUser(user1);
			} catch (error) {
				error instanceof Error ? setError(error.message) : setError("Erreur inconnue");
			} finally {
				setLoading(false);
			}
		}

		simulateApiCall();
	}, []);

	if (loading) return <DashboardLoading />;
	if (error) return <DashboardError error={error} />;
	if (user) return <DashboardDisplay user={user} />;
}
