(function () {
    "use strict";

    var DATA_URL = "src/data/timeline.json";

    function escapeHtml(str) {
        return String(str)
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

    function buildItem(item) {
        var chipsHtml = "";
        if (Array.isArray(item.chips) && item.chips.length) {
            chipsHtml =
                '<div class="tl-chips">' +
                item.chips.map(function (c) {
                    return "<span>" + escapeHtml(c) + "</span>";
                }).join("") +
                "</div>";
        }

        var article = document.createElement("article");
        article.className = "tl-item";
        article.setAttribute("data-tl-animate", "");

        article.innerHTML =
            '<div class="tl-dot">' + renderIconHtml(item.icon) + '</div>' +
            '<div class="tl-card">' +
                '<div class="tl-card-header">' +
                    '<span class="tl-tag tl-tag--' + escapeHtml(item.tagType) + '">' + escapeHtml(item.tag) + '</span>' +
                    '<span class="tl-date">' + escapeHtml(item.date) + '</span>' +
                '</div>' +
                '<h4 class="tl-title">' + escapeHtml(item.title) + '</h4>' +
                '<p class="tl-desc">' + escapeHtml(item.desc) + '</p>' +
                chipsHtml +
            '</div>';

        return article;
    }

    function extractSortDate(item) {
        // Utilise dateSort si disponible (format MM/YYYY), sinon extrait l'année de date
        if (item.dateSort) {
            var parts = String(item.dateSort).split("/");
            if (parts.length === 2) {
                var month = parseInt(parts[0], 10) || 1;
                var year = parseInt(parts[1], 10) || 9999;
                return year * 100 + month; // Format: YYYYMM pour tri
            }
        }
        // Fallback sur l'année
        var match = String(item.date).match(/\d{4}/);
        var year = match ? parseInt(match[0], 10) : 9999;
        return year * 100;
    }

    function sortByDateAscending(items) {
        return items.sort(function (a, b) {
            return extractSortDate(a) - extractSortDate(b);
        });
    }

    function attachObserver(items) {
        if (!("IntersectionObserver" in window)) {
            items.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        items.forEach(function (el) { observer.observe(el); });
    }

    function initTimeline() {
        var container = document.querySelector(".timeline-container");
        if (!container) return;

        fetch(DATA_URL)
            .then(function (res) {
                if (!res.ok) throw new Error("Impossible de charger la timeline.");
                return res.json();
            })
            .then(function (items) {
                // Filtre : exclure les éléments réservés au CV (onlyInCV === true)
                var filteredItems = items.filter(function(item) {
                    return item.onlyInCV !== true;
                });
                var sortedItems = sortByDateAscending(filteredItems);
                var fragment = document.createDocumentFragment();
                sortedItems.forEach(function (item) {
                    fragment.appendChild(buildItem(item));
                });
                container.appendChild(fragment);

                var newItems = Array.prototype.slice.call(
                    container.querySelectorAll(".tl-item[data-tl-animate]")
                );
                attachObserver(newItems);
                document.dispatchEvent(new CustomEvent("portfolio:layout-stable"));
            })
            .catch(function (err) {
                console.warn("Timeline:", err.message);
            });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTimeline);
    } else {
        initTimeline();
    }
})();