(function () {
      "use strict";

      var MOBILE_NAV_BREAKPOINT = 1140;

      function initNavbar() {
            var nav = document.querySelector(".primary-nav");
            var menuButton = document.querySelector(".menu-icon");
            var menuContainer = document.querySelector(".menu");
            var menuList = document.querySelector("#primary-menu");
            var menuLinks = document.querySelectorAll("#primary-menu li a");
            var ticking = false;

            if (!nav || !menuButton || !menuList || !menuContainer) return;

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
                  var current = "";

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

            function getHashTarget(hash) {
                  if (!hash || hash.charAt(0) !== "#") return null;
                  return document.querySelector(hash);
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

            function scrollToHash(hash, useSmoothScroll) {
                  var target = getHashTarget(hash);
                  if (!target) return;

                  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  var scrollOffset = nav.offsetHeight;
                  var targetY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - scrollOffset);

                  if (useSmoothScroll && !reducedMotion) {
                        smoothScrollTo(targetY, 320);
                  } else {
                        window.scrollTo(0, targetY);
                  }

                  setActiveLink(hash);
            }

            function correctInitialHashScroll() {
                  if (!window.location.hash) return;
                  scrollToHash(window.location.hash, false);
            }

            menuButton.setAttribute("aria-haspopup", "menu");
            menuList.setAttribute("aria-hidden", "true");

            function isMenuOpen() {
                  return menuList.classList.contains("showing");
            }

            function openMenu() {
                  menuList.classList.add("showing");
                  menuContainer.classList.add("is-open");
                  menuList.setAttribute("aria-hidden", "false");
                  menuButton.setAttribute("aria-expanded", "true");
                  document.body.classList.add("mobile-menu-open");
            }

            function closeMenu() {
                  menuList.classList.remove("showing");
                  menuContainer.classList.remove("is-open");
                  menuList.setAttribute("aria-hidden", "true");
                  menuButton.setAttribute("aria-expanded", "false");
                  document.body.classList.remove("mobile-menu-open");
            }

            menuButton.addEventListener("click", function () {
                  if (window.innerWidth > MOBILE_NAV_BREAKPOINT) return;
                  if (isMenuOpen()) {
                        closeMenu();
                  } else {
                        openMenu();
                  }
            });

            document.addEventListener("keydown", function (event) {
                  if (event.key === "Escape" && isMenuOpen()) {
                        closeMenu();
                        menuButton.focus();
                  }
            });

            document.addEventListener("click", function (event) {
                  if (window.innerWidth > MOBILE_NAV_BREAKPOINT) return;
                  if (!isMenuOpen()) return;
                  if (!nav.contains(event.target)) {
                        closeMenu();
                  }
            });

            menuLinks.forEach(function (link) {
                  link.addEventListener("click", function (event) {
                        var href = link.getAttribute("href") || "";
                        if (href.charAt(0) === "#") {
                              var target = document.querySelector(href);
                              if (target) {
                                    event.preventDefault();
                                    scrollToHash(href, true);

                                    if (history.pushState) {
                                          history.pushState(null, "", href);
                                    } else {
                                          window.location.hash = href;
                                    }
                              }
                              setActiveLink(href);
                        }
                        if (window.innerWidth <= MOBILE_NAV_BREAKPOINT) {
                              closeMenu();
                        }
                  });
            });

            window.addEventListener("resize", function () {
                  if (window.innerWidth > MOBILE_NAV_BREAKPOINT) {
                        closeMenu();
                  }
                  requestNavUpdate();
            });

            window.addEventListener("scroll", requestNavUpdate, { passive: true });
            window.addEventListener("hashchange", function () {
                  requestNavUpdate();
                  correctInitialHashScroll();
            });
            window.addEventListener("load", correctInitialHashScroll);
            window.addEventListener("pageshow", correctInitialHashScroll);
            document.addEventListener("portfolio:layout-stable", correctInitialHashScroll);
            closeMenu();
            requestNavUpdate();
            requestAnimationFrame(correctInitialHashScroll);
      }

      if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initNavbar);
      } else {
            initNavbar();
      }
})();