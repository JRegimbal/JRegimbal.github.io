document.addEventListener('DOMContentLoaded', () => {
    const burger = document.getElementById("burger");
    burger.addEventListener("click", () => {
        burger.classList.toggle("is-active");
        document.getElementById("menu").classList.toggle("is-active");
    });
});
