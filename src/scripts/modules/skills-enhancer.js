(function () {
    "use strict";

    var DATA_URL = "src/data/skills.json";

    // Schema minimal de src/data/skills.json :
    // [
    //   {
    //     "domain": "frontend|backend|bdd|outils",
    //     "title": "Nom de la categorie",
    //     "icon": "Classes Font Awesome",
    //     "description": "Texte court",
    //     "proof": ["Point 1", "Point 2"],
    //     "skills": [
    //       {
    //         "key": "identifiant-css",
    //         "name": "Nom affiche",
    //         "icon": "Classes Font Awesome",
    //         "level": "mastery|intermediate|notions",
    //         "featured": true,
    //         "methodo": false
    //       }
    //     ]
    //   }
    // ]

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getLevel(level) {
        if (level === "mastery") return { css: "level-1", label: "Bonne maitrise" };
        if (level === "intermediate") return { css: "level-2", label: "Intermediaire" };
        return { css: "level-3", label: "Notions" };
    }

    function buildSkillBadge(skill, domain) {
        var level = getLevel(skill.level);
        var badge = document.createElement("div");

        badge.className = "skill-badge skill-" + escapeHtml(skill.key);
        badge.setAttribute("tabindex", "0");
        badge.setAttribute("data-domain", domain);
        badge.setAttribute("data-methodo", skill.methodo ? "true" : "false");

        if (skill.featured) {
            badge.classList.add("skill-featured");
        }

        badge.innerHTML =
            '<div class="skill-icon"><i class="' + escapeHtml(skill.icon) + '" aria-hidden="true"></i></div>' +
            '<div class="skill-name">' + escapeHtml(skill.name) + '</div>' +
            '<span class="skills-level-chip ' + level.css + '">' + level.label + '</span>';

        return badge;
    }

    function buildSkillsCategory(category) {
        var wrapper = document.createElement("div");
        wrapper.className = "skills-category";
        wrapper.setAttribute("data-domain", category.domain);

        var proofHtml = (category.proof || []).map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
        }).join("");

        wrapper.innerHTML =
            '<h5 class="skills-category-title"><i class="' + escapeHtml(category.icon) + '" aria-hidden="true"></i> ' + escapeHtml(category.title) + '</h5>' +
            '<p class="skills-category-description">' + escapeHtml(category.description) + '</p>' +
            '<ul class="skills-proof-list">' + proofHtml + '</ul>' +
            '<div class="skills-grid"></div>';

        var grid = wrapper.querySelector(".skills-grid");
        (category.skills || []).forEach(function (skill) {
            grid.appendChild(buildSkillBadge(skill, category.domain));
        });

        return wrapper;
    }

    function renderSkills(categories) {
        var container = document.getElementById("skills-categories-scroll");
        if (!container) return;

        container.innerHTML = "";

        var fragment = document.createDocumentFragment();
        categories.forEach(function (category) {
            fragment.appendChild(buildSkillsCategory(category));
        });

        container.appendChild(fragment);
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
            category.style.display = "";
        });
    }

    function initFilters() {
        var buttons = document.querySelectorAll(".skills-filter-btn");
        if (!buttons.length) return;

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
        fetch(DATA_URL)
            .then(function (res) {
                if (!res.ok) throw new Error("Impossible de charger les competences.");
                return res.json();
            })
            .then(function (categories) {
                renderSkills(categories);
                initFilters();
                applyFilter("frontend");
            })
            .catch(function (err) {
                console.warn("Skills:", err.message);
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSkillsEnhancer);
    } else {
        initSkillsEnhancer();
    }
})();
