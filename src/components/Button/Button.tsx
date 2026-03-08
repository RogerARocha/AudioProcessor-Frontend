import './Button.css';

interface ButtonProps {
    text: string;
    onClick?: () => void;
    disabled?: boolean;
}

export const Button = ({ text, onClick, disabled }: ButtonProps) => (
    <button 
    className="custom-button" 
    onClick={onClick}
    disabled={disabled}>
        {text}
    </button>
);