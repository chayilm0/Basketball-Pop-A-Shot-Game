const canvas = document.querySelector ('canvas')
const c = canvas.getContext('2d')

const countdownEl = document.getElementById('countdown')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startGameBtn = document.querySelector('#startGameBtn')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')


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

let particles = []

class Basket {
    constructor (w, h, color) {
        this.w = w
        this.h = h
        this.color = color
    }

    draw() {
        c.beginPath()
        c.rect( (canvas.width / 2) - (this.w / 2), (canvas.height / 2) - (this.h / 2), this.w, this.h);
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
    }
}



let basket = new Basket(125, 25, "blue")

let x = 10 + (Math.random() * canvas.width - 10)
let y = canvas.height / 1.15

const player = new Player (x, y, 40, 'rgb(200,90,0)')

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

const projectiles = []

const gravity = - 0.99

let animationID
let score = 0
let countdown = 30
let made_basket_dist = 6

function animate() {
    requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    basket.draw()
    projectiles.forEach((projectile, index) => {
        projectile.velocity.y -= gravity
        projectile.update()
    })
    player.draw()

    projectiles.forEach((projectile, projectileIndex) =>  {
            const dist = Math.hypot(projectile.x - canvas.width / 2, 
            projectile.y - canvas.height / 2 
            )

        //when projectiles hits top of basket
        if (dist - projectile.radius < made_basket_dist && projectile.velocity.y > 0 ) {
            console.log("basket made!")
            console.log(dist)
            console.log(projectile.velocity.y)

            //increase the score
            score += 2
            scoreEl.innerHTML = score


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
        }
    })
    particles.forEach ((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    });
}

//start of timer code
const timeH = document.querySelector('h1')
let timeSecond = 10

timeH.innerHTML = `00:${timeSecond}`

const countDown = setInterval (() => {
    timeSecond--
    displayTime(timeSecond)
    timeH.innerHTML = `00:${timeSecond}`
    if (timeSecond <= 9 || timeSecond < 1) {
        timeH.innerHTML = `00:0${timeSecond}`
    }
    if (timeSecond <= 0 || timeSecond < 1) {
        endTime()
        clearInterval(countDown)
    }
},1000)

function displayTime(second) {
    const min = Math.floor(second / 60)
    const sec = Math.floor(second % 60)
    timeH.innerHTML = `${min < 10 ? '0' : ''} ${min} : ${sec < 10 ? '0' : ''}${sec}`

}

function endTime() {
    timeH.innerHTML = 'TIME UP'
    cancelAnimationFrame(animationID)
    modalEl.style.display = 'flex'
}
//end of timer code

addEventListener('click', (event) => {

    const angle = Math.atan2(
        event.clientY - canvas.height / 1.15,
        event.clientX - player.x
    )

    const velocity = {
        x: Math.cos(angle) * 35,
        y: Math.sin(angle) * 35
    }

    if (timeSecond <= 0 || timeSecond < 1) {
        endTime()
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


    let limit = 700
    let rando_position = (limit/2) + (Math.random() * (canvas.width - limit))

    player.x = rando_position
    player.update()
})

animate()