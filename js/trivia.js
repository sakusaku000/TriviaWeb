// Trivia Web 3

// Data
var APIToken;
var currQuestion = 0;
var currQuestionName;
var currQuestionCorrAnswer;
var currQuestionAnswers;
var currQuestionCategory;
var currQuestionDifficulty;
var totalCorr = 0;
var timer = 0;
var timerInt;

$(document).ready(function() {
    $.ajax({
        url:"https://opentdb.com/api_token.php?command=request",
        responseType:"application/json",
        success:function(res) {
            APIToken = res.token;
            return TitleScreen();
        },
        error:function(res) {
            return ErrorScreen("There was an error with the API, please refresh.");
        }
    })
});

// -- Reusable
// Animate in screen
function ShowScreen() {
    $("#appCnt").show(); $("#appCnt").addClass("appear");
    setTimeout(function() { $("#appCnt").removeClass("appear"); }, 500);
};

// Clear the screen
function ClearScreen() {
    $("#appCnt").addClass("disappear");
    setTimeout(function() { $("#appCnt").removeClass("disappear"); $("#appCnt").hide(); }, 500);
};

// Load
function ShowLoading() {
    $("#load").show(); $("#load").addClass("loadAppear");
    setTimeout(function() { $("#load").removeClass("loadAppear"); }, 300);
};
function HideLoading() {
    $("#load").addClass("loadDisappear");
    setTimeout(function() { $("#load").removeClass("loadDisappear"); $("#load").hide(); }, 300);
};

// -- Sounds
var click = new Howl({src:["/sounds/progress.wav"]});
var correctSound = new Howl({src:["/sounds/correct.wav"]});
var incorrectSound = new Howl({src:["/sounds/incorrect.wav"]})
// -- Sounds

// Timer
function StartTimer() {
    timerInt = setInterval(function() {
        timer += 1;
        if (timer > 9) {
            clearInterval(timerInt);
            return Timeout();
        }
    }, 1000)
};

// -- Pages
// Error Screen;
function ErrorScreen(text) {
    $("#appCnt").empty();
    $("#appCnt").append(`\
        <div>\
            <h1>${text}</h1>\
        </div>\
    `)
    ShowScreen();
};

// Title Screen
function TitleScreen() {
    $("#appCnt").empty();
    $("#appCnt").append(`\
        <div>\
            <div style="margin-bottom:20px;">\
                <h1><b>Trivia Web</b></h1>\
                <h5>By Saku ♡</h5>\
            </div>\
            <div class="mainBtn" onclick="StartGame()"><span>Play Game</span></div><br>\
            <div style="margin-top:20px;">Questions grabbed from <a href="https://opentdb.com" target="_blank">OpenTDB</a> by PixelTail Games under <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">Creative Commons Attribution-ShareAlike 4.0 International License</a></span>\
        </div>\
    `);
    ShowScreen();
};

// Start game
function StartGame() {
    click.play();
    currQuestion = 0;
    totalCorr = 0;
    ClearScreen()
    setTimeout(function() {
        ShowLoading();
        return pullQuestions();
    }, 500)
};

// Question Array
var questions = [];

// Pull questions from DB
function pullQuestions() {
    $.ajax({
        url:`https://opentdb.com/api.php?amount=5&type=multiple&token=${APIToken}`,
        responseType:"application/json",
        success:function(res) {
            questions = res.results;
            return GrabQuestion();
        },
        error:function() {
            return ErrorScreen("There was an error with the API, please refresh.");
        }
    });
};

// Obtain Question
function GrabQuestion() {
    currQuestion += 1;
    if (currQuestion > 5) return Results();
    timer = 0;
    currQuestionName = questions[currQuestion-1].question;
    currQuestionCategory = questions[currQuestion-1].category;
    currQuestionDifficulty = questions[currQuestion-1].difficulty;
    currQuestionCorrAnswer = questions[currQuestion-1].correct_answer;
    currQuestionAnswers = questions[currQuestion-1].incorrect_answers;
    currQuestionAnswers.push(questions[currQuestion-1].correct_answer); currQuestionAnswers = shuffle(currQuestionAnswers);
    setTimeout(function() {
        HideLoading();
        return DisplayQuestion();
    }, 500);
};

// Display Question
function DisplayQuestion() {
    $("#appCnt").empty();
    $("#appCnt").append(`\
        <div style="margin-bottom:15px;">\
            <h1 class="QuestionTitle"><b>Q${currQuestion}:</b> ${currQuestionName}</h1>\
            <h5 class="QuestionCateDiff"><b>Category:</b> ${currQuestionCategory} | <b>Difficulty:</b> ${currQuestionDifficulty}</h5>\
        </div>\
    `)
    $("#appCnt").append(`\
        <div class="answerBtn answerBtnA" onclick="Answer(0)"><span>${currQuestionAnswers[0]}</span></div><br>\
        <div class="answerBtn answerBtnB" onclick="Answer(1)"><span>${currQuestionAnswers[1]}</span></div><br>\
        <div class="answerBtn answerBtnC" onclick="Answer(2)"><span>${currQuestionAnswers[2]}</span></div><br>\
        <div class="answerBtn answerBtnD" onclick="Answer(3)"><span>${currQuestionAnswers[3]}</span></div><br>\
    `)
    $("#appCnt").append(`<div class="timerBar"></div>`)
    ShowScreen();
    StartTimer();
};

// Answer
function Answer(choice) {
    clearInterval(timerInt);
    if (currQuestionAnswers[choice] === currQuestionCorrAnswer) {
        return CorrectAnswerScreen();
    } else {
        return IncorrectAnswerScreen();
    };
};

// Correct Answer
function CorrectAnswerScreen() {
    totalCorr += 1; // Increase total points by 1
    correctSound.play(); // Play correct sound
    $(".timerBar").addClass("timerBarPause"); // Pause timer
    $("#appDisable").show(); // Disable screen
    $("#app").addClass("blur"); // Blur Screen
    $("body").addClass("CorrAnsBG"); // Correct answer BG
    $("#appOvrCnt").show(); // Show overlay
    $("#appOvrCnt").append(`<div class="CorrAns"><i class="fas fa-check-circle"></i></div>`) // Display tick
    setTimeout(function() {
        $("body").removeClass("CorrAnsBG");
        ClearScreen();
        setTimeout(function() {
            $("#appCnt").empty(); $("#app").removeClass("blur");
            $("#appOvrCnt").addClass("fadeout");
            setTimeout(function() {
                $("#appOvrCnt").empty().removeClass("fadeout").hide();
            }, 500);
            $("#appDisable").hide();
            GrabQuestion();
        }, 500);
    }, 2000);
};

// Incorrect Answer
function IncorrectAnswerScreen() {
    incorrectSound.play();
    $(".timerBar").addClass("timerBarPause");
    $("#appDisable").show();
    $("#app").addClass("blur");
    $("body").addClass("IncorrAnsBG");
    $("#appOvrCnt").show();
    $("#appOvrCnt").append(`<div class="CorrAns"><i class="fas fa-times-circle"></i></div>
    <div class="IncorrAnsTxt">The correct answer was ${currQuestionCorrAnswer}</div>`);
    setTimeout(function() {
        $("body").removeClass("IncorrAnsBG");
        ClearScreen();
        setTimeout(function() {
            $("#appCnt").empty(); $("#app").removeClass("blur");
            $("#appOvrCnt").addClass("fadeout");
            setTimeout(function() {
                $("#appOvrCnt").empty().removeClass("fadeout").hide();
            }, 500);
            $("#appDisable").hide();
            GrabQuestion();
        }, 500);
    }, 2000);
};

// Timeout
function Timeout() {
    incorrectSound.play();
    $(".timerBar").addClass("timerBarPause");
    $("#appDisable").show();
    $("#app").addClass("blur");
    $("body").addClass("IncorrAnsBG");
    $("#appOvrCnt").show();
    $("#appOvrCnt").append(`<div class="CorrAns"><i class="fas fa-clock"></i></div>
    <div class="IncorrAnsTxt">You timed out.<br>The correct answer was ${currQuestionCorrAnswer}</div>`);
    setTimeout(function() {
        $("body").removeClass("IncorrAnsBG");
        ClearScreen();
        setTimeout(function() {
            $("#appCnt").empty(); $("#app").removeClass("blur");
            $("#appOvrCnt").addClass("fadeout");
            setTimeout(function() {
                $("#appOvrCnt").empty().removeClass("fadeout").hide();
            }, 500);
            $("#appDisable").hide();
            GrabQuestion();
        }, 500);
    }, 2000);
};

// Results
function Results() {
    setTimeout(function() {
        $("#appCnt").empty();
        $("#appCnt").append(`
            <h1 style="margin-bottom:15px;"><b>You got ${totalCorr} out of 5</b></h1>
            <div class="mainBtn" onclick="StartGame()"><span>Play Again</span></div>\
        `)
        ShowScreen();
    }, 500)
};

// Shuffle
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}