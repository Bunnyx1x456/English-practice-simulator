import React from 'react';
//src/components/SentenceItem.tsx

type SentenceItemProps = {
    text: string;
    index: number;
    isEnabled: boolean;
    onChange: (newText: string) => void;
    onSubmit: () => void;
};

// React.FC React.FunctionalComponent
const SentenceItem: React.FC<SentenceItemProps> = ({
    text,
    index,
    isEnabled,
    onChange,
    onSubmit,
}) => {
    const [currentText, setCurrentText] = React.useState(text);

    React.useEffect(() => {
        setCurrentText(text);
    }, [text]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setCurrentText(newValue);
        onChange(newValue);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && isEnabled) {
            event.preventDefault();
            onSubmit();
        }
    };

    return (
        <input
            type="text"
            name=""
            // id=""
            className={`sentence-item list-item ${!isEnabled ? 'disabled' : ''} ${isEnabled ? 'active-input' : ''}`}
            value={currentText}
            disabled={!isEnabled}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            aria-label={`Sentence number${index + 1}`} //${index + 1}:${text}
            placeholder={isEnabled ? "Type your sentence here..." : ""}
        />
    );
};

export default SentenceItem;