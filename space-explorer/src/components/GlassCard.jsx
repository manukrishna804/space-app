import './GlassCard.css';
import PropTypes from 'prop-types';

export default function GlassCard({
    children,
    onClick,
    className = '',
    hover = true,
    variant = 'default'
}) {
    const variantClasses = {
        default: 'glass-card-default',
        purple: 'glass-card-purple',
        pink: 'glass-card-pink',
        blue: 'glass-card-blue'
    };

    return (
        <div
            className={`glass-card ${variantClasses[variant]} ${hover ? 'glass-card-hover' : ''} ${onClick ? 'glass-card-clickable' : ''} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="glass-card-glow"></div>
            <div className="glass-card-content">
                {children}
            </div>
        </div>
    );
}

GlassCard.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
    hover: PropTypes.bool,
    variant: PropTypes.oneOf(['default', 'purple', 'pink', 'blue'])
};
