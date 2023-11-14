import { AverageTimeData, PerformanceData, UserData, WeeklyData } from "../types/interfaces";

export async function fetchUserData() {
	try {
		const userID = 18;

		const userDataResponse = await fetch(`http://localhost:3000/user/${userID}`);
		const userDataJSON: UserData = await userDataResponse.json();
		// Case where todayScore is named score instead
		if (userDataJSON.data.score) {
			userDataJSON.data.todayScore = userDataJSON.data.score;
		}

		const weeklyRecapResponse = await fetch(`http://localhost:3000/user/${userID}/activity`);
		const weeklyRecapJSON: WeeklyData = await weeklyRecapResponse.json();

		const averageTimeResponse = await fetch(`http://localhost:3000/user/${userID}/average-sessions`);
		const averageTimeJSON: AverageTimeData = await averageTimeResponse.json();

		const perfResponse = await fetch(`http://localhost:3000/user/${userID}/performance`);
		const perfJSON: PerformanceData = await perfResponse.json();
		perfJSON.data.data.forEach(element => {
			element.name = perfJSON.data.kind[element.kind];
		});

		const globalUserData = {
			userData: userDataJSON,
			weeklyData: weeklyRecapJSON,
			averageTime: averageTimeJSON,
			performance: perfJSON,
		};

		return globalUserData;
	} catch (error) {
		console.log("Error during data fetching");
	}
}
