$(document).ready(function() {
    const MAX_ATTEMPTS = 6;
    const WORD_LENGTH = 5;
    let attempts = 0;
    let word = getRandomWord();
    
    function getRandomWord() {
        const words = ["apple", "grape", "berry", "lemon", "peach"];
        return words[Math.floor(Math.random() * words.length)];
    }

    function initializeBoard() {
        $("#board").empty();
        for (let i = 0; i < MAX_ATTEMPTS * WORD_LENGTH; i++) {
            $("#board").append("<div class='tile'></div>");
        }
        $("#message").text("");
        $("#guessInput").val("").focus();
        attempts = 0;
    }

    function checkGuess(guess) {
        if (guess.length !== WORD_LENGTH) {
            $("#message").text("Enter a 5-letter word.");
            return;
        }
        
        if (attempts >= MAX_ATTEMPTS) {
            $("#message").text("Game Over! The word was " + word.toUpperCase());
            return;
        }

        let tiles = $("#board .tile").slice(attempts * WORD_LENGTH, (attempts + 1) * WORD_LENGTH);
        let remainingWord = word.split('');
        
        for (let i = 0; i < WORD_LENGTH; i++) {
            let guessedLetter = guess[i];
            
            if (guessedLetter === word[i]) {
                $(tiles[i]).addClass("correct");
                remainingWord[i] = null;
            }
        }

        for (let i = 0; i < WORD_LENGTH; i++) {
            let guessedLetter = guess[i];
            
            if ($(tiles[i]).hasClass("correct")) continue;
            
            if (remainingWord.includes(guessedLetter)) {
                $(tiles[i]).addClass("present");
                remainingWord[remainingWord.indexOf(guessedLetter)] = null;
            } else {
                $(tiles[i]).addClass("absent");
            }
        }

        guess.split('').forEach((letter, index) => {
            $(tiles[index]).text(letter.toUpperCase());
        });

        if (guess === word) {
            $("#message").text("Congratulations! You've guessed the word.");
            $("#guessButton").prop("disabled", true);
            return;
        }
        
        attempts++;
        
        if (attempts === MAX_ATTEMPTS) {
            $("#message").text("Game Over! The word was " + word.toUpperCase());
            $("#guessButton").prop("disabled", true);
        } else {
            $("#guessInput").val("").focus();
        }
    }

    $("#guessButton").click(function() {
        let guess = $("#guessInput").val().toLowerCase();
        checkGuess(guess);
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
