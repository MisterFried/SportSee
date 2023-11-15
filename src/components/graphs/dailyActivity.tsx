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
			CHART_WIDTH = WIDTH - HORIZONTAL_PADDING * 2;
			CHART_HEIGHT = HEIGHT - VERTICAL_PADDING * 2;
		}

		// X axis value and scale
		const firstDay = Number(weight[0].day);
		const lastDay = Number(weight[weight.length - 1].day);
		const xScale = d3.scaleLinear([firstDay, lastDay], [HORIZONTAL_PADDING, HORIZONTAL_PADDING + CHART_WIDTH]);
		const xAxis = d3.axisBottom(xScale).ticks(weight.length);
		svg.append("g")
			.attr("transform", `translate(0,${CHART_HEIGHT + VERTICAL_PADDING})`)
			.call(xAxis)
			.classed("x-axis-scale", true);
		svg.append("line")
			.attr("x1", HORIZONTAL_PADDING - BAR_SPACING / 2 - BAR_WIDTH)
			.attr("x2", CHART_WIDTH + HORIZONTAL_PADDING + BAR_SPACING / 2 + BAR_WIDTH)
			.attr("y1", CHART_HEIGHT + VERTICAL_PADDING)
			.attr("y2", CHART_HEIGHT + VERTICAL_PADDING)
			.attr("stroke-width", "1px")
			.classed("base-line", true);

		// Y axis - Weight
		const maxWeight = Math.max(...weight.map(element => element.weight));
		const maxDisplayedWeight = Math.ceil(maxWeight / 10) * 10 + 10;
		const yScaleWeight = d3.scaleLinear([0, maxDisplayedWeight], [0, CHART_HEIGHT]);

		// Y axis weight legend
		const yWeightAxis = d3
			.axisLeft(d3.scaleLinear([0, maxDisplayedWeight], [VERTICAL_PADDING + CHART_HEIGHT, VERTICAL_PADDING]))
			.ticks(5);
		svg.append("g").call(yWeightAxis).attr("transform", `translate(${WIDTH}, 0)`).classed("y-axis-weight", true);

		// Y axis - Calories
		const maxCalories = Math.max(...calories.map(element => element.calories));
		const maxDisplayedCalories = Math.ceil(maxCalories / 10) * 10 + 10;
		const yScaleCalories = d3.scaleLinear([0, maxDisplayedCalories], [0, CHART_HEIGHT]);

		// Y axis calories legend
		const yCaloriesAxis = d3
			.axisRight(d3.scaleLinear([0, maxDisplayedCalories], [VERTICAL_PADDING + CHART_HEIGHT, VERTICAL_PADDING]))
			.ticks(6);
		svg.append("g").call(yCaloriesAxis).attr("transform", "translate(-10, 0)").classed("y-axis-calories", true);

		// Create the tooltip
		const toolTip = d3
			.select(".dailyActivity__graph")
			.append("div")
			.style("opacity", 0)
			.classed("tooltip-daily", true)
			.style("background-color", "white")
			.style("border", "solid")
			.style("border-width", "1px")
			.style("border-radius", "5px")
			.style("padding", "5px");

		// Function to change the tooltip when hovering / moving / leaving the chart bar
		// Hover
		function mouseHover() {
			toolTip.style("opacity", 1);
		}

		// Move
		function mouseMoveWeight(event: MouseEvent, data: { day: string; weight: number }) {
			toolTip
				.style("top", `${event.y}px`)
				.style("left", `${event.x + 15}px`)
				.html(`Poids : ${data.weight} kg`);
		}

		function mouseMoveCalories(event: MouseEvent, data: { day: string; calories: number }) {
			toolTip
				.style("top", `${event.y}px`)
				.style("left", `${event.x + 15}px`)
				.html(`Calories : ${data.calories} kCal`);
		}

		//Leave
		function mouseLeave() {
			toolTip.style("opacity", 0);
		}

		// Generate the bar for the weight
		const weightBars = svg
			.selectAll(".rect-weight")
			.data(weight)
			.enter()
			.append("rect")
			.classed("rect-weight", true)
			.attr("x", data => xScale(Number(data.day)) + BAR_SPACING / 2)
			.attr("y", data => CHART_HEIGHT + VERTICAL_PADDING - yScaleWeight(data.weight))
			.attr("width", BAR_WIDTH)
			.attr("height", 0)
			.on("mouseover", mouseHover)
			.on("mousemove", (event, data) => mouseMoveWeight(event, data))
			.on("mouseleave", mouseLeave);

		weightBars
			.transition()
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("height", data => yScaleWeight(data.weight));

		// Weight bars rounded top
		svg.selectAll(".rect-weight-top")
			.data(weight)
			.enter()
			.append("circle")
			.classed("rect-weight-top", true)
			.attr("cx", data => xScale(Number(data.day)) + BAR_SPACING / 2 + BAR_WIDTH / 2)
			.attr("cy", data => CHART_HEIGHT + VERTICAL_PADDING - yScaleWeight(data.weight))
			.attr("r", BAR_WIDTH / 2);

		// Generate the bar for the calories
		const caloriesBar = svg
			.selectAll("rect-calories")
			.data(calories)
			.enter()
			.append("rect")
			.classed("rect-calories", true)
			.attr("x", data => xScale(Number(data.day)) - BAR_SPACING / 2 - BAR_WIDTH)
			.attr("y", data => CHART_HEIGHT + VERTICAL_PADDING - yScaleCalories(data.calories))
			.attr("width", BAR_WIDTH)
			.attr("height", 0)
			.on("mouseover", mouseHover)
			.on("mousemove", (event, data) => mouseMoveCalories(event, data))
			.on("mouseleave", mouseLeave);

		caloriesBar
			.transition()
			.duration(1000)
			.attr("height", data => yScaleCalories(data.calories))
			.ease(d3.easePoly.exponent(3));

		// Calories bars rounded top
		svg.selectAll(".rect-calories-top")
			.data(calories)
			.enter()
			.append("circle")
			.classed("rect-calories-top", true)
			.attr("cx", data => xScale(Number(data.day)) - BAR_WIDTH)
			.attr("cy", data => CHART_HEIGHT + VERTICAL_PADDING - yScaleCalories(data.calories))
			.attr("r", BAR_WIDTH / 2);
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
