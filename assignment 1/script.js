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

    function validateGuess(input) {
        return $.ajax({
            url: `https://api.datamuse.com/words?sp=${input}&max=1`,
            method: "GET",
            dataType: "json"
        });
    }

    function showMessage(message, color = "red") {
        $("#message").text(message).css("color", color);
    }

    function handleGuess(input) {
        if (input.length !== WORD_LENGTH) {
            showMessage("Guess must be 5 letters.");
            return;
        }

        validateGuess(input).then(function(response) {
            if (response.length === 0) {
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
        }).catch(function() {
            showMessage("Error checking word. Please try again.");
        });
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
