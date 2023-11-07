import * as d3 from "d3";
import { useEffect, useRef } from "react";
import "./perf.scss";

export default function Perf() {
	const data = [
		{
			name: "Endurance",
			value: 45,
		},
		{
			name: "Energie",
			value: 40,
		},
		{
			name: "Cardio",
			value: 25,
		},
		{
			name: "Intensité",
			value: 25,
		},
		{
			name: "Vitesse",
			value: 45,
		},
		{
			name: "Force",
			value: 38,
		},
	];

	// Ref to the chart container (div)
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		// Constant
		const PADDING = 100;
		const ticks = [10, 20, 30, 40, 50]; // spacing between each circle
		const ANGLE_SPACING = 360 / data.length; // spacing between each axis
		const svg = d3.select(".perf svg");

		// width / height of the chart container
		// Radius of the chart (smaller value between width & height)
		let WIDTH = 0;
		let HEIGHT = 0;
		let CHART_RADIUS = 0;
		if (ref.current) {
			WIDTH = ref.current.clientWidth;
			HEIGHT = ref.current.clientHeight;
			CHART_RADIUS = WIDTH <= HEIGHT ? WIDTH - PADDING : HEIGHT - PADDING;
		}

		// Generate chart circles
		const circleScale = d3.scaleLinear([0, ticks[ticks.length - 1]], [0, CHART_RADIUS / 2]);
		svg.selectAll("circle")
			.data(ticks)
			.enter()
			.append("circle")
			.attr("cx", WIDTH / 2)
			.attr("cy", HEIGHT / 2)
			.attr("fill", "none")
			.attr("stroke", "#fafafa")
			.attr("r", data => circleScale(data));

		// Function to convert an angle to coordinate value (used for axis legend + shape drawing)
		function angleToCoordinate(angle: number, value: number) {
			const x = Math.cos((angle + ANGLE_SPACING / 2) * (Math.PI / 180)) * circleScale(value);
			const y = Math.sin((angle + ANGLE_SPACING / 2) * (Math.PI / 180)) * circleScale(value);
			return {
				x: WIDTH / 2 + x,
				y: HEIGHT / 2 + y,
			};
		}

		// Generate the coordinate for the axis legend
		const angleData = data.map((item, index) => {
			const angle = ANGLE_SPACING * (index + 1);
			const value = ticks[ticks.length - 1];

			return {
				name: item.name,
				angle: angle,
				coordinate: angleToCoordinate(angle, value + 10),
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
			.attr("transform", "translate(-27.5,0)")
			.classed("axis-label", true);

		// Generate the coordinate for each axis value point
		const valueData = data.map((item, index) => {
			const angle = ANGLE_SPACING * (index + 1);
			const value = item.value;

			return {
				angle: angle,
				coordinate: angleToCoordinate(angle, value),
			};
		});

		let initialShapeCoordinate = "";
		let shapeCoordinate = "";
		valueData.forEach(item => {
			shapeCoordinate += `${item.coordinate.x}, ${item.coordinate.y} `;
			initialShapeCoordinate += `${WIDTH / 2}, ${HEIGHT / 2} `;
		});

		svg.append("g").classed("shape-group", true);

		svg.select(".shape-group")
			.append("polyline")
			.attr("points", initialShapeCoordinate)
			.attr("stroke", "none")
			.attr("fill", "#ff0101")
			.attr("fill-opacity", 0.7)
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
