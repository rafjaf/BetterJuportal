'use strict';

// ---------------------------------------------------------------------------
// Case / decision page logic
//   – initJuridatDecision  (redirect from old Juridat URLs)
//   – searchPasicrisie     (highlight Pasicrisie reference in notices)
//   – toAGTitleCase        (name formatting helper)
//   – abbreviateFirstName  (name formatting helper)
//   – searchAG             (detect advocate-general name/title)
//   – downloadFile         (PDF download / merge)
//   – initCase             (main entry point for content pages)
// ---------------------------------------------------------------------------

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
            ref = ref.replace("n° " + RG, "<i>Pas.</i>, " + t);
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

function abbreviateFirstName(firstName) {
    // Abbreviate first names: "Damien" → "D.", "Jean-Marie" → "J.-M."
    return firstName.split(' ').map(part =>
        part.split('-').map(sub => sub.charAt(0).toUpperCase() + '.').join('-')
    ).join(' ');
}

async function searchAG(changeSpan, targetDoc = document) {

    const AG_WOMEN = ["De Raeve", "Herregodts", "Inghels", "Liekendaele", "Mortier", "Römer"];

    if (isJudgment) {
        // Search for the AG in the text of the judgment.
        // Priority 1: paragraph ending cleanly after the name ("heeft geconcludeerd" / "a déposé des conclusions")
        textAG = Array.from(textOfJudgment.children)
            .find(el => el.textContent.match(/heeft geconcludeerd|a déposé.+conclusions?/i))
            ?.textContent.replace(/(a déposé.+conclusions?.*|heeft geconcludeerd.*)$/i, "");
        // Priority 2: paragraph with "conclusie neergelegd" – take raw text, nameAG cleaned later
        textAG = textAG || Array.from(textOfJudgment.children)
            .find(el => el.textContent.match(/conclusi\w+.+neergelegd/i))
            ?.textContent;
        // Priority 3: fall back to the closing paragraph mentioning the AG present at the hearing
        textAG = textAG || Array.from(textOfJudgment.children).slice().reverse()
            .find(el => el.textContent.match(/(en présence de |in aanwezigheid van )(.+)(,)/))
            ?.textContent.match(/(en présence de |in aanwezigheid van )(.+)(,)/)[2];
    }
    else {
        // Search for the AG in the text of the opinion
        textAG = textOfJudgment.textContent.split("\n").find(el => el.trim().match(/(^Conclusi.+:?$)|(^\w.+(a dit en substance|heeft in substantie gezegd)\s?:?)/i));
    }

    if (textAG) {
        textAG = textAG.replace(/\s?:/, "").replace(/,/, "").trim();
        let agMatch = textAG.match(/((((premier )?avocat|procureur) général)|((eerste )?(advocaat|procureur)-generaal))( met opdracht)?(\s.+:?)/i);
        if (agMatch) {
            // Determine title
            let titleBase = agMatch[1] || agMatch[5];
            let isMetOpdracht = !!agMatch[8];
            if (isMetOpdracht) {
                titleAG = "avocat général délégué";
                titleAG = "l'" + titleAG;
            } else {
                titleAG = (titleBase || "")
                    .replace(/eerste/i, "premier")
                    .replace(/advocaat-generaal/i, "avocat général")
                    .replace(/procureur-generaal/i, "procureur général");
                // Fix: Check the first character correctly and ensure proper spacing
                const prefix = (/^[aeiouyhAEIOUYH]/i.test(titleAG)) ? "l'" : "le ";
                titleAG = prefix + titleAG.toLowerCase();
            }
            nameAG = agMatch[9]? agMatch[9].trim() : "";
            // Strip non-name trailing text (e.g. "heeft op 22 oktober 2025", "een schriftelijke conclusie")
            nameAG = nameAG.replace(/\s+heeft\b.*$/i, "").replace(/\s+een\s+.*$/i, "").trim();
            // Convert to title case if all uppercase
            if (nameAG && nameAG === nameAG.toUpperCase()) {
                nameAG = toAGTitleCase(nameAG);
            }
            let firstName = "";
            if (nameAG.match(/(.+\s)(.+)/)) {
                if (nameAG == "Jean Marie Genicot") {
                    // Special case for AG Jean Marie Genicot (Jean-Marie is the compound first name)
                    shortNameAG = "Genicot";
                    firstName = "Jean-Marie";
                }
                else {
                    shortNameAG = nameAG.match(/(.+?\s)(.+)/)[2];
                    firstName = nameAG.match(/(.+?\s)(.+)/)[1].trim();
                }
            } else {
                shortNameAG = nameAG;
            }
            let abbreviatedNameAG = firstName ? abbreviateFirstName(firstName) + " " + shortNameAG : shortNameAG;
            introAG = (isJudgment ? "avec les " : "") + "conclusions de " + (AG_WOMEN.some(n => nameAG.match(n)) ? "Mme" : "M.") + " ";
            ref = ref.replace("concl. M.P.", introAG + titleAG + " " + abbreviatedNameAG);
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
        if (!btnFilename) {btnFilename = $("#btnFilename");}
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

async function initCase() {
    // Enhance readibility of the text of the case
    addStyle(`div.commandesdetaildecision {display: none}
                 div.textOfJudgment {font-size: 20px!important; width: 800px}
                 div.textOfJudgment p {margin-top: 15px}
                 div.textOfJudgment h2 {margin-left: 30px; color: orange;}
                 div.textOfJudgment h3 {margin-left: 60px; color: green;}
                 div.textOfJudgment h4 {margin-left: 90px; color: blue;}
                 button {cursor: pointer;}
                 button#Conclusions {margin-left: 20px; color: white; background-color: darkred; display: none}
                 div#TOC {float: right; position: sticky; top: 0; width: 400px; padding-top: 24px;}
                 div#TOC p {font-size: 14px}
                 div#TOC ul {font-size: 14px;}
                 div#TOC li {padding: 0 0 0 0;}
                 div#TOC a {text-decoration: none;}
                 div#endnotes {float: right; position: sticky; top: 0; width: 400px; max-height: 100vh; overflow-y: auto; padding-top: 24px; border-left: 2px solid #ccc; padding-left: 15px;}
                 div#endnotes p {font-size: 14px; margin: 5px 0;}
                 @keyframes myFade { 0% {opacity: 1;} 100% { opacity: 0;  } }`
               );
    const ECLI = $("fieldset td:nth-child(2)").innerText;
    // Special treatment for cases of the Supreme Court
    if ( ECLI.split(":")[2] == "CASS" ) {
        // Analyse reference
        [isJudgment, date, year, month, day] = analyseECLI(ECLI);
        textOfJudgment = Array.from(document.querySelectorAll("fieldset")).find(el => el.querySelector("legend")
                         .innerText.match(/^Texte|Tekst/)).querySelector("div");
        textOfJudgment.classList.add("textOfJudgment");
        let targetDoc = document;
        // URL of the judgment is contained in the links of the text
        urlJudgment = Array.from(textOfJudgment.parentElement.querySelectorAll("a")).at(-1)?.href;
        // Detect if there is a linked document
        const linkedDocumentsFieldset = Array.from(targetDoc.querySelectorAll("fieldset")).at(-1);
        if (linkedDocumentsFieldset && linkedDocumentsFieldset.querySelector("legend")?.innerText?.match(/^Publication|Gerelateerde/)) {
            const relevantLinks = ["Vonnis/arrest:", "Jugement/arrêt:", "Conclusie O.M.:", "Conclusion M.P.:"];
            const potentialDocumentLink = linkedDocumentsFieldset.querySelector("div:nth-child(1)").innerText;
            if (relevantLinks.some(type => potentialDocumentLink.includes(type))) {
                linkedDocument = linkedDocumentsFieldset.querySelector("div:nth-child(1) a");
                // Load the linked document to get the opinion PDF URL
                if (linkedDocument) {
                    let linkedDoc = await loadDoc(linkedDocument.href);
                    urlOpinion = Array.from(linkedDoc.querySelectorAll("fieldset")).find(el => el.querySelector("legend")
                                 ?.innerText?.match(/^Texte|Tekst/))?.querySelectorAll("a");
                    urlOpinion = urlOpinion ? Array.from(urlOpinion).at(-1)?.href : null;
                }
            } else {
                linkedDocument = null;
            }
        }
        // Build reference of the case
        const RGtr = Array.from(document.querySelectorAll("fieldset tr"))
            .find(tr => tr.querySelector("td")?.textContent?.match(/No Rôle|Rolnummer/));
        if (RGtr) {
            RG = RGtr.querySelector("td:nth-child(2)")?.textContent?.trim();
            if (RG.match(/\w\d{6}\w/)) {
                RG = RG.match(/(\w)(\d{2})(\d{4})(\w)/).slice(1,5).join(".");
            }
        }
        ref = (isJudgment ? "" : "concl. M.P. avant ") + "Cass., <a href='"
              + window.location.href.split("?")[0] + "'>" + date + "</a>, n° " + RG
              + (linkedDocument && isJudgment ? ", concl. M.P." : "");
        ref_fn = "Cass. " + year + "-" + String(month).padStart(2, '0') + "-" + String(day).padStart(2, '0')
                 + " n° " + RG + (linkedDocument ? " concl. MP" : "") + ".pdf";
        // Insert clickable reference at the top of the page
        const logoCass = document.querySelector("form div:nth-child(3)");
        logoCass.style.marginBottom = "15px";
        logoCass.removeChild(logoCass.querySelector("img"));
        logoCass.innerHTML = "<img id='btnClipboard' style='cursor: pointer; padding-right: 10px; "
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
                if (textOfJudgment.contains(s.anchorNode)) { // if text selected from text of the decision
                    navigator.clipboard.write([
                        new ClipboardItem({
                            "text/plain": new Blob(['"' + s.toString() + '" (' + ref_text + ")"], {type: 'text/plain'}),
                            "text/html": new Blob(['"' + s.toString() + '" (' + ref.trim() + ")"], {type: 'text/html'})
                        })
                    ]);
                }
                else if ( Array.from(document.querySelectorAll("fieldset")).filter(el => el.querySelector("legend").innerText.trim().match(/Fiche/))?.some(el => el.contains(s.anchorNode)) ) { // if text selected from fiche
                    navigator.clipboard.write([
                        new ClipboardItem({
                            "text/plain": new Blob([s.toString() + ' (' + ref_text + ")"], {type: 'text/plain'}),
                            "text/html": new Blob([s.toString() + ' (' + ref.trim() + ")"], {type: 'text/html'})
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
        };
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
        // Enhance readability of the text of cases of the Supreme Court
        if (isJudgment) {
            const CASS_H1 = [/^I+\. La procédure devant la Cour/i, /^I+\. RECHTSPLEGING VOOR HET HOF/i, /^I+\. Les faits/i, /^I+\. FEITEN/i, /^I+\. VOORAFGAANDE PROCEDURE/i,
                             /^I+V?I*\. Les? moyens? de cassation/i, /I+V?I*\. CASSATIEMIDDEL/i,
                             /^(I+V?I*\. )?La d[eé]cision (attaqu[eé][eé]|de la Cour)/i, /I+V?I*\. BESLISSING VAN HET HOF/, /I+V?I*\. Beslissing van het Hof/, /I+V?I*\. Bestreden beslissing/,
                             /^Par ces motifs(,)?$/i, /^Dictum/i,
                             /^((\w|\d)\. )?Sur le pourvoi/i, /^((\w|\d)\. )?En tant que le pourvoi est dirigé/i,
                             /^Quant à l'étendue de la cassation/i, /^Omvang van (de )?cassatie/i,];
            const CASS_H2 = [/^Sur le (.+ )?moyen/i, /^(\w+ )?middel( in zijn geheel)?$/i, /^Le contrôle d'office/i, /^Ambtshalve onderzoek/i, /^Sur la recevabilité (du pourvoi|des pourvois|du mémoire)/i,
                             /^Sur la question préjudicielle/i, /^Overige grieven/i, /^Beoordeling/i, /^Kosten$/i];
            const CASS_H3 = [/^(\d\. )?(Quant (à la|au) )?[\wéè]+( et (à la |au )?[\wéè]+)? (branches?|griefs?)\s*:?\s*$/i,
                             /^Quant aux (\w+ )+(et (aux? |à la )?(\w+ )+)?(branches?|griefs?)( réuni(e)?s)?\s*:?\s*$/i,
                             /^\w+( (en|tot en met) \w+)* onderdeel(en)?\s*$/i];
            const CASS_H4 = [/^Dispositions légales violées/i, /^Geschonden wettelijke bepaling/i, /^Décisions et motifs critiqués/i,
                             /^Griefs/i, /^Sur la fin de non-recevoir/i, /^Ontvankelijkheid/i, /^Grond van niet-ontvankelijkheid/i,
                             /^Gegrondheid/i, /^\w+( (en|tot en met) \w+)* subonderdeel(en)?\s*$/i,
                             /^Sur (le(s)?|les) .+rameau(x)?\s*:?\s*$/i];
            const CASS_TEACHING = [/^(\d+\. )?Il (n(e |'))?((s')?en )?(résulte|ressort|suit|s'ensuit|se déduit)/, /^(\d+\. )?En vertu de cette disposition/, /^(\d+\. )?Cet article/,
                                   /^(\d+\. )?Uit( ((de samenhang|het geheel) (van|tussen))? (deze|die|voormelde) (wets)?bepaling(en)?( (en|in) hun (onderlinge )?samenhang)?|het bovenstaande) (volgt|vloeit voort)/,
                                   /^(\d+\. )?Hieruit volgt/, /^(\d+\. )?Uit het bovenstaande volgt/,
                                   /^(\d+\. )?Uit voormelde bepalingen.+(volgt|vloeit voort)/,
                                   /^(\d+\. )?Par ces énonciations/, /^(\d+\. )?Ce faisant/];
            const CASS_HIGHLIGHT = [/manque en (fait|droit)/, /mist (het )?(\w+ )?feitelijke grondslag/, /faalt (het )?(\w+ )?naar recht/, /ne peut(, dès lors,)? être accueilli(e)?/, /niet worden aangenomen/,
                                    /irrecevable/, /niet ontvankelijk/, /fondé\./, /gegrond\./, /moet worden verworpen\./, /behoe(ft|ven) geen antwoord/,
                                    /^Rejette/, /^Verwerpt/, /^Casse/, /^Vernietigt/, /^Décrète/];
            const CASS_ATTORNEY = /^((représentée?s? par|ayant pour conseil|vertegenwoordigd door|met als raadsman) )?((Maître|Me|mr.|Mr.) )([\w\s''çûéè]+)(, (avocat|advocaat))/i;
            // Replace <br> by <p>
            let html = textOfJudgment.innerHTML;
            html = "<p>" + html.replace(/<br style="user-select: text;">/g, "<br>").split("<br>").join("</p><p>") + "</p>";
            textOfJudgment.innerHTML = html;
            // Now analyse it
            let textChildren = textOfJudgment.children;
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
                else if (CASS_TEACHING.some(e => e.test(t))) {
                    textChildren[i].style.backgroundColor = "lawngreen";
                }
                else if (CASS_HIGHLIGHT.some(e => e.test(t))) {
                    let r = CASS_HIGHLIGHT.find(e => e.test(t));
                    textChildren[i].innerHTML = t.replace(r, "<span style='background-color: yellow'>$&</span>");
                }
                else if (t.match(CASS_ATTORNEY)) {
                    textChildren[i].innerHTML = t.replace(CASS_ATTORNEY, "$1$3<span style='background-color: yellow'>$5</span>$6");
                }
            }
            if ($("h1, h2, h3, h4")) { // if at least one heading has been detected
                let el = document.createElement("div");
                el.id = "TOC";
                textOfJudgment.parentElement.insertBefore(el, textOfJudgment);
                // Add clipboard and save buttons before the reference in the TOC
                el.innerHTML = `<img id='tocBtnClipboard' style='cursor: pointer; padding-right: 10px; vertical-align: sub' src='${CLIPBOARD_IMG}'>`
                    + `<img id='tocBtnFilename' style='cursor: pointer; padding-right: 10px; vertical-align: sub' src='${SAVE_IMG}'>`
                    + `<span>${$("span#decref").textContent}</span>`
                    + "<p style='text-decoration: underline'>Table of content</p>";
                makeTOC(textOfJudgment, el);
                // Attach event listeners to the new TOC buttons
                document.getElementById('tocBtnClipboard').addEventListener('click', function() {
                    document.getElementById('btnClipboard')?.click();
                });
                document.getElementById('tocBtnFilename').addEventListener('click', function() {
                    document.getElementById('btnFilename')?.click();
                });
            }
        }
        else {
            // Conclusion of advocate general: format text and move endnotes to sidebar
            let html = textOfJudgment.innerHTML;
            html = "<p>" + html.replace(/<br style="user-select: text;">/g, "<br>").split("<br>").join("</p><p>") + "</p>";
            textOfJudgment.innerHTML = html;
            // Find endnotes separator (a line of underscores or hyphens)
            let allChildren = Array.from(textOfJudgment.children);
            let separatorIdx = allChildren.findIndex(el => el.textContent.trim().match(/^_{10,}$|^-{10,}$/));
            if (separatorIdx > -1) {
                let endnotesElements = allChildren.slice(separatorIdx + 1);
                allChildren[separatorIdx].remove();
                let el = document.createElement("div");
                el.id = "endnotes";
                el.innerHTML = "<hr style='border: 1px solid #999; margin-bottom: 10px'>";
                textOfJudgment.parentElement.insertBefore(el, textOfJudgment);
                endnotesElements.forEach(n => el.appendChild(n));
            }
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
    }
}
