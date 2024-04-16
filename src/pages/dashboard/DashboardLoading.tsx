// ** Import styles
import "./dashboard.scss";

/**
 * Render the loading dashboard
 *
 * @returns The loading dashboard component
 */
export default function DashboardLoading() {
	return (
		<section className="loading">
			<p className="loading-text">Chargement des données en cours...</p>
			<img className="loading-icon" src="/images/loading.png" alt="Chargement en cours" />
		</section>
	);
}
