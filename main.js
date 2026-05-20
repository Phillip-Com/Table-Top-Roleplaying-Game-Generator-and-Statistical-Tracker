document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabPages = document.querySelectorAll(".tab-page");
    const themeToggle = document.getElementById("theme-toggle");

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            themeToggle.textContent = "🌙Dark Mode";
        } else {
            themeToggle.textContent = "☀️Light Mode";
        }
    });

    function hideAllTabs() {
        tabPages.forEach(page => page.style.display = "None");
        tabButtons.forEach(btn => btn.classList.remove("active"));
    }

    function showTab(tabName) {
        hideAllTabs();
        const page = document.querySelector(`#tab-${tabName}`);
        const btn = document.querySelector(`[data-tab="${tabName}"]`);
        if (page) page.style.display = "block";
        if (btn) btn.classList.add("active");
    }

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => showTab(btn.getAttribute("data-tab")));
    });

    showTab("treasure");
});