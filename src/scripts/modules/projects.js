(function () {
    "use strict";

    var DATA_URL = "src/data/projects.json";
    var INITIAL_VISIBLE = 6;
    var state = {
        projects: [],
        visibleCount: INITIAL_VISIBLE,
        techFilter: "",
        typeFilter: ""
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function getStatusLabels(project) {
        if (Array.isArray(project.status) && project.status.length) {
            return project.status;
        }
        if (typeof project.status === "string" && project.status.trim()) {
            return [project.status.trim()];
        }
        return ["Terminé"];
    }

    function getStatusClassName(status) {
        return String(status || "termine")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function buildCard(project) {
        var techHtml = (project.tech || []).map(function (t) {
            return "<span>" + escapeHtml(t) + "</span>";
        }).join("");
        var statusBadgesHtml = getStatusLabels(project).map(function (statusLabel) {
            var statusClassName = getStatusClassName(statusLabel);
            return '<span class="project-status-badge project-status-badge--' + escapeHtml(statusClassName) + '">' + escapeHtml(statusLabel) + '</span>';
        }).join("");

        var article = document.createElement("article");
        article.className = "project-card";
        article.setAttribute("data-proj-animate", "");

        article.innerHTML =
            '<div class="project-card-img-wrapper">' +
                '<a href="projet.html?id=' + escapeHtml(project.id) + '" aria-label="Voir la page projet ' + escapeHtml(project.title) + '">' +
                    '<img src="' + escapeHtml(project.apercu) + '" alt="' + escapeHtml(project.apercu_alt) + '" class="project-card-img">' +
                '</a>' +
            '</div>' +
            '<div class="project-card-body">' +
                '<div class="project-card-meta">' +
                    '<span class="project-card-year">' + escapeHtml(project.year || "") + '</span>' +
                    '<span class="project-card-type">' + escapeHtml(project.type || "Projet") + '</span>' +
                    '<span class="project-status-list">' + statusBadgesHtml + '</span>' +
                '</div>' +
                '<h4 class="project-card-title">' + escapeHtml(project.title) + '</h4>' +
                '<p class="project-card-desc">' + escapeHtml(project.lead) + '</p>' +
                '<div class="project-stack">' + techHtml + '</div>' +
                '<div class="project-card-links">' +
                    '<a href="projet.html?id=' + escapeHtml(project.id) + '" class="project-link project-link--primary">' +
                        '<i class="fa fa-external-link" aria-hidden="true"></i> Voir le projet' +
                    '</a>' +
                '</div>' +
            '</div>';

        return article;
    }

    function attachObserver(cards) {
        if (!("IntersectionObserver" in window)) {
            cards.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        cards.forEach(function (el) { observer.observe(el); });
    }

    function sortByYearDesc(a, b) {
        var yearA = Number(a.year) || 0;
        var yearB = Number(b.year) || 0;
        if (yearA !== yearB) return yearB - yearA;
        return String(a.title || "").localeCompare(String(b.title || ""));
    }

    function uniqueValues(items, mapper) {
        var set = new Set();
        items.forEach(function (item) {
            mapper(item).forEach(function (value) {
                if (value) set.add(value);
            });
        });
        return Array.from(set).sort(function (a, b) { return a.localeCompare(b); });
    }

    function fillSelect(select, values, defaultLabel) {
        if (!select) return;
        select.innerHTML = "";

        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = defaultLabel;
        select.appendChild(defaultOption);

        values.forEach(function (value) {
            var option = document.createElement("option");
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function getFilteredProjects() {
        return state.projects.filter(function (project) {
            var matchTech = !state.techFilter || (project.tech || []).indexOf(state.techFilter) !== -1;
            var matchType = !state.typeFilter || project.type === state.typeFilter;
            return matchTech && matchType;
        });
    }

    function setSeeMoreState(btn, totalCount) {
        if (!btn) return;
        var hasMore = totalCount > state.visibleCount;
        btn.hidden = !hasMore;
        btn.setAttribute("aria-hidden", hasMore ? "false" : "true");
    }

    function renderProjects(grid, seeMoreBtn) {
        if (!grid) return;
        grid.innerHTML = "";

        var filtered = getFilteredProjects();
        var visible = filtered.slice(0, state.visibleCount);
        var fragment = document.createDocumentFragment();

        visible.forEach(function (project) {
            fragment.appendChild(buildCard(project));
        });

        if (!visible.length) {
            var empty = document.createElement("p");
            empty.className = "projects-empty";
            empty.textContent = "Aucun projet ne correspond aux filtres.";
            grid.appendChild(empty);
        } else {
            grid.appendChild(fragment);
            attachObserver(Array.prototype.slice.call(
                grid.querySelectorAll(".project-card[data-proj-animate]")
            ));
        }

        setSeeMoreState(seeMoreBtn, filtered.length);
    }

    function initProjects() {
        var grid = document.querySelector(".projects-grid");
        var techSelect = document.getElementById("projects-tech-filter");
        var typeSelect = document.getElementById("projects-type-filter");
        var seeMoreBtn = document.getElementById("projects-see-more");
        if (!grid || !techSelect || !typeSelect || !seeMoreBtn) return;

        fetch(DATA_URL)
            .then(function (res) {
                if (!res.ok) throw new Error("Impossible de charger les projets.");
                return res.json();
            })
            .then(function (projects) {
                state.projects = projects.slice().sort(sortByYearDesc);

                var techValues = uniqueValues(state.projects, function (item) {
                    return item.tech || [];
                });
                var typeValues = uniqueValues(state.projects, function (item) {
                    return item.type ? [item.type] : [];
                });

                fillSelect(techSelect, techValues, "Toutes les technos");
                fillSelect(typeSelect, typeValues, "Tous les types");

                techSelect.addEventListener("change", function () {
                    state.techFilter = techSelect.value;
                    state.visibleCount = INITIAL_VISIBLE;
                    renderProjects(grid, seeMoreBtn);
                });

                typeSelect.addEventListener("change", function () {
                    state.typeFilter = typeSelect.value;
                    state.visibleCount = INITIAL_VISIBLE;
                    renderProjects(grid, seeMoreBtn);
                });

                seeMoreBtn.addEventListener("click", function () {
                    state.visibleCount += INITIAL_VISIBLE;
                    renderProjects(grid, seeMoreBtn);
                });

                renderProjects(grid, seeMoreBtn);
                document.dispatchEvent(new CustomEvent("portfolio:layout-stable"));
            })
            .catch(function (err) {
                console.warn("Projects:", err.message);
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initProjects);
    } else {
        initProjects();
    }
})();
