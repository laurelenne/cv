(function () {
    "use strict";

    var DATA_URL = "src/data/projects.json";
    var INITIAL_VISIBLE = 6;
    var state = {
        projects: [],
        visibleCount: INITIAL_VISIBLE,
        techFilter: "",
        typeFilter: "",
        lightboxImages: [],
        lightboxIndex: 0,
        lightboxEl: null
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function buildCard(project, visibleIndex) {
        var techHtml = (project.tech || []).map(function (t) {
            return "<span>" + escapeHtml(t) + "</span>";
        }).join("");

        var article = document.createElement("article");
        article.className = "project-card";
        article.setAttribute("data-proj-animate", "");

        article.innerHTML =
            '<div class="project-card-img-wrapper">' +
                '<button type="button" class="project-image-zoom-trigger" data-project-image-index="' + visibleIndex + '" aria-label="Agrandir l\'image du projet ' + escapeHtml(project.title) + '">' +
                    '<img src="' + escapeHtml(project.apercu) + '" alt="' + escapeHtml(project.apercu_alt) + '" class="project-card-img">' +
                    '<span class="project-image-zoom-hint"><i class="fa fa-search-plus" aria-hidden="true"></i> Agrandir</span>' +
                '</button>' +
            '</div>' +
            '<div class="project-card-body">' +
                '<div class="project-card-meta">' +
                    '<span class="project-card-year">' + escapeHtml(project.year || "") + '</span>' +
                    '<span class="project-card-type">' + escapeHtml(project.type || "Projet") + '</span>' +
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

    function ensureLightbox() {
        if (state.lightboxEl) return state.lightboxEl;

        var lightbox = document.createElement("div");
        lightbox.className = "media-lightbox";
        lightbox.setAttribute("hidden", "");
        lightbox.setAttribute("aria-hidden", "true");
        lightbox.innerHTML =
            '<div class="media-lightbox-backdrop" data-lightbox-close="true"></div>' +
            '<div class="media-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Visualisation image projet">' +
                '<button type="button" class="media-lightbox-close" aria-label="Fermer la visionneuse">' +
                    '<i class="fa fa-times" aria-hidden="true"></i>' +
                '</button>' +
                '<button type="button" class="media-lightbox-nav media-lightbox-nav--prev" aria-label="Image precedente">' +
                    '<i class="fa fa-chevron-left" aria-hidden="true"></i>' +
                '</button>' +
                '<figure class="media-lightbox-figure">' +
                    '<img class="media-lightbox-image" src="" alt="" loading="eager">' +
                    '<figcaption class="media-lightbox-caption"></figcaption>' +
                    '<p class="media-lightbox-counter" aria-live="polite"></p>' +
                '</figure>' +
                '<button type="button" class="media-lightbox-nav media-lightbox-nav--next" aria-label="Image suivante">' +
                    '<i class="fa fa-chevron-right" aria-hidden="true"></i>' +
                '</button>' +
            '</div>';

        document.body.appendChild(lightbox);
        state.lightboxEl = lightbox;

        lightbox.addEventListener("click", function (event) {
            if (event.target.hasAttribute("data-lightbox-close") || event.target.classList.contains("media-lightbox")) {
                closeLightbox();
            }
        });

        var closeBtn = lightbox.querySelector(".media-lightbox-close");
        var prevBtn = lightbox.querySelector(".media-lightbox-nav--prev");
        var nextBtn = lightbox.querySelector(".media-lightbox-nav--next");

        if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
        if (prevBtn) prevBtn.addEventListener("click", function () { stepLightbox(-1); });
        if (nextBtn) nextBtn.addEventListener("click", function () { stepLightbox(1); });

        document.addEventListener("keydown", function (event) {
            if (!isLightboxOpen()) return;
            if (event.key === "Escape") {
                closeLightbox();
                return;
            }
            if (event.key === "ArrowLeft") {
                stepLightbox(-1);
                return;
            }
            if (event.key === "ArrowRight") {
                stepLightbox(1);
            }
        });

        return lightbox;
    }

    function isLightboxOpen() {
        return !!(state.lightboxEl && !state.lightboxEl.hasAttribute("hidden"));
    }

    function updateLightboxImage() {
        var lightbox = ensureLightbox();
        var images = state.lightboxImages;
        var total = images.length;
        if (!total) return;

        if (state.lightboxIndex < 0) state.lightboxIndex = total - 1;
        if (state.lightboxIndex >= total) state.lightboxIndex = 0;

        var current = images[state.lightboxIndex];
        var imageEl = lightbox.querySelector(".media-lightbox-image");
        var captionEl = lightbox.querySelector(".media-lightbox-caption");
        var counterEl = lightbox.querySelector(".media-lightbox-counter");
        var prevBtn = lightbox.querySelector(".media-lightbox-nav--prev");
        var nextBtn = lightbox.querySelector(".media-lightbox-nav--next");

        if (imageEl) {
            imageEl.src = current.src;
            imageEl.alt = current.alt;
        }

        if (captionEl) {
            captionEl.textContent = current.caption;
            captionEl.hidden = !current.caption;
        }

        if (counterEl) {
            counterEl.textContent = (state.lightboxIndex + 1) + " / " + total;
        }

        if (prevBtn) prevBtn.disabled = total < 2;
        if (nextBtn) nextBtn.disabled = total < 2;
    }

    function openLightbox(index) {
        if (!state.lightboxImages.length) return;

        state.lightboxIndex = Number(index) || 0;
        updateLightboxImage();

        var lightbox = ensureLightbox();
        lightbox.removeAttribute("hidden");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");

        var closeBtn = lightbox.querySelector(".media-lightbox-close");
        if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
        if (!state.lightboxEl) return;
        state.lightboxEl.setAttribute("hidden", "");
        state.lightboxEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
    }

    function stepLightbox(delta) {
        if (!state.lightboxImages.length) return;
        state.lightboxIndex += delta;
        updateLightboxImage();
    }

    function bindGridInteractions(grid) {
        if (!grid) return;

        grid.addEventListener("click", function (event) {
            var trigger = event.target.closest(".project-image-zoom-trigger");
            if (!trigger || !grid.contains(trigger)) return;

            var index = Number(trigger.getAttribute("data-project-image-index"));
            if (Number.isNaN(index)) return;

            event.preventDefault();
            openLightbox(index);
        });
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
        if (isLightboxOpen()) closeLightbox();
        grid.innerHTML = "";

        var filtered = getFilteredProjects();
        var visible = filtered.slice(0, state.visibleCount);
        var fragment = document.createDocumentFragment();

        state.lightboxImages = visible.map(function (project) {
            return {
                src: project.apercu,
                alt: project.apercu_alt || ("Apercu du projet " + project.title),
                caption: project.title
            };
        });

        visible.forEach(function (project, index) {
            fragment.appendChild(buildCard(project, index));
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

        ensureLightbox();
        bindGridInteractions(grid);

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
