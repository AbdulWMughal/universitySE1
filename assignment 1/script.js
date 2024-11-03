$(document).ready(function() {
    const MAX_ATTEMPTS = 6;
    const WORD_LENGTH = 5;
    let attempts = 0;
    let word = getRandomWord();
    let currentRow = [];
    let guess = "";

    function getRandomWord() {
        const words = ["apple", "grape", "berry", "lemon", "peach"];
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

    function showMessage(message, color = "red") {
        $("#message").text(message).css("color", color);
    }

    async function validateGuess(input) {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${input}`);
            if (!response.ok) {
                // If the response is not ok, it's probably a 404 (not found)
                return false;
            }
            const data = await response.json();
            return data.length > 0; // Return true if the word is found
        } catch (error) {
            console.error("Error validating word:", error);
            return false; // Return false on error
        }
    }

    async function handleGuess(input) {
        if (input.length !== WORD_LENGTH) {
            showMessage("Guess must be 5 letters.");
            return;
        }

        const isValid = await validateGuess(input);
        if (!isValid) {
            showMessage("Invalid word. Try a real word.");
            return;
        }

        let tiles = $("#board .tile").slice(attempts * WORD_LENGTH, (attempts + 1) * WORD_LENGTH);
        let remainingWord = word.split('');

        for (let i = 0; i < WORD_LENGTH; i++) {
            const letter = input[i];
            if (letter === word[i]) {
                $(tiles[i]).addClass("correct");
                remainingWord[i] = null;
            }
        }

        for (let i = 0; i < WORD_LENGTH; i++) {
            const letter = input[i];
            if ($(tiles[i]).hasClass("correct")) continue;

            if (remainingWord.includes(letter)) {
                $(tiles[i]).addClass("present");
                remainingWord[remainingWord.indexOf(letter)] = null;
            } else {
                $(tiles[i]).addClass("absent");
            }
        }

        input.split('').forEach((char, index) => {
            $(tiles[index]).text(char.toUpperCase());
        });

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
