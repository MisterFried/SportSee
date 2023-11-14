export interface UserData {
	data: {
		id: number;
		userInfos: { firstName: string; lastName: string; age: number };
		todayScore: number;
		score?: number;
		keyData: { calorieCount: number; proteinCount: number; carbohydrateCount: number; lipidCount: number };
	};
}

export interface WeeklyData {
	data: {
		userId: number;
		sessions: Array<{
			day: string;
			kilogram: number;
			calories: number;
		}>;
	};
}

export interface PerformanceData {
	data: {
		userId: number;
		kind: {
			[key: string]: string;
		};
		data: Array<{
			value: number;
			kind: number;
			name: string;
		}>;
	};
}

export interface AverageTimeData {
	data: {
		userId: number;
		sessions: Array<{
			day: number;
			sessionLength: number;
		}>;
	};
}

export interface GlobalUserData {
	userData: UserData;
	weeklyData: WeeklyData;
	averageTime: AverageTimeData;
	performance: PerformanceData;
}
