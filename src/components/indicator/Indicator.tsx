// ** Import styles
import "./indicator.scss";

/**
 * Render the indicator component, displaying the provided value with the corresponding icon
 * @param name The name of the indicator
 * @param value The value
 * @param icon The name of the icon file (path: images/${icon})
 * @returns
 */
export default function Indicator({ name, value, icon }: { name: string; value: number; icon: string }) {
	return (
		<div className="indicator">
			<img
				className="indicator__image"
				src={`/images/icons/${icon}.svg`}
				alt={`Icon ${name}`}
				width={60}
				height={60}
			/>
			<span className="indicator__value">{value}g</span>
			<span className="indicator__name">{name}</span>
		</div>
	);
}
