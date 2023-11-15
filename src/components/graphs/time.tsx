import { useContext, useEffect, useRef } from "react";
import "./time.scss";
import * as d3 from "d3";
import { UserDataContext } from "../..";

interface sessionData {
	day: number;
	sessionLength: number;
}

interface Coordinate {
	x: number;
	y: number;
	duration: number;
}

export default function Time() {
	const data: Array<sessionData> = [];
	const userData = useContext(UserDataContext);
	if (userData) {
		userData.averageTime.data.sessions.forEach(session => data.push(session));
	}

	const ticksLabel = ["L", "M", "M", "J", "V", "S", "D"];

	// Ref to the chart container (div)
	const ref = useRef<HTMLDivElement | null>(null);

	// Generate the chart
	useEffect(() => {
		const LEFT_PADDING = 15;
		const RIGHT_PADDING = 25;
		const VERTICAL_PADDING = 40;
		const svg = d3.select(".timeChart svg");

		// width / height of the chart container
		// width & height of the chart
		let WIDTH = 0;
		let HEIGHT = 0;
		let CHART_WIDTH = 0;
		let CHART_HEIGHT = 0;
		if (ref.current) {
			WIDTH = ref.current.clientWidth;
			HEIGHT = ref.current.clientHeight;
			CHART_WIDTH = WIDTH - LEFT_PADDING - RIGHT_PADDING;
			CHART_HEIGHT = HEIGHT - VERTICAL_PADDING;
		}

		// X axis value and scale
		const firstDay = data[0].day;
		const lastDay = data[data.length - 1].day;
		const xScale = d3.scaleLinear([firstDay, lastDay], [LEFT_PADDING, CHART_WIDTH]);
		const xAxis = d3.axisBottom(xScale).ticks(5);
		svg.append("g")
			.attr("transform", `translate(0,${CHART_HEIGHT})`)
			.call(xAxis)
			.classed("x-axis", true)
			.selectAll("text")
			.text(function (_, i) {
				return ticksLabel[i];
			});

		// Y axis
		const maxDuration = Math.max(...data.map(session => session.sessionLength));
		const maxDisplayTimeValue = Math.ceil(maxDuration / 10) * 10 + 10;
		const yScale = d3.scaleLinear([0, maxDisplayTimeValue], [CHART_HEIGHT, 0 + VERTICAL_PADDING]);

		// Y axis legend
		const yAxis = d3
			.axisLeft(d3.scaleLinear([0, maxDisplayTimeValue], [CHART_HEIGHT, 0 + VERTICAL_PADDING]))
			.ticks(5);
		svg.append("g").call(yAxis).attr("transform", `translate(${WIDTH}, 0)`).classed("y-axis", true);

		// function to create point coordinate
		function pointCoordinate(x: number, y: number) {
			return {
				x: xScale(x),
				y: yScale(y),
			};
		}

		// Create the tooltip
		const toolTip = d3
			.select(".timeChart")
			.append("div")
			.style("opacity", 0)
			.classed("tooltip-time", true)
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
		function mouseMove(event: MouseEvent, data: Coordinate) {
			toolTip
				.style("top", `${d3.pointer(event)[1]}px`)
				.style("left", `${d3.pointer(event)[0] + 15}px`)
				.html(`Durée : ${data.duration} min`);
		}

		//Leave
		function mouseLeave() {
			toolTip.style("opacity", 0);
		}

		// Path element for the curve
		let curvePath = "";
		let initialCurvePath = "";
		const curvePathPointsArray: Array<Coordinate> = [];
		data.forEach(session => {
			const pointCoord = pointCoordinate(session.day, session.sessionLength);
			curvePath += `${pointCoord.x} ${pointCoord.y} `;
			curvePathPointsArray.push({ x: pointCoord.x, y: pointCoord.y, duration: session.sessionLength });
			initialCurvePath += `${xScale(session.day)} ${CHART_HEIGHT} `;
		});

		// Draw the curve
		svg.append("polyline")
			.attr("fill", "none")
			.attr("stroke", "#ffa3a3")
			.attr("stroke-width", 3)
			.classed("curve", true)
			.attr("points", initialCurvePath)
			.transition()
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("points", curvePath);

		// Round up the curves corner
		const circles = svg
			.selectAll(".curve-corner")
			.data(curvePathPointsArray)
			.enter()
			.append("circle")
			.attr("fill", "#ffa3a3")
			.attr("r", 5)
			.attr("cx", data => data.x)
			.attr("cy", CHART_HEIGHT)
			.on("mouseover", mouseHover)
			.on("mousemove", (event, data) => mouseMove(event, data))
			.on("mouseleave", mouseLeave);

		circles
			.transition()
			.duration(1000)
			.ease(d3.easePoly.exponent(3))
			.attr("cy", data => data.y);
	}, []);

	return (
		<div ref={ref} className="timeChart">
			<h3 className="timeChart__title">Durée moyenne des sessions</h3>
			<svg></svg>
		</div>
	);
}
