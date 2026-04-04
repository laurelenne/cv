(function () {
    "use strict";

    var DATA_URL = "src/data/projects.json";

    function getProjectId() {
        var params = new URLSearchParams(window.location.search);
        return params.get("id") || "";
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setText(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function renderProject(project) {
        document.title = "Projet - " + project.title;

        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute("content", "Etude de cas - " + project.title);

        setText("proj-eyebrow", project.eyebrow || "Etude de cas");
        setText("proj-title", project.title);
        setText("proj-lead", project.lead);
        setText("proj-objectif", project.objectif);

        var techEl = document.getElementById("proj-tech");
        if (techEl && Array.isArray(project.tech)) {
            techEl.innerHTML = project.tech.map(function (t) {
                return "<span>" + escapeHtml(t) + "</span>";
            }).join("");
        }

        var travailEl = document.getElementById("proj-travail");
        if (travailEl && Array.isArray(project.travailRealise)) {
            travailEl.innerHTML = project.travailRealise.map(function (item) {
                return "<li>" + escapeHtml(item) + "</li>";
            }).join("");
        }

        var aprecu = document.getElementById("proj-apercu");
        if (aprecu) {
            aprecu.src = project.apercu || "";
            aprecu.alt = project.apercu_alt || "";
        }

        var codeEl = document.getElementById("proj-code");
        if (codeEl) {
            if (project.github) {
                codeEl.innerHTML = '<a class="project-code-link" href="' + escapeHtml(project.github) + '" target="_blank" rel="noopener noreferrer"><i class="fab fa-github" aria-hidden="true"></i> Voir sur GitHub</a>';
            } else {
                codeEl.innerHTML = '<span class="project-code-link is-disabled"><i class="fa fa-lock" aria-hidden="true"></i> Depot prive</span>';
            }
        }
    }

    function showError(message) {
        var main = document.querySelector(".project-detail-main");
        if (!main) return;
        main.innerHTML =
            '<section class="project-hero">' +
                '<p class="project-eyebrow">Erreur</p>' +
                '<h1 class="project-title">' + escapeHtml(message) + '</h1>' +
                '<a href="index.html#realisations" class="project-back-link">' +
                    '<i class="fa fa-arrow-left" aria-hidden="true"></i> Retour aux realisations' +
                '</a>' +
            '</section>';
    }

    function init() {
        var id = getProjectId();
        if (!id) {
            showError("Aucun projet specifie.");
            return;
        }

        fetch(DATA_URL)
            .then(function (res) {
                if (!res.ok) throw new Error("Impossible de charger les donnees projet.");
                return res.json();
            })
            .then(function (projects) {
                var project = null;
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].id === id) {
                        project = projects[i];
                        break;
                    }
                }
                if (!project) {
                    showError("Projet introuvable.");
                    return;
                }
                renderProject(project);
            })
            .catch(function () {
                showError("Erreur de chargement des donnees.");
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
