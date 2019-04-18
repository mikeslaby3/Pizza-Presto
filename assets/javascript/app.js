//========================================================//
//Global Variables
//========================================================//
var username = "";
var userScore = 0;
var difficulty = "";
var time = 5;
var highScore = "";

//====================================================//
// Chef Variables
//====================================================//
var chefDisapprovalDialogueOptions = ['Mamma mia...', 'My goldfish can make better pizza', 'Did you even eat spaghetti for breakfast?', 'Cavolo! The customer is waiting...', 'You microwave your pizza?', 'You eat cereal, don\'t you?'];
var chefGoodDialogue = ['Now, that is a pizza.', 'Tastes like Mozarella to me!', 'Maybe you\'re an Italian... Maybe', 'Caesar would be proud', 'When in Rome, do as the Romans do', 'Ah, a fresh pizza makes me think of home'];

//========================================================//
// Main Run Through
//========================================================//
$(document).ready(function () {
    //============================//
    // Initialize Firebase
    //============================//
    var config = {
        apiKey: "AIzaSyDd-uc53MHvSpaahIvBuYI2oAG22eZLkuw",
        authDomain: "pizza-presto-28c03.firebaseapp.com",
        databaseURL: "https://pizza-presto-28c03.firebaseio.com",
        projectId: "pizza-presto-28c03",
        storageBucket: "pizza-presto-28c03.appspot.com",
        messagingSenderId: "750779277139"
    };
    firebase.initializeApp(config);

    var database = firebase.database();

    function startGameButtonClicked() {
        $(document).on('click', '#startGameButton', function (event) {
            // prevent page from refreshing when form tries to submit itself
            event.preventDefault();
            $('#settingsMenu').addClass('hide');
            $('#gameScreen').removeClass('hide');
            
            var name = $("#username").val().trim();
            //Either need to find the user through the array or create a counter 
            database.ref('/users').push({
                username: name,
            });

            //Makes the username for the Game Screen into the User's settings
            $('#username-display').text(name);

            database.ref('/users').on("value", function (snapshot) {
                // Log everything that's coming out of snapshot
                console.log(snapshot.val());
                console.log(snapshot.val().username);

                // Capture user inputs and store them into variables
                $("#name-display").text(snapshot.val().username);

            }, function (errorObject) {
                console.log("Errors handled: " + errorObject.code);
            });
        });
    }


    //============================//
    //Materialize Animations
    //============================//
    $('.fixed-action-btn').floatingActionButton();
    $('select').formSelect();  //For the select difficulty dropdown

    //addEventListeners
    playButtonClicked();
    startGameButtonClicked();
    gameOverToScoreBoard();
    addScoreboardButtonListeners();
});

//========================================================//
// APIs
//========================================================//
//On the scoreboard page, the chef will say a random pizza joke
//on the bottom

function triviaPull() {
    difficulty = $('#difficulty').val().toLowerCase();
    var queryURL = 'https://opentdb.com/api.php?amount=50&difficulty=' + difficulty + '&type=multiple';

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then(function (response) {

        var questionIndex = 0;
        var questionArray = response.results;
        var answerArray = []
        var currentQuestion = {};
        var questionDisplay = $('#question');
        var answerDisplay1 = $('#answer1');
        var answerDisplay2 = $('#answer2');
        var answerDisplay3 = $('#answer3');
        var answerDisplay4 = $('#answer4');
        var correctAnswer;

        renderQuestion();

        function renderQuestion() {
            
            // Finds the HTML symbols in the questions/answers and replaces them with readable symbols
            function replaceWeirdSymbols(question) {
                return question.replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&shy;/g,"").replace(/&rdquo;/g,'"').replace(/&ldquo;/g,'"').replace(/&pi;/g,'π').replace(/&ntilde;/g,'ñ').replace(/&aacute;/g,'á').replace(/&ouml;/g,'ö').replace(/&amp;/g,'&');
            } 
            
            // Grabs the first question out the API data and stores it in current question variable
            currentQuestion = questionArray[questionIndex];

            // Variable storing the trivia question
            var triviaQuestion = replaceWeirdSymbols(currentQuestion.question);
            
            // Variables storing the correct answer and three incorrect answers
            correctAnswer = replaceWeirdSymbols(currentQuestion.correct_answer);
            var incorrectAnswer1 = replaceWeirdSymbols(currentQuestion.incorrect_answers[0]);
            var incorrectAnswer2 = replaceWeirdSymbols(currentQuestion.incorrect_answers[1]);
            var incorrectAnswer3 = replaceWeirdSymbols(currentQuestion.incorrect_answers[2]);

            // Array with multiple choice answers
            answerArray = [incorrectAnswer1, incorrectAnswer2, incorrectAnswer3, correctAnswer];
            
            // This array is used to mix up the answers so they 
            // don't appear on the same buttons every time.
            // We repeat -1 so that we can easily recognize
            // when a random number has already been used.
            randomNumberArray = [-1, -1, -1, -1];

            // This function is used to check if the random number
            // has already been put in the array by looping through 
            // the random number array and if the number isn't already 
            // in the array, it returns false and continues looping, 
            // but if it already exists in the array, it returns true
            function randomNumberIsInArray(randomNumber) {
                var isInArray = false;
                for (let index = 0; index < 4; index++) {
                    if (randomNumberArray[index] === randomNumber) {
                        isInArray = true;
                    }
                }
                return isInArray;
            }

            // This function says that when we create a new random number,
            // if the random number is not already in the array, it is 
            // valid so add it to the array and continue the loop. However,
            // if the random number is already in the array, stop the loop
            // and generate another random number
            function getValidRandomNumber() {
                var randomNumber;
                invalidNumber = true;
                while (invalidNumber) {
                    randomNumber = Math.floor(Math.random() * 4);
                    if (!randomNumberIsInArray(randomNumber)) {
                        invalidNumber = false;
                    }
                }
                return randomNumber;
            }

            // This funcation takes a valid random number that hasn't 
            // already been used and adds it to the random number array
            function randomizeIndexNumber() {
                for (let index = 0; index < 4; index++) {
                    randomNumberArray[index] = getValidRandomNumber();
                }
            }

            // Call the function above to create random number array
            randomizeIndexNumber();

            // Display the random answers by plugging each random number into the answer array
            questionDisplay.text(triviaQuestion);
            answerDisplay1.text(answerArray[randomNumberArray[0]]);
            answerDisplay2.text(answerArray[randomNumberArray[1]]);
            answerDisplay3.text(answerArray[randomNumberArray[2]]);
            answerDisplay4.text(answerArray[randomNumberArray[3]]);
        }

        function nextQuestion() {
            questionIndex++;
            renderQuestion();
        }


        $('.answer-button').click(function () {
            if ($(this).text() === correctAnswer) {
                if (difficulty === 'easy') {
                    userScore += 100;
                } else if (difficulty === 'medium') {
                    userScore += 200;
                } else {
                    userScore += 300;
                }
                chefApproval();
            } else {
                chefDisapproval();
            }
            $('#score').text(userScore);
            nextQuestion();
        });

    });

}

// Finds the HTML symbols in the questions/answers and replaces them with readable symbols
function replaceWeirdSymbols(question) {
    return question.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&shy;/g, "").replace(/&rdquo;/g, '"').replace(/&rdquo;/g, '"').replace(/&amp;/g,'&');
}


//=======================================================================================//
//Joke API
//=======================================================================================//
function joke() {
    var queryURL = "https://official-joke-api.appspot.com/random_joke";

    $.ajax({
        url: queryURL,
        method: 'GET'
    }).then(function (response) {
        console.log(response)
        console.log(response.setup)
        $('#setup').text(response.setup);  //[ ] I need to animate this
        $('#punchline').text(response.punchline);

    });

}

//========================================================================================================//
// Chef Animations
//========================================================================================================//
function chefDisapproval() {
    $('#dialogue').text(chefDisapprovalDialogueOptions[Math.floor(Math.random() * chefDisapprovalDialogueOptions.length)]);
    $('#chef').attr('src', './assets/images/chefwrong1.png');
    // console.log('1')
    // setTimeout(function() {
    //     $('#chef').attr('src', './assets/images/chefwrong2.png')
    //     console.log('2')
    // },2000);
    // setTimeout(function() {
    //     $('#chef').attr('src', './assets/images/chefwrong1.png')
    //     console.log('3')
    // },2000);
}

function chefApproval() {
    $('#dialogue').text(chefGoodDialogue[Math.floor(Math.random() * chefGoodDialogue.length)]);
    $('#chef').attr('src', './assets/images/happyChefwPizza.png')
}

//=======================================================================================//
// Screen Changes
//=======================================================================================//

//Adds an event listener to the play button, which brings us to the next screen
function playButtonClicked() {
    $(document).on('click', '#playButton', function () {
        $('#menuScreen').addClass('hide');
        $('#settingsMenu').removeClass('hide');
    });
}

function gameOverToScoreBoard() {
    $(document).on('click', '#modalButton', function () {
        $('#gameScreen').addClass('hide');
        $('#scoreBoardScreen').removeClass('hide');
    })
}

// where function used to be

//Shows the scoreBoard, gives the user the option to replay the game, 
//or choose a new topic
function addScoreboardButtonListeners() {
    replayWithSameDifficulty();


    joke();
    // replay();
    chooseNewTopic();
}

function replayWithSameDifficulty() {
    $(document).on('click', '#replay', function () {
        $('#scoreBoardScreen').addClass('hide');
        $('#gameScreen').removeClass('hide');
    });
}



//Brings the user back to the Topic screen
function chooseNewTopic() {
    $(document).on('click', '#replay', function () {
        $('#scoreBoardScreen').addClass('d-none');
        $('#topicsDiffcultyMenu').removeClass('d-none');
    });
}

function timeConverter(timeInSeconds) {

    var minutes = Math.floor(timeInSeconds / 60);
    var seconds = timeInSeconds - (minutes * 60);

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    if (minutes === 0) {
        minutes = "00";
    }
    else if (minutes < 10) {
        minutes = "0" + minutes;
    }

    return minutes + ":" + seconds;
}

$("#startGameButton").on("click", timer);

function timer() {

    setInterval(function () {
        time--;

        if (time <= 0) { 
            clearInterval(time);
            $('#time').text("Game Over!");
            return;
        } else {
            $('#time').text(timeConverter(time));
        }
    }, 1000);

    triviaPull();

    setTimeout(function(){
        $('.modal').modal(); 
        $('#modal1').modal('open');
     }, (5 * 1000));
}

        }
    
//Updates High Scores to firebase
function checkScores() {
    // check if there's a high score in the database
    var highScore;
    var currentScore = $('#score').val();
    var currentUser = $('#username').val();
  
    database.ref('/scores').on('value', function() {
      // go through the array of scores, look for one with a username
      // {
      //   username: "bob",
      //   highScore: 14
      // }
      // if we find one, set highScore to compare later
      if (currentUser === snapshot.val()[0].username){
        highScore = snapshot.val()[0].highScore;
      } else {
        // set the current value to the high score
        database.ref('/score').set({
          username: currentUser,
          highScore: currentScore
        })
        return;
      }
    })
  
    // if there is, check to see if we need to update it
    if (highScore){
      if (currentScore > highScore){
        // update the database with the new high score
        database.ref('/score').set({
          username: currentUser,
          highScore: currentScore
        })
      }
    }
    // if not, push a new object to the database
  }
  
  var time = 120000;
  // after the time expires, call checkScores
  setTimeout(checkScores, time);
  
  
  // pseudocode
  
  // function def 
  // set up variables
  // access db and look for username
  // if there is a username, get the high score 
  // if there isn't, then set the current score as the high score
  // if the username was found, check to see if the current score is larger than the high score
  // if the current score is greater than the high score, update the db with the new high score
