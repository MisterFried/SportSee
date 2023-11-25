import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import "./performance.scss";
import { PerformanceData } from "../../types/interfaces";
import { fetchUserPerformance } from "../../api/fetchData";

export default function Performance() {
	// State initialization
	const [performance, setPerformance] = useState<Array<PerformanceData>>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const ref = useRef<HTMLDivElement>(null); // div containing the chart ref

	// Fetching data after component mount
	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const performance = await fetchUserPerformance();

			if (performance) {
				setPerformance(performance);
			} else {
				setError(true);
			}
			setLoading(false);
		}

		fetchData();
	}, []);

	// Draw the chart once the component is rendered and the data fetched
	useEffect(() => {
		// Prevent the initial trigger when component mount but data hasn't been fetched yet
		if (performance) {
			// Constant
			const PADDING = 50;
			const ticks = [50, 100, 150, 200, 250]; // spacing between each polyline element
			const ANGLE_SPACING = 360 / performance.length; // spacing between each axis
			const svg = d3.select(".performance svg");

			// width / height of the chart container
			// Radius of the chart (smaller value between width & height)
			let WIDTH = 0;
			let HEIGHT = 0;
			let CHART_RADIUS = 0;
			if (ref.current) {
				WIDTH = ref.current.clientWidth;
				HEIGHT = ref.current.clientHeight;
				CHART_RADIUS = WIDTH <= HEIGHT ? (WIDTH - 2 * PADDING) / 2 : (HEIGHT - 2 * PADDING) / 2;
			}

			// Function to convert an angle and a value to coordinates
			const angleToCoordinate = (angle: number, value: number) => {
				// Scale function
				const circleScale = d3.scaleLinear([0, ticks[ticks.length - 1]], [0, CHART_RADIUS]);
				// Cosinus and sinus are used to convert an angle (in radians) to x/y coordinate
				// Angle offset is added to correspond to the design (+ ANGLE_SPACING / 2)
				const x = Math.cos((angle + ANGLE_SPACING / 2) * (Math.PI / 180)) * circleScale(value);
				const y = Math.sin((angle + ANGLE_SPACING / 2) * (Math.PI / 180)) * circleScale(value);
				return {
					x: WIDTH / 2 + x,
					y: HEIGHT / 2 + y,
				};
			};

			// Generate the coordinate string for each axis ticks line
			const axisTicksLines: Array<string> = [];
			ticks.forEach(tick => {
				let tickLineCoordinate = "";
				for (let i = 0; i <= performance.length; i++) {
					const PointCoordinate = angleToCoordinate(ANGLE_SPACING * i, tick);
					tickLineCoordinate += `${PointCoordinate.x} ${PointCoordinate.y} `;
				}
				axisTicksLines.push(tickLineCoordinate);
			});

			// Generate axis ticks lines
			svg.selectAll(".axis-ticks")
				.data(axisTicksLines)
				.enter()
				.append("polyline")
				.attr("points", axisTicksLines => axisTicksLines)
				.attr("fill", "none")
				.attr("stroke", "#fafafa")
				.classed("axis-ticks", true);

			// Generate the coordinate for the axis legend (text)
			const axisLegendData = performance.map((axis, index) => {
				const angle = ANGLE_SPACING * (index + 1);
				const value = ticks[ticks.length - 1];

				return {
					name: axis.name,
					angle: angle,
					coordinate: angleToCoordinate(angle, value),
					index: index + 1,
				};
			});

			// Generate the axis legend text
			svg.selectAll(".axis-label")
				.data(axisLegendData)
				.enter()
				.append("text")
				.attr("x", axis => axis.coordinate.x)
				.attr("y", axis => axis.coordinate.y)
				.text(axis => axis.name)
				.classed("axis-label", true)
				.attr("id", axis => `axis-label-${axis.index}`);

			// Generate the coordinate for each axis value point
			const axisValueData = performance.map((axis, index) => {
				const angle = ANGLE_SPACING * (index + 1);
				const value = axis.value;
				return { coordinate: angleToCoordinate(angle, value) };
			});

			let initialShapeCoordinate = ""; // starting point for the animation (coordinate = chart's center)
			let shapeCoordinate = ""; // final state of the shape animation (actual value)

			axisValueData.forEach(axis => {
				shapeCoordinate += `${axis.coordinate.x}, ${axis.coordinate.y} `;
				initialShapeCoordinate += `${WIDTH / 2}, ${HEIGHT / 2} `;
			});

			// Generate the value shape
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
		}
	}, [performance]);

	// Display a loading message during the data fetching
	if (loading) {
		return <div className="performance">Chargement en cours</div>;
	}

	// Display error message if the data fetching failed
	if (error) {
		return <div className="performance">Une erreur est survenue lors de la récupération des données de performance utilisateur</div>;
	}

	return (
		<div ref={ref} className="performance">
			<svg></svg>
		</div>
	);
}
