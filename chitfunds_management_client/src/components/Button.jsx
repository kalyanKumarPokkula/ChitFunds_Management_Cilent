import '../styles/Button.css';

const Button = ({
	children,
	type = 'button',
	onClick,
	variant = 'primary',
	size = 'medium',
	fullWidth = false,
	disabled = false,
	className = '',
}) => {
	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled}
			className={`btn btn-${variant} btn-${size} ${
				fullWidth ? 'btn-full-width' : ''
			} ${className}`}
		>
			{children}
		</button>
	);
};

export default Button;
