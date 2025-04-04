import '../../styles/ui/LoadingStatus.css';

const LoadingStatus = ({ message = 'loading...' }) => {
	return (
		<div className="loading-spinner-older">
			<i className="fas fa-spinner fa-spin"></i>
			<span>{message}</span>
		</div>
	);
};

export default LoadingStatus;
