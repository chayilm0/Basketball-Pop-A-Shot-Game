const canvas = document.querySelector ('canvas')
const c = canvas.getContext('2d')

const countdownEl = document.getElementById('countdown')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')
const startBonusBtn = document.querySelector('#startBonusBtn')
startBonusBtn.style.display = 'none'

class Player {
    constructor (x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
    }

}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Particle {
    constructor(x, y, radius, color, velocity) {

        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

class Basket {
    constructor (w, h, color) {
        this.w = w
        this.h = h
        this.color = color
    }

    draw() {
        c.beginPath()
        c.rect( (canvas.width / 2) - (this.w / 2), (canvas.height / 3.2) - (this.h / 2), this.w, this.h);
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
    }
}

class Backboard {
    constructor (w, h, color) {
        this.w = w
        this.h = h
        this.color = color
    }

    draw() {
        c.beginPath()
        c.rect( (canvas.width / 2) - (this.w / 2), (canvas.height / 3.2) - (this.h / 1.5), this.w, this.h);
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
    }
}

let particles = []

let basket = new Basket(125, 25, "red")
let backboard = new Backboard (250, 150, "white")

let x = 10 + (Math.random() * canvas.width - 10)
let y = canvas.height / 1.15

let player = new Player (x, y, 40, 'rgb(200,90,0)')

const friction = .99


const projectile = new Projectile(
    canvas.width / 2, 
    canvas.height / 1.15, 
    5, 
    'rgb(200,90,0)', 
    {
        x: 1, 
        y: 1
    }
)

function init() {
    player = new Player (x, y, 40, 'rgb(200,90,0)')
    basket = new Basket(125, 25, "red")
    backboard = new Backboard (250, 150, "white")
    projectiles = []
    particles = []
    timeSecond = 20
    score = 0
    bonus = 0        
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
    timeH.innerHTML = `00:${timeSecond}`
    timer = setInterval("countDown()", 1000)
}

let endTurn = 0

function initBonus(){
    player = new Player (x, y, 40, 'rgb(200,90,0)')
    basket = new Basket(125, 25, "red")
    backboard = new Backboard (250, 150, "white")
    projectiles = []
    particles = []
    timeSecond = 10
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score
    timeH.innerHTML = `00:${timeSecond}`
    timer = setInterval("countDown()", 1000)
    endTurn = 1
}

let projectiles = []

const gravity = - 1.05

let animationID
let score = 0
let made_basket_dist = 4

//start of timer code
const timeH = document.querySelector('h1')
let timeSecond = 20

timeH.innerHTML = `00:${timeSecond}`

function countDown() {
    timeSecond--
    displayTime(timeSecond)
    timeH.innerHTML = `00:${timeSecond}`
    if (timeSecond <= 9 || timeSecond < 1) {
        timeH.innerHTML = `00:0${timeSecond}`
    }
    if (timeSecond <= 0 || timeSecond < 1) {
        endTime()
        clearInterval(timer)
    }
}

function displayTime(second) {
    const min = Math.floor(second / 60)
    const sec = Math.floor(second % 60)
    timeH.innerHTML = `${min < 10 ? '0' : ''} ${min} : ${sec < 10 ? '0' : ''}${sec}`

}

function endTime() {
    cancelAnimationFrame(animationID)
    timeH.innerHTML = 'TIME UP'
    //cancelAnimationFrame(animationID)
    modalEl.style.display = 'flex'
    bigScoreEl.innerHTML = score
}
//end of timer code

let start = 0
let bonus = 0

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    backboard.draw()
    basket.draw()
    projectiles.forEach((projectile, index) => {
        projectile.velocity.y -= gravity
        projectile.update()
    })
    player.draw()

    projectiles.forEach((projectile, projectileIndex) =>  {
            const dist = Math.hypot(projectile.x - canvas.width / 2, 
            projectile.y - canvas.height / 3.2
            )

        //when projectiles hits top of basket
        if (dist - projectile.radius < made_basket_dist && projectile.velocity.y > 0 ) {
            console.log("basket made!")
            //console.log(dist)
            console.log(projectile.velocity.y)

            //increase the score
            if(bonus == 0){
                score += 2
                scoreEl.innerHTML = score
            }
            else if(bonus == 1){
                score += 3
                scoreEl.innerHTML = score
            }


            //splash effect on made basket
            for (let i = 0; i < 20; i++) {
                particles.push(
                    new Particle(projectile.x, 
                        projectile.y, 
                        Math.random() * 5 , 
                        "purple", 
                        {
                        x: (Math.random() - .5) * (Math.random() * 15), 
                        y: (Math.random() - 1) * (Math.random() * 15)
                    })
                    )
            }

            projectiles.splice(projectileIndex, 1)
        }else{
            console.log("basket miss!")
        }
    })
    particles.forEach ((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    });

    if (timeSecond <= 0 || timeSecond < 1) {
        endTime()
    }
}

addEventListener('click', (event) => {
    if ((start == 1) || (bonus == 1)) {

        const angle = Math.atan2(
            event.clientY - canvas.height / 1.15,
            event.clientX - player.x
        )

        const velocity = {
            x: Math.cos(angle) * 35,
            y: Math.sin(angle) * 35
        }

        if ((timeSecond <= 0 || timeSecond < 1) && ((bonus == 1) || (start == 1))) {
            endTime()
            cancelAnimationFrame()
            clearInterval(countDown)
        }

        projectile.radius = 40

        projectiles.push(
            new Projectile(
                player.x, 
                canvas.height / 1.15, 
                projectile.radius -= 5, 
                'rgb(200,90,0)',
                velocity 
            )
        )


        let limit = 900
        let rando_position = (limit/2) + (Math.random() * (canvas.width - limit))

        player.x = rando_position
        player.update()

        if ((score > 8) && (endTurn == 0)){
            startGameBtn.style.display = 'none'
            startBonusBtn.style.display = 'block'
        } 
        else if(endTurn == 1){
            startGameBtn.style.display = 'block'
            startBonusBtn.style.display = 'none'
        }
    }
})

startGameBtn.addEventListener('click', () => {
    start = 1
    init()
    modalEl.style.display = 'none'
})

startBonusBtn.addEventListener('click', () => {
    bonus = 1
    initBonus()
    modalEl.style.display = 'none'
})

animate()


//TODO:
// Figuring out how to move the backboard and basket side to side during the bonus 
// and adjust the requirements for a made basket and the splash effect for the bonus 
// round accordingly. I also want the basket to change through a bunch of colors
//  at random when the bonus round is reached .