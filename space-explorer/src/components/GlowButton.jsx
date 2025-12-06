import PropTypes from 'prop-types';
import './GlowButton.css';

export default function GlowButton({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    icon = null,
    disabled = false,
    className = ''
}) {
    const sizeClasses = {
        sm: 'glow-btn-sm',
        md: 'glow-btn-md',
        lg: 'glow-btn-lg'
    };

    const variantClasses = {
        primary: 'glow-btn-primary',
        secondary: 'glow-btn-secondary',
        accent: 'glow-btn-accent'
    };

    return (
        <button
            className={`glow-btn ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {/* Glow effect layer */}
            <div className="glow-btn-glow"></div>

            {/* Background layer */}
            <div className="glow-btn-bg"></div>

            {/* Border animation layer */}
            <div className="glow-btn-border"></div>

            {/* Content */}
            <span className="glow-btn-content">
                {children}
                {icon && <span className="glow-btn-icon">{icon}</span>}
            </span>
        </button>
    );
}

GlowButton.propTypes = {
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func,
    variant: PropTypes.oneOf(['primary', 'secondary', 'accent']),
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    icon: PropTypes.node,
    disabled: PropTypes.bool,
    className: PropTypes.string
};
