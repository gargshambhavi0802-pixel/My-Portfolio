const text = "WELCOME TO THE ALGORITHM TIMES.";

        const typingElement = document.getElementById("typing");

        let index = 0;


        function typeText() {

            if (index < text.length) {

                typingElement.textContent += text.charAt(index);

                index++;

                setTimeout(typeText, 100);

            }

        }


        // Start typing when page loads

        window.addEventListener("load", typeText);