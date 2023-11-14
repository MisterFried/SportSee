import * as d3 from "d3";
import "./dailyActivity.scss";
import { useContext, useEffect, useRef } from "react";
import { UserDataContext } from "../..";

export default function DailyActivity() {
	const weight: Array<{ day: string; weight: number }> = [];
	const calories: Array<{ day: string; calories: number }> = [];

	const userData = useContext(UserDataContext);
	if (userData) {
		userData.weeklyData.data.sessions.forEach(session => {
			weight.push({
				day: session.day.slice(-2),
				weight: session.kilogram,
			});
			calories.push({
				day: session.day.slice(-2),
				calories: session.calories,
			});
		});
	}

	// Ref to the chart container (div)
	const ref = useRef<HTMLDivElement | null>(null);

	// Generate the chart
	useEffect(() => {
		// Constant
		const BAR_WIDTH = 10;
		const BAR_SPACING = 10;
		const VERTICAL_PADDING = 20;
		const HORIZONTAL_PADDING = 50;
		const svg = d3.select(".dailyActivity__graph svg");

		// width / height of the chart container
		// width & height of the chart
		let WIDTH = 0;
		let HEIGHT = 0;
		let CHART_WIDTH = 0;
		let CHART_HEIGHT = 0;
		if (ref.current) {
			WIDTH = ref.current.clientWidth;
			HEIGHT = ref.current.clientHeight;
			CHART_WIDTH = WIDTH - HORIZONTAL_PADDING;
			CHART_HEIGHT = HEIGHT - VERTICAL_PADDING;
		}

		// X axis value and scale
		const firstDay = Number(weight[0].day);
		const lastDay = Number(weight[weight.length - 1].day);
		const xScale = d3.scaleLinear([firstDay, lastDay], [HORIZONTAL_PADDING, CHART_WIDTH]);
		const xAxis = d3.axisBottom(xScale).ticks(weight.length);
		svg.append("g").attr("transform", `translate(0,${CHART_HEIGHT})`).call(xAxis).classed("x-axis-scale", true);

		// Y axis - Weight
		let maxDisplayWeightValue = 0;
		weight.forEach(el => (maxDisplayWeightValue += el.weight));
		maxDisplayWeightValue = Math.ceil((maxDisplayWeightValue / lastDay) * 2); // max displayed vallue = 2 * average
		const yScaleWeight = d3.scaleLinear([0, maxDisplayWeightValue], [0 + VERTICAL_PADDING, CHART_HEIGHT]);

		// Y axis weight legend
		const yWeightAxis = d3
			.axisLeft(d3.scaleLinear([0, maxDisplayWeightValue], [CHART_HEIGHT, 0 + VERTICAL_PADDING]))
			.ticks(5);
		svg.append("g").call(yWeightAxis).attr("transform", `translate(${WIDTH}, 0)`).classed("y-axis-weight", true);

		// Y axis - Calories
		let maxDisplayCaloriesValue = 0;
		calories.forEach(el => (maxDisplayCaloriesValue += el.calories));
		maxDisplayCaloriesValue = Math.ceil((maxDisplayCaloriesValue / lastDay) * 2); // max displayed value = 2 * average
		const yScaleCalories = d3.scaleLinear([0, maxDisplayCaloriesValue], [0, CHART_HEIGHT]);

		// Y axis calories legend
		const yCaloriesAxis = d3
			.axisRight(d3.scaleLinear([0, maxDisplayCaloriesValue], [CHART_HEIGHT, 0 + VERTICAL_PADDING]))
			.ticks(6);
		svg.append("g").call(yCaloriesAxis).attr("transform", "translate(-10, 0)").classed("y-axis-calories", true);

		// Generate the bar for the weight
		svg.selectAll(".rect-weight")
			.data(weight)
			.enter()
			.append("rect")
			.classed("rect-weight", true)
			.attr("x", data => xScale(Number(data.day)) + BAR_SPACING / 2)
			.attr("y", data => CHART_HEIGHT - yScaleWeight(data.weight))
			.attr("width", BAR_WIDTH)
			.attr("height", 0)
			.transition()
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("height", data => yScaleWeight(data.weight));

		// Generate the bar for the calories
		svg.selectAll("rect-calories")
			.data(calories)
			.enter()
			.append("rect")
			.classed("rect-calories", true)
			.attr("x", data => xScale(Number(data.day)) - BAR_SPACING / 2 - BAR_WIDTH)
			.attr("y", data => CHART_HEIGHT - yScaleCalories(data.calories))
			.attr("width", BAR_WIDTH)
			.attr("height", 0)
			.transition()
			.duration(1000)
			.attr("height", data => yScaleCalories(data.calories))
			.ease(d3.easePoly.exponent(3));
	}, []);

	return (
		<div className="dailyActivity">
			<h3 className="dailyActivity__title">Activité quotidienne</h3>
			<div className="dailyActivity__legend">
				<span>Poids (kg)</span>
				<span>Calories brûlées (kCal)</span>
			</div>
			<div ref={ref} className="dailyActivity__graph">
				<svg></svg>
			</div>
		</div>
	);
}
