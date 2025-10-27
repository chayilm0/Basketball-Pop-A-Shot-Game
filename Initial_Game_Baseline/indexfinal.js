// =============
// CANVAS SETUP
// =============
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

// ======================
// HTML ELEMENTS ELEMENTS
// ======================
const scoreEl = document.querySelector('#scoreEl')
const modalEl = document.querySelector('#modalEl')
const bigScoreEl = document.querySelector('#bigScoreEl')

// ===============
// GAME VARIABLES
// ===============
const friction = 0.99
const gravity = -0.99
let particles = []
let projectiles = []

let score = 0
let countdown = 30
let made_basket_dist = 6
let animationID

// Represents the player class
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
    }
}

// ===========================
// PROJECTILE CLASS
// ===========================
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
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

// Represents the particle class for the splash effect
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
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01
    }
}

//Represents the basket class the player/ basketball will be aiming for
class Basket {
    constructor(w, h, color) {
        this.w = w
        this.h = h
        this.color = color
    }

    draw() {
        c.beginPath()
        c.rect(
            (canvas.width / 2) - (this.w / 2),
            (canvas.height / 2) - (this.h / 2),
            this.w,
            this.h
        )
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
    }
}

// ===========================
// INITIAL OBJECTS
// ===========================
let basket = new Basket(125, 25, "blue")

// random starting x for player, but set y
let x = 10 + (Math.random() * canvas.width - 10)
let y = canvas.height / 1.15
const player = new Player(x, y, 40, 'rgb(200,90,0)')

// template projectile (radius will decrease on click)
const projectile = new Projectile(
    canvas.width / 2,
    canvas.height / 1.15,
    5,
    'rgb(200,90,0)',
    { x: 1, y: 1 }
)

//Intended to loop through the animation for as long as the time is not 0
function animate() {
    animationID = requestAnimationFrame(animate)

    // Clear screen with slight fade for trail effect
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    basket.draw()

    // Update all projectiles
    projectiles.forEach((proj) => {
        proj.velocity.y -= gravity
        proj.update()
    })

    player.draw()

    // Collision detection for projectiles and basket
    projectiles.forEach((proj, index) => {
        const dist = Math.hypot(proj.x - canvas.width / 2, proj.y - canvas.height / 2)
        if (dist - proj.radius < made_basket_dist && proj.velocity.y > 0) {
            // Basket made
            score += 2
            scoreEl.innerHTML = score

            // Splash particles
            for (let i = 0; i < 20; i++) {
                particles.push(
                    new Particle(proj.x, proj.y, Math.random() * 5, "purple", {
                        x: (Math.random() - 0.5) * (Math.random() * 15),
                        y: (Math.random() - 1) * (Math.random() * 15)
                    })
                )
            }

            // Remove projectile
            projectiles.splice(index, 1)
        }
    })

    // Update particles
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
}

// Code related to the timer counting down
const timeH = document.querySelector('h1')
let timeSecond = 10
timeH.innerHTML = `00:${timeSecond}`

const countDown = setInterval(() => {
    timeSecond--
    displayTime(timeSecond)
    if (timeSecond <= 0) {
        endTime()
        clearInterval(countDown)
    }
}, 1000)

function displayTime(second) {
    const min = Math.floor(second / 60)
    const sec = Math.floor(second % 60)
    timeH.innerHTML = `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`
}

function endTime() {
    timeH.innerHTML = 'TIME UP'
    cancelAnimationFrame(animationID)
    modalEl.style.display = 'flex'
}

// Click event listener for the player to shoot when they click
addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 1.15,
        event.clientX - player.x
    )

    const velocity = {
        x: Math.cos(angle) * 35,
        y: Math.sin(angle) * 35
    }

    // Add projectile
    projectile.radius = 40
    projectiles.push(
        new Projectile(player.x, canvas.height / 1.15, projectile.radius - 5, 'rgb(200,90,0)', velocity)
    )

    // Move player randomly after shot
    const limit = 700
    const rando_position = (limit / 2) + (Math.random() * (canvas.width - limit))
    player.x = rando_position
    player.update()
})

//Animates the project
animate()
