// ** Import core packages
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// ** Import styles
import "./performance.scss";

// ** Import Types
import { PerformanceInterface } from "../../types/user.interface";

// ** Types
interface RadialAreaInterface {
	innerRadius: number;
	outerRadius: number;
	startAngle: number;
	endAngle: number;
}

/**
 * Renders a performance radial area chart based on the provided data.
 *
 * @param data - Array of performance data to display on the chart
 * @return The performance chart component
 */
export default function Performance({ data }: { data: PerformanceInterface[] }) {
	const ref = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);
	const [height, setHeight] = useState(0);

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
	});

	useEffect(() => {
		if (width === 0 || height === 0) return;

		// ********** SETUP ********** //
		// Constant
		const PADDING = 70;
		const svg = d3.select(".performance svg");

		svg.selectAll("*").remove(); // Clear the previous chart if existing

		// Radius of the chart (smaller value between width & height)
		const CHART_RADIUS = width <= height ? (width - 2 * PADDING) / 2 : (height - 2 * PADDING) / 2;

		/**
		 * Polygon generator function. Given a specific object with innerRadius, outerRadius, startAngle and endAngle,
		 * This function will return the coordinates of the polygon.
		 * @param data - The data object with innerRadius, outerRadius, startAngle and endAngle
		 * @returns The coordinates of the polygon
		 */
		const areaGenerator = d3
			.areaRadial<RadialAreaInterface>()
			.curve(d3.curveLinearClosed)
			.startAngle(data => data.startAngle)
			.endAngle(data => data.endAngle)
			.innerRadius(data => data.innerRadius)
			.outerRadius(data => data.outerRadius);

		// ********** TICKS / AXIS ********** //
		// Define the steps for the ticks / axis
		const steps = [CHART_RADIUS * 0.25, CHART_RADIUS * 0.5, CHART_RADIUS * 0.75, CHART_RADIUS];
		// Array containing an array for each step defined above (one step = one polygon)
		const radialAreasData: RadialAreaInterface[][] = steps.map(value => {
			const radialAreaData: RadialAreaInterface[] = [];

			// Define each side of the polygon based on the number of category
			// Inner radius at 0 to create a full polygon (not hollow)
			for (let i = 0; i < data.length; i++) {
				radialAreaData.push({
					innerRadius: 0,
					outerRadius: value,
					startAngle: (Math.PI * 2 * i) / data.length,
					endAngle: (Math.PI * 2 * (i + 1)) / data.length,
				});
			}

			return radialAreaData;
		});

		// Draw all the areas
		svg.selectAll(".radial-area")
			.data(radialAreasData)
			.enter()
			.append("path")
			.attr("d", areaGenerator)
			.attr("fill", "#fafafa00")
			.attr("stroke", "#fafafa50")
			.attr("stroke-width", 1)
			.attr("transform", `translate(${width / 2}, ${height / 2})`)
			.transition()
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("fill", "#fafafa15");

		// ********** SCORE / GOAL ********** //
		// Array containing the data for the initial polygon (no polygon),
		//This is used for the transition to make the polygon appear smoothly
		const initialRadialAreasData: RadialAreaInterface[] = data.map((_, index) => {
			return {
				innerRadius: 0,
				outerRadius: 0,
				startAngle: (Math.PI * 2 * index) / data.length,
				endAngle: (Math.PI * 2 * (index + 1)) / data.length,
			};
		});
		const initialRadialAreasPath = areaGenerator(initialRadialAreasData);

		// Array containing the data for goal polygon
		const goalsData: RadialAreaInterface[] = data.map((perf, index) => {
			return {
				innerRadius: 0,
				outerRadius: (perf.goal / 100) * CHART_RADIUS,
				startAngle: (Math.PI * 2 * index) / data.length,
				endAngle: (Math.PI * 2 * (index + 1)) / data.length,
			};
		});

		// Array containing the data for score polygon
		const scoresData: RadialAreaInterface[] = data.map((perf, index) => {
			return {
				innerRadius: 0,
				outerRadius: (perf.score / 100) * CHART_RADIUS,
				startAngle: (Math.PI * 2 * index) / data.length,
				endAngle: (Math.PI * 2 * (index + 1)) / data.length,
			};
		});

		// Draw the polygon for the goals
		svg.selectAll(".goal")
			.data([goalsData])
			.enter()
			.append("path")
			.attr("d", initialRadialAreasPath)
			.attr("fill", "var(--clr-secondary-200)")
			.attr("fill-opacity", 0.5)
			.attr("stroke", "var(--clr-secondary-200)")
			.attr("stroke-width", 1)
			.attr("transform", `translate(${width / 2}, ${height / 2})`)
			.transition()
			.delay(1000)
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("d", areaGenerator);

		// Draw the polygon for the scores
		svg.selectAll(".score")
			.data([scoresData])
			.enter()
			.append("path")
			.attr("d", initialRadialAreasPath)
			.attr("fill", "var(--clr-primary-600)")
			.attr("fill-opacity", 0.5)
			.attr("stroke", "var(--clr-primary-600)")
			.attr("stroke-width", 1)
			.attr("transform", `translate(${width / 2}, ${height / 2})`)
			.transition()
			.delay(2000)
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("d", areaGenerator);

		// ********** LABELS ********** //
		// Calculate the coordinates for labels
		const labelsData = data.map((category, index) => {
			// For some reason, the label have a slight offset compared to
			// the polygon's edge, so the -1.55 is used to compensate.
			const angle = (Math.PI * 2 * index - 1.55) / data.length;

			return {
				x: (CHART_RADIUS + 15) * Math.cos(angle),
				y: (CHART_RADIUS + 15) * Math.sin(angle),
				label: category.category,
			};
		});

		// Draw labels
		svg.selectAll(".label")
			.data(labelsData)
			.enter()
			.append("text")
			.attr("x", d => d.x)
			.attr("y", d => d.y)
			.text(d => d.label)
			.attr("transform", `translate(${width / 2}, ${height / 2})`)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
			.attr("fill", "var(--clr-textLight)");
	}, [width, height]);

	return (
		<div ref={ref} className="performance">
			<svg></svg>
			<h3 className="performance__title">Performances du jour</h3>
			<span className="performance__legend">Score</span>
			<span className="performance__legend">Goals</span>
		</div>
	);
}
