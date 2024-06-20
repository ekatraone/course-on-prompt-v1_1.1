const fs =  require("fs");
const path = require("path");
const OpenAI = require("openai");
require('dotenv').config("./env");


const configuration = {
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_KEY
};

const openai = new OpenAI(configuration);

const speechFile = path.resolve("./speech.wav");

async function main() {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: "Today is a wonderful day to build something people love!",
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}
main();