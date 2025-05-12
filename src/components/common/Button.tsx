//src/components/common/Button.tsx
import React from "react";
import './Button.css'

type ButtonProps = {
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
    title?: string;
    disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({
    onClick,
    children,
    className = '',
    title,
    disabled = false,
}) => {
    return (
        <button
            className={`common-button ${className}`}
            onClick={onClick}
            title={title}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;