(function () {
    function animateCounter(counter, duration) {
        var target = parseInt(counter.getAttribute("data-target"), 10);
        if (isNaN(target)) {
            return;
        }

        var start = 0;
        var startTime = null;

        function step(timestamp) {
            if (!startTime) {
                startTime = timestamp;
            }

            var progress = Math.min((timestamp - startTime) / duration, 1);
            var value = Math.floor(progress * (target - start) + start);
            counter.textContent = String(value);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                counter.textContent = String(target);
            }
        }

        window.requestAnimationFrame(step);
    }

    function runCounters() {
        var counters = document.querySelectorAll(".skills-meta-number");
        if (!counters.length) {
            return;
        }

        var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        counters.forEach(function (counter) {
            if (reduceMotion) {
                counter.textContent = counter.getAttribute("data-target") || "0";
            } else {
                animateCounter(counter, 900);
            }
        });
    }

    function initWhenVisible() {
        var section = document.getElementById("competences");
        if (!section) {
            return;
        }

        var hasPlayed = false;

        function playOnce() {
            if (hasPlayed) {
                return;
            }
            hasPlayed = true;
            runCounters();
        }

        if (!("IntersectionObserver" in window)) {
            playOnce();
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    playOnce();
                    observer.disconnect();
                }
            });
        }, {
            threshold: 0.01,
            rootMargin: "0px 0px 8% 0px"
        });

        observer.observe(section);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initWhenVisible);
    } else {
        initWhenVisible();
    }
})();
