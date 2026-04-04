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
            '<div class="tl-dot"><i class="' + escapeHtml(item.icon) + '" aria-hidden="true"></i></div>' +
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
                var fragment = document.createDocumentFragment();
                items.forEach(function (item) {
                    fragment.appendChild(buildItem(item));
                });
                container.appendChild(fragment);

                var newItems = Array.prototype.slice.call(
                    container.querySelectorAll(".tl-item[data-tl-animate]")
                );
                attachObserver(newItems);
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