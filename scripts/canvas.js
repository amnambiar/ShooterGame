$(document).ready(function() {
    var ctx,
            canvas,
            imgBg, //main background
            imgSpaceship,
            imgBullet,
            shipX,
            shipY,
            bulletX = shipX + 32,
            bulletY = shipY - 30,
            noOfAliens, //number of aliens to appear on the screen
            fallingAliens = [],
            aliensKilledSpaceship = [], //aliens that have collided with the spaceship
            killedAliens = [], //aliens killed by bullet
            alienTimer, //to re-draw aliens
            bullets = [],
            lastFired = Date.now(),
            life,
            alienCount, //to distinguish each alien by and id
            firstBulletY, //the y-coordinate of the top-most fired bullet
            score;

    canvas = document.getElementById('canvas_region');
    document.addEventListener('keypress', doKeyDown, true); //set spaceship movements
    document.addEventListener('keyup', doKeyUp, true);
    ctx = canvas.getContext('2d');

    function initializeVariables() {
        shipX = 300;
        shipY = 400;
        noOfAliens = 5;
        fallingAliens = [];
        aliensKilledSpaceship = [];
        killedAliens = [];
        bullets = [];
        life = 10;
        alienCount = 0;
        firstBulletY = 395;
        score = 0;
    }

    function setAlienImage() {
        //fill canvas
        imgBg = new Image();
        imgBg.src = "images/space.jpg";
        imgSpaceship = new Image();
        imgSpaceship.src = "images/spaceship.png";
        imgBullet = new Image();
        imgBullet.src = "images/bullet.png";
        ctx.drawImage(imgBg, 0, 0); //drawMainBackground
        ctx.drawImage(imgSpaceship, shipX, shipY); //drawSpaceship
        for (var i = 0; i < noOfAliens; i++, alienCount++) {
            var fallingDr = new Object();
            fallingDr["image"] = new Image();
            fallingDr.image.src = 'images/alien.png';
            fallingDr["x"] = Math.random() * 600;
            fallingDr["y"] = Math.random() * 5;
            fallingDr["speed"] = 2 + Math.random() * 5;
            fallingDr["id"] = "alien" + alienCount;
            fallingAliens.push(fallingDr);
        }
    }

    function fillCanvas() {
        $("#life_value").text('10');
        $("#score_value").text('0');
        //draw falling aliens
        alienTimer = setInterval(drawAliens, 30);
        setAlienImage();
    }

    function drawBullets() { //draw firing bullets
        for (var i = 0; i < bullets.length; i++) {
            var bullet = bullets[i],
                    index = 0,
                    pos = 0,
                    timer = setInterval(function() { //move each bullet upwards
                        if (life > 0 && index <= 20) {
                            firstBulletY = bullet[1] -= 15;
                            ctx.drawImage(imgBullet, bullet[0], bullet[1]);
                            //check for collission with alien for each bullet
                            for (var j = 0; j < noOfAliens; j++) {
                                if (bullet[0] <= (fallingAliens[j].x + 35) &&
                                        (fallingAliens[j].x - 30) <= (bullet[0]) &&
                                        bullet[2] <= (fallingAliens[j].y + 35) &&
                                        (fallingAliens[j].y - 30) <= (bullet[2])) {
                                    pos = $.inArray(fallingAliens[j].id, killedAliens);
                                    if (pos === -1) {
                                        $("#alien_explosion")[0].play();
                                        killedAliens.push(fallingAliens[j].id);
                                        clearInterval(timer);
                                        fallingAliens[j].y = 510;
                                        score = score + 10;
                                        $("#score_value").text(score);
                                        break;
                                    } else {
                                    }
                                }
                            }
                            index++;
                        } else {
                            clearInterval(timer);
                        }
                    }, 100);
        }
    }

    function doKeyDown(e) {
        if (e.keyCode === 115 || e.keyCode === 83) { //right - S key
            if (shipX <= 600) {
                shipX = shipX + 10;
                bullets = [];
                ctx.drawImage(imgSpaceship, shipX, shipY);
            }
        }
        if (e.keyCode === 97 || e.keyCode === 65) { //left - A key
            if (shipX >= 0) {
                shipX = shipX - 10;
                bullets = [];
                ctx.drawImage(imgSpaceship, shipX, shipY);
            }
        }
        if (e.keyCode === 32) { //pressed space to fire bullets
            $("#bullet")[0].play();
            bulletX = shipX + 32;
            bulletY = shipY - 30;
            bullets.push([bulletX, bulletY, firstBulletY]);
            drawBullets();
        }
        lastFired = Date.now();
    }

    function doKeyUp() {
        if (Date.now() - lastFired > 200) {
            bullets = [];
        }
    }

    function drawAliens() {
        ctx.drawImage(imgBg, 0, 0); //drawMainBackground
        for (var i = 0; i < noOfAliens; i++) {
            ctx.drawImage(fallingAliens[i].image, fallingAliens[i].x, fallingAliens[i].y); //The rain drop
            fallingAliens[i].y += fallingAliens[i].speed; //set the falling speed
            if (fallingAliens[i].y > 500) { //repeat the raindrop when it falls out of view
                fallingAliens[i].y = -25; //account for the image size
                alienCount++;
                fallingAliens[i].id = "alien" + alienCount;
                fallingAliens[i].x = Math.random() * 600; //make it appear randomly along the width    
            }

            //game over case check
            if ((fallingAliens[i].x <= (shipX + 100) && fallingAliens[i].x >= (shipX - 27)) && (fallingAliens[i].y <= (shipY + 120) && fallingAliens[i].y >= (shipY - 10))) {
                var pos = $.inArray(fallingAliens[i].id, aliensKilledSpaceship);
                if (pos === -1) {
                    aliensKilledSpaceship.push(fallingAliens[i].id);
                    life--;
                    $("#life_value").text(life);
                    if (life <= 0) {
                        $("#spaceship_movement")[0].pause();
                        clearInterval(alienTimer);
                        document.removeEventListener('keypress', doKeyDown, true);
                        document.removeEventListener('keyup', doKeyUp, true);

                        //show restart and also remove canvas.
                        $("#result").show(1);
                        $("button.start_game").removeAttr("class").text("Restart").attr("class", "restart_game").css("display", "block");
                        $("button.restart_game").click(function() {
                            window.location.reload(true);
                        });
                    }
                } else {
                }
            }
        }
        ctx.drawImage(imgSpaceship, shipX, shipY); //drawSpaceShip above all aliens
    }

    $("button.start_game").on("click", function() {
        $("#spaceship_movement")[0].play();
        initializeVariables();
        fillCanvas();
        $("#score_text").css("display", "block");
        $("#result").hide(1);
        $("button").css("display", "none");
    });

    $("#spaceship_movement")[0].addEventListener("ended", function() {
        $("#spaceship_movement")[0].play();
    });
});