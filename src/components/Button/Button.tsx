import './Button.css';

interface ButtonProps {
    text: string;
    onClick?: () => void;
}

export const Button = ({ text, onClick }: ButtonProps) => (
    <button className="custom-button" onClick={onClick}>
        {text}
    </button>
);