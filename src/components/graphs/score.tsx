import * as d3 from "d3";
import { useContext, useEffect, useRef } from "react";
import "./score.scss";
import { UserDataContext } from "../..";

export default function Score() {
	const userData = useContext(UserDataContext);
	let score = 0;
	let arcType = 0;

	if (userData) {
		score = userData.userData.data.todayScore === 1 ? 99.999 : userData.userData.data.todayScore * 100;
		arcType = score <= 50 ? 0 : 1; // largest - smallest arc drawing svg
	}

	// Ref to the chart container (div)
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Constant
		const PADDING = 100;
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

		// Function to convert a percentage to coordinate value (used the path end point drawing)
		function angleToCoordinate(value: number) {
			// Cosinus and sinus used the get the x / y coordinate
			// Conversion of the percentage value to an angle in degrees (*3.6)
			// Offset of 90 degrees to start in the center of the top side (-90deg)
			// Convert degrees to radian (Pi/180)
			// Get the coordinate for the corresponding chart radius (*CHART_RADIUS)
			const x = Math.cos((value * 3.6 - 90) * (Math.PI / 180)) * CHART_RADIUS;
			const y = Math.sin((value * 3.6 - 90) * (Math.PI / 180)) * CHART_RADIUS;
			return {
				x: WIDTH / 2 + x,
				y: HEIGHT / 2 + y,
			};
		}

		const startingPoint = angleToCoordinate(0);
		const endingPoint = angleToCoordinate(score);

		// Background circle
		svg.append("circle")
			.attr("cx", `${WIDTH / 2}`)
			.attr("cy", `${HEIGHT / 2}`)
			.attr("r", `${CHART_RADIUS - BAR_WIDTH / 2}`)
			.attr("fill", "#fafafa")
			.attr("stroke", "none");

		// Bar
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
