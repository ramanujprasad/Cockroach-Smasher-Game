var cockroachNumber = 5;
var levelOneScore = 0;
var speed = 4000;
var totalClicks = 0;
var screenHeight = $(window).height();
var timer = 0;
var timerInterval;
var alreadyVisited = true;
var loopEntered = true;

$(document).ready(function() {
    $(".container").css({
        "height": $(window).height()
    });
    var db = openDatabase('mydb', '1.0', 'Game DB', 2 * 1024 * 1024);
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS game (name , cockroach, time)');
    });
    $("body").click(function() {
        totalClicks++;
    });

    $(".playButton").click(function() {
        timer = 0;
        setTimeout(function() {
            totalClicks = 0;
        }, 5);
        hideHomeScreen();
        move();
        playTimer();
    });

    $("#gameRestart, .endGameRestart").click(function() {
        setTimeout(function() {
            totalClicks = 0;
        }, 5);
        cockroachNumber = 5;
        levelOneScore = 0;
        speed = 4000;
        timer = 0;
        $(".awardImage img").hide();
        $("#congrats").hide();
        alreadyVisited = true;
        loopEntered = true
        $(".image").stop();
        $(".image").parent().css({
            "top": "0%"
        });
        $("#score").html(0);
        $("[id *='aliveDiv']").each(function() {
            $(this).children().css({
                "top": "0%"
            });
        });
        $("[id *='aliveDiv']").show();
        $("#endCard").hide();
        move();
        playTimer();
    });

    $("#gameExit, .endGameExit").click(function() {
        location.reload();
    });

    $("[id *='aliveDiv']").click(function(element) {

        $(this).children().stop();

        levelOneScore++;
        speed = speed - 50;
        var xPosition = element.pageX - 35;
        var yPosition = element.pageY - 30;

        $("#deadDiv").css({
            "padding-left": xPosition + "px",
            "padding-top": yPosition + "px"
        });
        $("#deadDiv").show();

        setTimeout(function() {
            $("#deadDiv").hide();
        }, 1000);

        $("#score").html(levelOneScore);


        if (cockroachNumber > 25) {
            $(this).hide();
            showEndCard();
        }
    });

});

function move() {
    animateImage(0);
    animateImage(1);
    animateImage(2);
    animateImage(3);
}

function hideHomeScreen() {
    $("#mainDivId").removeClass("mainScreen");
    $("#mainDivId").addClass("mainDiv");
    $("#homeScreenPlay").hide();
    $(".homeScreenName").hide();
    $(".bottomFameOptionsDiv").show();
    $("[id *='aliveDiv']").show();
}

function animateImage(cockroachID) {
    $(".container").css({
        "height": screenHeight
    });
    $img = $(".image" + cockroachID);
    var i = new Image();
    i.src = $img.attr('src');

    $img.animate({
        top: ($(window).height() - 210)
    }, speed, 'linear');

    $(".image" + cockroachID).promise().done(function() {

        if ($(".image" + cockroachID).position().top >= (-210) && cockroachNumber <= 25) {
            cockroachNumber++;
            $(".image" + cockroachID).css({
                "top": "0%"
            });
            speed = speed - 100;
            animateImage(cockroachID);
        } else if (cockroachNumber > 25) {
            $(".image" + cockroachID).parent().hide();
            showEndCard();
        }
    });
}

function showEndCard() {

    var gameOver = true;
    $("[id *='aliveDiv']").each(function() {
        if ($(this).css("display") !== "none") {
            gameOver = false;
            return gameOver;
        }
    });
    var endCardTime = 0;
    if ($($("#deadDiv")).css("display") !== "none") {
        endCardTime = 1001;
    }
    setTimeout(function() {
        var accuracy = 0;
        if (levelOneScore > 0) {
            accuracy = parseInt((100 / (totalClicks / levelOneScore).toString().replace(".", "")));
        }
        if (gameOver && alreadyVisited) {
            alreadyVisited = false;
            $("#endCard").show();
            $("#hitsValue").html(levelOneScore);
            if (levelOneScore === 0) {
                $("#missesValue").html(25);
            } else {
                $("#missesValue").html(25 - levelOneScore);
            }
            $("#accuracyValue").html((accuracy) + " %");
            clearInterval(timerInterval);
            $("#timeValue").html(($("#level").html()) + " Sec");

            var db = openDatabase('mydb', '1.0', 'Game DB', 2 * 1024 * 1024);
            var timeDbValue = $("#level").html();
            db.transaction(function(tx) {

                var insertValues = "INSERT INTO game VALUES ('guest', \'" + levelOneScore + "\', \'" + timeDbValue + "\')";
                tx.executeSql(insertValues);
            });
            db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM game where name=? ORDER BY CAST(cockroach AS int)DESC, CAST(time AS int)", ["guest"], function(tx, results) {
                    for (var i = 0; i < 5; i++) {
                        $("#tscore" + i).html(results.rows.item(i).cockroach);
                        $("#time" + i).html(results.rows.item(i).time);
                    }
                });
            });
            db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM game where cockroach=\'" + levelOneScore + "\', time=\'" + timeDbValue + "\'", [], function(tx, results) {
                    alert(results.rows.item(0));


                });
            });

        }

    }, endCardTime);
    setTimeout(function() {
        if (loopEntered) {
            $("[id *='tscore']").each(function() {
                var id = $(this).attr("id").replace(/\D/g, '');
                if (($(this).html() !== "") && ($("#time" + id).html() !== "")) {
                    if (($(this).html()) === ($("#hitsValue").html())) {
                        if (($("#time" + id).html()) === ($("#timeValue").html().replace(/\D/g, ''))) {
                            $("#userRank").html(++id);
                            $("#congrats").show();

                            loopEntered = false;
                            return false;
                        }
                    }

                }
            });
        }
        if ($("#userRank").html() === "") {
            $("#userRank").html(8);
        }
    }, 3000);

}

function playTimer() {
    timerInterval = setInterval(function() {

        $("#level").html(++timer);

    }, 1000);
}