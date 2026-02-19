'use strict';

// ---------------------------------------------------------------------------
// Search helper and main entry point
// ---------------------------------------------------------------------------

function searchCass(hash) {
    let [, year, month, day] = hash.match(/(\d{4})-(\d{2})-(\d{2})/);
    document.getElementsByName("TRECHDECISIONDE")[0].value=`${year}-${month}-${day}`;
    $("select#combojusteljurid option[value='1']").selected = true;
    $("button.buttonconfirm").click();
}

function showStatusMessage(msg) {
    let popup = document.getElementById('status');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'status';
        addStyle(`
                div#status {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background-color: #0e63ac;
                    color: #fff;
                    text-align: center;
                    padding: 10px;
                    z-index: 999;
                    overflow: hidden;
                    opacity: 0;
                    transform: translateY(100%);
                    transition: transform 1s ease-in-out, opacity 1s ease-in-out;
                }
                div#status a {
                    color: yellow;
                }`);
        document.body.appendChild(popup);
    }
    popup.innerHTML = msg;

    // Force reflow to ensure initial state is applied
    void popup.offsetHeight;

    // Show the popup
    popup.style.transform = 'translateY(0%)';
    popup.style.opacity = '1';

    // After 10 seconds, hide the popup
    setTimeout(() => {
        popup.style.transform = 'translateY(100%)';
        popup.style.opacity = '0';
    }, 10000);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async function() {

    // Display status message if extension was updated
    const lastVersion = await getStorage("extensionVersion");
    const currentVersion = chrome.runtime.getManifest().version;
    if (lastVersion != currentVersion) {
        showStatusMessage(`Better Juportal has been updated to version ${currentVersion}. Click <a href="https://github.com/rafjaf/BetterJuportal#release-history" target="_blank">here</a> for more info`);
        await setStorage("extensionVersion", currentVersion);
    }

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
        if (await waitForElement("fieldset td:nth-child(2)")) {
            initCase();
        }
    }

})();
