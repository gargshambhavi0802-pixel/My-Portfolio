const title = document.getElementById("title");
const progress = document.getElementById("progress");
const percent = document.getElementById("percent");
const status = document.getElementById("status");
const button = document.getElementById("enterBtn");

const text = "The Algorithm Times";

const messages = [
    "Preparing Front Page...",
    "Gathering Headlines...",
    "Fact Checking Articles...",
    "Printing Today's Edition...",
    "Edition Ready."
];

// -------------------- TYPEWRITER --------------------

function typeWriter() {

    let i = 0;

    title.innerHTML = "";

    const typing = setInterval(() => {

        title.innerHTML =
            text.substring(0, i + 1) +
            '<span class="cursor">|</span>';

        i++;

        if (i === text.length) {

            clearInterval(typing);

        }

    }, 90);

}

// -------------------- LOADING --------------------

let load = 0;

const loading = setInterval(() => {

    load++;

    progress.style.width = load + "%";

    percent.innerHTML = load + "%";

    // Change message every 25%

    if (load === 20)
        status.innerHTML = messages[1];

    if (load === 45)
        status.innerHTML = messages[2];

    if (load === 70)
        status.innerHTML = messages[3];

    if (load === 100) {

        clearInterval(loading);

        status.innerHTML = messages[4];

        button.style.opacity = "1";

        button.style.pointerEvents = "auto";

    }

}, 35);


// -------------------- START TYPING --------------------

setTimeout(() => {

    typeWriter();

}, 600);


// -------------------- BUTTON --------------------

button.addEventListener("click", () => {

    document.body.style.transition = "0.8s";

    document.body.style.opacity = "0";

    setTimeout(() => {

        window.location.href = "index.html";

    }, 800);

});