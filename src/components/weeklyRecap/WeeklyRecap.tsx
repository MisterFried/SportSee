// ** Import core packages
import { useEffect, useRef, useState } from "react";

// ** Import third party
import * as d3 from "d3";

// ** Import styles
import "./weeklyRecap.scss";

// ** Import Types
import { SessionInterface } from "../../types/user.interface";

/**
 * Render the weekly recap chart based on the provided data
 *
 * @param weeklyRecap The weekly recap data
 * @returns The weekly recap component
 */
export default function WeeklyRecap({ sessions }: { sessions: SessionInterface[] }) {
	const ref = useRef<HTMLDivElement>(null); // div containing the chart ref
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);
	const [viewportWidth, setViewportWidth] = useState(0);

	// Initially setting the width and height of the container
	useEffect(() => {
		if (ref.current) {
			setWidth(ref.current.clientWidth);
			setHeight(ref.current.clientHeight);
		}
	}, []);

	// Update the width and height of the container on resize
	window.addEventListener("resize", () => {
		if (ref.current) {
			setWidth(ref.current.clientWidth);
			setHeight(ref.current.clientHeight);
		}
		setViewportWidth(window.innerWidth);
	});

	// Draw the chart
	useEffect(() => {
		if (width === 0 || height === 0) return;

		// ******** SETUP ******** //
		// Constant
		let BAR_WIDTH = 20;
		let BAR_SPACING = 10;
		const TOP_PADDING = 10;
		const BOTTOM_PADDING = 30;
		const LEFT_PADDING = 50;
		const RIGHT_PADDING = 50;
		const VERTICAL_PADDING = TOP_PADDING + BOTTOM_PADDING;
		const HORIZONTAL_PADDING = LEFT_PADDING + RIGHT_PADDING;
		const svg = d3.select(".weeklyRecap__chart svg");
		if (viewportWidth <= 800) {
			BAR_WIDTH = 10;
			BAR_SPACING = 5;
		}
		svg.selectAll("*").remove(); // Clear the previous chart if existing

		// Width and height the chart
		const CHART_WIDTH = width - HORIZONTAL_PADDING;
		const CHART_HEIGHT = height - VERTICAL_PADDING;

		// ********** TOOLTIP ********** //
		// Create the tooltip
		const toolTip = d3
			.select(".weeklyRecap__chart")
			.append("div")
			.style("opacity", 0)
			.classed("tooltip-weeklyRecap", true);

		/**
		 * Show the tooltip
		 */
		const mouseHover = () => toolTip.style("opacity", 1).style("user-select", "all").style("z-index", "10");

		/**
		 * Update the position of the tooltip (weight)
		 *
		 * @param event The mouse event
		 * @param data The corresponding session data
		 */
		const mouseMoveWeight = (event: MouseEvent, data: SessionInterface) => {
			toolTip
				.style("top", `${event.y}px`)
				.style("left", `${event.x + 15}px`)
				.html(`Poids : ${data.weight} kg`);
		};

		/**
		 * Update the position of the tooltip (calories)
		 *
		 * @param event The mouse event
		 * @param data The corresponding session data
		 */
		const mouseMoveCalories = (event: MouseEvent, data: SessionInterface) => {
			toolTip
				.style("top", `${event.y}px`)
				.style("left", `${event.x + 15}px`)
				.html(`Calories : ${data.burnedCalories} kCal`);
		};

		/**
		 *  Hide the tooltip
		 */
		const mouseLeave = () => toolTip.style("opacity", 0).style("user-select", "none").style("z-index", "-1");

		// ********** X AXIS ********** //
		// X axis min/max, scale function and legend
		const firstDay = Number(sessions[0].day.slice(8, 10));
		const lastDay = Number(sessions[sessions.length - 1].day.slice(8, 10));
		const xScale = d3.scaleLinear(
			[firstDay, lastDay],
			[LEFT_PADDING + BAR_WIDTH + BAR_SPACING / 2, LEFT_PADDING + CHART_WIDTH - BAR_WIDTH - BAR_SPACING / 2]
		);
		const xAxis = d3.axisBottom(xScale).ticks(sessions.length);
		svg.append("g") // Legend
			.call(xAxis)
			.attr("transform", `translate(0,${CHART_HEIGHT + TOP_PADDING})`)
			.selectAll("text")
			.attr("fill", "var(--clr-text)")
			.text((_, index) => sessions[index].day.slice(8, 10))
			.attr("font-size", "1rem");
		svg.append("line") // Horizontal line
			.attr("x1", xScale(firstDay) - BAR_WIDTH - BAR_SPACING / 2)
			.attr("x2", xScale(lastDay) + BAR_WIDTH + BAR_SPACING / 2)
			.attr("y1", CHART_HEIGHT + TOP_PADDING)
			.attr("y2", CHART_HEIGHT + TOP_PADDING)
			.attr("stroke-width", "1")
			.attr("stroke", "black");

		// ********** LEFT Y AXIS (WEIGHT) ********** //
		// Y axis (weight) max, scale function and legend (on the left)
		const maxWeight = Math.max(...sessions.map(session => session.weight));
		const maxDisplayedWeight = Math.ceil(maxWeight / 10) * 10 + 10; // Round to the nearest upper 10
		const yScaleWeight = d3.scaleLinear([0, maxDisplayedWeight], [TOP_PADDING + CHART_HEIGHT, TOP_PADDING]);
		const yWeightAxis = d3.axisLeft(yScaleWeight).ticks(maxDisplayedWeight / 20);
		svg.append("g")
			.call(yWeightAxis)
			.attr("transform", `translate(${LEFT_PADDING - 2}, 0)`)
			.selectAll("text")
			.attr("font-size", "1rem")
			.attr("fill", "var(--clr-text)");

		// Generate the bar for the weight, handle tooltip interactions and animate the bar
		svg.selectAll(".weight-bar")
			.data(sessions)
			.enter()
			.append("rect")
			.attr("x", session => xScale(Number(session.day.slice(8, 10))) - BAR_WIDTH - BAR_SPACING / 2)
			.attr("y", TOP_PADDING + CHART_HEIGHT)
			.attr("width", BAR_WIDTH)
			.attr("height", 0)
			.attr("fill", "var(--clr-primary-300)")
			.on("mouseover", mouseHover) // Tooltip
			.on("mousemove", (event, data) => mouseMoveWeight(event, data))
			.on("mouseleave", mouseLeave)
			.transition()
			.duration((_, index) => 500 + index * 200)
			.ease(d3.easePoly.exponent(3))
			.attr("y", session => yScaleWeight(session.weight))
			.attr("height", session => CHART_HEIGHT + TOP_PADDING - yScaleWeight(session.weight));

		// ********** RIGHT Y AXIS (CALORIES) ********** //
		// Y axis (calories) max, scale function and legend (on the right)
		const maxCalories = Math.max(...sessions.map(session => session.burnedCalories));
		const maxDisplayedCalories = Math.ceil(maxCalories / 10) * 10 + 10;
		const yScaleCalories = d3.scaleLinear([0, maxDisplayedCalories], [TOP_PADDING + CHART_HEIGHT, TOP_PADDING]);
		const yCaloriesAxis = d3.axisRight(yScaleCalories).ticks(maxDisplayedCalories / 50);
		svg.append("g")
			.call(yCaloriesAxis)
			.attr("transform", `translate(${LEFT_PADDING + CHART_WIDTH + 1}, 0)`)
			.selectAll("text")
			.attr("font-size", "1rem")
			.attr("fill", "var(--clr-text)");

		// Generate the bar for the calories, handle tooltip interactions and animate the bar
		svg.selectAll(".calories-bar")
			.data(sessions)
			.enter()
			.append("rect")
			.attr("x", session => xScale(Number(session.day.slice(8, 10))) + BAR_SPACING / 2)
			.attr("y", TOP_PADDING + CHART_HEIGHT)
			.attr("width", BAR_WIDTH)
			.attr("height", 0)
			.attr("fill", "var(--clr-primary-500)")
			.on("mouseover", mouseHover)
			.on("mousemove", (event, data) => mouseMoveCalories(event, data))
			.on("mouseleave", mouseLeave)
			.transition()
			.duration((_, index) => 500 + index * 200)
			.ease(d3.easePoly.exponent(3))
			.attr("y", session => yScaleCalories(session.burnedCalories))
			.attr("height", session => CHART_HEIGHT + TOP_PADDING - yScaleCalories(session.burnedCalories));
	}, [width, height]);

	return (
		<div className="weeklyRecap">
			<h3 className="weeklyRecap__title">Activité quotidienne</h3>
			<div className="weeklyRecap__legend">
				<span>Poids (kg)</span>
				<span>Calories brûlées (kCal)</span>
			</div>
			<div ref={ref} className="weeklyRecap__chart">
				<svg></svg>
			</div>
		</div>
	);
}
