import * as d3 from "d3";
import { useEffect, useRef } from "react";
import "./score.scss";

interface Props {
	value: number;
}

export default function Score(props: Props) {
	const { value } = props;
	const ref = useRef<HTMLDivElement>(null); // div containing the chart ref

	// The score is set to 99.999% when it's at 100% because otherwise
	// the arc is just a point (end point = start point at 100%)
	const score = value === 1 ? 99.999 : value * 100;
	const arcType = score <= 50 ? 0 : 1; // largest or smallest arc (svg arc parameter)

	useEffect(() => {
		// Constant
		const PADDING = 50;
		const BAR_WIDTH = 15;
		const svg = d3.select(".score svg");

		// width / height of the chart container
		// Radius of the chart (smaller value between width & height)
		let WIDTH = 0;
		let HEIGHT = 0;
		let CHART_RADIUS = 0;
		if (ref.current) {
			WIDTH = ref.current.clientWidth;
			HEIGHT = ref.current.clientHeight;
			CHART_RADIUS = WIDTH <= HEIGHT ? (WIDTH - PADDING) / 2 : (HEIGHT - PADDING) / 2;
		}

		// Function to convert a percentage to coordinate value
		function valueToCoordinate(value: number) {
			// Cosinus and sinus are used to convert an angle (in radians) to x/y coordinate
			// The value is converted from a percentage (0-100) to an angle (0-360)
			// Offset of 90 degrees to start in the center of the top side (-90deg)
			const x = Math.cos((value * 3.6 - 90) * (Math.PI / 180)) * CHART_RADIUS;
			const y = Math.sin((value * 3.6 - 90) * (Math.PI / 180)) * CHART_RADIUS;
			return {
				x: WIDTH / 2 + x,
				y: HEIGHT / 2 + y,
			};
		}

		// Generate the coordinate for the starting and ending point of the arc
		const startingPoint = valueToCoordinate(0);
		const endingPoint = valueToCoordinate(score);

		// Generate Background circle
		svg.append("circle")
			.attr("cx", `${WIDTH / 2}`)
			.attr("cy", `${HEIGHT / 2}`)
			.attr("r", `${CHART_RADIUS - BAR_WIDTH / 2}`)
			.attr("fill", "#fff")
			.attr("stroke", "none");

		// Generate the arc
		svg.append("path")
			.attr("fill", "none")
			.attr("stroke", "#ff0101")
			.attr("stroke-linecap", "round")
			.attr(
				"d",
				`M ${startingPoint.x} ${startingPoint.y} A ${CHART_RADIUS} ${CHART_RADIUS} 0 ${arcType} 1 ${endingPoint.x} ${endingPoint.y}`
			)
			.attr("stroke-width", 0)
			.transition()
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("stroke-width", BAR_WIDTH);
	}, []);

	return (
		<div ref={ref} className="score">
			<svg></svg>
			<h3 className="score__title">Score</h3>
			<span className="score__text">
				<b>{score === 99.999 ? "100" : score}%</b> de votre objectif
			</span>
		</div>
	);
}
