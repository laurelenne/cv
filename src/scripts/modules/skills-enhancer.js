(function () {
    var featuredSkills = [
        "skill-java",
        "skill-spring",
        "skill-rest",
        "skill-sql",
        "skill-git",
        "skill-scrum",
        "skill-react",
        "skill-javascript",
        "skill-postgresql",
        "skill-spring-security",
        "skill-github",
        "skill-html"
    ];

    var levelMastery = [
        "skill-java",
        "skill-spring",
        "skill-rest",
        "skill-sql",
        "skill-git",
        "skill-scrum",
        "skill-html",
        "skill-css",
        "skill-javascript"
    ];

    var levelIntermediate = [
        "skill-react",
        "skill-postgresql",
        "skill-mysql",
        "skill-bootstrap",
        "skill-junit",
        "skill-spring-security",
        "skill-spring-mvc",
        "skill-http",
        "skill-json",
        "skill-postman",
        "skill-vscode",
        "skill-github"
    ];

    var methodoSkills = [
        "skill-agile",
        "skill-scrum",
        "skill-jira",
        "skill-notion",
        "skill-trello",
        "skill-markdown",
        "skill-uml",
        "skill-merise",
        "skill-drawio"
    ];

    function hasAnyClass(element, classList) {
        return classList.some(function (className) {
            return element.classList.contains(className);
        });
    }

    function getLevelForBadge(badge) {
        if (hasAnyClass(badge, levelMastery)) {
            return { css: "level-1", label: "Bonne maitrise" };
        }
        if (hasAnyClass(badge, levelIntermediate)) {
            return { css: "level-2", label: "Intermediaire" };
        }
        return { css: "level-3", label: "Notions" };
    }

    function enrichBadges() {
        var badges = document.querySelectorAll(".skill-badge");

        badges.forEach(function (badge) {
            var category = badge.closest(".skills-category");
            var domain = category ? (category.getAttribute("data-domain") || "") : "";

            if (domain) {
                badge.setAttribute("data-domain", domain);
            }

            if (hasAnyClass(badge, methodoSkills)) {
                badge.setAttribute("data-methodo", "true");
            } else {
                badge.setAttribute("data-methodo", "false");
            }

            if (hasAnyClass(badge, featuredSkills)) {
                badge.classList.add("skill-featured");
            }

            if (!badge.querySelector(".skills-level-chip")) {
                var level = getLevelForBadge(badge);
                var chip = document.createElement("span");
                chip.className = "skills-level-chip " + level.css;
                chip.textContent = level.label;
                badge.appendChild(chip);
            }
        });
    }

    function applyFilter(filter) {
        var badges = document.querySelectorAll(".skill-badge");
        var categories = document.querySelectorAll(".skills-category");

        badges.forEach(function (badge) {
            var domain = badge.getAttribute("data-domain");
            var isMethodo = badge.getAttribute("data-methodo") === "true";
            var shouldShow = false;

            if (filter === "all") {
                shouldShow = true;
            } else if (filter === "methodo") {
                shouldShow = isMethodo;
            } else {
                shouldShow = domain === filter;
            }

            badge.classList.toggle("is-hidden", !shouldShow);
        });

        categories.forEach(function (category) {
            var visibleBadges = category.querySelectorAll(".skill-badge:not(.is-hidden)");
            category.classList.toggle("is-hidden", visibleBadges.length === 0);
        });

        resetPagination(filter);
    }

    /* ===== Pagination ===== */
    var currentPage = 0;
    var paginationActive = false;

    function getVisibleCategories() {
        return Array.from(document.querySelectorAll(".skills-category:not(.is-hidden)"));
    }

    function buildDots(count) {
        var container = document.getElementById("skills-pagination-dots");
        if (!container) return;
        container.innerHTML = "";
        for (var i = 0; i < count; i++) {
            var dot = document.createElement("button");
            dot.className = "skills-pagination-dot";
            dot.setAttribute("aria-label", "Page " + (i + 1));
            (function (index) {
                dot.addEventListener("click", function () { showPage(index); });
            })(i);
            container.appendChild(dot);
        }
    }

    function updateDots(page) {
        var dots = document.querySelectorAll(".skills-pagination-dot");
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === page);
        });
    }

    function setPaginationVisible(visible) {
        var pagination = document.querySelector(".skills-pagination");
        if (pagination) pagination.style.display = visible ? "" : "none";
    }

    function showPage(page) {
        var visible = getVisibleCategories();
        if (!visible.length) return;

        currentPage = Math.max(0, Math.min(page, visible.length - 1));

        visible.forEach(function (cat, i) {
            cat.style.display = (i === currentPage) ? "" : "none";
        });

        var indicator = document.getElementById("skills-page-indicator");
        if (indicator) {
            indicator.textContent = (currentPage + 1) + " / " + visible.length;
        }

        var prevBtn = document.getElementById("skills-prev");
        var nextBtn = document.getElementById("skills-next");
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage >= visible.length - 1;

        updateDots(currentPage);

        var scroll = document.getElementById("skills-categories-scroll");
        if (scroll) scroll.scrollTop = 0;
    }

    function resetPagination(filter) {
        currentPage = 0;
        // Toutes les catégories visibles retrouvent leur display par défaut
        document.querySelectorAll(".skills-category").forEach(function (cat) {
            cat.style.display = "";
        });
        var visible = getVisibleCategories();

        if (!filter || filter === "all") {
            // Mode "Toutes" : tout est visible, pagination masquée
            paginationActive = false;
            visible.forEach(function (cat) { cat.style.display = ""; });
            setPaginationVisible(false);
        } else {
            // Mode filtre spécifique : pagination active (1 catégorie à la fois)
            paginationActive = true;
            setPaginationVisible(true);
            buildDots(visible.length);
            showPage(0);
        }
    }

    function initPagination() {
        var prevBtn = document.getElementById("skills-prev");
        var nextBtn = document.getElementById("skills-next");

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                showPage(currentPage - 1);
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                showPage(currentPage + 1);
            });
        }
    }

    function initFilters() {
        var buttons = document.querySelectorAll(".skills-filter-btn");
        if (!buttons.length) {
            return;
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var filter = button.getAttribute("data-filter") || "all";

                buttons.forEach(function (btn) {
                    var active = btn === button;
                    btn.classList.toggle("is-active", active);
                    btn.setAttribute("aria-pressed", active ? "true" : "false");
                });

                applyFilter(filter);
            });
        });
    }

    function initSkillsEnhancer() {
        enrichBadges();
        initFilters();
        initPagination();
        applyFilter("frontend");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSkillsEnhancer);
    } else {
        initSkillsEnhancer();
    }
})();
