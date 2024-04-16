// ** Import styles
import "./dashboard.scss";

/**
 * Render the dashboard with the provided error message
 *
 * @param error The error message
 * @returns The error dashboard component
 */
export default function DashboardError({ error }: { error: string }) {
	return (
		<section className="loading">
			<p className="loading-text">Oups ! Une erreur est survenue lors de la récupération de vos données</p>
			<p className="loading-text">Code d'erreur : {error}</p>
		</section>
	);
}
