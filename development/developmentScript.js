// ==UserScript==
// @name         Development Script
// @version      0.1
// @description  try to take over the world!
// @author       TheHebel97
// @match        https://lms.hs-osnabrueck.de/ilias.php?baseClass=ilexercisehandlergui&cmdNode=*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        none
// ==/UserScript==



function log(...args) {
    console.log("%cUserscript:", "color: purple; font-weight: bold", ...args);
}

log("Dev mode started");
function main() {
    fetch("http://localhost:9000/index.js").then(resp => {
        resp.text().then(script => {
            log("Got Dev script");
            eval(script);
            log("Dev script evaled");
        });
    });
}

// Make sure we run once at the start
main.bind({})();