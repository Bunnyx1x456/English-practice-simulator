//src/components/HintItem.tsx

type HintItemProps = {
    text: string;
    index: number;
};

// React.FC React.FunctionalComponent
const HintItem: React.FC<HintItemProps> = ({ text, index }) => {
    return (
        <input
            type="text"
            name=""
            id=""
            className="hint-item list-item"
            disabled
            readOnly
            value={text}

            aria-label={`Hint number ${index + 1} + ${text}`}
        />
    );
};

export default HintItem;