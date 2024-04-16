/**
 * Interface for the object containing all the user data
 */
export interface UserInterface {
	id: number;
	infos: {
		firstName: string;
		lastName: string;
		age: number;
	};
	todayScore: number;
	keyData: {
		calories: number;
		proteins: number;
		carbohydrates: number;
		lipids: number;
	};
	sessions: SessionInterface[];
	performances: PerformanceInterface[];
}

/**
 * Interface for the object containing data about a single session
 */
export interface SessionInterface {
	day: string;
	weight: number;
	burnedCalories: number;
	duration: number;
}

/**
 * Interface for the object containing data about a specific performance
 */
export interface PerformanceInterface {
	category: string;
	score: number;
	goal: number;
}
