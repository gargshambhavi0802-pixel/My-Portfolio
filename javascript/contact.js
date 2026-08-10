emailjs.init({
    publicKey: "q5IouVN9ywOcVzGiS"
});


document.getElementById("contact-form").addEventListener("submit", function(event) {

    event.preventDefault();

    const button = this.querySelector("button");

    button.disabled = true;
    button.innerText = "SENDING...";

    emailjs.sendForm(
        "service_b3cyxcd",
        "template_bkenta2",
        this
    )
    .then(function() {

        alert("Message sent successfully!");

        document.getElementById("contact-form").reset();

        button.disabled = false;
        button.innerText = "SEND MESSAGE →";

    })
    .catch(function(error) {

        console.log("FAILED...", error);

        alert("Something went wrong. Please try again.");

        button.disabled = false;
        button.innerText = "SEND MESSAGE →";

    });

});