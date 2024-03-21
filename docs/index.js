import dotenv from "dotenv";
dotenv.config();

// import { JSDOM } from 'jsdom';

// // Create a virtual DOM using jsdom
// const { document } = new JSDOM().window;

import OpenAI  from "openai";

//const config = new Configuration({
//  apiKey: process.env.OPENAI_API_KEY,
//});

//Creates and instence of OpenAI and passes config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateClueSuggestion(target, avoid = "") {
  return `Give me some clues that relate the following target words, but avoids the unwanted words. Target words: ${
    target.charAt(0).toUpperCase() + target.slice(1)
  } Unwanted words: ${avoid.charAt(0).toUpperCase() + avoid.slice(1)}.`;
}

function generateClueGuess(game, clue, avoid = "") {
  let clueLength = clue.charAt(clue.length - 1)
  let wordList;


  if (game === "1") {
    wordList = "Note, Model, Lead, Shop, Tap, Ice, Tablet, Knife, Dragon, March, Rock, Part, Snow, Back, Van, Cover, Bell, Thief, Fall, Chocolate, Bolt, Ninja, Deck, Wake, Honey.";
} else if (game === "2") {
    wordList = "Ground, Tokyo, Watch, Needle, Mouth, Tag, Slip, Church, Stadium, Contract, London, Bugle, Trunk, Czech, Vet, Cell, Lemon, Bark, Scale, Suit, China, Olympus, Buffalo, Fighter, Horseshoe.";
} else if (game === "3") {
    wordList = "Australia, Egypt, Change, Knight, Compound, Microscope, Film, Foot, Ray, Beat, Green, Crown, Yard, Sound, Belt, Wind, Racket, Link, Genius, Undertaker, Berry, Ivory, Pupil, Pyramid, Poison.";
} else if (game === "4") {
    wordList = "Limousine, Theater, Rose, Pie, Slug, Jet, Button, New York, Post, Hole, Pass, Himalayas, Chest, Paper, Light, Kid, Beijing, Dance, Eagle, Mail, Soldier, America, Plot, Opera, Tower.";
} else {
    wordList = "Invalid game value";
}


  return `Our teams spy master has given us the following clue: "${
    clue.charAt(0).toUpperCase() + clue.slice(1)
  }" where the number after the word refers to how many words their clue relates to on the board. 
  The current words on the board are: ${wordList}.
  From the current words on the board, give me ${clueLength} suggestions of words that our spy master could be hinting with their clue. 
  Don't include the following unwanted words in your suggestions. Unwanted words: 
  ${avoid.charAt(0).toUpperCase() + avoid.slice(1)}.`;
}

async function runClueSuggestion(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful boardgame partner playing codenames with me. You give me suggestions for clues I can give our teammate and you explain how your clue links to each target word and avoids each unwanted word.",
      },
      {
        role: "user",
        content:
          "We are playing a game of Codenames. Our goal is to think of a one-word clue that relates to some of our target words. You also say one number, which tells your teammtes how many target words are related to your clue. For example a clue should be in the format CLUE NUMBER, e.g. TRAVEL 3. This means there are 3 target words that relate to the word travel. While you are allowed to give a clue for only one target word, it's better to give two or more, so always aim to give clues that relate to 2 target words. We are also trying make our word avoid associations with any unwanted words. One rule you MUST follow is that the clues your provide CANNOT be any of the target words or the unwanted words. I am going to give you some examples of how to answer clues which you should follow. Make sure when you answer to give at least two candidates for good clues.",
      },
      {
        role: "user",
        content:
          "Here is the first example: Give me some clues that relate the following target words, but avoids the unwanted words. Target words: tree, page, book. Unwanted words: material.",
      },
      {
        role: "assistant",
        content:
          "Here are some clues I would give. 1.  'LEAF 3'. Leaf relates to tree as some trees have leaves on their branches. Leaf also relates to page and book as a read can leaf through the pages of a book. The clue LEAF avoids relation to the word material, as even though leaves can be used as a type of material the clue more strongly relates to the target words tree, page and book. I avoided suggesting a word like PAPER as that would relate to the concept of material. 2. 'READ 2'. Read refers to page and book as one can read both a page and a book. It avoids association with the word material.",
      },
      {
        role: "user",
        content:
          " Here is the second example: Give me some clues that relate the following target words, but avoids the unwanted words. Target words: bat, platypus, horse. Unwanted words: dwarf.",
      },
      {
        role: "assistant",
        content:
          "Consider some of these clues. 1. 'ANIMAL 3''. Animal relates to horse, platypus and bat as these are all examples of animals. The clue ANIMAL avoids relation to the word dwarf as dwarves are usually considered sentient creatures and hence not animals. I avoided suggesting a word like LIVING, CREATURE, or ALIVE as that would also relate to dwarf as a dwarf is a something that can be considered a creature, alive or living. 2. 'FUR 3'. Each of the target words are things that have fur, whereas the unwanted word (dwarf) does no have fur.",
      },
      {
        role: "user",
        content:
          " Here is the third example: Give me some clues that relate the following target words, but avoids the unwanted words. Target words: berlin, bond. Unwanted words: box.",
      },
      {
        role: "assistant",
        content:
          "Here are some clues I would suggest. 1.  'SPY 2''. Spy relates to Bond, as James Bond is a popular character who is a spy. Spy also relates to Berlin as many spys were used in Berlin during the cold war. The clue SPY also has no obvious relation to the word box, hence there is no risk of association with the unwanted word. 2. 'UNITE 2'. Unite relates to bond in the sense that bond means 'to tie together' which unite can also mean. Unite also relates to Berlin as east and west Berlin eventually united. Unite has no strong association with the word box.",
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 2048,
    temperature: 1,
  });

  return completion.choices[0].message.content;
}

async function runClueGuess(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        "role": "system",
        "content": "You are a helpful boardgame partner playing codenames with me. When I recieve a clue from my teammate you give me suggestions for which words on the board relate to that clue and why."
      },
      {
        "role": "user",
        "content": "We are playing a game of Codenames. There is a 5 by 5 grid of words in front of us, some of which are secretly our teams target words. Only the spymaster can see said target words. Our goal is to receive a one word clue from our spymaster teammate which relates to some of our secret target words, and use that to correctly guess the words they are hinting with the clue. The clue is accompanied by a number, which indicates how many words on the board are related to that clue. For example the clue will be in the format CLUE NUMBER, e.g. Travel 3. This means there are 3 target words that relate to the word travel. When interpreting how a clue relates to possible target words, think about semantic connections between the clue and the words on the board. I am going to give you some examples of how to interpret clues and suggest possible target words which you should follow. Make sure when you answer to suggest X + 1 potential target words, where X is the number accompanying the clue we receive."
      },
      {
        "role": "user",
        "content": "Here's the first example: Our teams spy master has given us the following clue: \"Material 2\"  where the number after the word refers to how many words their clue relates to on the board. \n  The current words on the board are: Note, Model, Lead, Shop, Tap, Ice, Tablet, Knife, Dragon, March, Rock, Part, Snow, Back, Van, Cover, Bell, Thief, Fall, Chocolate, Bolt, Ninja, Deck, Wake, Honey.\n  From the current words on the board, give me X suggestions (where X is the number after the clue + 1) of words that our spy master could be hinting with their clue. \n  Don't include the following unwanted words in your suggestions. Unwanted words: March, Honey, Snow, Deck, Rock"
      },
      {
        "role": "assistant",
        "content": "Based on the clue \"Material 2\" and the unwanted words, here are my suggestions:\n\n1. Lead: Lead is a material that can be used in various applications, such as in construction or as a metal. \n2. Bolt: A bolt is a material used to fasten or secure objects together.\n\nThe words \"Tap\" and \"Knife\" could also relate to the clue given as they are also potential materials used.  "
      },
      {
        "role": "user",
        "content": "Well done, those are great suggestions!\n\nHere's the second example: Our teams spy master has given us the following clue: \"Gladiator 2\"  where the number after the word refers to how many words their clue relates to on the board. \n  The current words on the board are: Ground, Tokyo, Watch, Needle, Mouth, Tag, Slip, Church, Stadium, Contract, London, Bugle, trunk, Czech, Vet, Cell, Lemon, Bark, Scale, Suit, China, Olympus, Buffalo, Fighter, Horseshoe.\n  From the current words on the board, give me X suggestions (where X is the number after the clue + 1) of words that our spy master could be hinting with their clue. \n  Don't include the following unwanted words in your suggestions. Unwanted words: Buffalo, Horseshoe, Trunk."
      },
      {
        "role": "assistant",
        "content": "Based on the clue \"Gladiator 2\" and the unwanted words, here are my suggestions:\n\n1. Stadium: A gladiator would typically fight in a stadium, so this word is directly related to the clue.\n2. Fighter: A gladiator is also a type of fighter who engages in combat.\n\nAdditionally, the word \"Olympus\" could also be related to the clue given as Olympus and Gladiators are associated with ancient history and mythology."
      },
      {
        "role": "user",
        "content": "Again great responses.\n\nHere's the third example: Our teams spy master has given us the following clue: \"Academia 3\"  where the number after the word refers to how many words their clue relates to on the board. \n  The current words on the board are: Australia, Egypt, Change, Knight, Compound, Microscope, Film, Foot, Ray, Beat, Green, Crown, Yard, Sound, Belt, Wind, Racket, Link, Genius, Undertaker, Berry, Ivory, Pupil, Pyramid, Poison.\n  From the current words on the board, give me X suggestions (where X is the number after the clue + 1) of words that our spy master could be hinting with their clue. \n  Don't include the following unwanted words in your suggestions. Unwanted words: Microscope, Compound."
      },
      {
        "role": "assistant",
        "content": "Based on the clue \"Academia 3\" and the unwanted words, here are my suggestions:\n\n1. Genius: Academia is associated with intelligence and knowledge, so the word \"Genius\" fits that theme.\n2. Pupil: In academia, a pupil refers to a student, particularly in a school or educational setting.\n3. Ivory: Ivory could be related to academia due to its historical association with education and prestigious institutions.\n\nThere aren't any other strong associations I can find."
      },
      {
        "role": "user",
        "content": "Great suggestions!\n\nHere's the final example: Our teams spy master has given us the following clue: \"Animal 3\"  where the number after the word refers to how many words their clue relates to on the board. \n  The current words on the board are: Limousine, Theater, Rose, Pie, Slug, Jet, Button, New York, Post, Hole, Pass, Himalayas, Chest, Paper, Light, Kid, Beijing, Dance, Eagle, Mail, Soldier, America, Plot, Opera, Tower.\n  From the current words on the board, give me X suggestions (where X is the number after the clue + 1) of words that our spy master could be hinting with their clue. \n  Don't include the following unwanted words in your suggestions. Unwanted words: ."
      },
      {
        "role": "assistant",
        "content": "Based on the clue \"Animal 3\" and the words on the board, here are my suggestions:\n\n1. Eagle: An eagle is an animal that fits the clue perfectly, as it is a well-known bird of prey and an animal.\n2. Slug: A slug is a type of animal, specifically a gastropod mollusk, which makes it a valid option.\n3. Kid: While not directly an animal, a \"kid\" is the name of a baby goat, which itself is a type of animal.\n\nSince you have not added any excluded words, these are the suggestions I would pick."
      },
      { role: "user", content: prompt },
    ],
    max_tokens: 2048,
    temperature: 1,
  });

  return completion.choices[0].message.content;
}
export { generateClueSuggestion, generateClueGuess, runClueSuggestion, runClueGuess };
