(function () {
      "use strict";

      function initNavbar() {
            var nav = document.querySelector(".primary-nav");
            var menuButton = document.querySelector(".menu-icon");
            var menuList = document.querySelector(".primary-nav ul");
            var menuLinks = document.querySelectorAll(".primary-nav ul li a");
            var ticking = false;

            if (!nav || !menuButton || !menuList) return;

            var navLinks = Array.prototype.slice.call(menuLinks).filter(function (link) {
                  var href = link.getAttribute("href") || "";
                  return href.charAt(0) === "#";
            });

            var sections = navLinks
                  .map(function (link) {
                        var selector = link.getAttribute("href");
                        var section = selector ? document.querySelector(selector) : null;
                        return section ? { link: link, section: section, href: selector } : null;
                  })
                  .filter(Boolean);

            function setActiveLink(activeHref) {
                  navLinks.forEach(function (link) {
                        var isActive = (link.getAttribute("href") || "") === activeHref;
                        link.classList.toggle("is-active", isActive);
                        if (isActive) {
                              link.setAttribute("aria-current", "page");
                        } else {
                              link.removeAttribute("aria-current");
                        }
                  });
            }

            function updateActiveLink() {
                  if (!sections.length) return;

                  var marker = window.scrollY + nav.offsetHeight + 24;
                  var current = sections[0].href;

                  sections.forEach(function (entry) {
                        if (entry.section.offsetTop <= marker) {
                              current = entry.href;
                        }
                  });

                  setActiveLink(current);
            }

            function requestNavUpdate() {
                  if (ticking) return;
                  ticking = true;
                  window.requestAnimationFrame(function () {
                        updateScrollState();
                        updateActiveLink();
                        ticking = false;
                  });
            }

            function updateScrollState() {
                  if (window.scrollY > 8) {
                        nav.classList.add("black");
                  } else {
                        nav.classList.remove("black");
                  }
            }

            function easeInOutCubic(t) {
                  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function smoothScrollTo(targetY, duration) {
                  var startY = window.scrollY;
                  var distance = targetY - startY;
                  var startTime = null;

                  function step(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var elapsed = timestamp - startTime;
                        var progress = Math.min(elapsed / duration, 1);
                        var eased = easeInOutCubic(progress);

                        window.scrollTo(0, startY + distance * eased);

                        if (progress < 1) {
                              window.requestAnimationFrame(step);
                        }
                  }

                  window.requestAnimationFrame(step);
            }

            function closeMenu() {
                  menuList.classList.remove("showing");
                  menuButton.setAttribute("aria-expanded", "false");
            }

            menuButton.addEventListener("click", function () {
                  var isOpen = menuList.classList.toggle("showing");
                  menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });

            menuLinks.forEach(function (link) {
                  link.addEventListener("click", function (event) {
                        var href = link.getAttribute("href") || "";
                        if (href.charAt(0) === "#") {
                              var target = document.querySelector(href);
                              if (target) {
                                    event.preventDefault();
                                    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                                    var targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight - 12);

                                    if (reducedMotion) {
                                          window.scrollTo(0, targetY);
                                    } else {
                                          smoothScrollTo(targetY, 520);
                                    }

                                    if (history.pushState) {
                                          history.pushState(null, "", href);
                                    } else {
                                          window.location.hash = href;
                                    }
                              }
                              setActiveLink(href);
                        }
                        if (window.innerWidth <= 768) {
                              closeMenu();
                        }
                  });
            });

            window.addEventListener("resize", function () {
                  if (window.innerWidth > 768) {
                        closeMenu();
                  }
                  requestNavUpdate();
            });

            window.addEventListener("scroll", requestNavUpdate, { passive: true });
            window.addEventListener("hashchange", requestNavUpdate);
            requestNavUpdate();
      }

      if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initNavbar);
      } else {
            initNavbar();
      }
})();