import { useEffect, useState } from "react";
import { fetchUserData } from "../../script/fetchData";
import DailyActivity from "../graphs/dailyActivity";
import Perf from "../graphs/perf";
import Score from "../graphs/score";
import Time from "../graphs/time";
import Indicator from "../indicator/indicator";
import "./dashboard.scss";
import { UserDataContext } from "../..";
import { GlobalUserData } from "../../types/interfaces";

export default function Dashboard() {
	const [userData, setUserData] = useState<GlobalUserData>();

	useEffect(() => {
		async function fetchGlobalUserData() {
			const response = await fetchUserData();

			if (response) {
				setUserData(response);
			} else {
				console.log("Error during data fetching");
			}
		}

		fetchGlobalUserData();
	}, []);

	if (userData) {
		const userName = userData.userData.data.userInfos.firstName;
		const indicator = [
			{
				name: "Calories",
				value: userData.userData.data.keyData.calorieCount,
				icon: "calories-icon.svg",
			},
			{
				name: "Protéines",
				value: userData.userData.data.keyData.proteinCount,
				icon: "protein-icon.svg",
			},
			{
				name: "Glucides",
				value: userData.userData.data.keyData.carbohydrateCount,
				icon: "carbs-icon.svg",
			},
			{
				name: "Lipides",
				value: userData.userData.data.keyData.lipidCount,
				icon: "fat-icon.svg",
			},
		];

		return (
			<section className="dashboard">
				<div className="dashboard__heading">
					<h1 className="dashboard__title">
						Bonjour <b>{userName}</b>
					</h1>
					<h2 className="dashboard__message">Félicitation ! Vous avez explosé vos objectifs hier 👏</h2>
				</div>
				<div className="dashboard__grid">
					<UserDataContext.Provider value={userData}>
						<DailyActivity />
						<div className="dashboard__indicatorContainer">
							{indicator.map(indicator => (
								<Indicator content={indicator} key={crypto.randomUUID()} />
							))}
						</div>
						<Time />
						<Perf />
						<Score />
					</UserDataContext.Provider>
				</div>
			</section>
		);
	} else {
		return (
			<section className="loading">
				<p className="loading-text">Chargement des données en cours</p>
				<img className="loading-icon" src="/images/loading.png" alt="Chargement" />
			</section>
		);
	}
}
