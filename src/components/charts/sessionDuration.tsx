import { useEffect, useRef, useState } from "react";
import "./sessionDuration.scss";
import * as d3 from "d3";
import { fetchUserSessionDuration } from "../../api/fetchData";
import { SessionDurationData } from "../../types/interfaces";

export default function SessionDuration() {
	// State initialization
	const [sessionDuration, setSessionDuration] = useState<SessionDurationData>();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const ref = useRef<HTMLDivElement>(null); // div containing the chart ref

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const sessionDuration = await fetchUserSessionDuration();

			if (sessionDuration) {
				setSessionDuration(sessionDuration);
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
		if (sessionDuration) {
			// Constant
			const LEFT_PADDING = 15;
			const RIGHT_PADDING = 35;
			const VERTICAL_PADDING = 20;
			const sessions = sessionDuration.sessions;
			const ticksLabel = ["L", "M", "M", "J", "V", "S", "D"];
			const svg = d3.select(".sessionDuration svg");

			// Width / height of the chart + its container
			let WIDTH = 0;
			let HEIGHT = 0;
			let CHART_WIDTH = 0;
			let CHART_HEIGHT = 0;
			if (ref.current) {
				WIDTH = ref.current.clientWidth;
				HEIGHT = ref.current.clientHeight;
				CHART_WIDTH = WIDTH - LEFT_PADDING - RIGHT_PADDING;
				CHART_HEIGHT = HEIGHT - 2 * VERTICAL_PADDING;
			}

			// X axis min/max, scale function and legend
			const firstDay = sessions[0].day;
			const lastDay = sessions[sessions.length - 1].day;
			const xScale = d3.scaleLinear([firstDay, lastDay], [LEFT_PADDING, CHART_WIDTH + LEFT_PADDING]);
			const xAxis = d3.axisBottom(xScale).ticks(6);
			svg.append("g")
				.attr("transform", `translate(0,${CHART_HEIGHT})`)
				.call(xAxis)
				.classed("x-axis", true)
				.selectAll("text")
				.text((_, i) => ticksLabel[i]);

			// Y axis max, scale function and legend
			const maxDuration = Math.max(...sessions.map(session => session.sessionLength));
			const maxDisplayedDuration = Math.ceil(maxDuration / 10) * 10 + 10;
			const yScale = d3.scaleLinear([0, maxDisplayedDuration], [CHART_HEIGHT, 0 + VERTICAL_PADDING]);
			const yAxis = d3.axisLeft(yScale).ticks(maxDisplayedDuration / 10 - 1);
			svg.append("g").call(yAxis).attr("transform", `translate(${WIDTH}, 0)`).classed("y-axis", true);

			// Function to generate coordinate from a day/duration pair
			const valueToCoordinate = (day: number, duration: number) => {
				return {
					x: xScale(day),
					y: yScale(duration),
				};
			};

			// Generate an array of coordinate based on each session day/duration
			const durationsCoordinate = sessions.map(session => {
				return { ...valueToCoordinate(session.day, session.sessionLength), duration: session.sessionLength };
			});
			// Generate an array of coordinate with y = 0 for each session
			const initialDurationsCoordinate = sessions.map(session => {
				return {
					x: valueToCoordinate(session.day, session.sessionLength).x,
					y: CHART_HEIGHT + VERTICAL_PADDING,
				};
			});

			// Curve model
			const curveModel = d3
				.line<{ x: number; y: number }>()
				.x(d => d.x)
				.y(d => d.y)
				.curve(d3.curveBumpX); // rounded curve

			// Generate the curve
			svg.append("path")
				.data([initialDurationsCoordinate])
				.attr("d", curveModel)
				.attr("fill", "none")
				.attr("stroke", "#ffa3a3")
				.attr("stroke-width", 3)
				.transition()
				.duration(1000)
				.ease(d3.easePoly.exponent(3))
				.attr("d", curveModel(durationsCoordinate));

			// Create the tooltip
			const toolTip = d3
				.select(".sessionDuration")
				.append("div")
				.style("opacity", 0)
				.classed("tooltip-sessionDuration", true);

			// Function handle tooltip behavior
			// Hover
			const mouseHover = () => toolTip.style("opacity", 1);

			// Move
			const mouseMove = (event: MouseEvent, data: { duration: number; x: number; y: number }) => {
				toolTip
					.style("top", `${d3.pointer(event)[1]}px`)
					.style("left", `${d3.pointer(event)[0] + 15}px`)
					.html(`Durée : ${data.duration} min`);
			};

			//Leave
			const mouseLeave = () => toolTip.style("opacity", 0);

			// Generate circle on each session's day point
			const circles = svg
				.selectAll(".curve-circle")
				.data(durationsCoordinate)
				.enter()
				.append("circle")
				.attr("fill", "#ffa3a3")
				.attr("r", 5)
				.attr("cx", data => data.x)
				.attr("cy", CHART_HEIGHT + VERTICAL_PADDING)
				.on("mouseover", mouseHover)
				.on("mousemove", (event, data) => mouseMove(event, data))
				.on("mouseleave", mouseLeave);
			circles
				.transition()
				.duration(1000)
				.ease(d3.easePoly.exponent(3))
				.attr("cy", data => data.y);
		}
	}, [sessionDuration]);

	// Display a loading message during data fetching
	if (loading) {
		return <div className="sessionDuration">Chargement des données en cours</div>;
	}

	// Display error message if the data fetching failed
	if (error) {
		return (
			<div className="sessionDuration">
				Une erreur est survenue lors de la récupération des données de durée de session hebdomadaire
			</div>
		);
	}

	// Display the chart once data are fetched and no error occured
	return (
		<div ref={ref} className="sessionDuration">
			<h3 className="sessionDuration__title">Durée moyenne des sessions</h3>
			<svg></svg>
		</div>
	);
}
