(function() {
    'use strict';

    const CLIPBOARD_IMG = "data:image/gif; base64,"
    + "R0lGODlhEAAQAHcAACH5BAEAAAAALAAAAAAQABAApwEAAMaML//iYvGJHqBeJf+RMP6uVf+tR/+M"
    + "K/+BE5iYmP+2UP+7Vqqwuv++WP+yTP+SMP+/Wf+kP//AWf+7Vd/g4f+vSf6tVP+0Tv/VY6d5Kv+4"
    + "Uv+OLP+NLv+zTf+8Vv+4U/6tU/6sUP/EXv6tUuDf3/+3Uf+PL/+QMJ9cJPPy7ry8vLG70f+AEv/K"
    + "Zf+SIP+wSv+RF/+pQ/+YNJFgJf+8V/P3//+qQ//nb6yDLaqwuP/GZf/ahv/Kbf/FYf+eO/+rRf+2"
    + "Uv+eOf/AVP+gPP+jP6BeJv+/WP+mQ5hrKP/fjv+5U59eJ/+wS/+lTP+dOv+bN//BW/+pQv/BWf+c"
    + "Of+6VP+rRuTk5P+hPf+eOv/BXP/Pdv+zTP+HG9W6gP+/Wp1bJP6oTf/CW/+WNJ5cJf+LH/+uSP/V"
    + "e//AWv+6U//FX4eHh/+QGP/MU/+fPP///+Xl5Z9cJf+uSf+XNcCLMv/ci+Ph3Lu7wcejZp5dJfXz"
    + "8P+pPf+OLv6kS/+5VP6gSP+RHN7e3P6sUv/mcf+PLo2NjQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    + "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    + "AAjoAAEIHAhAgQKCCAleKaQATkKEFd6sWaGiQkIRBgx40ROoRAk7NpIMGClQhJI2eO7oaMCSBY09"
    + "SAYIJFHHRYYcdALoDJBhiAw2M3n4UINjkICjAkaMuBFDYIgzWqKIQTNlwoQjaUxIAeR0y5cIERw4"
    + "CPthwQMJLwRe6MGAgh8GHxiAWMDFApUyAg3sALFhA4UqS0xggAFkTBe1NR488LAAgwcLVoo8QZFA"
    + "oKAgBzLLaWJGAhYoc05UBhCmTxY3RH4ImQEBwokOHVoIdPKnQAEIBQjx4YCgN4fRADQQGG4kT5wU"
    + "YMgw0SAwIAA7";

    const SAVE_IMG = "data:image/png; base64,"
    + "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJ"
    + "bWFnZVJlYWR5ccllPAAAAURJREFUeNqsks1qg0AQx2erIAGhfQPBQIIXb+Kp1wbaS0++VvMWXu0h"
    + "fYAcFPElUvABWu0qfndmm12ag9BI/7Af7Mz+ZnZ2GADco44wo2ma1EojjuNnXF+lXXcc54gDbNsW"
    + "B1EUQZIkczxwXTdijCmITlNRFJBlmXAYxxGapgFGUc+XfN8Xa5qmsNlsoO97BdFlesMwKEBVV8Am"
    + "RDBCMLAsS9jquhZ+2+0WNE2LyKjLS0hVb604xw0BfjKQNv7Foet6YHguAypA13XCn/ac18LpXD7Y"
    + "71+Aaskxs77vLmoiAPRmGYW02z3MFnFtr1VmClCWJeR5DqvVShyapjkLOL2fRPrSVwDatoUwDOGv"
    + "CoLgMgN6v+d5sEQ3ErBU/wP4/QNXA7CjVFMsEf3owTCMx2svYu+8Ydc+EeAWx92C4B8I+PwWYACX"
    + "BK4D+SrWXwAAAABJRU5ErkJggg==";

    const MONTH_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
		"septembre", "octobre", "novembre", "décembre"];

    const MONTH_NL = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus",
        "september", "oktober", "november", "december"];

    const CASES_COLORS = {
        "C" : "yellow",
        "P" : "lightgreen",
        "F" : "deepskyblue",
        "S" : "hotpink",
        "D" : "darkgray"
    }

    let isJudgment, linkedDocument, urlJudgment, urlOpinion, date, day, month, year, ref, ref_fn, ref_fn_Pas, RG, Pas, textAG, titleAG, nameAG, shortNameAG, introAG, urlPasicrisieDownload;

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
                    toc += (new Array(level+ 1)).join('</li>');
                }

                level = parseInt(openLevel);

                var anchor = titleText.replace(/\s/g, "_");
                toc += '<li><a href="#' + anchor + '">' + titleText
                    + '</a>';

                return '<h' + openLevel + '><a id="' + anchor + '">'
                    + titleText + '</a></h' + closeLevel + '>';
            }
        );

        if (level) {
            toc += (new Array(level + 1)).join('</ul>');
        }
        output.innerHTML += toc;
    };

    function initFormular() {
        // Show by default options for research by date or ECLI number
        // Show by default saved searches and improve the appearance of the list
        if ($("div#buttonchargerrecherche")) { // if at least one search has been saved
            hocuspocus20('formchargerrecherche','buttonchargerrecherche'); // Show saved searches
            $("select.text20").size = "1";
            $("div#formchargerrecherche").removeChild($("div#formchargerrecherche br"));
            $("select.text20").style.marginTop = "5px";
            $("select.text20").style.marginRight = "10px";
        }
        // When clicking in the text research input field, automatically select text content
        $("input#texpression").addEventListener("mousedown", function(e){
            e.target.select();
            e.target.focus();
            e.preventDefault();
        }, false);
        // Center and enlarge search button
        let el = document.createElement("div");
        $("button.buttonconfirm").parentElement.insertBefore(el, $("button.buttonconfirm"));
        el.appendChild($("button.buttonconfirm"));
        el.appendChild($("button.buttoncommand"));
        el.style.textAlign = "center";
        $("button.buttonconfirm").style.fontSize = "large";
        // Add button to search only in Supreme Court judgments
        let btnSearchCass = document.createElement("button");
        btnSearchCass.innerText = "Cass.";
        btnSearchCass.style.cssText = window.getComputedStyle($("button.buttonconfirm")).cssText
        el.appendChild(btnSearchCass);
        btnSearchCass.addEventListener("click", (e) => {
            e.preventDefault();
            $("select#combojusteljurid option[value='1']").selected = true;
            $("button.buttonconfirm").click();
        }, false);
    }

    function analyseECLI(ECLI) {
        let isJudgment, date, year, month, day;
        isJudgment = (ECLI.split(":")[4].slice(0,3) == "ARR");
        [, year, month, day] = ECLI.split(":")[4].slice(isJudgment ? 4 : 5, isJudgment ? 12 : 13).match(/(\d{4})(\d{2})(\d{2})/);
        date = parseInt(day) + (parseInt(day) == 1 ? "er " : " ") + MONTH_FR[month - 1] + " " + year;
        return [isJudgment, date, year, month, day];
    }

    async function initResults() {
        // --- Start of functions moved inside initResults for performance refactoring ---

        // Copy button and hijack copy to clipboard
        addStyle(`@keyframes myFade { 0% {opacity: 1;} 100% { opacity: 0;  } }`);
        const getSelectionParentElement = function() {
            let parentEl = null, sel;
            if (window.getSelection) {
                sel = window.getSelection();
                if (sel.rangeCount) {
                    parentEl = sel.getRangeAt(0).commonAncestorContainer;
                    if (parentEl.nodeType != 1) {
                        parentEl = parentEl.parentNode;
                    }
                }
            } else if ( (sel = document.selection) && sel.type != "Control") {
                parentEl = sel.createRange().parentElement();
            }
            return parentEl;
        }

        const analyseTarget = async function(e) {
            let urlTarget;
            let refElement;

            if (e.type === 'click') { // Click on copy/download button
                refElement = e.target.closest("span[data-ecli]").querySelector(".ref-container");
            } else { // copy event from selection
                let p = getSelectionParentElement().parentElement;
                do {
                    p = p.previousElementSibling;
                }
                while (p && p.className != "datalist_separateur");
                refElement = p.nextElementSibling.querySelector("span[data-ecli] .ref-container");
            }

            urlTarget = refElement.querySelector("a").href;
            [isJudgment,,year,month,day] = analyseECLI(refElement.closest("span[data-ecli]").dataset.ecli);
            ref = refElement.innerHTML; // Sets global `ref` string for other functions
            RG = ref.match(/(n° )(\w\.\d{2}\.\d{4}\.\w)/) ? ref.match(/(n° )(\w\.\d{2}\.\d{4}\.\w)/)[2] : "";
            ref_fn = "Cass. " + year + "-" + String(month).padStart(2, '0') + "-" + String(day).padStart(2, '0') + " n° " + RG + ".pdf";
            // Load target document
            let targetDoc = await loadDoc(urlTarget);
            urlJudgment = targetDoc.querySelector("fieldset#text a") ? Array.from(targetDoc.querySelectorAll("fieldset#text a")).slice(-1)[0].href : null;
            if (!urlJudgment && targetDoc.querySelector("a[title^=Original]")) {
                // Test if there exists an original version
                let originalDoc = targetDoc.querySelector("a[title^=Original]").href;
                targetDoc = await loadDoc(originalDoc);
                urlJudgment = targetDoc.querySelector("fieldset#text a") ? Array.from(targetDoc.querySelectorAll("fieldset#text a")).slice(-1)[0].href : null;
            }
            // Search linked document and AG
            // Use the same logic as in initCase to detect if the linked document is really an opinion
            const linkedDocumentsFieldset = Array.from(targetDoc.querySelectorAll("fieldset")).at(-1);
            if (linkedDocumentsFieldset && linkedDocumentsFieldset.querySelector("legend")?.innerText?.match(/^Publication|Gerelateerde/)) {
                const relevantLinks = ["Vonnis/arrest:", "Jugement/arrêt:", "Conclusie O.M.:", "Conclusion M.P.:"];
                const potentialDocumentLink = linkedDocumentsFieldset.querySelector("div.champ-entete").innerText;
                if (relevantLinks.some(type => potentialDocumentLink.includes(type))) {
                    linkedDocument = linkedDocumentsFieldset.querySelector("div.show-lien a");
                } else {
                    linkedDocument = null;
                }
            } else {
                linkedDocument = targetDoc.querySelector("div.show-lien a");
            }
            if (linkedDocument) {
                if (isJudgment) {
                    ref += ", concl. M.P.";
                }
                else {
                    ref = "concl. M.P. avant " + ref;
                }
                ref_fn = ref_fn.replace(".pdf", " concl. MP.pdf");
                await searchAG(false, targetDoc)
            }
            // Search Pasicrisie
            await searchPasicrisie(false, targetDoc);
        }

        const copyToClip = async function(e) { // Allow easier quoting of the case
            const s = document.getSelection();
            if (s.toString() || (e && e.type == "click")) {
                await analyseTarget(e);
                let ref_text = ref.replace(/<[^>]*>/g, '');
                if (s.toString()) {
                    navigator.clipboard.write([
                        new ClipboardItem({
                            "text/plain": new Blob([s.toString() + ' (' + ref_text + ")"], {type: 'text/plain'}),
                            "text/html": new Blob([s.toString() + ' (' + ref + ")"], {type: 'text/html'})
                        })
                    ]);
                }
                else { // e.type == "click"
                    navigator.clipboard.write([
                        new ClipboardItem({
                            "text/plain": new Blob([ref_text], {type: 'text/plain'}),
                            "text/html": new Blob([ref], {type: 'text/html'})
                        })
                    ]);
                }
            }
            else {
                navigator.clipboard.write([
                    new ClipboardItem({
                        "text/plain": new Blob([s.toString()], {type: 'text/plain'}),
                        "text/html": new Blob([s.toString()], {type: 'text/html'})
                    })
                ]);
            }
        }

        const downloadButton = async function(e) {
            e.target.disabled = true;
            await analyseTarget(e);
            await downloadFile(e.target);
            e.target.disabled = false;
        }

        const mouseOverHandle = function (e) {
            e.stopPropagation();
            let el = e.target;
            while (el.nodeName != "TR") {el = el.parentElement;}
            el.removeEventListener("mouseover", mouseOverHandle, false);
            while (el?.className != "datalist_separateur") {el = el.previousElementSibling;}
            if (el.nextElementSibling.querySelector("span").style.display == "none") {
                el.nextElementSibling.querySelector("span").style.display = "block";
                el.nextElementSibling.querySelector("span.decision_ligne1").style.display = "none";
            }
        }

        // --- End of moved functions ---

        // hijack copy function
        document.body.addEventListener("copy", function(e) {
            copyToClip(e);
            e.preventDefault();
        }, false);

        // Add delegated event listeners for copy and download buttons
        document.body.addEventListener('click', function(e) {
            if (e.target.matches('img.btnClipboard')) {
                copyToClip(e);
            } else if (e.target.matches('img.btnFilename')) {
                downloadButton(e);
            }
        });

        const processResult = (result) => {
            // Ensure that all results will be displayed in French
            const resultURL = result.href.split("?");
            if (resultURL.length > 1) {
                result.href = resultURL[0] + "/FR?" + resultURL[1];
            } else {
                result.href = resultURL[0] + "/FR";
            }
            // Process judgment of the Supreme Court
            const ECLI = result.title;
            if (ECLI.match(/CASS.+(ARR|CONC)/)) {
                // Make reference
                let [isJudgment, date, , ,] = analyseECLI(ECLI);
                RG = result.parentElement.querySelector("span").innerText.match(/(-.+-\s)(.+)/) ? result.parentElement.querySelector("span").innerText.match(/(-.+-\s)(.+)/)[2] : "";
                if (RG.match(/\w\d{6}\w/)) {
                    RG = RG.match(/(\w)(\d{2})(\d{4})(\w)/).slice(1,5).join(".");
                }
                let refHtml = "<span class='ref-container'>Cass., <a href='" + result.href + "'>" + date + "</a>" + (RG ? ", n° " + RG : "") + "</span>";
                let el = document.createElement("span");
                el.dataset.ecli = ECLI;
                el.style.display = "none";
                el.innerHTML = "<img class='btnClipboard' style='cursor: pointer; padding-right: 10px; "
                    + "vertical-align: sub" + "' src='" + CLIPBOARD_IMG + "'>"
                    + "<img class='btnFilename' style='cursor: pointer; padding-right: 10px; "
                    + "vertical-align: sub" + "' src='" + SAVE_IMG + "'>"
                    + refHtml;
                result.parentElement.insertBefore(el, result.parentElement.querySelector("span"));
                // Change color depending on nature of the case
                result.style.backgroundColor = CASES_COLORS[RG[0]] || "white";
            }
            // Color links to conclusions of advocate general in dark blue
            if (ECLI.match(/CONC/)) {
                result.style.color = "darkblue";
                let refLink = result.parentElement.querySelector("span a");
                if(refLink) refLink.style.color = "darkblue";
            }
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const resultLink = entry.target;
                    processResult(resultLink);
                    observer.unobserve(resultLink);
                }
            });
        }, { rootMargin: "200px" });

        let results = document.querySelectorAll("a[title^='ECLI']");
        results.forEach(result => {
            observer.observe(result);
        });

        // Make new span visible on mouseover
        Array.from(document.querySelectorAll("legend ~ table tr")).slice(5).forEach(el => {
            el.addEventListener("mouseover", mouseOverHandle, false);
        });
    }

    async function initCase() {
        // Enhance readibility of the text of the case
        addStyle(`div.commandesdetaildecision {display: none}
                     fieldset#text div#plaintext {font-size: 20px; width: 800px}
                     fieldset#text p {margin-top: 15px}
                     fieldset#text div#plaintext h2 {margin-left: 30px; color: orange;}
                     fieldset#text div#plaintext h3 {margin-left: 60px; color: green;}
                     fieldset#text div#plaintext h4 {margin-left: 90px; color: blue;}
                     button {cursor: pointer;}
                     button#Conclusions {margin-left: 20px; color: white; background-color: darkred; display: none}
                     div#TOC {float: right; position: sticky; top: 0; width: 400px; padding-top: 24px;}
                     div#TOC p {font-size: 14px}
                     div#TOC ul {font-size: 14px;}
                     div#TOC li {padding: 0 0 0 0;}
                     div#TOC a {text-decoration: none;}
                     @keyframes myFade { 0% {opacity: 1;} 100% { opacity: 0;  } }`
                   );
        const ECLI = $("p.description-entete-table").innerText;
        // Special treatment for cases of the Supreme Court
        if ( ECLI.split(":")[2] == "CASS" ) {
            // Analyse reference
            [isJudgment, date, year, month, day] = analyseECLI(ECLI);
            let targetDoc = document;
            urlJudgment = $("fieldset#text a") ? Array.from(document.querySelectorAll("fieldset#text a")).slice(-1)[0].href : null;
            if (!urlJudgment && $("a[title^=Original]")) {
                // Test if there exists an original version
                let originalDoc = $("a[title^=Original]").href;
                targetDoc = await loadDoc(originalDoc);
                urlJudgment = targetDoc.querySelector("fieldset#text a") ? Array.from(targetDoc.querySelectorAll("fieldset#text a")).slice(-1)[0].href : null;
            }
            // Detect if there is a linked document
            const linkedDocumentsFieldset = Array.from(targetDoc.querySelectorAll("fieldset")).at(-1);
            if (linkedDocumentsFieldset && linkedDocumentsFieldset.querySelector("legend")?.innerText?.match(/^Publication|Gerelateerde/)) {
                const relevantLinks = ["Vonnis/arrest:", "Jugement/arrêt:", "Conclusie O.M.:", "Conclusion M.P.:"];
                const potentialDocumentLink = linkedDocumentsFieldset.querySelector("div.champ-entete").innerText;
                if (relevantLinks.some(type => potentialDocumentLink.includes(type))) {
                    linkedDocument = linkedDocumentsFieldset.querySelector("div.show-lien a");
                } else {
                    linkedDocument = null;
                }
            }
            // Build reference of the case
            RG = document.querySelectorAll("p.description-entete-table")[1].textContent;
            if (RG.match(/\w\d{6}\w/)) {
                RG = RG.match(/(\w)(\d{2})(\d{4})(\w)/).slice(1,5).join(".");
            }
            ref = (isJudgment ? "" : "concl. M.P. avant ") + "Cass., <a href='"
                  + window.location.href.split("?")[0] + "'>" + date + "</a>, n° " + RG
                  + (linkedDocument && isJudgment ? ", concl. M.P." : "");
            ref_fn = "Cass. " + year + "-" + String(month).padStart(2, '0') + "-" + String(day).padStart(2, '0')
                     + " n° " + RG + (linkedDocument ? " concl. MP" : "") + ".pdf";
            // Insert clickable referrence at the top of the page
            $("div#show-author").style.marginBottom = "15px";
            $("div#show-author").removeChild($("div#show-author img"));
            $("div#show-author").innerHTML = "<img id='btnClipboard' style='cursor: pointer; padding-right: 10px; "
                + "vertical-align: sub" + "' src='" + CLIPBOARD_IMG + "'>"
                + "<img id='btnFilename' style='cursor: pointer; padding-right: 10px; "
                + "vertical-align: sub" + "' src='" + SAVE_IMG + "'>"
                + "<span id='decref'" + (!isJudgment ? " style='color: darkblue'" : "") + ">" + ref + "</span>"
                + "<button id='Conclusions'>Conclusions</button>";
            $("span#decref").style.backgroundColor = CASES_COLORS[RG[0]] || "white";
            $("span#decref a").style.color = isJudgment ? "#DD2B08" : "darkblue";
            $("span#decref a").style.fontSize = "1em";
            // Copy button and hijack copy to clipboard
            const copyToClip = function() { // Allow easier quoting of the case
                let ref_text = ref.replace(/<[^>]*>/g, '');
                let s = document.getSelection();
                if (s.toString()) {
                    if ($("fieldset#text").contains(s.anchorNode)) { // if text selected from text of the decision
                        // GM_setClipboard('"' + s.toString() + '" (' + ref + ")", "html");
                        navigator.clipboard.write([
                            new ClipboardItem({
                                "text/plain": new Blob(['"' + s.toString() + '" (' + ref_text + ")"], {type: 'text/plain'}),
                                "text/html": new Blob(['"' + s.toString() + '" (' + ref + ")"], {type: 'text/html'})
                            })
                        ]);
                    }
                    else if ( Array.from(document.querySelectorAll("fieldset[id^=notice]")).some(el => el.contains(s.anchorNode)) ) { // if text selected from fiche
                        navigator.clipboard.write([
                            new ClipboardItem({
                                "text/plain": new Blob([s.toString() + ' (' + ref_text + ")"], {type: 'text/plain'}),
                                "text/html": new Blob([s.toString() + ' (' + ref + ")"], {type: 'text/html'})
                            })
                        ]);
                    }
                    else { // if text selected e.g. from the summary of the decision
                        navigator.clipboard.write([
                            new ClipboardItem({
                                "text/plain": new Blob([s.toString()], {type: 'text/plain'}),
                                "text/html": new Blob([s.toString()], {type: 'text/html'})
                            })
                        ]);
                    }
                }
                else {
                    navigator.clipboard.write([
                        new ClipboardItem({
                            "text/plain": new Blob([ref_text], {type: 'text/plain'}),
                            "text/html": new Blob([ref], {type: 'text/html'})
                        })
                    ]);
                }
            }
            $("#btnClipboard").addEventListener("click", copyToClip, false);
            document.body.addEventListener("copy", function(e) {
                copyToClip();
                e.preventDefault();
            }, false);
            // Download button
            if (urlJudgment) {
                $("#btnFilename").addEventListener("click", function(e){
                    downloadFile();
                    e.preventDefault();
                }, false);
            }
            else {
                $("#btnFilename").style.display = "none";
            }
            // Search Pasicrisie number
            await searchPasicrisie(true);
            // If linked document
            if ( linkedDocument ) {
                // Add button to access linked document
                if (!isJudgment) { $("button#Conclusions").innerText = "Arrêt"; }
                $("button#Conclusions").style.display = "inline-block";
                $("button#Conclusions").addEventListener("click", function(e){
                    window.open( $("div.show-lien a").href );
                    e.preventDefault();
                }, false);
                // Detect title and name of the advocate general
                searchAG(true);
            }
            // Enhance readability of the text of cases of the Supreme Court
            if (isJudgment) {
                const CASS_H1 = [/^I+\. La procédure devant la Cour/i, /^I+\. RECHTSPLEGING VOOR HET HOF/i, /^I+\. Les faits/i, /^I+\. FEITEN/i, /^I+\. VOORAFGAANDE PROCEDURE/i,
                                 /^I+V?I*\. Les? moyens? de cassation/i, /I+V?I*\. CASSATIEMIDDEL/i,
                                 /^(I+V?I*\. )?La décision (attaquée|de la Cour)/i, /I+V?I*\. BESLISSING VAN HET HOF/, /^Par ces motifs(,)?$/i, /^Dictum/i,
                                 /^((\w|\d)\. )?Sur le pourvoi/i, /^((\w|\d)\. )?En tant que le pourvoi est dirigé/i,
                                 /^Quant à l'étendue de la cassation/i, /^Omvang van de cassatie/i,];
                const CASS_H2 = [/^Sur le (.+ )?moyen/i, /^(\w+ )?middel( in zijn geheel)?$/i, /^Le contrôle d'office/i, /^Ambtshalve onderzoek/i, /^Sur la recevabilité (du pourvoi|des pourvois|du mémoire)/i,
                                 /^Sur la question préjudicielle/i, /^Overige grieven/i, /^Beoordeling/i, /^Kosten$/i];
                const CASS_H3 = [/^(\d\. )?(Quant (à la|au) )?[\wéè]+ (branche|grief)/i, /^Quant aux \w+ branches réunies/i, /^\w+ onderdeel$/i];
                const CASS_H4 = [/^Dispositions légales violées/i, /^Geschonden wettelijke bepaling/i, /^Décisions et motifs critiqués/i,
                                 /^Griefs/i, /^Sur la fin de non-recevoir/i, /^Ontvankelijkheid/i, /^Grond van niet-ontvankelijkheid/i,
                                 /^Gegrondheid/i, /^\w+ subonderdeel$/i];
                const CASS_TEACHING = [/^(\d+\. )?Il (n(e |'))?((s')?en )?(résulte|ressort|suit|s'ensuit|se déduit)/, /^(\d+\. )?En vertu de cette disposition/, /^(\d+\. )?Cet article/,
                                       /^(\d+\. )?Uit( (de samenhang|het geheel) (van|tussen))? (deze|die) (wets)?bepaling(en)?( en hun samenhang)? (volgt|vloeit voort)/, /^(\d+\. )?Hieruit volgt/];
                const CASS_TEACHING_BEFORE = [/article|artikel/, /disposition|bepaling/];
                const CASS_HIGHLIGHT = [/manque en (fait|droit)/, /mist (het )?(\w+ )?feitelijke grondslag/, /faalt (het )?(\w+ )?naar recht/, /ne peut(, dès lors,)? être accueilli(e)?/, /niet worden aangenomen/,
                                        /irrecevable\./, /niet ontvankelijk\./, /fondé\./, /gegrond\./, /moet worden verworpen\./, /behoe(ft|ven) geen antwoord/,
                                        /^Rejette/, /^Verwerpt/, /^Casse/, /^Vernietigt/, /^Décrète/];
                const CASS_ATTORNEY = /^((représentée?s? par|ayant pour conseil|vertegenwoordigd door|met als raadsman) )?((Maître|Me|mr.|Mr.) )([\w\s'çûéè]+)(, (avocat|advocaat))/i;
                // Replace <br> by <p>
                let html = $("fieldset#text div#plaintext").innerHTML;
                html = "<p>" + html.replace(/<br style="user-select: text;">/g, "<br>").split("<br>").join("</p><p>") + "</p>";
                $("fieldset#text div#plaintext").innerHTML = html;
                // Now analyse it
                let textChildren = $("fieldset#text div#plaintext").children;
                for (let i = 0; i < textChildren.length; i++) {
                    let t = textChildren[i].textContent.trim().replace(/\t/g, ' ').replace(/  +/g, ' ');
                    if (CASS_H1.some(e => e.test(t))) {
                        textChildren[i].outerHTML = "<h1>" + t + "</h1>";
                    }
                    else if (CASS_H2.some(e => e.test(t))) {
                        textChildren[i].outerHTML = "<h2>" + t + "</h2>";
                    }
                    else if (CASS_H3.some(e => e.test(t))) {
                        textChildren[i].outerHTML = "<h3>" + t + "</h3>";
                    }
                    else if (CASS_H4.some(e => e.test(t))) {
                        textChildren[i].outerHTML = "<h4>" + t + "</h4>";
                    }
                    else if (CASS_TEACHING.some(e => e.test(t)) /* && ( textChildren[i - 1].textContent.match(CASS_TEACHING_BEFORE) || textChildren[i - 1].tagName.match("H1|H2|H3|H4")) */ ) {
                        textChildren[i].style.backgroundColor = "lawngreen";
                    }
                    else if (CASS_HIGHLIGHT.some(e => e.test(t))) {
                        let r = CASS_HIGHLIGHT.find(e => e.test(t));
                        textChildren[i].innerHTML =t.replace(r, "<span style='background-color: yellow'>$&</span>");
                    }
                    else if (t.match(CASS_ATTORNEY)) {
                        textChildren[i].innerHTML = t.replace(CASS_ATTORNEY, "$1$3<span style='background-color: yellow'>$5</span>$6");
                    }
                }
                if ($("h1, h2, h3, h4")) { // if at least one heading has been detected
                    let el = document.createElement("div");
                    el.id = "TOC";
                    $("fieldset#text").insertBefore(el, $("fieldset#text div#plaintext"));
                    // Add clipboard and save buttons before the reference in the TOC
                    el.innerHTML = `<img id='tocBtnClipboard' style='cursor: pointer; padding-right: 10px; vertical-align: sub' src='${CLIPBOARD_IMG}'>`
                        + `<img id='tocBtnFilename' style='cursor: pointer; padding-right: 10px; vertical-align: sub' src='${SAVE_IMG}'>`
                        + `<span>${$("span#decref").textContent}</span>`
                        + "<p style='text-decoration: underline'>Table of content</p>";
                    makeTOC($("fieldset#text div#plaintext"), el);
                    // Attach event listeners to the new TOC buttons
                    document.getElementById('tocBtnClipboard').addEventListener('click', function() {
                        document.getElementById('btnClipboard')?.click();
                    });
                    document.getElementById('tocBtnFilename').addEventListener('click', function() {
                        document.getElementById('btnFilename')?.click();
                    });
                }
            }
        }
    }

    function initJuridatDecision() {
        const IUBEL_BASEURL = "https://juportal.be/content/ECLI:BE:CASS:";
        let decID = String(window.location.hash.match(/\d+-\d+/)).replace(/-/, ".");
        let year = decID.slice(0,4);
        window.location = IUBEL_BASEURL + year + ":ARR." + decID + "/FR";
    }

    async function searchPasicrisie(changeSpan, targetDoc = document) {
        // Examine notice to detect Pasicrisie reference
        let notices = targetDoc.querySelectorAll("fieldset[id^='notice']");
        for (let i = 0; i < notices.length; i++) {
            if (notices[i].innerText.match(/PASICRISIE BELGE/)) {
                let p = Array.from(notices[i].querySelectorAll("p.description-notice-table")).find(el => el.innerText.match(/PASICRISIE BELGE/));
                p.style.backgroundColor = "yellow";
                p.style.width = "500px";
                let t = p.innerText;
                t = t.slice(t.match("PASICRISIE BELGE").index + 21, t.match("PASICRISIE BELGE").index + 45);
                if (t.match("P")) {
                    t = t.match(/\d+/) + ", I, p. " + t.match(/\d+.*?(\d+)/)[1];
                }
                else {
                    t = t.match(/\d+/) + ", I, n° " + t.match(/\d+.*?(\d+)/)[1];
                }
                ref = ref.replace("n° " + RG, "<i>Pas.</i>, " + t)
                ref_fn = ref_fn.replace("n° "+ RG, `Pas. ${t.replace(", I,","")}`);
                if (changeSpan) {
                    $("span#decref").innerHTML = $("span#decref").innerHTML.replace("n° "+ RG, `<i>Pas.</i>, ${t}`);
                }
                break;
            }
        }
    }

    function toAGTitleCase(name) {
        // Lowercase for 'de' and 'van', capitalize other words
        return name.toLowerCase().split(/([ -])/).map((word, i, arr) => {
            if (word === 'de' || word === 'van') return word;
            // Only capitalize if it's a word (not a space or hyphen)
            if (/^[a-zàâçéèêëîïôûùüÿñæœ'.]+$/i.test(word)) {
                return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        }).join('');
    }

    async function searchAG(changeSpan, targetDoc = document) {
        // Load opinion of the linked document
        let r = await fetch(linkedDocument.href);
        let html = await r.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");
        // Determine AG
        if (!isJudgment) {
            textAG = targetDoc.querySelector("fieldset#text div#plaintext");
            urlOpinion = Array.from(doc.querySelectorAll("fieldset#text a")).slice(-1)[0]?.href;
        }
        else {
            textAG = doc.querySelector("fieldset#text div#plaintext");
            urlOpinion = doc.querySelector("fieldset a[href*='CONC']")?.href;
        }
        const AG_WOMEN = ["De Raeve", "Herregodts", "Inghels", "Liekendaele", "Mortier"];
        if (textAG) {
            // Try to match the standard pattern first
            let matchChild = Array.from(textAG.children).find(c => c.innerText.match(/(^Conclusi.+:?$)|(^\w.+(a dit en substance|heeft in substantie gezegd)\s?:?)/i));
            textAG = matchChild ? matchChild.innerText : textAG.innerText;
        } else {
            textAG = null;
        }
        if (textAG) {
            // Try standard pattern
            let agMatch = textAG.match(/((((premier )?avocat|procureur) général)|((eerste )?(advocaat|procureur)-generaal))( met opdracht)?(\s.+:?)/i);
            // Try new pattern: "Conclusions du premier avocat général M. NOLET DE BRAUWERE :"
            let agLineMatch = textAG.match(/Conclusions du ([^:]+?) (M\.|Mme) ([A-Z .'-]+) *:/i);
            if (agLineMatch) {
                // agLineMatch[1]: title, agLineMatch[2]: gender, agLineMatch[3]: name
                titleAG = agLineMatch[1].trim();
                nameAG = agLineMatch[3].trim();
                // Convert to title case if all uppercase
                if (nameAG === nameAG.toUpperCase()) {
                    nameAG = toAGTitleCase(nameAG);
                }
                shortNameAG = nameAG;
                introAG = "conclusions de " + (agLineMatch[2] === "Mme" ? "Mme" : "M.") + " ";
                ref = ref.replace("concl. M.P.", introAG + titleAG + " " + nameAG);
                ref_fn = ref_fn.replace("MP", shortNameAG);
                if (changeSpan) {
                    $("span#decref").innerHTML = $("span#decref").innerHTML.replace("M.P.", shortNameAG);
                    // Also update TOC reference if present
                    let tocRefSpan = document.querySelector("#TOC span");
                    if (tocRefSpan) {
                        tocRefSpan.innerHTML = tocRefSpan.innerHTML.replace("M.P.", shortNameAG);
                    }
                }
                return;
            }
            if (agMatch) {
                // Determine title
                let titleBase = agMatch[1] || agMatch[5];
                let isMetOpdracht = !!agMatch[8];
                if (isMetOpdracht) {
                    titleAG = "avocat général délégué";
                    titleAG = "l'" + titleAG;
                } else {
                    titleAG = (titleBase || "")
                        .replace("eerste", "premier")
                        .replace("advocaat-generaal", "avocat général")
                        .replace("procureur-generaal", "procureur général");
                    titleAG = ((/^a|e|i|o|u|y/i.test(titleAG)) ? "l'" : "le ") + titleAG.toLowerCase();
                }
                nameAG = agMatch[9] ? agMatch[9].replace(/(a dit en substance)|(heeft in substantie gezegd)|:/gi, "").trim() : "";
                // Convert to title case if all uppercase
                if (nameAG && nameAG === nameAG.toUpperCase()) {
                    nameAG = toAGTitleCase(nameAG);
                }
                if (nameAG.match(/(\w\. )(.+)/)) {
                    shortNameAG = nameAG.match(/(\w\. )(.+)/)[2];
                } else {
                    shortNameAG = nameAG;
                }
                introAG = (isJudgment ? "avec les " : "") + "conclusions de " + (AG_WOMEN.some(n => nameAG.match(n)) ? "Mme" : "M.") + " ";
                ref = ref.replace("concl. M.P.", introAG + titleAG + " " + nameAG);
                ref_fn = ref_fn.replace("MP", shortNameAG);
                if (changeSpan) {
                    $("span#decref").innerHTML = $("span#decref").innerHTML.replace("M.P.", shortNameAG);
                    // Also update TOC reference if present
                    let tocRefSpan = document.querySelector("#TOC span");
                    if (tocRefSpan) {
                        tocRefSpan.innerHTML = tocRefSpan.innerHTML.replace("M.P.", shortNameAG);
                    }
                }
            }
        }
    }

    function downloadFile(btnFilename) {
        if (!linkedDocument && urlJudgment) {
            saveData(urlJudgment, ref_fn);
        }
        // Only merge if urlOpinion is a valid PDF URL
        else if (linkedDocument && urlJudgment && urlOpinion && typeof urlOpinion === 'string' && urlOpinion.match(/\.pdf($|\?)/i)) {
            if (!btnFilename) {btnFilename = $("#btnFilename")};
            btnFilename.style.animation = "myFade 2s 0s infinite linear alternate";
            // Swap both url if needed
            if (!isJudgment) { [urlJudgment, urlOpinion] = [urlOpinion, urlJudgment]; }
            // Fetch both PDFs as ArrayBuffers
            Promise.all([
                fetch(urlJudgment).then(r => r.arrayBuffer()),
                fetch(urlOpinion).then(r => r.arrayBuffer())
            ]).then(async ([buf1, buf2]) => {
                // Merge PDFs
                const PDFDocument = window.PDFLib && window.PDFLib.PDFDocument;
                if (!PDFDocument) { console.error('PDFLib not loaded!'); return; }
                const pdfDoc = await PDFDocument.create();
                const [doc1, doc2] = await Promise.all([
                    PDFDocument.load(buf1),
                    PDFDocument.load(buf2)
                ]);
                const copiedPages1 = await pdfDoc.copyPages(doc1, doc1.getPageIndices());
                copiedPages1.forEach(p => pdfDoc.addPage(p));
                const copiedPages2 = await pdfDoc.copyPages(doc2, doc2.getPageIndices());
                copiedPages2.forEach(p => pdfDoc.addPage(p));
                const mergedPdfBytes = await pdfDoc.save();
                const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                saveData(url, ref_fn);
                btnFilename.style.animation = "";
            }).catch(e => {
                btnFilename.style.animation = "";
                alert("Erreur lors de la fusion des PDF: " + e);
            });
        }
        // If there is a linkedDocument but no valid urlOpinion, just download the judgment
        else if (linkedDocument && urlJudgment) {
            saveData(urlJudgment, ref_fn);
        }
    }

    function searchCass(hash) {
        // console.log("Hash:", hash);
        let [, year, month, day] = hash.match(/(\d{4})-(\d{2})-(\d{2})/);
        document.getElementsByName("TRECHDECISIONDE")[0].value=`${year}-${month}-${day}`;
        $("select#combojusteljurid option[value='1']").selected = true;
        $("button.buttonconfirm").click();
    }

    // Main
    let loc = window.location.href;
    if (loc.match("accueil")) {
        // Open link to search engine in same window instead of new window
        document.querySelector("div#accueil_texte a").target = "";
    }
    else if (loc.match("view_decision")) {
        initJuridatDecision();
    }
    else if (loc.match("formulaire")) {
        let hash = window.location.hash;
        if (hash && (hash.slice(0,5) == "#Cass")) {
            searchCass(hash);
        }
        else {
            initFormular();
        }
    }
    else if (loc.match("resultats")) {
        initResults();
    }
    else if (loc.match("content")) {
        initCase();
    }
})();