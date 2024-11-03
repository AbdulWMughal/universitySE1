$(document).ready(function() {
    const MAX_ATTEMPTS = 6;
    const WORD_LENGTH = 5;
    let attempts = 0;
    let word = "";
    let currentRow = [];
    let guess = "";

    // Function to fetch a random 5-letter word from the Random Word API
    async function fetchRandomWord() {
        let validWord = "";
        while (true) {
            try {
                const response = await fetch(`https://random-word-api.herokuapp.com/word?number=1&length=${WORD_LENGTH}`);
                const data = await response.json();
                validWord = data[0]; // Get the first word from the response
                
                // Validate the fetched word using the dictionary API
                const isValid = await validateGuess(validWord);
                if (isValid) {
                    return validWord; // Return the valid word
                } else {
                    console.log(`Fetched invalid word: ${validWord}. Fetching a new word...`);
                }
            } catch (error) {
                console.error("Error fetching random word:", error);
                showMessage("Error fetching word. Please try again.", "red");
                break; // Break the loop on error
            }
        }
        return validWord; // Return empty string if no valid word found
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
        if (input === "00000") {
            showMessage("The word is: " + word.toUpperCase());
            $("#guessInput").val(""); // Clear the input field after revealing the word
            return;
        }

        if (input.length !== WORD_LENGTH) {
            showMessage("Guess must be 5 letters.");
            $("#guessInput").val(""); // Clear the input field
            return;
        }

        const isValid = await validateGuess(input);
        if (!isValid) {
            showMessage("Invalid word. Try a real word.");
            $("#guessInput").val(""); // Clear the input field
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
                $("#guessInput").val("").focus(); // Clear input field after guess
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

    $("#restartButton").click(async function() {
        word = await fetchRandomWord();
        initializeBoard();
        $("#guessButton").prop("disabled", false);
    });

    // Start the game by fetching a random word
    fetchRandomWord().then(fetchedWord => {
        word = fetchedWord;
        initializeBoard();
    });
});

// Function to change contrast
function changeContrast() {
    document.body.classList.toggle('high-contrast');
}

// Function to change font to Times New Roman
function changeFont() {
    document.body.classList.toggle('times-new-roman');
}
