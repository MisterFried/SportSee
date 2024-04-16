// ** Import core packages
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

// ** Import styles
import "./sessionDuration.scss";

// ** Import Types
import { SessionInterface } from "../../types/user.interface";

export default function SessionDuration({ data }: { data: SessionInterface[] }) {
	const ref = useRef<HTMLDivElement>(null); // div containing the chart ref
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

	// Draw the chart once the component is rendered and the data fetched
	useEffect(() => {
		if (width === 0 || height === 0) return;

		// ******** SETUP ******** //
		// Constants
		const LEFT_PADDING = 35;
		const RIGHT_PADDING = 15;
		const TOP_PADDING = 45;
		const BOTTOM_PADDING = 35;
		const VERTICAL_PADDING = TOP_PADDING + BOTTOM_PADDING;
		const HORIZONTAL_PADDING = LEFT_PADDING + RIGHT_PADDING;
		const svg = d3.select(".sessionDuration svg");

		svg.selectAll("*").remove(); // Clear the previous chart if existing

		// Width / height of the chart
		const CHART_WIDTH = width - HORIZONTAL_PADDING;
		const CHART_HEIGHT = height - VERTICAL_PADDING;

		// ******** TOOLTIP ******** //
		// Create the tooltip
		const toolTip = d3
			.select(".sessionDuration")
			.append("div")
			.style("opacity", 0)
			.classed("tooltip-sessionDuration", true);

		/**
		 * Show the tooltip
		 */
		const mouseHover = () => toolTip.style("opacity", 1).style("user-select", "all").style("z-index", "10");

		/**
		 * Update the position of the tooltip
		 *
		 * @param event The mouse event
		 * @param duration The duration of the session
		 */
		const mouseMove = (event: MouseEvent, duration: number) => {
			toolTip
				.style("top", `${d3.pointer(event)[1]}px`)
				.style("left", `${d3.pointer(event)[0] + 15}px`)
				.html(`Durée : ${duration} min`);
		};

		/**
		 *  Hide the tooltip
		 */
		const mouseLeave = () => toolTip.style("opacity", 0).style("user-select", "none").style("z-index", "-1");
		// ******** X AXIS ******** //
		// X axis min/max, scale function and legend
		const firstDay = Number(data[0].day.slice(8, 10));
		const lastDay = Number(data[data.length - 1].day.slice(8, 10));
		const xScale = d3.scaleLinear([firstDay, lastDay], [LEFT_PADDING, CHART_WIDTH + LEFT_PADDING]);
		const xAxis = d3.axisBottom(xScale).ticks(lastDay - firstDay + 1);
		svg.append("g")
			.attr("transform", `translate(0,${CHART_HEIGHT + TOP_PADDING})`)
			.call(xAxis)
			.selectAll("text")
			.text((_, index) => data[index].day.slice(8, 10))
			.attr("font-size", "0.75rem");

		// ******** Y AXIS ******** //
		// Y axis max, scale function and legend
		const maxDuration = Math.max(...data.map(session => session.duration));
		const maxDisplayedDuration = Math.ceil(maxDuration / 10) * 10 + 10;
		const yScale = d3.scaleLinear([0, maxDisplayedDuration], [CHART_HEIGHT + TOP_PADDING, TOP_PADDING]);
		const yAxis = d3.axisLeft(yScale).ticks(maxDisplayedDuration / 10 - 1);
		svg.append("g").call(yAxis).attr("transform", `translate(${LEFT_PADDING},0)`).attr("font-size", "0.75rem");

		// ******** LINE ******** //
		// Line generator function
		const line = d3
			.line<{ day: string; duration: number }>()
			.x(d => xScale(Number(d.day.slice(8, 10))))
			.y(d => yScale(d.duration))
			.curve(d3.curveBumpX);

		// Draw the line
		const path = svg
			.append("path")
			.attr("fill", "none")
			.attr("stroke", "var(--clr-primary-500)")
			.attr("stroke-width", "2")
			.attr("d", line(data));

		const totalLength = path.node()!.getTotalLength();
		const animationDuration = 1500;

		// Set the stroke-dash offset to the total length to initially hide the line
		// Then transition to a stroke dashoffset of 0 to reveal it
		path.attr("stroke-dasharray", totalLength)
			.attr("stroke-dashoffset", totalLength)
			.transition()
			.duration(animationDuration)
			.ease(d3.easePoly.exponent(3))
			.attr("stroke-dashoffset", 0);

		// ******** CIRCLES ******** //
		data.forEach((session, index) => {
			const circle = svg
				.append("circle")
				.attr("cx", xScale(Number(session.day.slice(8, 10))))
				.attr("cy", yScale(session.duration))
				.attr("r", 0)
				.attr("fill", "var(--clr-primary-500)")
				.on("mouseover", mouseHover)
				.on("mousemove", event => mouseMove(event, session.duration))
				.on("mouseleave", mouseLeave);

			// Animate the circle's radius with a delay based on their position
			circle
				.transition()
				.delay(index * (animationDuration / data.length))
				.duration(300)
				.attr("r", 5);
		});
	}, [width, height]);

	return (
		<div ref={ref} className="sessionDuration">
			<h3 className="sessionDuration__title">Durée moyenne des sessions</h3>
			<svg></svg>
		</div>
	);
}
