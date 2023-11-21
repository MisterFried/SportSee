import * as d3 from "d3";
import "./weeklyRecap.scss";
import { useEffect, useRef, useState } from "react";
import { WeeklyData } from "../../types/interfaces";
import { fechUserWeeklyRecap } from "../../api/fetchData";

export default function WeeklyRecap() {
	// State initialization
	const [weeklyRecap, setWeeklyRecap] = useState<WeeklyData>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const ref = useRef<HTMLDivElement>(null); // div containing the chart ref

	// Arrays containing the weight & calories datas
	const weight: Array<{ day: string; weight: number }> = [];
	const calories: Array<{ day: string; calories: number }> = [];

	// Fetching data after component mount
	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const weeklyRecap = await fechUserWeeklyRecap();

			if (weeklyRecap) {
				setWeeklyRecap(weeklyRecap);
			} else {
				setError(true);
			}
			setLoading(false);
		}

		fetchData();
	}, []);

	// Draw the chart once the component is rendered and the data fetched
	useEffect(() => {
		// Prevent the inital trigger when component mount but data hasn't been fetched yet
		if (weeklyRecap) {
			// Gather the weight & calories data in arrays to be used later for the chart
			weeklyRecap.sessions.forEach(session => {
				// Only keep the last 2 digit of the date (YYYY-MM-DD)
				weight.push({
					day: session.day.slice(-2),
					weight: session.kilogram,
				});
				calories.push({
					day: session.day.slice(-2),
					calories: session.calories,
				});
			});

			// Constant
			const BAR_WIDTH = 10;
			const BAR_SPACING = 10;
			const VERTICAL_PADDING = 20;
			const HORIZONTAL_PADDING = 70;
			const svg = d3.select(".dailyActivity__graph svg");

			// Width / height of the chart + its container
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

			// X axis min/max, scale function and legend
			const firstDay = Number(weight[0].day);
			const lastDay = Number(weight[weight.length - 1].day);
			const xScale = d3.scaleLinear([firstDay, lastDay], [HORIZONTAL_PADDING, HORIZONTAL_PADDING + CHART_WIDTH]);
			const xAxis = d3.axisBottom(xScale).ticks(weight.length);
			svg.append("g") // Legend
				.attr("transform", `translate(0,${CHART_HEIGHT + VERTICAL_PADDING})`)
				.call(xAxis)
				.classed("x-axis-scale", true);
			svg.append("line") // Horizontal line
				.attr("x1", HORIZONTAL_PADDING - BAR_SPACING / 2 - BAR_WIDTH)
				.attr("x2", CHART_WIDTH + HORIZONTAL_PADDING + BAR_SPACING / 2 + BAR_WIDTH)
				.attr("y1", CHART_HEIGHT + VERTICAL_PADDING)
				.attr("y2", CHART_HEIGHT + VERTICAL_PADDING)
				.attr("stroke-width", "1px")
				.classed("base-line", true);

			// Y axis (Weight) max, scale function and legend
			const maxWeight = Math.max(...weight.map(element => element.weight));
			const maxDisplayedWeight = Math.ceil(maxWeight / 10) * 10 + 10;
			const yScaleWeight = d3.scaleLinear([0, maxDisplayedWeight], [0, CHART_HEIGHT]);
			const yWeightAxis = d3
				.axisLeft(d3.scaleLinear([0, maxDisplayedWeight], [VERTICAL_PADDING + CHART_HEIGHT, VERTICAL_PADDING]))
				.ticks(5);
			svg.append("g")
				.call(yWeightAxis)
				.attr("transform", `translate(${WIDTH}, 0)`)
				.classed("y-axis-weight", true);

			// Y axis (Calories) max, scale function and legend
			const maxCalories = Math.max(...calories.map(element => element.calories));
			const maxDisplayedCalories = Math.ceil(maxCalories / 10) * 10 + 10;
			const yScaleCalories = d3.scaleLinear([0, maxDisplayedCalories], [0, CHART_HEIGHT]);
			const yCaloriesAxis = d3
				.axisRight(
					d3.scaleLinear([0, maxDisplayedCalories], [VERTICAL_PADDING + CHART_HEIGHT, VERTICAL_PADDING])
				)
				.ticks(6);
			svg.append("g").call(yCaloriesAxis).classed("y-axis-calories", true);

			// Create the tooltip
			const toolTip = d3
				.select(".dailyActivity__graph")
				.append("div")
				.style("opacity", 0)
				.classed("tooltip-weeklyRecap", true);

			// Functions to handle tooltip behavior
			// Hover
			const mouseHover = () => toolTip.style("opacity", 1);

			// Move
			const mouseMoveWeight = (event: MouseEvent, data: { day: string; weight: number }) => {
				toolTip
					.style("top", `${event.y}px`)
					.style("left", `${event.x + 15}px`)
					.html(`Poids : ${data.weight} kg`);
			};
			const mouseMoveCalories = (event: MouseEvent, data: { day: string; calories: number }) => {
				toolTip
					.style("top", `${event.y}px`)
					.style("left", `${event.x + 15}px`)
					.html(`Calories : ${data.calories} kCal`);
			};

			// Leave
			const mouseLeave = () => toolTip.style("opacity", 0);

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

			weightBars // Animate the height of the bar from 0 to their value
				.transition()
				.duration(1000)
				.ease(d3.easePoly.exponent(3))
				.attr("height", data => yScaleWeight(data.weight));

			// Add a circle on top of the bar for a rounded effect
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

			caloriesBar // Animate the height of the bar from 0 to their value
				.transition()
				.duration(1000)
				.attr("height", data => yScaleCalories(data.calories))
				.ease(d3.easePoly.exponent(3));

			// Add a circle on top of the bar for a rounded effect
			svg.selectAll(".rect-calories-top")
				.data(calories)
				.enter()
				.append("circle")
				.classed("rect-calories-top", true)
				.attr("cx", data => xScale(Number(data.day)) - BAR_WIDTH)
				.attr("cy", data => CHART_HEIGHT + VERTICAL_PADDING - yScaleCalories(data.calories))
				.attr("r", BAR_WIDTH / 2);
		}
	}, [weeklyRecap]);

	// Display a loading message during the data fetching
	if (loading) {
		return <div className="dailyActivity">Chargement en cours</div>;
	}

	// Display error message if the data fetching failed
	if (error) {
		return <div className="dailyActivity">Erreur</div>;
	}

	// Display the chart once data are fetched and no error occured
	if (weeklyRecap) {
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
}
