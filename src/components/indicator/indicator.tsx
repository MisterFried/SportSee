import "./indicator.scss";

interface Props {
	content: {
		name: string;
		value: number;
		icon: string;
	};
}

export default function Indicator(props: Props) {
	const { name, value, icon } = props.content;
	return (
		<div className="indicator">
			<img className="indicator__image" src={`/images/${icon}`} alt={`Icone ${name}`} width={60} height={60} />
			<span className="indicator__value">{value}g</span>
			<span className="indicator__name">{name}</span>
		</div>
	);
}
