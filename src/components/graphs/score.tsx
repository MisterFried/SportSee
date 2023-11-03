import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from "recharts";
import "./score.scss";

export default function Score() {
	const data = [
		{
			name: "25-29",
			uv: 26.69,
			pv: 4567,
			fill: "#83a6ed",
		},
	];

	const style = {
		top: "50%",
		right: 0,
		transform: "translate(0, -50%)",
		lineHeight: "24px",
	};

	return (
		<ResponsiveContainer className="score" width="100%" height="100%">
			<RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="80%" barSize={15} data={data}>
				<RadialBar label={{ position: "insideStart", fill: "#fff" }} background dataKey="uv" />
				<Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={style} />
			</RadialBarChart>
		</ResponsiveContainer>
	);
}
