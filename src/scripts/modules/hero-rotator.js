(function () {
    "use strict";

    function initHeroRotator() {
        var root = document.getElementById("hero-rotating-text");
        if (!root) return;

        var list = root.querySelector(".content__container__list");
        var items = root.querySelectorAll(".content__container__list__item");
        var dotsHost = root.querySelector(".content__dots");
        if (!list || !items.length) return;

        var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var currentIndex = 0;
        var timer = null;
        var intervalMs = 3200;
        function setActiveDot(index) {
            if (!dotsHost) return;
            var dots = dotsHost.querySelectorAll(".content__dot");
            dots.forEach(function (dot, i) {
                var active = i === index;
                dot.classList.toggle("is-active", active);
                dot.setAttribute("aria-selected", active ? "true" : "false");
            });
        }

        function setActiveItem(index, animate) {
            items.forEach(function (item, i) {
                if (!animate) {
                    item.style.transition = "none";
                } else {
                    item.style.transition = "opacity 320ms ease, transform 320ms ease";
                }
                item.classList.toggle("is-active", i === index);
                if (!animate) {
                    window.requestAnimationFrame(function () {
                        item.style.transition = "opacity 320ms ease, transform 320ms ease";
                    });
                }
            });
        }

        function setIndex(index, animate) {
            currentIndex = (index + items.length) % items.length;
            setActiveItem(currentIndex, animate);
            setActiveDot(currentIndex);
        }

        function stopAutoplay() {
            if (!timer) return;
            clearInterval(timer);
            timer = null;
        }

        function startAutoplay() {
            if (timer) return;
            timer = setInterval(function () {
                setIndex(currentIndex + 1, !reducedMotion);
            }, intervalMs);
        }

        function buildDots() {
            if (!dotsHost) return;
            dotsHost.innerHTML = "";
            items.forEach(function (_, i) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.className = "content__dot";
                dot.setAttribute("role", "tab");
                dot.setAttribute("aria-label", "Message " + (i + 1));
                dot.setAttribute("aria-selected", "false");
                dot.addEventListener("click", function () {
                    setIndex(i, !reducedMotion);
                    stopAutoplay();
                    startAutoplay();
                });
                dotsHost.appendChild(dot);
            });
        }

        buildDots();
        setIndex(0, false);
        startAutoplay();

        root.classList.add("is-ready");

        // Parallax souris
        if (!reducedMotion) {
            var header = root.closest ? root.closest("header") : document.querySelector("header");
            if (header) {
                var rafPending = false;
                var pendingX = 0;
                var pendingY = 0;
                function applyParallax() {
                    root.style.setProperty("--px", pendingX + "px");
                    root.style.setProperty("--py", pendingY + "px");
                    rafPending = false;
                }
                header.addEventListener("mousemove", function (e) {
                    var rect = header.getBoundingClientRect();
                    var cx = rect.left + rect.width / 2;
                    var cy = rect.top + rect.height / 2;
                    pendingX = -((e.clientX - cx) / (rect.width / 2)) * 5;
                    pendingY = -((e.clientY - cy) / (rect.height / 2)) * 5;
                    if (!rafPending) {
                        rafPending = true;
                        requestAnimationFrame(applyParallax);
                    }
                }, { passive: true });
                header.addEventListener("mouseleave", function () {
                    root.style.setProperty("--px", "0px");
                    root.style.setProperty("--py", "0px");
                }, { passive: true });
            }
        }

        window.addEventListener("resize", function () {
            setIndex(currentIndex, false);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeroRotator);
    } else {
        initHeroRotator();
    }
})();
