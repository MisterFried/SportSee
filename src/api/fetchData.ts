import {
	PerformanceData,
	PerformanceResponse,
	SessionDurationData,
	UserData_1,
	UserData_2,
	WeeklyRecapData,
} from "../types/interfaces";

const userID = 12;

export async function fetchUserData() {
	try {
		const response = await fetch(`http://localhost:3000/user/${userID}`);
		const responseJSON = await response.json();
		const userDataResponse: UserData_1 | UserData_2 = responseJSON.data;

		// Case where todayScore is named score instead
		if ("score" in userDataResponse) {
			const { score, ...userDataWithoutScore } = userDataResponse;
			const userData: UserData_1 = { ...userDataWithoutScore, todayScore: score };
			return userData;
		} else {
			const userData: UserData_1 = userDataResponse;
			return userData;
		}
	} catch (error) {
		console.log(error);
	}
}

export async function fechUserWeeklyRecap() {
	try {
		const response = await fetch(`http://localhost:3000/user/${userID}/activity`);
		const responseJSON = await response.json();
		const weeklyRecap: WeeklyRecapData = responseJSON.data;
		return weeklyRecap;
	} catch (error) {
		console.log(error);
	}
}

export async function fetchUserSessionDuration() {
	try {
		const response = await fetch(`http://localhost:3000/user/${userID}/average-sessions`);
		const responseJSON = await response.json();
		const sessionDuration: SessionDurationData = responseJSON.data;
		return sessionDuration;
	} catch (error) {
		console.log(error);
	}
}

export async function fetchUserPerformance() {
	try {
		const response = await fetch(`http://localhost:3000/user/${userID}/performance`);
		const responseJSON = await response.json();
		const performanceResponse: PerformanceResponse = responseJSON.data;
		// Gather the kind & value in the same array of object before
		const performance: Array<PerformanceData> = performanceResponse.data.map(element => {
			return { ...element, name: performanceResponse.kind[element.kind] };
		});
		return performance;
	} catch (error) {
		console.log(error);
	}
}
