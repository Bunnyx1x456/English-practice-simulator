import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, GenerationConfig } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("API ключ для Gemini не знайдено. Перевірте конфігурацію.")
} else {
    console.log("API ключ Gemini завантажено (перші 5 символів):", API_KEY.substring(0, 5) + "...");
  }

const genAI = new GoogleGenerativeAI(API_KEY)

// Налаштування безпеки (можна налаштувати за потребою)
// Документація: https://ai.google.dev/docs/safety_setting_gemini
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings });

export type DrillContentResponse = {
    hints: string[];
    sentences: string[];
}

/*
 * Генерує контент для Substitution Drill за допомогою Gemini API.
 * @param prompt - Текстовий промпт для Gemini.
 * @returns Текстова відповідь від Gemini або null у разі помилки.
 */

export async function generateDrillContentJSON(
    userPromptDetails: string,
    numberOfSentences: number = 14
): Promise<DrillContentResponse | null> {
    const jsonSchema = {
        type: "object",
        properties: {
            hint: {
                type: "array",
                items: { type: "string" },
                description: `An array of ${numberOfSentences} short hints for the substitution drill.`

            },
            sentences: {
                type: "array",
                items: { type: "string" },
                description: `An array of ${numberOfSentences} corresponding full sentences for the substitution drill.
                The first sentence should be a complete example.`
            }
        },
        required: ["hints", "sentences"]
    };

    const fullPrompt = `You are an English language learning assistant.
    Generate a substitution drill exercise based on the following detail:
    ${userPromptDetails}
    Number of hint/sentence pairs: ${numberOfSentences}.
    
    The output MUST be a valid JSON object strictly conforming to the following JSON schema.
    Do NOT include any text outside of the JSON object (no introductory phrases, no markdown backticks for the JSON block)
    Schema:
    ${JSON.stringify(jsonSchema, null, 2)}

    Example of a desired hint/sentences pair:
    Hint: "Grateful, She"
    Sentence: "She is graftul."
    
    Ensure all hints and sentences are unique and relevant to the provided details.
    The hints should guids the user to construct the sentences.`;

    console.log("Запит до Gemini з промптом (Очікуємо JSON):", fullPrompt);

    const generationConfig: GenerationConfig = {
        responseMimeType: "application/json",
        temperature: 1.0,
    };

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
            generationConfig
        });

        const response = result.response;
        const responseText = response.text();

        console.log("Сира відповідь від Gemini (має бути JSON):", responseText);

        //Парсинг JSON
        const parsedResponse: DrillContentResponse = JSON.parse(responseText);

        if (parsedResponse && Array.isArray(parsedResponse.hints) && Array.isArray(parsedResponse.sentences)) {
            if (parsedResponse.hints.length !== numberOfSentences && parsedResponse.sentences.length !== numberOfSentences) {
                console.warn(`Gemini повернув неправильну кількість рядків. Очікувалось ${numberOfSentences}. Отримано hints: ${parsedResponse.hints.length}, sentences: ${parsedResponse.sentences.length}`);

                //ДОДАТКОВА ЛОГІКА на прийом/помилку/чи перероб

            }
            return parsedResponse;
        } else {
            console.error("Відповідь API не відповідає очікуваній JSON структурі:", parsedResponse);
            return null;
        }
    }
    catch (error) {
        console.error("Помилка під час виклику або парсингу Gemini API:", error);
        return null;
    }
}