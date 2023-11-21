import { useEffect, useState } from "react";
import { fetchUserData } from "../../api/fetchData";
import WeeklyRecap from "../graphs/weeklyRecap";
import Indicator from "../indicator/indicator";
import "./dashboard.scss";
import { UserData_1 } from "../../types/interfaces";

export default function Dashboard() {
	const [userData, setUserData] = useState<UserData_1>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const userData = await fetchUserData();

			if (userData) {
				setUserData(userData);
			} else {
				setError(true);
			}
			setLoading(false);
		}

		fetchData();
	}, []);

	if (loading) {
		return (
			<section className="loading">
				<p className="loading-text">Chargement des données en cours</p>
				<img className="loading-icon" src="/images/loading.png" alt="Chargement" />
			</section>
		);
	}

	if (error) {
		return (
			<section className="loading">
				<p className="loading-text">Une erreur est survenue lors de la récupération des données utilisateur</p>
			</section>
		);
	}

	if (userData) {
		const userName = userData.userInfos.firstName;
		const indicators = [
			{
				name: "Calories",
				value: userData.keyData.calorieCount,
				icon: "calories-icon.svg",
			},
			{
				name: "Protéines",
				value: userData.keyData.proteinCount,
				icon: "protein-icon.svg",
			},
			{
				name: "Glucides",
				value: userData.keyData.carbohydrateCount,
				icon: "carbs-icon.svg",
			},
			{
				name: "Lipides",
				value: userData.keyData.lipidCount,
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
					<WeeklyRecap />
					<div className="dashboard__indicatorContainer">
						{indicators.map(indicator => (
							<Indicator content={indicator} key={crypto.randomUUID()} />
						))}
					</div>
					{/* <Time /> */}
					{/* <Perf /> */}
					{/* <Score /> */}
				</div>
			</section>
		);
	}
}
