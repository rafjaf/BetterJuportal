'use strict';

// ---------------------------------------------------------------------------
// Generic DOM / async utility functions
// ---------------------------------------------------------------------------

async function getStorage(key) {
    let items = await chrome.storage.local.get(key);
    try {
        return(items[key]);
    }
    catch(e) {
        console.error(`Error getting key ${key} from local storage:`, e);
        return undefined;
    }
}

async function setStorage(key, value) {
    let obj = {};
    obj[key] = value;
    try {
        return await chrome.storage.local.set(obj);
    }
    catch(e) {
        console.error(`Error storing value ${value} of key ${key} in local storage:`, e);
        return undefined;
    }
}

function addStyle(css) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
}

const saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (url, fileName) {
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

async function loadDoc(urlTarget) {
    let r = await fetch(urlTarget, { method: "GET" });
    let html = await r.text();
    let parser = new DOMParser();
    return parser.parseFromString(html, "text/html");
}

function waitForElement(selector, timeout = 30000) {
    return new Promise(resolve => {
        if ($(selector)) return resolve(true);
        const observer = new MutationObserver(() => {
            if ($(selector)) {
                observer.disconnect();
                resolve(true);
            }
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
        setTimeout(() => { observer.disconnect(); resolve(false); }, timeout);
    });
}

function $(selector) {
    return document.querySelector(selector);
}

function makeTOC(container, output) {
    var toc = "";
    var level = 0;

    container.innerHTML =
        container.innerHTML.replace(
        /<h([\d])>([^<]+)<\/h([\d])>/gi,
        function (str, openLevel, titleText, closeLevel) {
            if (openLevel != closeLevel) {
                return str;
            }

            if (openLevel > level) {
                toc += (new Array(openLevel - level + 1)).join('<ul>');
            } else if (openLevel < level) {
                toc += (new Array(level - openLevel + 1)).join('</li></ul>');
            } else {
                toc += (new Array(level + 1)).join('</li>');
            }

            level = parseInt(openLevel);

            var anchor = titleText.replace(/\s/g, "_");
            toc += '<li><a href="#' + anchor + '">' + titleText + '</a>';

            return '<h' + openLevel + '><a id="' + anchor + '">'
                + titleText + '</a></h' + closeLevel + '>';
        }
    );

    if (level) {
        toc += (new Array(level + 1)).join('</ul>');
    }
    output.innerHTML += toc;
}
