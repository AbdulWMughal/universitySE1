$(document).ready(function() {
    const MAX_ATTEMPTS = 6;
    const WORD_LENGTH = 5;
    let attempts = 0;
    let word = getRandomWord();
    let currentRow = [];
    let guess = "";

    // Sample word list, you may want to expand this
    const wordList = ["apple", "grape", "berry", "lemon", "peach", "smart", "whole", "other", "words", "can", "be", "added"];

    function getRandomWord() {
        const words = ["apple", "grape", "berry", "lemon", "peach"]; // Sample word list for the game
        return words[Math.floor(Math.random() * words.length)];
    }

    function initializeBoard() {
        $("#board").empty();
        $("#message").text("");
        $("#guessInput").val("").focus();
        attempts = 0;
        guess = "";
        currentRow = [];
        
        // Create a 5x6 grid layout for the game
        for (let i = 0; i < MAX_ATTEMPTS * WORD_LENGTH; i++) {
            $("#board").append("<div class='tile'></div>");
        }
    }

    function validateGuess(input) {
        const url = `https://api.datamuse.com/words?sp=${input}&max=1`;
        return $.ajax({
            url: url,
            method: "GET",
            dataType: "json"
        });
    }

    function isValidWord(word) {
        return wordList.includes(word);
    }

    function showMessage(message, color = "red") {
        $("#message").text(message).css("color", color);
    }

    function isValidInput(input) {
        // Check if input is exactly 5 letters long and contains only letters
        const regex = /^[a-zA-Z]{5}$/;
        return regex.test(input);
    }

    function handleGuess(input) {
        if (!isValidInput(input)) {
            showMessage("Guess must be a valid 5-letter word without numbers or special characters.");
            return;
        }

        // Check the word against the local word list first
        if (isValidWord(input)) {
            processGuess(input);
        } else {
            // If not valid locally, check with the API
            validateGuess(input).then(function(response) {
                if (response.length === 0) {
                    showMessage("Invalid word. Try a real word.");
                    return;
                }

                processGuess(input);
            }).catch(function() {
                showMessage("Error checking word. Please try again.");
            });
        }
    }

    function processGuess(input) {
        let tiles = $("#board .tile").slice(attempts * WORD_LENGTH, (attempts + 1) * WORD_LENGTH);
        let remainingWord = word.split('');

        // Check for correct letters and their positions
        for (let i = 0; i < WORD_LENGTH; i++) {
            const letter = input[i];
            if (letter === word[i]) {
                $(tiles[i]).addClass("correct");
                remainingWord[i] = null; // Mark this letter as checked
            }
        }

        // Check for letters that are in the word but in the wrong position
        for (let i = 0; i < WORD_LENGTH; i++) {
            const letter = input[i];
            if ($(tiles[i]).hasClass("correct")) continue;

            if (remainingWord.includes(letter)) {
                $(tiles[i]).addClass("present");
                remainingWord[remainingWord.indexOf(letter)] = null; // Mark this letter as checked
            } else {
                $(tiles[i]).addClass("absent");
            }
        }

        // Display the user's guess in the tiles
        input.split('').forEach((char, index) => {
            $(tiles[index]).text(char.toUpperCase());
        });

        // Check for win condition
        if (input === word) {
            showMessage("Congratulations! You guessed it!", "green");
            $("#guessButton").prop("disabled", true);
        } else {
            attempts++;
            if (attempts === MAX_ATTEMPTS) {
                showMessage("Game over! The word was " + word.toUpperCase());
                $("#guessButton").prop("disabled", true);
            } else {
                $("#guessInput").val("").focus();
            }
        }
    }

    $("#guessButton").click(function() {
        guess = $("#guessInput").val().toLowerCase();
        handleGuess(guess);
    });

    $("#guessInput").keypress(function(event) {
        if (event.key === "Enter") {
            $("#guessButton").click();
        }
    });

    $("#restartButton").click(function() {
        word = getRandomWord();
        initializeBoard();
        $("#guessButton").prop("disabled", false);
    });

    initializeBoard();
});
