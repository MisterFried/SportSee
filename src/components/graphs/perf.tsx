import * as d3 from "d3";
import { useContext, useEffect, useRef } from "react";
import "./perf.scss";
import { UserDataContext } from "../..";
import { PerformanceData } from "../../types/interfaces";

export default function Perf() {
	let performanceData: PerformanceData;

	const userData = useContext(UserDataContext);
	if (userData) {
		performanceData = userData.performance;
	}

	// Ref to the chart container (div)
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Constant
		const PADDING = 100;
		const ticks = [50, 100, 150, 200, 250]; // spacing between each polyline element
		const ANGLE_SPACING = 360 / performanceData.data.data.length; // spacing between each axis
		const svg = d3.select(".perf svg");

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

		// Function to convert an angle and a value to coordinates
		function angleToCoordinate(angle: number, value: number) {
			// Scale to convert a value from something between 0 - max ticks value
			// to something between - max chart radius
			const circleScale = d3.scaleLinear([0, ticks[ticks.length - 1]], [0, CHART_RADIUS]);
			// Cosinus and sinus used the get the x / y coordinate
			// Add a little angle offset to correspond to the design (+ ANGLE_SPACING / 2)
			// Convert degrees to radian (Pi/180)
			// Get the coordinate for the corresponding value (* circleScale)
			const x = Math.cos((angle + ANGLE_SPACING / 2) * (Math.PI / 180)) * circleScale(value);
			const y = Math.sin((angle + ANGLE_SPACING / 2) * (Math.PI / 180)) * circleScale(value);
			return {
				x: WIDTH / 2 + x,
				y: HEIGHT / 2 + y,
			};
		}

		// Generate the coordinate for each axis polylines element
		const polylineLegendArray: Array<string> = [];
		ticks.forEach(tick => {
			let polylineCoordinate = "";
			for (let i = 0; i <= performanceData.data.data.length; i++) {
				const PointCoordinate = angleToCoordinate(ANGLE_SPACING * i, tick);
				polylineCoordinate += `${PointCoordinate.x} ${PointCoordinate.y} `;
			}
			polylineLegendArray.push(polylineCoordinate);
		});

		// Generate polylines element
		svg.selectAll(".axis-ticks")
			.data(polylineLegendArray)
			.enter()
			.append("polyline")
			.attr("points", polylineLegendArray => polylineLegendArray)
			.attr("fill", "none")
			.attr("stroke", "#fafafa")
			.classed("axis-ticks", true);

		// Generate the coordinate for the axis legend
		const angleData = performanceData.data.data.map((item, index) => {
			const angle = ANGLE_SPACING * (index + 1);
			const value = ticks[ticks.length - 1];

			return {
				name: item.name,
				angle: angle,
				coordinate: angleToCoordinate(angle, value),
				index: index,
			};
		});

		// Draw the legend
		svg.selectAll(".axis-label")
			.data(angleData)
			.enter()
			.append("text")
			.attr("x", data => data.coordinate.x)
			.attr("y", data => data.coordinate.y)
			.text(data => data.name)
			.classed("axis-label", true)
			.attr("id", data => `axis-label-${data.index}`);

		// Generate the coordinate for each axis value point
		const valueData = performanceData.data.data.map((item, index) => {
			const angle = ANGLE_SPACING * (index + 1);
			const value = item.value;

			return { coordinate: angleToCoordinate(angle, value) };
		});

		let initialShapeCoordinate = ""; // starting point for the animation
		let shapeCoordinate = ""; // final state of the shape animation
		valueData.forEach(item => {
			shapeCoordinate += `${item.coordinate.x}, ${item.coordinate.y} `;
			initialShapeCoordinate += `${WIDTH / 2}, ${HEIGHT / 2} `;
		});

		// Draw the value shape
		svg.append("polyline")
			.attr("points", initialShapeCoordinate)
			.attr("stroke", "none")
			.attr("fill", "#ff0101")
			.attr("fill-opacity", 0.6)
			.classed("shape", true)
			.transition()
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("points", shapeCoordinate);
	}, []);

	return (
		<div ref={ref} className="perf">
			<svg></svg>
		</div>
	);
}
