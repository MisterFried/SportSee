// ** Import core packages
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// ** Import styles
import "./score.scss";

/**
 * Generate a radial bar chart to display the user's score.
 *
 * @param value - The score to be displayed (0-100).
 * @returns The score component
 */
export default function Score({ value }: { value: number }) {
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

		// Constant
		const PADDING = 50;
		const BAR_WIDTH = 15;
		const BAR_CORNER_RADIUS = BAR_WIDTH / 2;
		const svg = d3.select(".score svg");

		svg.selectAll("*").remove(); // Clear the previous chart if existing

		// Radius of the chart (smaller value between width & height)
		const CHART_RADIUS = width <= height ? (width - PADDING) / 2 : (height - PADDING) / 2;

		// Create the arc generator function
		const arcGenerator = d3.arc().cornerRadius(BAR_CORNER_RADIUS);

		// Draw the chart
		svg.append("g")
			.attr("transform", `translate(${width / 2}, ${height / 2})`)
			.append("path")
			.attr("fill", "var(--clr-primary-400)")
			.transition()
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attrTween("d", () => {
				// Interpolate the arc angle between 0 (start) and calculated angle value (end)
				const interpolate = d3.interpolate(0, (Math.PI * 2 * value) / 100);

				/**
				 * This function takes the current time elapsed in the transition and returns the
				 * calculated arc path for it.
				 * @param t Time elapsed in the transition (0-1)
				 * @returns The arc path
				 */
				function returnFunction(t: number) {
					return arcGenerator({
						innerRadius: CHART_RADIUS - BAR_WIDTH,
						outerRadius: CHART_RADIUS,
						startAngle: 0,
						endAngle: interpolate(t),
					}) as string;
				}
				// Function to return the arc path based on the interpolated angle
				return returnFunction;
			});
	}, [width, height]);

	return (
		<div ref={ref} className="score">
			<svg></svg>
			<h3 className="score__title">Score</h3>
			<span className="score__text">
				<b>{value}%</b> de votre objectif
			</span>
		</div>
	);
}
