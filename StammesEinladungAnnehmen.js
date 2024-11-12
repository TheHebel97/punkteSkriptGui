// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      2024-11-10
// @description  try to take over the world!
// @author       You
// @match        https://*.die-staemme.de/game.php?*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=die-staemme.de
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  $(document).ready(function() {
    $('.btn-confirm-yes').click();
  });
})();
