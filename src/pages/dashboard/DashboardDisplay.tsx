// ** Import components
import WeeklyRecap from "../../components/weeklyRecap/WeeklyRecap";
import Indicator from "../../components/indicator/Indicator";
import Score from "../../components/score/Score";
import Performance from "../../components/performance/Performance";
import SessionDuration from "../../components/sessionDuration/SessionDuration";

// ** Import styles
import "./dashboard.scss";

// ** Import Types
import { UserInterface } from "../../types/user.interface";

/**
 * Display the dashboard with all the different charts and data.
 *
 * @param user The user object containing all the user data
 * @returns The dashboard component
 */
export default function DashboardDisplay({ user }: { user: UserInterface }) {
	const { firstName, lastName } = user.infos;
	const { todayScore, keyData, performances, sessions } = user;

	let message = "Aucune donnée pour aujourd'hui";
	if (todayScore <= 25)
		message = "Vous avez pris un excellent départ ! Poursuivez vos efforts pour atteindre vos objectifs.";
	else if (todayScore <= 50) message = "A mi-chemin ! Vos progrès sont louables, continuez à faire du bon travail.";
	else if (todayScore <= 75)
		message =
			"Vous vous en sortez très bien ! Restez concentré et continuez à vous efforcer d'atteindre votre objectif.";
	else if (todayScore <= 100)
		message =
			"Félicitations ! Vous avez atteint votre objectif. Votre travail acharné a porté ses fruits, continuez sur votre lancée.";

	return (
		<section className="dashboard">
			<div className="dashboard__heading">
				<h1 className="dashboard__title">
					Bonjour{" "}
					<b>
						{firstName} {lastName}
					</b>
				</h1>
				<h2 className="dashboard__message">{message}</h2>
			</div>
			<div className="dashboard__content">
				<div className="dashboard__charts">
					<WeeklyRecap sessions={sessions} />
					<SessionDuration data={sessions} />
					<Performance data={performances} />
					<Score value={todayScore} />
				</div>
				<div className="dashboard__indicators">
					{keyData &&
						Object.entries(keyData).map(([key, value]) => (
							<Indicator key={key} name={key} value={value} icon={key} />
						))}
				</div>
			</div>
		</section>
	);
}
