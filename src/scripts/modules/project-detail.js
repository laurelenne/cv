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

    function isVideoUrl(url) {
        return /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(url);
    }

    function isImageUrl(url) {
        return /\.(gif|png|jpe?g|webp|avif|svg)(?:[?#].*)?$/i.test(url);
    }

    function detectMediaType(url) {
        if (isVideoUrl(url)) return "video";
        if (isImageUrl(url)) return "image";
        return "link";
    }

    function normalizeMediaItem(rawItem, projectTitle, index) {
        var item = null;
        if (typeof rawItem === "string") {
            item = { src: rawItem };
        } else if (rawItem && typeof rawItem === "object") {
            item = rawItem;
        }

        if (!item || !item.src) return null;

        var type = item.type;
        if (type !== "image" && type !== "video" && type !== "link") {
            type = detectMediaType(item.src);
        }

        return {
            src: String(item.src),
            type: type,
            alt: item.alt || ("Media " + (index + 1) + " du projet " + projectTitle),
            caption: item.caption || "",
            poster: item.poster || ""
        };
    }

    function getProjectMedia(project) {
        var media = [];

        if (Array.isArray(project.medias)) {
            for (var i = 0; i < project.medias.length; i++) {
                var normalized = normalizeMediaItem(project.medias[i], project.title, media.length);
                if (normalized) media.push(normalized);
            }
        }

        if (project.apercu) {
            media.push({
                src: String(project.apercu),
                type: "image",
                alt: project.apercu_alt || ("Apercu du projet " + project.title),
                caption: "",
                poster: ""
            });
        }

        var deduped = [];
        var seen = Object.create(null);
        for (var j = 0; j < media.length; j++) {
            if (seen[media[j].src]) continue;
            seen[media[j].src] = true;
            deduped.push(media[j]);
        }

        return deduped;
    }

    function renderVideoPreview(project) {
        var previewEl = document.getElementById("proj-apercu-video");
        if (!previewEl) return;
        var previewBlock = previewEl.closest(".project-block");

        var previewUrl = project.apercuVideo || project.demo;
        if (!previewUrl) {
            previewEl.innerHTML = "";
            if (previewBlock) previewBlock.hidden = true;
            return;
        }

        if (previewBlock) previewBlock.hidden = false;

        if (isVideoUrl(previewUrl)) {
            previewEl.innerHTML =
                '<video class="project-video-preview-media" autoplay muted loop controls preload="metadata" playsinline>' +
                    '<source src="' + escapeHtml(previewUrl) + '">' +
                    'Votre navigateur ne supporte pas la lecture video.' +
                '</video>';
            return;
        }

        if (isImageUrl(previewUrl)) {
            previewEl.innerHTML =
                '<img class="project-video-preview-media" src="' + escapeHtml(previewUrl) + '" alt="Apercu video du projet ' + escapeHtml(project.title) + '">';
            return;
        }

        previewEl.innerHTML =
            '<a class="project-code-link" href="' + escapeHtml(previewUrl) + '" target="_blank" rel="noopener noreferrer">' +
                '<i class="fa fa-external-link" aria-hidden="true"></i> Ouvrir l\'apercu video' +
            '</a>';
    }

    function buildMediaCard(item, index, projectTitle) {
        var mediaHtml = "";

        if (item.type === "video") {
            mediaHtml =
                '<video class="project-gallery-media" controls preload="metadata" playsinline ' +
                (item.poster ? 'poster="' + escapeHtml(item.poster) + '" ' : "") +
                'aria-label="Video ' + (index + 1) + ' du projet ' + escapeHtml(projectTitle) + '">' +
                    '<source src="' + escapeHtml(item.src) + '">' +
                    'Votre navigateur ne supporte pas la lecture video.' +
                '</video>';
        } else if (item.type === "link") {
            mediaHtml =
                '<a class="project-gallery-link" href="' + escapeHtml(item.src) + '" target="_blank" rel="noopener noreferrer">' +
                    '<i class="fa fa-external-link" aria-hidden="true"></i> Ouvrir la demo' +
                '</a>';
        } else {
            mediaHtml =
                '<img class="project-gallery-media" src="' + escapeHtml(item.src) + '" alt="' + escapeHtml(item.alt) + '" loading="lazy">';
        }

        return (
            '<figure class="project-media-card project-gallery-item">' +
                mediaHtml +
                (item.caption ? '<figcaption>' + escapeHtml(item.caption) + '</figcaption>' : "") +
            '</figure>'
        );
    }

    function renderMediaGallery(project) {
        var galleryEl = document.getElementById("proj-gallery");
        if (!galleryEl) return;

        var media = getProjectMedia(project);
        if (!media.length) {
            galleryEl.innerHTML = '<p class="project-gallery-empty">Aucun media disponible pour ce projet.</p>';
            return;
        }

        galleryEl.innerHTML = media.map(function (item, index) {
            return buildMediaCard(item, index, project.title);
        }).join("");
    }

    function renderExtraSections(project) {
        var container = document.getElementById("proj-extra-sections");
        if (!container) return;

        var sections = Array.isArray(project.sectionsDetails) ? project.sectionsDetails : [];
        if (!sections.length) {
            container.innerHTML = "";
            return;
        }

        container.innerHTML = sections.map(function (section) {
            var title = section && section.title ? section.title : "Detail";
            var content = section ? section.content : "";
            var contentHtml = "";

            if (Array.isArray(content)) {
                contentHtml = '<ul class="project-list">' + content.map(function (item) {
                    return "<li>" + escapeHtml(item) + "</li>";
                }).join("") + "</ul>";
            } else {
                contentHtml = "<p>" + escapeHtml(content || "") + "</p>";
            }

            return (
                '<article class="project-block">' +
                    "<h2>" + escapeHtml(title) + "</h2>" +
                    contentHtml +
                "</article>"
            );
        }).join("");
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

        renderExtraSections(project);
        renderMediaGallery(project);
        renderVideoPreview(project);

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
