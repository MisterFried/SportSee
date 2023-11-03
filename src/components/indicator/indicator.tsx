import { IndicatorContent, IndicatorInterface } from "../../types/interfaces";
import "./indicator.scss";

export default function Indicator(props: IndicatorInterface) {
	const content: IndicatorContent = props.content;
	return (
		<div className="indicator">
			<img className="indicator__image" src={`/images/${content.icon}`} alt="icon" />
			<span className="indicator__value">{content.value}</span>
			<span className="indicator__name">{content.name}</span>
		</div>
	);
}
