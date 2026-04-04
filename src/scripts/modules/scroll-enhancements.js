(function () {
    "use strict";

    var ENABLE_CINEMATIC_MODE = true;
    var ENABLE_WHEEL_SMOOTHING = false;

    function prefersReducedMotion() {
        return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function initScrollProgress() {
        if (ENABLE_CINEMATIC_MODE) {
            document.body.classList.add("scroll-cinematic");
        }

        var bar = document.createElement("div");
        bar.className = "scroll-progress";
        bar.setAttribute("aria-hidden", "true");
        document.body.appendChild(bar);

        var ticking = false;

        function updateProgress() {
            ticking = false;
            var scrollTop = window.scrollY || window.pageYOffset || 0;
            var doc = document.documentElement;
            var maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
            var progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
            bar.style.transform = "scaleX(" + progress + ")";
        }

        function onScroll() {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateProgress);
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        updateProgress();
    }

    function isScrollableElement(el) {
        if (!el || el === document.body || el === document.documentElement) return false;
        var style = window.getComputedStyle(el);
        var overflowY = style.overflowY;
        if (overflowY !== "auto" && overflowY !== "scroll") return false;
        return el.scrollHeight > el.clientHeight + 1;
    }

    function findScrollableParent(start) {
        var node = start;
        while (node && node !== document.body && node !== document.documentElement) {
            if (isScrollableElement(node)) {
                return node;
            }
            node = node.parentElement;
        }
        return null;
    }

    function shouldBypassForNestedScroll(target, deltaY) {
        var scroller = findScrollableParent(target);
        if (!scroller) return false;

        var maxScroll = scroller.scrollHeight - scroller.clientHeight;
        if (maxScroll <= 0) return false;

        var atTop = scroller.scrollTop <= 0;
        var atBottom = scroller.scrollTop >= maxScroll - 1;

        if (deltaY > 0 && !atBottom) return true;
        if (deltaY < 0 && !atTop) return true;
        return false;
    }

    function initCinematicWheelScroll() {
        if (!ENABLE_CINEMATIC_MODE || !ENABLE_WHEEL_SMOOTHING || prefersReducedMotion()) {
            return;
        }

        var isTouchDevice = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
        if (isTouchDevice) {
            return;
        }

        var currentY = window.scrollY || window.pageYOffset || 0;
        var targetY = currentY;
        var rafId = 0;
        var easing = 0.24;
        var wheelMultiplier = 0.82;
        var maxWheelStep = 120;

        function clamp(v, min, max) {
            return Math.max(min, Math.min(max, v));
        }

        function maxPageScroll() {
            var doc = document.documentElement;
            return Math.max(0, doc.scrollHeight - window.innerHeight);
        }

        function syncToRealScroll() {
            var y = window.scrollY || window.pageYOffset || 0;
            currentY = y;
            targetY = y;
        }

        function step() {
            var diff = targetY - currentY;
            if (Math.abs(diff) < 0.35) {
                currentY = targetY;
                window.scrollTo(0, Math.round(currentY));
                rafId = 0;
                return;
            }

            currentY += diff * easing;
            window.scrollTo(0, Math.round(currentY));
            rafId = requestAnimationFrame(step);
        }

        function startLoop() {
            if (rafId) return;
            rafId = requestAnimationFrame(step);
        }

        window.addEventListener("wheel", function (event) {
            if (event.ctrlKey) return;
            if (shouldBypassForNestedScroll(event.target, event.deltaY)) return;

            event.preventDefault();
            var wheelDelta = clamp(event.deltaY, -maxWheelStep, maxWheelStep);
            targetY = clamp(targetY + (wheelDelta * wheelMultiplier), 0, maxPageScroll());
            startLoop();
        }, { passive: false });

        window.addEventListener("resize", function () {
            targetY = clamp(targetY, 0, maxPageScroll());
        });

        window.addEventListener("scroll", function () {
            if (!rafId) {
                syncToRealScroll();
            }
        }, { passive: true });
    }

    function initRevealOnScroll() {
        if (prefersReducedMotion()) {
            return;
        }

        var selectors = [
            ".about-card",
            ".about-impact-item",
            ".skills-col-left",
            ".skills-col-right",
            ".skills-category",
            ".positioning-header",
            ".skills-positioning-card",
            ".timeline-section-header",
            ".projects-header",
            ".projects-shell",
            ".project-card",
            ".contact-header",
            ".contact-form"
        ];

        var observer = null;

        function bindElement(el) {
            if (!el || el.classList.contains("reveal-on-scroll") || el.classList.contains("is-visible")) {
                return;
            }

            el.classList.add("reveal-on-scroll");

            if (ENABLE_CINEMATIC_MODE) {
                var siblings = el.parentElement ? Array.prototype.slice.call(el.parentElement.children) : [];
                var localIndex = Math.max(0, siblings.indexOf(el));
                var delay = Math.min(120, localIndex * 24);
                el.style.setProperty("--reveal-delay", delay + "ms");
            }

            if (!observer) {
                el.classList.add("is-visible");
                return;
            }

            observer.observe(el);
        }

        function scan(root) {
            selectors.forEach(function (selector) {
                var nodes = root.querySelectorAll(selector);
                nodes.forEach(bindElement);
            });
        }

        if ("IntersectionObserver" in window) {
            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.16,
                rootMargin: "0px 0px -8% 0px"
            });
        }

        scan(document);

        var main = document.getElementById("main-content") || document.body;
        var mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (!(node instanceof Element)) return;
                    if (node.matches && selectors.some(function (sel) { return node.matches(sel); })) {
                        bindElement(node);
                    }
                    scan(node);
                });
            });
        });

        mo.observe(main, { childList: true, subtree: true });
    }

    function init() {
        initScrollProgress();
        initCinematicWheelScroll();
        initRevealOnScroll();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
