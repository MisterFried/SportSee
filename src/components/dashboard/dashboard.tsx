import DailyActivity from "../graphs/dailyActivity";
import Perf from "../graphs/perf";
import Score from "../graphs/score";
import Time from "../graphs/time";
import Indicator from "../indicator/indicator";
import "./dashboard.scss";

export default function Dashboard() {
	const indicator = [
		{
			name: "Calories",
			value: "1,930 kCal",
			icon: "calories-icon.svg",
		},
		{
			name: "Protéines",
			value: "155g",
			icon: "protein-icon.svg",
		},
		{
			name: "Glucides",
			value: "290g",
			icon: "carbs-icon.svg",
		},
		{
			name: "Lipides",
			value: "50g",
			icon: "fat-icon.svg",
		},
	];

	return (
		<section className="dashboard">
			<div className="dashboard__heading">
				<h1 className="dashboard__title">
					Bonjour <b>Thomas</b>
				</h1>
				<h2 className="dashboard__message">Félicitation ! Vous avez explosé vos objectifs hier 👏</h2>
			</div>
			<div className="dashboard__grid">
				<DailyActivity />
				<div className="dashboard__indicatorContainer">
					{indicator.map(indicator => (
						<Indicator content={indicator} key={crypto.randomUUID()} />
					))}
				</div>
				<Time />
				<Perf />
				<Score />
			</div>
		</section>
	);
}
