'use strict';

// ---------------------------------------------------------------------------
// ECLI parsing, search form page, and results page
// ---------------------------------------------------------------------------

function analyseECLI(ECLI) {
    let isJudgment, date, year, month, day;
    isJudgment = (ECLI.split(":")[4].slice(0,3) == "ARR");
    [, year, month, day] = ECLI.split(":")[4].slice(isJudgment ? 4 : 5, isJudgment ? 12 : 13).match(/(\d{4})(\d{2})(\d{2})/);
    date = parseInt(day) + (parseInt(day) == 1 ? "er " : " ") + MONTH_FR[month - 1] + " " + year;
    return [isJudgment, date, year, month, day];
}

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
    $("button.submitconfirm,button[name=action]").parentElement.insertBefore(el, $("button.submitconfirm,button[name=action]"));
    el.appendChild($("button.submitconfirm,button[name=action]"));
    el.appendChild($("button.submitcommand,button[name=clear]"));
    el.style.textAlign = "center";
    $("button.submitconfirm,button[name=action]").style.fontSize = "large";
    // Add button to search only in Supreme Court judgments
    let btnSearchCass = document.createElement("button");
    btnSearchCass.innerText = "Cass.";
    btnSearchCass.style.cssText = window.getComputedStyle($("button.submitconfirm,button[name=action]")).cssText;
    el.appendChild(btnSearchCass);
    btnSearchCass.addEventListener("click", (e) => {
        e.preventDefault();
        $("select#combojusteljurid option[value='1']").selected = true;
        $("button.submitconfirm,button[name=action]").click();
    }, false);
}

async function initResults() {
    addStyle(`@keyframes myFade { 0% {opacity: 1;} 100% { opacity: 0;  } }`);

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
            RG = result.parentElement.querySelector("td > span").innerText.match(/(-.+-\s)(.+)/) ? result.parentElement.querySelector("td > span").innerText.match(/(-.+-\s)(.+)/)[2] : "";
            if (RG.match(/\w\d{6}\w/)) {
                RG = RG.match(/(\w)(\d{2})(\d{4})(\w)/).slice(1,5).join(".");
            }
            let refHtml = "<span class='my-ref-container'>Cass., <a href='" + result.href + "'>" + date + "</a>" + (RG ? ", n° " + RG : "") + "</span>";
            let el = document.createElement("span");
            el.dataset.ecli = ECLI;
            el.innerHTML = refHtml;
            // Hide original reference and insert the new one
            result.parentElement.querySelector("td > span").style.display = "none";
            result.parentElement.insertBefore(el, result.parentElement.querySelector("td >span"));
            // Change color depending on nature of the case
            result.querySelector("span").style.backgroundColor = CASES_COLORS[RG[0]] || "white";
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
}
