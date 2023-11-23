import {
  bold,
  redBright,
  blue,
  green,
  red,
  magenta,
  greenBright,
  yellow,
  cyan,
  yellowBright,
} from "colorette";
import { keyInSelect, keyInYNStrict, question } from "readline-sync";

export class Shrugman {
  constructor(printer) {
    this.words = [
      [
        "Inception",
        "Gone Girl",
        "Toy Story",
        "Gladiator",
        "La La Land",
        "The Godfather",
        "Interstellar",
        "Ratatouille",
        "Joker",
        "Inside Out",
      ],
      [
        "Munich",
        "Tokyo",
        "Hanoi",
        "Paris",
        "Seoul",
        "Sydney",
        "Dubai",
        "Toronto",
        "Rome",
        "Cairo",
      ],
      [
        "Golf",
        "Ice Hockey",
        "Table Tennis",
        "Material Arts",
        "Rugby",
        "Basketball",
        "Surfing",
        "Football",
        "Swimming",
        "Fencing",
      ],
    ];
    this.playedWords = [];
    this.resultOfPlayedWords = [];
    this.shrugEmoji = "¯\\_(:/)_/¯";
    this.chosenCategoryIndex = -1;
    this.chosenCategory = "";
    this.targetWord = "";
    this.printer = printer;
  }

  start() {
    this.intro();
    this.chooseCategory();
    this.play();
  }

  intro() {
    this.printIntroMsg();
    this.confirmReady();
  }

  printIntroMsg() {
    let welcomeMsg = "\nWelcome to Shrugman Game!";
    let introMsg =
      "\nThe goal is straightforward: guess the hidden word by guessing letters one at a time.\n\nThe rule is simple: You choose one category and be presented with a mysterious word represented by a series of dashes, with each dash representing a letter. Each correct guess will expose the corresponding letters. But beware of the Shrugman! For every incorrect guess, a piece of shrugman will appear, shrugging in response to your inaccuracy. \n\n🤷 Can you solve the word before the Shrugman completes his nonchalant pose?  ";

    console.clear();
    this.centerText(welcomeMsg, "redBright");
    this.centerText(introMsg, "green");
  }

  centerText(message, color) {
    const terminalWidth = process.stdout.columns;
    const lines = message.split("\n"); // Split the message into lines
    let centeredMessage = "";

    for (let line of lines) {
      const paddingLength = Math.floor((terminalWidth - line.length) / 2);
      const padding = " ".repeat(Math.max(0, paddingLength));
      centeredMessage += `${padding}${line}\n`; // Append the centered line with padding
    }

    switch (color) {
      case "redBright":
        this.printer.print(bold(redBright(centeredMessage)));
        break;
      case "blue":
        this.printer.print(blue(centeredMessage));
        break;
      case "green":
        this.printer.print(green(centeredMessage));
        break;
      default:
        this.printer.print(centeredMessage);
        break;
    }
  }

  confirmReady() {
    let playConfirm = "\n\nAre you ready? 🚀";
    const readyPlay = keyInYNStrict(playConfirm);

    if (!readyPlay) {
      this.printer.print(blue("\nYou chose to quit. Goodbye!\n"));
      process.exit();
    }
  }

  chooseCategory() {
    console.clear();

    const categoryOptions = ["Movie Titles", "Cities", "Sports"];
    const chosenCategoryIndex = keyInSelect(
      categoryOptions,
      cyan("Please choose one of the categories for the game.")
    );
    let chosenCategory;

    switch (chosenCategoryIndex) {
      case -1:
        this.printer.print(red("\nYou want to quit. Goodbye 👋 \n"));
        process.exit();

      case 0:
        chosenCategory = "Movie Title 🎞️";
        this.printer.print(`\n➡️ Let's guess a ${chosenCategory}\n`);
        break;

      case 1:
        chosenCategory = "City 🏙️";
        this.printer.print(`\n➡️ Let's guess a ${chosenCategory}\n`);
        break;

      case 2:
        chosenCategory = "Sport 🏃";
        this.printer.print(`\n➡️ Let's guess a ${chosenCategory}\n`);
        break;
    }

    this.chosenCategory = chosenCategory;
    this.chosenCategoryIndex = chosenCategoryIndex;
  }

  play() {
    setTimeout(() => {
      this.targetWord = this.chooseTargetWordRandomly();
      const maskedWord = this.showMaskedWord();
      this.storePlayedWords();
      const { resultLetters, maxWrongGuessExceeded } =
        this.guessingProcess(maskedWord);
      this.checkWinLose(resultLetters, maxWrongGuessExceeded);
      this.askUserToPlayAgain();
    }, 1500);
  }

  chooseTargetWordRandomly() {
    let availableWords = this.words[this.chosenCategoryIndex].filter(
      (word) => !this.playedWords.includes(word)
    );

    if (availableWords.length === 0) {
      // if all words have been played, reset:
      this.playedWords = [];
      availableWords = this.words[this.chosenCategoryIndex];
    }

    const randomIndex = Math.floor(Math.random() * availableWords.length);
    return availableWords[randomIndex];
  }

  showMaskedWord() {
    let maskedWord = this.targetWord.replace(/[a-zA-Z]/g, "_");

    console.clear();
    this.printer.print(greenBright(maskedWord));

    return maskedWord;
  }

  storePlayedWords() {
    this.playedWords.push(this.targetWord);
  }

  guessingProcess(maskedWord) {
    let wrongGuess = 0;
    const maxWrongGuess = this.shrugEmoji.length;
    let shrugCurrentState = [];
    let guessedLetters = []; //store letters already guessed to check if repeated
    let remainingLetters = this.targetWord.match(/[a-zA-Z]/g).length;
    const resultLetters = maskedWord.split("");

    //GAME STARTS WHEN REMAINING LETTERS TO GUESS > 0
    while (remainingLetters > 0 && wrongGuess < maxWrongGuess) {
      let userGuess = question(blue("\nGuess a letter → ")).toLowerCase();

      //validate user's guess:
      if (userGuess.length !== 1 || !/^[a-zA-Z]+$/.test(userGuess)) {
        this.printer.print("\nPlease enter a single letter.\n");
      } else if (guessedLetters.includes(userGuess)) {
        this.printer.print(
          "\nYou've already guess this letter. Choose another one.\n"
        );
      } else {
        //user guess valid => check whether letter: correct or wrong
        guessedLetters.push(userGuess);
        let wrongAnswer = true;

        for (let n = 0; n < this.targetWord.length; n++) {
          if (userGuess === this.targetWord[n].toLowerCase()) {
            resultLetters[n] = this.targetWord[n];
            remainingLetters--;
            wrongAnswer = false;
          }
        }

        if (wrongAnswer) {
          wrongGuess++;
          let shrugCharacter = this.shrugEmoji[wrongGuess - 1];
          shrugCurrentState.push(shrugCharacter);
        }

        console.clear();
        this.printer.print(greenBright(resultLetters.join("")));
        this.printer.print(red("\n" + shrugCurrentState.join("")));
      }
    }

    return {
      resultLetters: resultLetters.join(""),
      maxWrongGuessExceeded: wrongGuess === maxWrongGuess,
    };
  }

  checkWinLose(resultLetters, maxWrongGuessExceeded) {
    let result;

    if (!resultLetters.includes("_")) {
      result = "Win";
      this.resultOfPlayedWords.push(result);
      this.printer.print(green("\nHey you win!"));
    } else if (maxWrongGuessExceeded) {
      result = "Loss";
      this.resultOfPlayedWords.push(result);
      this.printer.print(magenta("\nBetter luck next time!"));
    }
  }

  askUserToPlayAgain() {
    let playAgain = keyInYNStrict(
      `\nAnother round in same category ${this.chosenCategory} ?`
    );
    if (playAgain) {
      this.printer.print(yellow("\nGood luck!\n"));
      this.play();
    } else {
      this.printListPlayedWords();
      this.printer.print(yellowBright("\nNice to meet you. Goodbye!\n"));
      process.exit();
    }
  }

  printListPlayedWords() {
    for (let index = 0; index < this.playedWords.length; index++) {
      this.printer.print(
        `\n${index + 1}. ${this.playedWords[index]} - ${
          this.resultOfPlayedWords[index]
        }`
      );
    }

    this.printer.print("\n--- THE END ---\n");
  }
}
