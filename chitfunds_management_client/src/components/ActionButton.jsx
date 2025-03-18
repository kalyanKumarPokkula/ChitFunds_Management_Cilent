import '../styles/ActionButton.css';

const ActionButton = ({
	label,
	icon,
	onClick,
	variant = 'primary',
	className = '',
	size = 'medium',
}) => {
	return (
		<button
			className={`btn-component action-button-${variant} action-button-${size} ${className}`}
			onClick={onClick}
		>
			{icon && <i className={`fas fa-${icon}`}></i>}
			{label}
		</button>
	);
};

export default ActionButton;
