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
        var itemHeight = 0;

        function measureItemHeight() {
            itemHeight = items[0].offsetHeight || 66;
            setIndex(currentIndex, false);
        }

        function setActiveDot(index) {
            if (!dotsHost) return;
            var dots = dotsHost.querySelectorAll(".content__dot");
            dots.forEach(function (dot, i) {
                var active = i === index;
                dot.classList.toggle("is-active", active);
                dot.setAttribute("aria-selected", active ? "true" : "false");
            });
        }

        function setIndex(index, animate) {
            currentIndex = (index + items.length) % items.length;
            if (!animate) {
                list.style.transition = "none";
            } else {
                list.style.transition = "transform 560ms cubic-bezier(0.65, 0, 0.35, 1)";
            }
            list.style.transform = "translateY(" + (-currentIndex * itemHeight) + "px)";
            if (!animate) {
                window.requestAnimationFrame(function () {
                    list.style.transition = "transform 560ms cubic-bezier(0.65, 0, 0.35, 1)";
                });
            }
            setActiveDot(currentIndex);
        }

        function stopAutoplay() {
            if (!timer) return;
            clearInterval(timer);
            timer = null;
        }

        function startAutoplay() {
            if (reducedMotion || timer) return;
            timer = setInterval(function () {
                setIndex(currentIndex + 1, true);
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
                    setIndex(i, true);
                    stopAutoplay();
                    startAutoplay();
                });
                dotsHost.appendChild(dot);
            });
        }

        buildDots();
        measureItemHeight();
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

        root.addEventListener("mouseenter", stopAutoplay);
        root.addEventListener("mouseleave", startAutoplay);
        root.addEventListener("focusin", stopAutoplay);
        root.addEventListener("focusout", startAutoplay);

        window.addEventListener("resize", function () {
            measureItemHeight();
        });

        window.addEventListener("load", function () {
            measureItemHeight();
        });

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function () {
                measureItemHeight();
            });
        }

        if (window.ResizeObserver) {
            var ro = new ResizeObserver(function () {
                measureItemHeight();
            });
            ro.observe(items[0]);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initHeroRotator);
    } else {
        initHeroRotator();
    }
})();
