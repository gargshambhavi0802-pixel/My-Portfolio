window.addEventListener("DOMContentLoaded", () => {

    const sequence = [
        ".main_container",
        ".tagline",
        ".navbar",
        ".left",
        ".right",
        ".line",
        ".section2",
        ".footer"
    ];

    sequence.forEach((selector, index) => {

        const elements = document.querySelectorAll(selector);

        elements.forEach((el) => {

            setTimeout(() => {

                el.style.transition = "all 1.5s ease";

                el.style.opacity = "1";

                el.style.transform = "translateY(0)";

            }, index * 600);

        });

    });

});