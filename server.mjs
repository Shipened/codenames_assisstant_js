import express from "express";
import { generatePromptTarget, runPrompt } from "./public/index.js";
import dotenv from "dotenv";
dotenv.config();
import { Configuration, OpenAIApi } from "openai";
const app = express();
const port = 3000; // Change this to the desired port number

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

//Creates and instence of OpenAIApi and passes config
const openai = new OpenAIApi(config);

// Middleware to parse incoming form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (e.g., index.html, main.css, and index.js)
app.use(express.static("public"));

// POST route to handle the form submission
app.post("/", async (req, res) => {
  const clue = req.body.clue;
  const avoidWords = req.body["avoid words"];

  // Generate the prompt based on the input data
  const prompt = generatePromptTarget(clue, avoidWords);

  // Generate the response using OpenAI API
  const response = await runPrompt(prompt);

  // // Send the response back to the client
  res.send(response);

  // res.json({ response });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});