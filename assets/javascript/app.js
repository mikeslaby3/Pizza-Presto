//========================================================//
//Global Variables
//========================================================//
var username = "";
var userScore = 0;
var difficulty = "";
var maxSeconds = 30;
var secondsRemaining;
var highScore = "";
var intervalTimer;
var timeWhenLastPizzaWasComplete = 120;
var database;

//Music
var introMusic = document.getElementById("introMusic");
var gameMusic = document.getElementById("gameMusic");
var scoreboardMusic = document.getElementById("scoreboardMusic");
var currentSong = "intro";
var currentSongForMutePurposes = introMusic;

var correctAnswer;
var questionIndex = 0;
var questionArray;
var answerArray = [];
var currentQuestion = {};
var questionDisplay = $("#question");
var answerDisplay1 = $("#answer1");
var answerDisplay2 = $("#answer2");
var answerDisplay3 = $("#answer3");
var answerDisplay4 = $("#answer4");

//====================================================//
// Chef Variables
//====================================================//
var chefDisapprovalDialogueOptions = [
  "Mamma mia...",
  "My goldfish can make better pizza",
  "Did you even eat spaghetti for breakfast?",
  "Cavolo! The customer is waiting...",
  "You microwave your pizza?",
  "You eat cereal, don't you?"
];
var chefGoodDialogue = [
  "Now, that is a pizza.",
  "Tastes like Mozarella to me!",
  "Maybe you're an Italian... Maybe",
  "Caesar would be proud",
  "When in Rome, do as the Romans do",
  "Ah, a fresh pizza makes me think of home"
];

//====================================================//
// Pizza Variables
//====================================================//
var currentPizzaOrder;
var possiblePizzas = [
  "pepperoni",
  "hawaiian",
  "margherita",
  "aifunghi",
  "seafood"
];
var ingredientCount = 0;

//========================================================//
// Main Run Through
//========================================================//
$(document).ready(function () {
  initializaFirebaseAndCheckForHighScores();
  // //============================//
  // // Initialize Firebase
  // //============================//
  // var config = {
  //   apiKey: "AIzaSyDd-uc53MHvSpaahIvBuYI2oAG22eZLkuw",
  //   authDomain: "pizza-presto-28c03.firebaseapp.com",
  //   databaseURL: "https://pizza-presto-28c03.firebaseio.com",
  //   projectId: "pizza-presto-28c03",
  //   storageBucket: "pizza-presto-28c03.appspot.com",
  //   messagingSenderId: "750779277139"
  // };
  // firebase.initializeApp(config);

  // var database = firebase.database();

  function startGameButtonClicked() {
    $(document).on("click", "#startGameButton", function (event) {
      startGameMusic();
      generateRandomPizzaOrder();
      displayPizzaOrder();

      secondsRemaining = maxSeconds;
      intervalTimer = setInterval(timerTick, 1000);
      triviaPull();
      // prevent page from refreshing when form tries to submit itself
      event.preventDefault();
      $("#settingsMenu").addClass("hide");
      $("#gameScreen").removeClass("hide");

      var name = $("#username").val().trim();
      username = name;

      //Either need to find the user through the array or create a counter
      // database.ref("/users").push({
      //   username: name
      // });

      //Makes the username for the Game Screen into the User's settings
      $("#username-display").text(name);

      // database.ref("/users").on("value", function (snapshot) {
      //   // Log everything that's coming out of snapshot
      //   console.log(snapshot.val());
      //   console.log(snapshot.val().username);

      //   // Capture user inputs and store them into variables
      //   $("#name-display").text(snapshot.val().username);
      // },
      //   function (errorObject) {
      //     console.log("Errors handled: " + errorObject.code);
      //   }
      // );
    });
  }

  //============================//
  //Materialize Animations
  //============================//
  $(".fixed-action-btn").floatingActionButton();
  $("select").formSelect(); //For the select difficulty dropdown
  $(document).ready(function () {
    $(".tooltipped").tooltip();
  });
  //============================//
  // Add Event Listeners
  //============================//
  playButtonClicked();
  startGameButtonClicked();
  addScoreboardButtonListeners();
  addAnswerButtonListeners();
  addMuteUnmuteButtonListeners();
  addListenerToTheBottomRightFloatingRestartButton();

  // //============================//
  // // Display Pizza
  // //============================//
  // generateRandomPizzaOrder();
  // displayPizzaOrder();
});

//========================================================//
// APIs
//========================================================//
//On the scoreboard page, the chef will say a random pizza joke
//on the bottom

function triviaPull() {
  difficulty = $("#difficulty")
    .val()
    .toLowerCase();
  var queryURL =
    "https://opentdb.com/api.php?amount=50&difficulty=" +
    difficulty +
    "&type=multiple";

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    questionArray = response.results;
    renderQuestion();
  });
}

function renderQuestion() {
  // Finds the HTML symbols in the questions/answers and replaces them with readable symbols
  function replaceWeirdSymbols(question) {
    return question
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&shy;/g, "")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&pi;/g, "π")
      .replace(/&ntilde;/g, "ñ")
      .replace(/&aacute;/g, "á")
      .replace(/&ouml;/g, "ö")
      .replace(/&amp;/g, "&")
      .replace(/&deg;/g, "°")
      .replace(/&rsquo;/g, '"');
  }

  // Grabs the first question out the API data and stores it in current question variable
  currentQuestion = questionArray[questionIndex];

  // Variable storing the trivia question
  var triviaQuestion = replaceWeirdSymbols(currentQuestion.question);

  // Variables storing the correct answer and three incorrect answers
  correctAnswer = replaceWeirdSymbols(currentQuestion.correct_answer);
  var incorrectAnswer1 = replaceWeirdSymbols(
    currentQuestion.incorrect_answers[0]
  );
  var incorrectAnswer2 = replaceWeirdSymbols(
    currentQuestion.incorrect_answers[1]
  );
  var incorrectAnswer3 = replaceWeirdSymbols(
    currentQuestion.incorrect_answers[2]
  );

  // Array with multiple choice answers
  answerArray = [
    incorrectAnswer1,
    incorrectAnswer2,
    incorrectAnswer3,
    correctAnswer
  ];

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

function finishedPizzaBounceOutAnimation() {
  let timeItTookToCompletePizza = timeWhenLastPizzaWasComplete - secondsRemaining;
  let bonus = 1;
  if ( currentPizzaOrder != 'pepperoni' ) {
    if (timeItTookToCompletePizza < 15) {
      bonus = 1.55;
    } else if (timeItTookToCompletePizza < 30) {
      bonus = 1.25;
    } 
  }
  timeWhenLastPizzaWasComplete = secondsRemaining;
  if (difficulty === "easy") {
    userScore += 100 * bonus;
  } else if (difficulty === "medium") {
    userScore += 200 * bonus;
  } else {
    userScore += 300 * bonus;
  }

  setTimeout(function () {
    $("#pizza").addClass("animated bounceOutUp 2s");
    // $('#pizza').addClass('animated bounceOutUp 3s');
  }, 1000);

  setTimeout(function () {
    $("#pizza").removeClass("animated bounceOutUp 3s");
    $("#pizza").attr("src", "./assets/images/blankPizza.png");
    ingredientCount = 0;

    generateRandomPizzaOrder();
    displayPizzaOrder();
  }, 2000);
}

// Finds the HTML symbols in the questions/answers and replaces them with readable symbols
function replaceWeirdSymbols(question) {
  return question
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&shy;/g, "")
    .replace(/&rdquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, "&");
}

//=======================================================================================//
//Joke API
//=======================================================================================//
function joke() {
  var queryURL = "https://official-joke-api.appspot.com/random_joke";

  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {
    console.log(response);
    console.log(response.setup);
    $("#scoreboardDialogue").text(response.setup);
    setTimeout(function () {
      $("#scoreboardDialogue").text(response.punchline);
    }, 5000);
    setTimeout(function () {
      $("#scoreboardDialogue").text("Let's play again?");
      $("#scoreboardChef").attr("src", "./assets/images/chef_neutral.png");
    }, 10000);
  });
}

//========================================================================================================//
// Chef Animations
//========================================================================================================//
function chefDisapproval() {
  $("#dialogue").text(
    chefDisapprovalDialogueOptions[
    Math.floor(Math.random() * chefDisapprovalDialogueOptions.length)
    ]
  );
  $("#chef").attr("src", "./assets/images/chefwrong1.png");
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
  $("#dialogue").text(
    chefGoodDialogue[Math.floor(Math.random() * chefGoodDialogue.length)]
  );
  $("#chef").attr("src", "./assets/images/happyChefwPizza.png");
}

//========================================================================================================//
// Pizza Functions
//========================================================================================================//
//====================================================//
// Choose a random pizza
//====================================================//
function generateRandomPizzaOrder() {
  currentPizzaOrder = possiblePizzas[Math.floor(Math.random() * 5)];
}

//====================================================//
// Display the Pizza Order
//====================================================//
function displayPizzaOrder() {
  let index = possiblePizzas.indexOf(currentPizzaOrder);
  if (index === 0) {
    $("#pizzaOrder").attr(
      "src",
      "./assets/images/pizzas/pizzaOrders/pizzaOrder1.png"
    );
  } else if (index === 1) {
    $("#pizzaOrder").attr(
      "src",
      "./assets/images/pizzas/pizzaOrders/pizzaOrder2.png"
    );
  } else if (index === 2) {
    $("#pizzaOrder").attr(
      "src",
      "./assets/images/pizzas/pizzaOrders/pizzaOrder3.png"
    );
  } else if (index === 3) {
    $("#pizzaOrder").attr(
      "src",
      "./assets/images/pizzas/pizzaOrders/pizzaOrder4.png"
    );
  } else {
    $("#pizzaOrder").attr(
      "src",
      "./assets/images/pizzas/pizzaOrders/pizzaOrder5.png"
    );
  }
}

//=======================================================================================//
// Screen Changes
//=======================================================================================//

//Adds an event listener to the play button, which brings us to the next screen
function playButtonClicked() {
  $(document).on("click", "#playButton", function () {
    $("#menuScreen").addClass("hide");
    $("#settingsMenu").removeClass("hide");
  });
}

function gameOver() {
  stopTimer();
  startScoreboardMusic();
  checkIfUserBeatTheHighScore();
  $("#name2").text(username);
  $("#score2").text(userScore);
  $("#gameScreen").addClass("hide");
  $("#scoreboardScreen").removeClass("hide");
  joke();
}

// where function used to be

//Shows the scoreBoard, gives the user the option to replay the game,
//or choose a new topic
function addScoreboardButtonListeners() {
  replayChangeToSettingScreen();
}

function addMuteUnmuteButtonListeners() {
  $(document).on('click', '#muteButton', function () {
    console.log(currentSongForMutePurposes);
    currentSongForMutePurposes.muted = true;
    $('#muteButton').addClass('hide');
    $('#unmuteButton').removeClass('hide');
  });

  $(document).on('click', '#unmuteButton', function () {
    currentSongForMutePurposes.muted = false;
    $('#unmuteButton').addClass('hide');
    $('#muteButton').removeClass('hide');
  });
}

function addListenerToTheBottomRightFloatingRestartButton() {
  $(document).on('click', '#replayButtonFAB', function () {
    location.reload();
  });
}


function addAnswerButtonListeners() {
  $(document).on("click", ".answer-button", function () {
    console.log("hi");
    if ($(this).text() === correctAnswer) {
      if (currentPizzaOrder === "pepperoni") {
        ingredientCount++;
        $("#pizza").attr("src", "./assets/images/pizzas/pizzaOrders/pizzaOrder1.png"
        );
        finishedPizzaBounceOutAnimation();
      } else if (currentPizzaOrder === "margherita") {
        ingredientCount++;
        $("#pizza").attr("src", "./assets/images/pizzas/margheritapizza" + ingredientCount + ".png"
        );
        if (ingredientCount == 2) {
          finishedPizzaBounceOutAnimation();
        }
      } else if (currentPizzaOrder === "hawaiian") {
        ingredientCount++;
        $("#pizza").attr("src", "./assets/images/pizzas/hawaiianpizza" + ingredientCount + ".png"
        );
        if (ingredientCount == 3) {
          finishedPizzaBounceOutAnimation();
        }
      } else if (currentPizzaOrder === "aifunghi") {
        ingredientCount++;
        $("#pizza").attr("src", "./assets/images/pizzas/aifunghi" + ingredientCount + ".png"
        );
        if (ingredientCount == 4) {
          finishedPizzaBounceOutAnimation();
        }
      } else {
        ingredientCount++;
        $("#pizza").attr( "src", "./assets/images/pizzas/seafoodpizza" + ingredientCount + ".png"
        );
        if (ingredientCount == 5) {
          finishedPizzaBounceOutAnimation();
        }
      }
      chefApproval();
    } else {
      chefDisapproval();
    }
    $("#score").text(userScore);
    nextQuestion();
  });
}

function replayChangeToSettingScreen() {
  $(document).on("click", "#replayButton", function () {
    startIntroMusic();
    $("#scoreboardScreen").addClass("hide");
    $("#settingsMenu").removeClass("hide");
    $("#score").text("0");
    $("#scoreboardChef").attr("src", "./assets/images/happyChefwPizza.png");
    userScore = 0;
    $("#pizza").attr("src", "./assets/images/blankPizza.png");
    ingredientCount = 0;

    generateRandomPizzaOrder();
    displayPizzaOrder();
  });
}

//=======================================================================================//
// Timer
//=======================================================================================//
function timeConverter(timeInSeconds) {
  var minutes = Math.floor(timeInSeconds / 60);
  var seconds = timeInSeconds - minutes * 60;

  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  if (minutes === 0) {
    minutes = "00";
  } else if (minutes < 10) {
    minutes = "0" + minutes;
  }

  return minutes + ":" + seconds;
}

function timerTick() {
  secondsRemaining -= 1;
  updateTimerDisplay();
  if (secondsRemaining <= 0) {
    gameOver();
  }
}

function stopTimer() {
  clearInterval(intervalTimer);
}

function updateTimerDisplay() {
  $("#time").text(timeConverter(secondsRemaining));
}

function timer() {
  var time = 120;

  timerTickID = setInterval(function () {
    time--;
    timeConverter(time);
  }, 1000);

  triviaPull();

  setTimeout(function () {
    $("#gameScreen").addClass("hide");
    $("#scoreboardScreen").removeClass("hide");
    // $('.modal').modal();
    // $('#modal1').modal('open');
    clearInterval(timerTickID);
  }, 3 * 1000);
}
//=======================================================================================//
// Music
//=======================================================================================//
function startIntroMusic() {
  if (currentSong == "game") {
    gameMusic.pause();
  } else if (currentSong == "scoreboard") {
    scoreboardMusic.pause();
  }
  currentSong = "intro";
  currentSongForMutePurposes = introMusic;
  introMusic.currentTime = 0;
  introMusic.play();
}

function startGameMusic() {
  if (currentSong == "intro") {
    introMusic.pause();
  } else if (currentSong == "scoreboard") {
    scoreboardMusic.pause();
  }
  currentSong = "game";
  currentSongForMutePurposes = gameMusic;
  gameMusic.currentTime = 0;
  gameMusic.play();
}

function startScoreboardMusic() {
  if (currentSong == "intro") {
    introMusic.pause();
  } else if (currentSong == "game") {
    gameMusic.pause();
  }
  currentSongForMutePurposes = scoreboardMusic;
  currentSong = "scoreboard";
  scoreboardMusic.currentTime = 0;
  scoreboardMusic.play();
}

//=======================================================================================//
// Firebase
//=======================================================================================//
//Updates High Scores to firebase
function checkScores() {
  // check if there's a high score in the database
  var highScore;
  var currentScore = $('#score').val();
  var currentUser = $('#username').val();

  database.ref('/scores').on('value', function () {
    // go through the array of scores, look for one with a username
    // {
    //   username: "bob",
    //   highScore: 14
    // }
    // if we find one, set highScore to compare later
    if (currentUser === snapshot.val()[0].username) {
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
  if (highScore) {
    if (currentScore > highScore) {
      // update the database with the new high score
      database.ref('/score').set({
        userName: currentUser,
        highScore: currentScore
      })
    }
  }
  // if not, push a new object to the database
}

// // after the time expires, call checkScores
// setTimeout(checkScores, time);

// pseudocode

// function def
// set up variables
// access db and look for username
// if there is a username, get the high score
// if there isn't, then set the current score as the high score
// if the username was found, check to see if the current score is larger than the high score
// if the current score is greater than the high score, update the db with the new high score

function initializaFirebaseAndCheckForHighScores() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCwUmc_twZWmStRkiWZ8zuSjc2dH_ccY1s",
    authDomain: "coderbay-c1c1a.firebaseapp.com",
    databaseURL: "https://coderbay-c1c1a.firebaseio.com",
    projectId: "coderbay-c1c1a",
    storageBucket: "coderbay-c1c1a.appspot.com",
    messagingSenderId: "33666931224"
  };
  firebase.initializeApp(config);

  // Create a variable to reference the database
  database = firebase.database();

  // Initial Values
  var highScore = 0;
  var highScoreUser = "No one";

  // --------------------------------------------------------------

  // At the initial load and subsequent value changes, get a snapshot of the stored data.
  // This function allows you to update your page in real-time when the firebase database changes.
  database.ref().on("value", function (snapshot) {

    // If Firebase has a highScore and highScoreUser stored, update our client-side variables
    if (snapshot.child("highScoreUser").exists() && snapshot.child("highScore").exists()) {
      // Set the variables for highScoreUser/highScore equal to the stored values.
      highScoreUser = snapshot.val().highScoreUser;
      highScore = parseInt(snapshot.val().highScore);
    }

    // If Firebase does not have highScore and highScoreUser values stored, they remain the same as the
    // values we set when we initialized the variables.
    // In either case, we want to log the values to console and display them on the page.
    console.log(highScoreUser);
    console.log(highScore);
    $("#name1").text(highScoreUser);
    $('#highScore').text(highScore)
    $("#score1").text(highScore);

    // If any errors are experienced, log them to console.
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });


}

function checkIfUserBeatTheHighScore() {
  if (userScore > highScore) {
    // Save the new price in Firebase. This will cause our "value" callback above to fire and update
    // the UI.
    database.ref().set({
      highScoreUser: username,
      highScore: userScore
    });

    // Log the new High Price
    console.log("New High Score!");
    console.log(username);
    console.log(userScore);
  } else {
    console.log('You did not beat the high score');
  }
}
