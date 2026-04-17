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

    /**
     * Renders icon HTML supporting both local assets and Font Awesome formats:
     * - "icon:filename.ext" → <img src="public/assets/icons-skills/filename.ext">
     * - "fa:fab fa-icon" or "fab fa-icon" (legacy) → <i class="fab fa-icon">
     */
    function renderIconHtml(iconString) {
        if (!iconString) return "";
        
        // Local icon format (SVG, PNG, WebP, etc.)
        if (iconString.startsWith("icon:")) {
            var filename = iconString.substring(5); // Remove "icon:" prefix
            var iconPath = "public/assets/icons-skills/" + escapeHtml(filename);
            return '<img src="' + iconPath + '" alt="" class="icon-svg" loading="lazy" />';
        }
        
        // Font Awesome format (with or without "fa:" prefix)
        var iconClass = iconString.startsWith("fa:") ? iconString.substring(3) : iconString;
        return '<i class="' + escapeHtml(iconClass) + '" aria-hidden="true"></i>';
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
                html += renderIconHtml(skill.icon);
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

    /* ─── Parcours (timeline.json) ───────────────────────── */

    function extractYear(dateStr) {
        var match = String(dateStr).match(/\d{4}/);
        return match ? parseInt(match[0], 10) : 9999;
    }

    function buildTimelineHtml(data) {
        if (!data || !data.length) {
            return '<p class="cv-loading">Aucune entrée trouvée.</p>';
        }

        // Filtre : afficher si showInCV !== false OU onlyInCV === true
        var filteredData = data.filter(function(item) {
            return item.showInCV !== false || item.onlyInCV === true;
        });
        // Tri par date décroissante (CV)
        var sortedData = filteredData.slice().sort(function (a, b) {
            return extractYear(b.date) - extractYear(a.date);
        });

        // Regroupement par type
        var groupes = {
            experience: [],
            formation: [],
            diplome: []
        };
        sortedData.forEach(function(item) {
            if (item.tagType === "experience") groupes.experience.push(item);
            else if (item.tagType === "formation") groupes.formation.push(item);
            else if (item.tagType === "diplome") groupes.diplome.push(item);
        });

        function renderSection(titre, items) {
            if (!items.length) return "";
            return '<div class="cv-tl-section">'
                + '<h4 class="cv-tl-section-title">' + titre + '</h4>'
                + items.map(function (item) {
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
                        +   '<p class="cv-tl-title">' + escapeHtml(item.title) + '</p>'
                        +   '<p class="cv-tl-desc">' + escapeHtml(item.desc) + '</p>'
                        +   chipsHtml
                        + '</div>'
                        + '</div>';
                }).join("")
                + '</div>';
        }

        return [
            renderSection("Formations", groupes.formation),
            renderSection("Diplômes", groupes.diplome),
            renderSection("Expériences", groupes.experience)
        ].join("");
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
            var previewUrl = p.apercuVideo || p.demo;
            if (previewUrl) {
                linksHtml += '<a href="' + escapeHtml(previewUrl) + '" class="cv-proj-link" '
                           + 'target="_blank" rel="noopener noreferrer">Aperçu vidéo</a>';
            }

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
