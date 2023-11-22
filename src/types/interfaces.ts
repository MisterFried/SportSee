export interface UserData {
	id: number;
	userInfos: { firstName: string; lastName: string; age: number };
	keyData: { calorieCount: number; proteinCount: number; carbohydrateCount: number; lipidCount: number };
}

export interface UserData_1 extends UserData {
	todayScore: number;
}

export interface UserData_2 extends UserData {
	score: number;
}

export interface WeeklyRecapData {
	userId: number;
	sessions: Array<{
		day: string;
		kilogram: number;
		calories: number;
	}>;
}

export interface PerformanceResponse {
	userId: number;
	kind: {
		[key: string]: string;
	};
	data: Array<{
		value: number;
		kind: number;
	}>;
}

export interface PerformanceData {
	value: number;
	kind: number;
	name: string
}

export interface SessionDurationData {
	userId: number;
	sessions: Array<{
		day: number;
		sessionLength: number;
	}>;
}
