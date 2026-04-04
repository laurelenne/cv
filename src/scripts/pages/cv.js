/* jshint esversion: 5 */
(function () {
    "use strict";

    /* ─── Utilitaires ─────────────────────────────────────── */

    function escapeHtml(str) {
        return String(str || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function fetchJSON(url) {
        return fetch(url).then(function (response) {
            if (!response.ok) throw new Error("HTTP " + response.status + " — " + url);
            return response.json();
        });
    }

    function setContent(id, html) {
        var el = document.getElementById(id);
        if (el) el.innerHTML = html;
    }

    function setError(id, msg) {
        var el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<p class="cv-loading">' + escapeHtml(msg) + '</p>';
        }
    }

    /* ─── Compétences (skills.json) ───────────────────────── */

    var DOMAIN_LABELS = {
        frontend: "Frontend",
        backend:  "Backend",
        bdd:      "Bases de données",
        outils:   "Outils & Environnement"
    };

    function buildSkillsHtml(data) {
        var html = "";

        data.forEach(function (domain) {
            // On n'affiche que mastery et intermediate (pas notions) 
            var shown = domain.skills.filter(function (s) {
                return s.level === "mastery" || s.level === "intermediate";
            });
            if (!shown.length) return;

            var label = DOMAIN_LABELS[domain.domain] || escapeHtml(domain.title);

            html += '<div class="cv-skill-domain">';
            html += '<p class="cv-skill-domain-title">' + escapeHtml(label) + '</p>';
            html += '<div class="cv-skill-chips">';

            shown.forEach(function (skill) {
                var lvlClass = skill.level === "mastery"
                    ? "cv-skill-chip--mastery"
                    : "cv-skill-chip--intermediate";

                html += '<span class="cv-skill-chip ' + lvlClass + '">';
                html += '<i class="' + escapeHtml(skill.icon) + '" aria-hidden="true"></i>';
                html += escapeHtml(skill.name);
                html += '</span>';
            });

            html += '</div></div>';
        });

        // Légende des niveaux
        html += '<div class="cv-skills-legend">'
             +  '<span class="cv-skill-chip cv-skill-chip--mastery">Bonne maîtrise</span>'
             +  '<span class="cv-skill-chip cv-skill-chip--intermediate">Intermédiaire</span>'
             +  '</div>';

        return html || '<p class="cv-loading">Aucune compétence trouvée.</p>';
    }

    /* ─── Parcours (timeline.json) ────────────────────────── */

    function buildTimelineHtml(data) {
        if (!data || !data.length) {
            return '<p class="cv-loading">Aucune entrée trouvée.</p>';
        }

        return data.map(function (item) {
            var tagType  = escapeHtml(item.tagType || "projet");
            var chipsHtml = "";

            if (item.chips && item.chips.length) {
                chipsHtml = '<div class="cv-tl-chips">'
                    + item.chips.map(function (c) {
                        return '<span class="cv-tl-chip">' + escapeHtml(c) + '</span>';
                    }).join("")
                    + '</div>';
            }

            return '<div class="cv-tl-item">'
                + '<div class="cv-tl-date">' + escapeHtml(item.date) + '</div>'
                + '<div class="cv-tl-body">'
                +   '<span class="cv-tl-tag cv-tl-tag--' + tagType + '">' + escapeHtml(item.tag) + '</span>'
                +   '<p class="cv-tl-title">' + escapeHtml(item.title) + '</p>'
                +   '<p class="cv-tl-desc">' + escapeHtml(item.desc) + '</p>'
                +   chipsHtml
                + '</div>'
                + '</div>';
        }).join("");
    }

    /* ─── Réalisations (projects.json) ────────────────────── */

    function buildProjectsHtml(data) {
        if (!data || !data.length) {
            return '<p class="cv-loading">Aucun projet trouvé.</p>';
        }

        // Tri par année décroissante, on garde les 5 plus récents
        var sorted = data.slice().sort(function (a, b) {
            return (b.year || 0) - (a.year || 0);
        }).slice(0, 5);

        return sorted.map(function (p) {
            var techHtml = (p.tech || []).map(function (t) {
                return '<span class="cv-proj-chip">' + escapeHtml(t) + '</span>';
            }).join("");

            var linksHtml = "";
            if (p.github) {
                linksHtml += '<a href="' + escapeHtml(p.github) + '" class="cv-proj-link" '
                           + 'target="_blank" rel="noopener noreferrer">GitHub</a>';
            }
            if (p.demo) {
                linksHtml += '<a href="' + escapeHtml(p.demo) + '" class="cv-proj-link" '
                           + 'target="_blank" rel="noopener noreferrer">Démo</a>';
            }

            return '<div class="cv-proj">'
                + '<div class="cv-proj-meta">'
                +   '<span class="cv-proj-year">' + escapeHtml(String(p.year || "")) + '</span>'
                +   '<span class="cv-proj-type">' + escapeHtml(p.type || "") + '</span>'
                +   (linksHtml ? '<span class="cv-proj-links">' + linksHtml + '</span>' : '')
                + '</div>'
                + '<p class="cv-proj-title">' + escapeHtml(p.title) + '</p>'
                + '<p class="cv-proj-lead">' + escapeHtml(p.lead) + '</p>'
                + (techHtml ? '<div class="cv-proj-chips">' + techHtml + '</div>' : '')
                + '</div>';
        }).join("");
    }

    /* ─── Initialisation ──────────────────────────────────── */

    var ERR_MSG = "Données indisponibles. Ouvrir la page via un serveur web local (ex : VS Code Live Server).";

    function init() {
        var base = "src/data/";

        fetchJSON(base + "skills.json")
            .then(function (data) { setContent("cv-skills", buildSkillsHtml(data)); })
            .catch(function ()    { setError("cv-skills", ERR_MSG); });

        fetchJSON(base + "timeline.json")
            .then(function (data) { setContent("cv-timeline", buildTimelineHtml(data)); })
            .catch(function ()    { setError("cv-timeline", ERR_MSG); });

        fetchJSON(base + "projects.json")
            .then(function (data) { setContent("cv-projects", buildProjectsHtml(data)); })
            .catch(function ()    { setError("cv-projects", ERR_MSG); });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();
