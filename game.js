var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var highScore = localStorage.getItem("highScore");
var score = 0;
var score_multiplier = 1;

var ukupno_enemies;

var pwups = [];

var magazine = 200;

var bullets = [];

let tasteri = {};
let fireInterval = null;
let fireRate = 20;//5

let mouse = {
    x: canvas.width / 2,
    y: canvas.height / 2
};

var InfinityInterval = null;
var ShieldInterval = null;

addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    //scopeDraw();
});

addEventListener("keydown", function (event) {
    tasteri[event.key] = true;
});

addEventListener("keyup", function (event) {
    tasteri[event.key] = false;
});

addEventListener("mousedown", startFire);
addEventListener("mouseup", stopFire);

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function scopeDraw() {
    context.fillStyle = "red";
    context.beginPath();
    context.arc(mouse.x, mouse.y, 5, 0, Math.PI * 2, false);
    context.fill();
    context.closePath();
    context.beginPath();
    context.arc(mouse.x, mouse.y, 25, 0, Math.PI * 2, false);
    context.lineWidth = 3;
    context.strokeStyle = "red";
    context.stroke();
    context.closePath();
    context.fillRect(mouse.x - 2, mouse.y - 35, 4, 20);
    context.fillRect(mouse.x - 2, mouse.y + 14, 4, 20);
    context.fillRect(mouse.x - 35, mouse.y - 2, 20, 4);
    context.fillRect(mouse.x + 14, mouse.y - 2, 20, 4);
}

function startFire() {

    shoot();
    fireInterval = setInterval(shoot, 1000 / fireRate);
}

function stopFire() {
    clearInterval(fireInterval);
}


const PowerType = {
    LIFE: { color: "green", symbol: "❤️" },
    PLUS_50: { color: "blue", symbol: "+50" },
    PLUS_40: { color: "aquamarine", symbol: "+40" },
    PLUS_30: { color: "cyan", symbol: "+30" },
    INFINITY: { color: "blueviolet", symbol: "∞" },
    SHIELD: { color: "crimson", symbol: "🛡️" }
}
const pwup_chance = 0.1;


class Igrac {
    constructor() {
        this.pwupShield = false;
        this.pwupInfinity = false;
        this.r = 25;
        this.x = (canvas.width - this.r) / 2;
        this.y = (canvas.height - this.r) / 2;
        this.boja = "white";
        this.health = 2;
        this.dx = 4;
        this.dy = 3;
    }
    draw() {
        context.fillStyle = this.boja;
        if (this.pwupInfinity) { context.fillStyle = PowerType.INFINITY.color }
        if (this.pwupShield) { context.fillStyle = PowerType.SHIELD.color }

        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
    }

    Provera(desno, levo, gore, dole) {
        if (desno) {
            if (this.x + this.dx + this.r >= canvas.width)
                return false;
        }
        if (levo) {
            if (this.x - this.dx - this.r < 0)
                return false;
        }
        if (dole) {
            if (this.y + this.dy + this.r >= canvas.height)
                return false;
        }
        if (gore) {
            if (this.y - this.dy - this.r < 0)
                return false;
        }
        return true;
    }

    Dupla(desno, levo, gore, dole) {
        if (gore && levo) {
            if (this.y - this.dy - this.r < 0 && this.x - this.dx - this.r < 0) {
                return false;
            }
            else {
                if (this.x - this.dx - this.r < 0) {
                    this.y -= this.dy;
                }
                if (this.y - this.dy - this.r < 0) {
                    this.x -= this.dx;
                    return true;
                }
            }

        }
        if (gore && desno) {
            if (this.y - this.dy - this.r < 0 && this.x + this.dx + this.r >= canvas.width) {
                return false;
            }
            else {
                if (this.x + this.dx + this.r >= canvas.width) {
                    this.y -= this.dy;
                }
                if (this.y - this.dy - this.r < 0) {
                    this.x += this.dx;
                    return true;
                }
            }

        }
        if (dole && desno) {
            if (this.y + this.dy + this.r >= canvas.height && this.x + this.dx + this.r >= canvas.width) {
                return false;
            }
            else {
                if (this.x + this.dx + this.r >= canvas.width) {
                    this.y += this.dy;
                }
                if (this.y + this.dy + this.r >= canvas.height) {
                    this.x += this.dx;
                    return true;
                }
            }

        }
        if (dole && levo) {
            if (this.y + this.dy + this.r >= canvas.height && this.x - this.dx - this.r < 0) {
                return false;
            }
            else {
                if (this.x - this.dx - this.r < 0) {
                    this.y += this.dy;
                }
                if (this.y + this.dy + this.r >= canvas.height) {
                    this.x -= this.dx;
                    return true;
                }
            }

        }
    }

    Pomeri() {
        if (tasteri['w'] && tasteri['d']) {
            if (!this.Dupla(true, false, true, false))
                if (this.Provera(true, false, true, false)) {
                    this.x += this.dx;
                    this.y -= this.dy;
                }
        }
        else {
            if (tasteri['w'] && tasteri['a']) {
                if (!this.Dupla(false, true, true, false))
                    if (this.Provera(false, true, true, false)) {
                        this.x -= this.dx;
                        this.y -= this.dy;
                    }
            }
            else {
                if (tasteri['s'] && tasteri['a']) {
                    if (!this.Dupla(false, true, false, true))
                        if (this.Provera(false, true, false, true)) {
                            this.x -= this.dx;
                            this.y += this.dy;
                        }
                }
                else {
                    if (tasteri['s'] && tasteri['d']) {
                        if (!this.Dupla(true, false, false, true))
                            if (this.Provera(true, false, false, true)) {
                                this.x += this.dx;
                                this.y += this.dy;
                            }
                    }
                    else {
                        if (tasteri['s']) {
                            if (this.Provera(false, false, false, true))
                                this.y += this.dy;
                        }
                        else {
                            if (tasteri['w']) {
                                if (this.Provera(false, false, true, false))
                                    this.y -= this.dy;
                            }
                            else {
                                if (tasteri['a']) {
                                    if (this.Provera(false, true, false, false))
                                        this.x -= this.dx;
                                }
                                else {
                                    if (tasteri['d']) {
                                        if (this.Provera(true, false, false, false))
                                            this.x += this.dx;
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }
        this.draw();
    }
    update() {
        this.draw();
    }

    kraj() {
        this.boja = "red";
        this.dx = 0;
        this.dy = 0;
        //GameOver(igrac,talas);
    }

    pogodjen() {
        this.health--;
        this.restart();
        if (this.health == 0)
            GameOver()
        //this.kraj();
    }

    restart() {
        this.x = (canvas.width - this.r) / 2;
        this.y = (canvas.height - this.r) / 2;
    }

};
var gOver = false;
function GameOver() {
    igrac = null;
    talas = null;
    gOver = true;
    clearInterval(interval1);
    clearInterval(interval2);
    context.font = "80px Arial";
    context.textAlign = "center";
    context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
}

var igrac = new Igrac();

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.boja = "yellow";
        this.r = 5;
        this.dx = 0;
        this.dy = 0;
    }
    draw() {
        context.fillStyle = this.boja;
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
    }
};

class Enemy {
    constructor(x, y, r, health) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.boja = "orange";
        this.health = health;
        switch (this.health) {
            case 3:
                this.boja = "darkgray";
                break;
            case 2:
                this.boja = "darkred";
                break;
            case 1:
                this.boja = "goldenrod";
                break;
        }
        this.drop = getRandomInt(4) == 3 ? true : false;
        this.dx = 0;
        this.dy = 0;
        this.destroyed = false;
    }
    draw() {
        context.fillStyle = this.boja;
        context.beginPath();
        context.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        context.fill();
        context.closePath();
    }

}

let waveInterval = null;

class Wave {
    constructor(brzina, player) {
        this.waveNumber = 1;
        this.enemies = [];
        this.brzina = brzina;
        this.brojac = 0;
        this.player = player;
        this.count_destroyed = 0;
        ukupno_enemies = 20;
    }

    makeEnemy() {
        let x, y, r, health;
        let tmp = getRandomInt(4) + 1;
        r = tmp * 5 + 5;
        health = getRandomInt(3) + 1;

        let br = getRandomInt(4);
        switch (br) {
            case 0:
                x = -r;
                y = Math.floor(Math.random() * (canvas.height - 2 * r)) + r;
                break;
            case 1:
                x = canvas.width + r;
                y = Math.floor(Math.random() * (canvas.height - 2 * r)) + r;
                break;
            case 2:
                x = Math.floor(Math.random() * (canvas.width - 2 * r)) + r;
                y = -r;
                break;
            case 3:
                x = Math.floor(Math.random() * (canvas.width - 2 * r)) + r;
                y = canvas.height + r;

        }
        let enemy = new Enemy(x, y, r, health);
        this.enemies.push(enemy);
    }

    drawWave() {
        this.moveEnemies();
        this.enemies.forEach(element => {
            if (!element.destroyed)
                element.draw();
        });
    }



    moveEnemies() {
        this.enemies.forEach(element => {
            let vel_x = this.player.x - element.x;
            let vel_y = this.player.y - element.y;

            let dist = Math.sqrt(vel_x * vel_x + vel_y * vel_y);
            element.dx = vel_x / dist;
            element.dy = vel_y / dist;

            element.dx *= this.brzina;
            element.dy *= this.brzina;

            element.x += element.dx;
            element.y += element.dy;

            let ex = this.player.x - element.x;
            let ey = this.player.y - element.y;

            if (Math.sqrt(ex * ex + ey * ey) < this.player.r + element.r) {
                this.kraj();
            }
        });
    }
    kraj() {
        this.enemies.forEach(element => {
            element.dx = 0;
            element.dy = 0;
            this.brojac = 21;
        });
    }

    ponovi() {
        this.enemies = [];
        this.brojac = 0;
        this.makeEnemy();
        //this.count_destroyed = 0;
        this.reinkarnacija();
    }
    reinkarnacija() {
        this.enemies.forEach(element => {
            element.destroyed = true;
        });
    }
    newLevel() {
        this.waveNumber++;
        this.brzina *= 1.2;
        if (this.brzina > 2)
            this.brzina = 1.8;
        fireRate *= 1.1;
        ukupno_enemies += 20;
    }
}

let talas = new Wave(0.5, igrac);



function shoot() {
    let bullet = new Bullet(igrac.x, igrac.y);

    let vel_x = mouse.x - bullet.x;
    let vel_y = mouse.y - bullet.y;
    let speed = 10;

    let dist = Math.sqrt(vel_x * vel_x + vel_y * vel_y);
    bullet.dx = vel_x / dist;
    bullet.dy = vel_y / dist;

    bullet.dx *= speed;
    bullet.dy *= speed;
    if (!igrac.pwupInfinity) {
        if (magazine != 0)
            magazine--;

    }
    if (magazine > 0) {
        bullets.push(bullet);
    }

}

function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        b.x += b.dx;
        b.y += b.dy;
    }
}

function drawBullets() {
    moveBullets();
    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        b.draw();
    }
}

function spawn() {
    talas.brojac++;

    if (talas.brojac == ukupno_enemies + 1) talas.brojac = ukupno_enemies;
    if (talas.brojac < ukupno_enemies) {
        talas.tmp = getRandomInt(3) + 1;
        talas.tmp = 300 + talas.tmp * 30;
        talas.makeEnemy();
    }
}

function Pogodjen() {
    talas.enemies.forEach(element => {
        if (!element.destroyed) {
            let vel_x = igrac.x - element.x;
            let vel_y = igrac.y - element.y;

            let dist = Math.sqrt(vel_x * vel_x + vel_y * vel_y);
            if (igrac.r + element.r > dist) {
                if (!igrac.pwupShield) {
                    igrac.pogodjen();
                    talas.ponovi();
                    return;
                }
            }
        }
    });
}

function changeColor(enemy) {
    switch (enemy.health) {
        case 3:
            enemy.boja = "darkgray";
            break;
        case 2:
            enemy.boja = "darkred";
            break;
        case 1:
            enemy.boja = "goldenrod";
            break;
    }
}

function hitEnemy() {
    for (let i = 0; i < bullets.length; i++) {
        let element = bullets[i];
        for (let j = 0; j < talas.enemies.length; j++) {

            const en = talas.enemies[j];
            if (!en.destroyed) {
                let vel_x = en.x - element.x;
                let vel_y = en.y - element.y;

                let dist = Math.sqrt(vel_x * vel_x + vel_y * vel_y);

                if (element.r + en.r > dist) {
                    bullets.splice(i, 1);
                    en.health--;
                    changeColor(en);



                    if (en.health == 0) {
                        en.destroyed = true;
                        talas.count_destroyed++;

                        if (talas.count_destroyed % 20 == 0)
                            score_multiplier += 0.3;

                        score += 10 * score_multiplier;

                        ukupno_enemies--;
                        if (Math.random() <= pwup_chance) {

                            let px = en.x;
                            let py = en.y;
                            let pSize = 20;
                            let pKeys = Object.keys(PowerType);
                            let pKey = pKeys[Math.floor(Math.random() * pKeys.length)];
                            pwups.push(new PowerUp(px, py, pSize, PowerType[pKey]));
                        }

                    }
                }
            }
        }
    }
}

function show_Magazine() {

    context.textAlign = "left";
    context.font = "40px Arial";
    context.fillText("Bullets: " + magazine, canvas.width - 240, 40);
    context.fillText("Lifes: " + igrac.health, canvas.width - 230, 80);

    context.font = "50px Arial";
    context.fillText("Score: " + score, canvas.width - 260, 120);

    context.textAlign = "center";
    context.font = "70px Arial";
    context.fillText("Wave: " + talas.waveNumber, canvas.width / 2, 70);
}

function PowerUp(x, y, size, type) {
    this.r = size;
    this.h = size;
    this.x = x;
    this.y = y;
    this.type = type;
}
function drawPowerUps() {
    context.lineWidth = 2;
    for (let pwup of pwups) {
        context.fillStyle = pwup.type.color;
        context.strokeStyle = pwup.type.color;
        context.beginPath();

        context.arc(pwup.x, pwup.y, pwup.r, 0, Math.PI * 2, false);

        context.stroke();

        context.font = "bold " + pwup.r + "px Arial";
        context.textAlign = "center";
        context.fillText(pwup.type.symbol, pwup.x, pwup.y + 8);
        context.closePath();
    }
}
function CatchPower() {
    for (let i = 0; i < pwups.length; i++) {
        const element = pwups[i];
        let distX = element.x - igrac.x;
        let distY = element.y - igrac.y;
        let dist = Math.sqrt(distX * distX + distY * distY);

        if (dist < igrac.r + element.r) {
            switch (element.type) {
                case PowerType.PLUS_50:
                    magazine += 50;
                    break;
                case PowerType.PLUS_40:
                    magazine += 40;
                    break;
                case PowerType.PLUS_30:
                    magazine += 30;
                    break;
                case PowerType.LIFE:
                    igrac.health++;
                    break;
                case PowerType.INFINITY:
                    igrac.pwupInfinity = true;
                    InfinityInterval = setInterval(infDuration, 1000);
                    break;
                case PowerType.SHIELD:
                    igrac.pwupShield = true;
                    ShieldInterval = setInterval(shieldDuration, 1000);
                    break;
            }
            pwups.splice(i, 1);
        }
    }
}

function HighScore() {
    if (highScore !== null) {
        if (score > highScore) {
            localStorage.setItem("highScore", score);
        }
    }
    else {
        localStorage.setItem("highScore", 0);
    }
    if (highScore < score) {
        highScore = score;
    }
    context.font = "50px Arial";
    context.fillText("High score " + highScore, canvas.width - 180, 170);
}

var shieldBrojac = 0;
function shieldDuration() {
    shieldBrojac++;
    if (shieldBrojac == 5) {
        shieldBrojac = 0;
        igrac.pwupShield = false;
        clearInterval(ShieldInterval);
    }
}

var infBrojac = 0;
function infDuration() {
    infBrojac++;
    if (infBrojac == 5) {
        infBrojac = 0;
        igrac.pwupInfinity = false;
        clearInterval(InfinityInterval);
    }
}

var newLvlIterval = null;
function NoviTalas() {
    talas.newLevel();
}

var interval2 = setInterval(NoviTalas, 10 * 1000);
function loop() {
    if (gOver)
        return;
    requestAnimationFrame(loop);

    context.clearRect(0, 0, canvas.width, canvas.height);
    igrac.Pomeri();
    talas.drawWave();
    hitEnemy();
    Pogodjen();
    drawBullets();
    scopeDraw();
    show_Magazine();
    drawPowerUps();
    CatchPower();
    HighScore();
}
spawn();
var interval1 = setInterval(spawn, talas.tmp);

loop();