require('dotenv').config();

// const { Configuration, OpenAI } = require("openai");
// import OpenAI from "openai";
const OpenAI = require("openai");

// Initialize OpenAI configuration
// const configuration = {
//     apiKey: process.env.OPENAI_API_KEY,
//     organization: process.env.OPENAI_ORG_KEY
// };

// Initialize OpenAI API instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_KEY
});

async function ask(course_name, language) {
    try {
        const question = `Write a 3 day lesson plan on the topic ${course_name}, each day should be divided into 3 modules and each module should have 1 topic. Strictly follow and create a valid JSON as given below in ${language}.
{
    "Introduction":[""],
    "Day 1":["Day 1 - Module 1 : Topic","Day 1 - Module 2 : Topic","Day 1 - Module 3 : Topic"],
    "Day 2":["Day 2 - Module 1 : Topic","Day 2 - Module 2 : Topic","Day 2 - Module 3 : Topic"],
    "Day 3":["Day 3 - Module 1 : Topic","Day 3 - Module 2 : Topic","Day 3 - Module 3 : Topic"],
    "Assessment":[""],
    "Conclusion":[""]
}`;

        // Create chat completion
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // You might want to experiment with different models
            messages: [
                { role: "system", content: "You are a subject matter expert." },
                { role: "user", content: question }
            ],
            temperature: 0.2
        });

        // Extract response
        const response = completion.choices[0].message.content;

        return response;
    } catch (error) {
        console.error("Error in asking question:", error);
        return "Error in asking question";
    }
}

// Example usage
async function main() {
    const ans = await ask("React.js", "English");
    console.log(ans);
}

main();
