// scr/pages/MainScreen.tsx
// import React, {useState} from 'react';
import { useState } from 'react';
import { generateDrillContentJSON } from '../core/services/GeminiService';

import HintItem from '../components/HintItem';
import SentenceItem from '../components/SentenceItem';
import Button from '../components/common/Button';

import SettingsIcon from '../assets/settings.svg?react';
import MicrophoneIcon from '../assets/microphone.svg?react';
// import MicRestartIcon from '../assets/mic_restart.svg?react';

// import './MainScreen.css';

function MainScreen() {
    const [activeSentenceIndex, setActiveSentenceIndex] = useState<number>(1);
    const [hints, setHints] = useState<string[]>(
        Array.from({ length: 14 }, (_, i) => `${i}-HINT`)
    );
    const [targetSentences, setTargetSentences] = useState<string[]>(
        Array.from({ length: 14 }, (_, i) => `${i}-TARGET_SENTENCE_EXAMPLE`)
    );
    const [userInputSentences, setUserInputSentences] = useState<string[]>(
        () => {
            const initialTarget = Array.from({ length: 14 }, (_, i) => `${i}-TARGET_SENTENCE_EXAMPLE`);
            const initialUser = Array(initialTarget.length).fill("");
            if (initialTarget.length > 0) {
                initialUser[0] = initialTarget[0];
            }
            return initialUser;
        }
    );
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleSentenceChange = (index: number, newText: string) => {
        console.log(`Sentence ${index} change to: ${newText}`);
        // Оновимо тільки змінне речення у стані
        setUserInputSentences(prevInputs => prevInputs.map((input, i) => (i === index ? newText : input))
        );
    };

    const handleSentenceSubmit=()=> {
        if(isLoading||activeSentenceIndex>=targetSentences.length)
            return;
        
        const currentUserInput = userInputSentences[activeSentenceIndex].trim();
        const currentTargetSentence=targetSentences[activeSentenceIndex].trim();

        console.log(`Перевірка: Введено "${currentUserInput}", Очікувалось "${currentTargetSentence}"`)

        // TODO: Додати візуальний фідбек про правильність/неправильність
        // Наприклад, змінювати колір фону інпута або показувати іконку

        if(currentUserInput.toLowerCase()=== currentTargetSentence.toLowerCase()){
            console.log("Правильно!");
            if(activeSentenceIndex<targetSentences.length-1){
                setActiveSentenceIndex(prevIndex=> prevIndex+1);
            } else {
                console.log("Всі речення пройдені!");
                // TODO: показати повідомлення про завершення гри
            } 
        } else {
            console.log("Неправильно. Спробуйте ще раз.");
            //TODO: Можна додати логіку для показу помилки, н-д потрясти інпут або дозволити користувачу спробувати ще раз без переходу
        }
    };
    
    const handleSettingsClick = () => {
        console.log("Клік по кнопці Settings");
    };

    const handleNewGameClick = async () => {
        ////////////////////////////////////////////////////
        // TODO: Переробити з використанням змінних у налаштуваннях
        console.log("Клік по кнопці New game (JSON mode)");
        setIsLoading(true);
        const userPromptDetails = "Тема: 'to be' в Present Simple, Складність: початкова";
        const numberOfSentences = 14;
        /////////////////////////////////////////////////////

        console.log("--- Calling generateDrillContent ---");

        // const drillData: DrillContentResponse | null = await generateDrillContentJSON(userPromptDetails, numberOfSentences); БУЛО
        const drillData = await generateDrillContentJSON(userPromptDetails, numberOfSentences); // СТАЛО

        if (drillData && drillData.hints && drillData.sentences) {
            console.log("Успішно розпарсені дані:", drillData);
            setHints(drillData.hints);
            setTargetSentences(drillData.sentences);

            const newUserInputs = Array(drillData.sentences.length).fill("");
            if (drillData.sentences.length > 0) {
                newUserInputs[0] = drillData.sentences[0];
            }
            setUserInputSentences(newUserInputs);

            setActiveSentenceIndex(1);
        } else {
            console.error("Не вдалося отримати або розпарсити дані від API у форматі JSON");

        }
        setIsLoading(false);
    };

    const handleMicrophoneClick = () => {
        console.log("Клік по кнопці Microphone");
    };

    return (
        <div className="main-screen-container">
            <div className="titles-container">
                <h3 className="titles-hints">Hints</h3>
                <h3 className="title-sentences">Sentences</h3>
            </div>

            <div className="columns-container">
                <div className="hints-column">
                    {hints.map((hintText, index) => (
                        <HintItem
                            key={`hint-${index}`}
                            text={hintText}
                            index={index}
                        />
                    )
                    )
                    }
                </div>

                <div className="sentences-column">
                    {targetSentences.map((_, index) => (
                        <SentenceItem
                            key={`sentence-${index}`}
                            text={index === 0 ? targetSentences[0] : userInputSentences[index]}
                            index={index}
                            isEnabled={!isLoading && index > 0 && index === activeSentenceIndex}
                            onChange={index > 0 ? (newText) => handleSentenceChange(index, newText) : () => { }}
                            onSubmit={index>0&&index===activeSentenceIndex?handleSentenceSubmit:()=>{}}
                        />
                    )
                    )
                    }
                </div>
            </div>

            <div className="controls-panel">
                <Button
                    onClick={handleSettingsClick} title='Settings' className='icon-button' disabled={isLoading}>
                    {SettingsIcon ? <SettingsIcon width={24} height={24} /> : '⚙️'}
                </Button>

                <Button onClick={handleNewGameClick} disabled={isLoading}>
                    {isLoading ? 'Завантаження...' : 'New game'}
                </Button>

                <Button onClick={handleMicrophoneClick}
                    title="Voice Input" className="icon-button" disabled={isLoading}>
                    {MicrophoneIcon ? <MicrophoneIcon width={24} height={24} /> : '🎤'}
                </Button>
            </div>

        </div>
    );
}

export default MainScreen;