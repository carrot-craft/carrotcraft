// This file provides interactive functionality for the website.
// It includes DOM manipulation and event listener setup.

// Prevent scroll restoration on page load
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener('DOMContentLoaded', function() {
    // Force scroll to top immediately
    window.scrollTo(0, 0);

    // Additional safety check for hash links
    if (window.location.hash) {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 10);
    }
    const button = document.getElementById('myButton');
    if (button) {
        button.addEventListener('click', function() {
            alert('Button was clicked!');
        });
    }

    const elements = document.querySelectorAll('.myClass');
    elements.forEach(element => {
        element.addEventListener('mouseover', function() {
            element.style.color = 'blue';
        });
        element.addEventListener('mouseout', function() {
            element.style.color = '';
        });
    });

    // Smooth scroll for navigation links (updated to adjust for header height)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // Scroll Animation
    const observerOptions = {
        root: null, // ビューポートをルートとして使用
        rootMargin: '0px',
        threshold: 0.1 // 10% 要素が見えたら発火
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // 一度表示されたら監視を解除する場合
                // observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // アニメーションさせたい要素を取得
    const animatedElements = document.querySelectorAll('section, .card');
    animatedElements.forEach(el => observer.observe(el));

    // Modal Functionality
    const openModalButtons = document.querySelectorAll('[data-modal-target]');
    const closeModalButtons = document.querySelectorAll('.close-button');
    const overlay = document.querySelector('.modal-overlay'); // CSSで .modal-overlay を定義した場合

    function openModal(modal) {
        if (modal == null) return;
        modal.classList.add('active');
        // overlay.classList.add('active'); // モーダル自体に背景があるので、個別オーバーレイは不要かも
        document.body.style.overflow = 'hidden'; // 背景スクロール禁止
    }

    function closeModal(modal) {
        if (modal == null) return;
        modal.classList.remove('active');
        // overlay.classList.remove('active');
        document.body.style.overflow = ''; // 背景スクロール許可
    }

    openModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = document.querySelector(button.dataset.modalTarget);
            openModal(modal);
        });
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            closeModal(modal);
        });
    });

    // モーダル外クリックで閉じる
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) { // modal-content の外側がクリックされた場合
                closeModal(modal);
            }
        });
    });

    // Theme Toggle Functionality
    const themeToggleButton = document.getElementById('theme-toggle');
    const body = document.body;
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    function applyTheme(theme) {
        body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        if (themeToggleButton) {
            const icon = themeToggleButton.querySelector('i');
            if (theme === 'dark') {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            }
        }
    }

    // Load saved theme or detect OS preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        applyTheme('dark');
    } else {
        applyTheme('light'); // Default to light if no preference or saved theme
    }

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            const currentTheme = body.dataset.theme || (prefersDarkScheme.matches ? 'dark' : 'light');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    }

    // Listen for OS theme changes (optional, but good for UX)
    prefersDarkScheme.addEventListener('change', (e) => {
        // Only change if no theme is explicitly set by the user via toggle
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Language Toggle Functionality
    const langToggleButton = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('language') || 'ja'; // Default to Japanese

    function applyLanguage(lang) {
        document.documentElement.lang = lang; // Set lang attribute on <html>
        if (langToggleButton) {
            langToggleButton.textContent = lang.toUpperCase();
        }

        // Update page title
        const bodyTag = document.body;
        if (bodyTag.dataset.titleJa && bodyTag.dataset.titleEn) {
            document.title = lang === 'en' ? bodyTag.dataset.titleEn : bodyTag.dataset.titleJa;
        } else if (document.querySelector('title[data-ja][data-en]')) { // Fallback for rules.html title
             const titleTag = document.querySelector('title[data-ja][data-en]');
             document.title = lang === 'en' ? titleTag.dataset.en : titleTag.dataset.ja;
        }

        const translatableElements = document.querySelectorAll('[data-ja][data-en]');
        translatableElements.forEach(el => {
            const content = el.dataset[lang];
            if (content !== undefined) {
                // Check if the content string itself contains HTML tags
                const containsHtml = /<[a-z][\s\S]*>/i.test(content);

                if (containsHtml) {
                    el.innerHTML = content;
                } else {
                    // For simple text, textContent is generally fine.
                    // Special handling for <a> tags that only contain a text node,
                    // to correctly update the text without affecting other potential child nodes (like icons, though not in current nav structure).
                    if (el.tagName === 'A' && el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE) {
                         el.childNodes[0].nodeValue = content;
                    } else {
                         el.textContent = content;
                    }
                }
            }
        });

        // Special handling for aria-labels on specific buttons
        if (themeToggleButton && themeToggleButton.dataset.ariaLabelJa && themeToggleButton.dataset.ariaLabelEn) {
            const ariaLabel = lang === 'en' ? themeToggleButton.dataset.ariaLabelEn : themeToggleButton.dataset.ariaLabelJa;
            themeToggleButton.setAttribute('aria-label', ariaLabel);
        }
        if (langToggleButton && langToggleButton.dataset.ariaLabelJa && langToggleButton.dataset.ariaLabelEn) {
            const ariaLabel = lang === 'en' ? langToggleButton.dataset.ariaLabelEn : langToggleButton.dataset.ariaLabelJa;
            langToggleButton.setAttribute('aria-label', ariaLabel);
        }
    }

    if (langToggleButton) {
        langToggleButton.addEventListener('click', () => {
            currentLang = (currentLang === 'ja') ? 'en' : 'ja';
            localStorage.setItem('language', currentLang);
            applyLanguage(currentLang);
        });
    }

    // Apply initial language
    applyLanguage(currentLang);

    // Copy Server IP Functionality
    const copyButton = document.getElementById('copy-server-ip');
    const serverIp = document.getElementById('server-ip');

    // Copy function
    const copyServerAddress = async () => {
        try {
            const ipText = serverIp.textContent.trim();

            // Modern browsers with Clipboard API
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(ipText);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = ipText;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }

            // Visual feedback for copy button
            if (copyButton) {
                copyButton.classList.add('copied');
                setTimeout(() => {
                    copyButton.classList.remove('copied');
                }, 1000);
            }

            // Visual feedback for IP address (subtle scale only)
            serverIp.style.transform = 'scale(1.02)';

            setTimeout(() => {
                serverIp.style.transform = '';
            }, 200);

        } catch (err) {
            console.error('Failed to copy text: ', err);

            // Show error feedback
            if (copyButton) {
                const originalText = copyButton.querySelector('.copy-text').textContent;
                const errorText = currentLang === 'ja' ? 'エラー' : 'Error';
                copyButton.querySelector('.copy-text').textContent = errorText;

                setTimeout(() => {
                    copyButton.querySelector('.copy-text').textContent = originalText;
                }, 1000);
            }
        }
    };

    // Add click event to both copy button and IP address
    if (copyButton && serverIp) {
        copyButton.addEventListener('click', copyServerAddress);
        serverIp.addEventListener('click', copyServerAddress);

        // Update aria-label on language change
        const updateCopyButtonAria = () => {
            if (copyButton.dataset.ariaLabelJa && copyButton.dataset.ariaLabelEn) {
                const ariaLabel = currentLang === 'en' ? copyButton.dataset.ariaLabelEn : copyButton.dataset.ariaLabelJa;
                copyButton.setAttribute('aria-label', ariaLabel);
            }
        };

        // Call initially and on language change
        updateCopyButtonAria();

        // Override the language toggle to also update copy button
        const originalLangToggle = langToggleButton?.onclick;
        if (langToggleButton) {
            langToggleButton.addEventListener('click', () => {
                setTimeout(updateCopyButtonAria, 100); // Delay to ensure language is updated
            });
        }
    }

    console.log("Modern Minecraft Site Script Loaded with Scroll Animations, Modals, Theme Toggle, Language Toggle, and Copy Functionality!");
});