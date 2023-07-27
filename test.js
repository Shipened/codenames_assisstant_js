require('dotenv').config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function runPrompt() {

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{"role": "system", "content": "You are a helpful assistant."}, {role: "user", content: "Hello world"}],
    });

  return completion.data.choices[0].message;
}


async function main() {
  const result = await runPrompt();
  console.log(result);

}

main();




