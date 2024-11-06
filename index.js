// ==UserScript==
// @name         punkteSkript
// @namespace    http://tampermonkey.net/
// @version      2024-10-30
// @description  try to take over the world!
// @author       You
// @match        https://lms.hs-osnabrueck.de/ilias.php?baseClass=ilexercisehandlergui&cmdNode=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hs-osnabrueck.de
// @grant        none
// ==/UserScript==

$(document).ready(function () {
    const csvImportHtml = `<label for="csvImport">CSV Import</label>
<textarea id="csvImport" name="csvImport" style="width: 75%; height: 100px; margin-right: 15px"></textarea> 
<input class="btn btn-default" value="Importieren" id="csvImportBtn">`


    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(mutations => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }


    waitForElm(".ilTabsContentOuter").then((elm) => {
        console.log("laden von Daten aus localstorage")
        let data = JSON.parse(localStorage.getItem("GUIEPunkte")) || {};
        console.log(data);
        console.log("Seite geladen");
        let scope = $(".navbar-form").find("option:selected").text();
        console.log(scope)
        $("#tb-collapse-1").parent().append(csvImportHtml)


        $("#csvImportBtn").click(function () {
            let csvLines = $("#csvImport").val().split("\n");
            let names = [];
            let taskNumber;
            let points = [];


            //get data from csv
            for (let i = 0; i < csvLines.length; i++) {
                if (csvLines[i].includes("Bewertungsmaßstab")) {
                    taskNumber = csvLines[i].match(/\d+/)[0];
                }
                if (csvLines[i].includes(";MAXIMAL")) {
                    names = csvLines[i].split(";");
                }
                if (csvLines[i].includes("Gesamtpunktzahl")) {
                    points = csvLines[i].split(";");
                }
            }
            console.log(taskNumber);
            console.log(names);
            console.log(points);

            let taskData = data[taskNumber] || {};
            for (let j = 1; j < names.length; j++) {
                if (names[j] && points[j]) {
                    let nameParts = names[j].split("%");
                    nameParts.forEach(name => {
                        let trimName = name.trim();
                        taskData[trimName] = parseFloat(points[j]);
                    });
                }
            }

            data[taskNumber] = taskData;
            console.log(data);
            localStorage.setItem("GUIEPunkte", JSON.stringify(data));
            renderTable(data);
        });

        // Create a container for the table
        const tableContainer = $('<div id="tableContainer" style="margin: 15px;"></div>');
        $("#tb-collapse-1").parent().append(tableContainer);

        // Function to render the table
        function renderTable(data) {
            tableContainer.empty();

            // Create a clickable div to toggle the table
            const toggleDiv = $('<div style="cursor: pointer; padding: 10px; background-color: #d5d1d1; margin-bottom: 10px;">Toggle Table</div>');
            tableContainer.append(toggleDiv);

            // Create the table element
            const table = $('<table border="1" style="width: 100%; display: none;"></table>');
            const thead = $('<thead></thead>');
            const tbody = $('<tbody></tbody>');

            // Create table headers
            const headerRow = $('<tr></tr>');
            headerRow.append('<th>Name</th><th>Total Points</th>');
            Object.keys(data).forEach(taskNumber => {
                headerRow.append(`<th>Task ${taskNumber}</th>`);
            });
            thead.append(headerRow);

            // Create table rows
            const names = new Set();
            Object.values(data).forEach(taskData => {
                Object.keys(taskData).forEach(name => names.add(name));
            });

            names.forEach(name => {
                const row = $('<tr></tr>');
                row.append(`<td>${name}</td>`);

                // Calculate total points for the name
                let totalPoints = 0;
                Object.keys(data).forEach(taskNumber => {
                    totalPoints += data[taskNumber][name] || 0;
                });
                row.append(`<td>${totalPoints}</td>`);

                Object.keys(data).forEach(taskNumber => {
                    const points = data[taskNumber][name] || 0;
                    const color = points > 5 ? 'green' : 'red';
                    row.append(`<td style="background-color: ${color};">${points}</td>`);
                });
                tbody.append(row);
            });

            table.append(thead);
            table.append(tbody);
            tableContainer.append(table);

            // Toggle table visibility
            toggleDiv.click(function () {
                table.toggle();
            });

            // Create a button to confirm the data
            const confirmButton = $('<div style="cursor: pointer; padding: 10px; background-color: #4CAF50; color: white; text-align: center; margin-top: 10px;">Daten bestätigen</div>');
            tableContainer.append(confirmButton);

            // Store the data in another local storage on button click
            confirmButton.click(function () {
                localStorage.setItem("ConfirmedGUIEPunkte", JSON.stringify(data));
                console.log("Data confirmed and stored!");
            });
        }

        // Initial render of the table
        renderTable(data);


    });
    let sampleObj = [{
        "01": {
            "MAXIMAL": 11,
            "Backhaus, Sarah": 10,
            "Tischler, Ana-Chris": 11,
            "Befuss, Jason": 11,
            "Al Hussen, Bashar": 10.5,
            "Daaboul, Wajed": 10.5,
            "Johanning, Jan": 10.5,
            "Nguyen, Phuong Linh": 10.5,
            "Tandem 8": 0,
            "Tandem 9": 0,
            "Tandem 10": 0,
            "Davydov, Maxim": 9.5,
            "Nowak, Calvin": 9.5,
            "Bajrami, Dalina": 10.5,
            "Brunekreeft, Noa": 10.5,
            "Karadag, Nazim": 10,
            "Onat, Muhammed Ali": 10
        }
    }]

});