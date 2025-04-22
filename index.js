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
<input class="btn btn-default" value="Importieren" id="csvImportBtn">
<br>
<label for="jsonImport">JSON Import</label>
<textarea id="jsonImport" name="jsonImport" style="width: 75%; height: 100px; margin-right: 15px; margin-top: 10px;"></textarea>
<input class="btn btn-default" value="JSON Importieren" id="jsonImportBtn">
<br>
<input class="btn btn-default" value="JSON Exportieren" id="jsonExportBtn">`;


    const style = document.createElement('style');
    style.innerHTML = `
  .highlight {
    background-color: yellow;
  }
  table tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  table tr:nth-child(odd) {
    background-color: #ffffff;
  }
`;
    document.head.appendChild(style);

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
        console.log("detect context")
        let tabAssignment = $("#subtab_assignment").prop("class") === "active";
        let tabGrades = $("#subtab_grades").prop("class") === "active";
        let tabMembers = $("#subtab_participant").prop("class") === "active";

        console.log("laden von Daten aus localstorage")
        let data = JSON.parse(localStorage.getItem("GUIEPunkte")) || {};
        let confirmedData = JSON.parse(localStorage.getItem("ConfirmedGUIEPunkte"));
        if (confirmedData !== null) {
            console.log(confirmedData);
            if (tabAssignment) {
                console.log("Auf Übungseinheit Seite")
                let id = $("#ass_id").find("option:selected").text().match(/\d+/)[0]
                console.log("Übungseinheit ID: " + id);
                if (confirmedData && confirmedData[id]) {
                    console.log(Object.entries(confirmedData[id]));
                    Object.entries(confirmedData[id]).forEach(([name, points]) => {
                        console.log(name, points)
                        console.log($("#exc_mem").find("tr:contains(" + name + ")"))
                        let tryToFindName = $("#exc_mem").find("tr:contains(" + name + ")");
                        console.log(tryToFindName)
                        if (tryToFindName.length > 0) {
                            console.log("Name gefunden")
                            if (points < 5) {
                                let selectElement = $(tryToFindName).find("option[value='failed']").closest('select');
                                if (selectElement.val() !== 'failed') {
                                    selectElement.val('failed').addClass('highlight');
                                }
                            } else {
                                let selectElement = $(tryToFindName).find("option[value='passed']").closest('select');
                                if (selectElement.val() !== 'passed') {
                                    selectElement.val('passed').addClass('highlight');
                                }
                            }

                        }
                    });
                }


            } else if (tabGrades) {
                console.log("Auf Noten Seite")
                let studentData = {};

                // Transform data structure
                Object.entries(confirmedData).forEach(([task, taskData]) => {
                    Object.entries(taskData).forEach(([student, points]) => {
                        if (!studentData[student]) {
                            studentData[student] = {};
                        }
                        studentData[student][task] = points;
                    });
                });

                // Insert transformed data into the page
                const table = $("table[id^='exc_grades']")
                Object.entries(studentData).forEach(([student, tasks]) => {
                    let studentRow = $(table).find("tr:contains(" + student + ")");
                    if (studentRow.length > 0) {
                        let taskDetails = "";
                        Object.entries(tasks).forEach(([task, points]) => taskDetails += `Blatt ${task}: ${points} Punkte \n`);
                        console.log(taskDetails);
                        let textareaElement = $(studentRow).find("textarea[name^='lcomment']");
                        if (textareaElement.val() !== taskDetails) {
                            textareaElement.val(taskDetails).addClass('highlight');
                        }
                    }
                });

                return;
            } else if (tabMembers) {
                console.log("Auf Mitglieder Seite")
                return;
            }
        }
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

            $("#csvImport").val("");
            //get data from csv
            for (let i = 0; i < csvLines.length; i++) {
                if (csvLines[i].includes("Bewertung")) {
                    taskNumber = csvLines[i].match(/\d+/)[0];
                }
                if (csvLines[i].includes(";MAXIMAL")) {
                    names = csvLines[i].split(";");
                }
                if (csvLines[i].includes("Gesamtpunktzahl")) {
                    points = csvLines[i].split(";");
                }
            }

            // Check if task number is undefined
            if (typeof taskNumber === 'undefined') {
                alert("Invalid data: Task number is undefined.");
                return;
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
                        if (!trimName.startsWith("Tandem")) {
                            // Ersetze Komma durch Punkt
                            let pointValue = parseFloat(points[j].replace(",", "."));
                            taskData[trimName] = pointValue;
                        }
                    });
                }
            }

            data[taskNumber] = taskData;
            console.log(data);
            localStorage.setItem("GUIEPunkte", JSON.stringify(data));
            renderTable(data);
        });

        // JSON Import functionality
        $("#jsonImportBtn").click(function () {
            let jsonData = $("#jsonImport").val();
            try {
                let parsedData = JSON.parse(jsonData);
                localStorage.setItem("GUIEPunkte", JSON.stringify(parsedData));
                console.log("JSON data imported and stored!");
                renderTable(parsedData);
                $("#jsonImport").val("");
            } catch (e) {
                console.error("Invalid JSON data:", e);
                alert("Invalid JSON data. Please check the format and try again.");
            }
        });

        // JSON Export functionality
        $("#jsonExportBtn").click(function () {
            let data = localStorage.getItem("GUIEPunkte");
            if (data) {
                let blob = new Blob([data], { type: "application/json" });
                let url = URL.createObjectURL(blob);
                let a = document.createElement("a");
                a.href = url;
                a.download = "GUIEPunkte.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                console.log("JSON data exported!");
            } else {
                alert("No data to export.");
            }
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
                row.append(`<td>${name} <span class="remove-row" style="color: red; cursor: pointer;">&#10060;</span> </td>`);

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
                row.find('.remove-row').click(function () {
                    Object.keys(data).forEach(taskNumber => {
                        delete data[taskNumber][name];
                    });
                    localStorage.setItem("GUIEPunkte", JSON.stringify(data));
                    renderTable(data);
                });
            });

            table.append(thead);
            table.append(tbody);
            tableContainer.append(table);

            // Retrieve and set the initial table visibility from localStorage
            const tableVisible = localStorage.getItem("tableVisible") === "true";
            table.toggle(tableVisible);

            // Toggle table visibility and save the state in localStorage
            toggleDiv.click(function () {
                table.toggle();
                localStorage.setItem("tableVisible", table.is(":visible"));
            });

            // Create a flexbox container for the buttons
            const buttonContainer = $('<div style="display: flex; gap: 10px; margin-top: 10px;"></div>');
            tableContainer.append(buttonContainer);

            // Create a button to confirm the data
            const confirmButton = $('<div style="cursor: pointer; padding: 10px; background-color: #4CAF50; color: white; text-align: center;">Daten bestätigen</div>');
            buttonContainer.append(confirmButton);

            // Store the data in another local storage on button click
            confirmButton.click(function () {
                localStorage.setItem("ConfirmedGUIEPunkte", JSON.stringify(data));
                console.log("Data confirmed and stored!");
                updateConfirmButton();
            });

            // Create a button to delete the data
            const deleteButton = $('<div style="cursor: pointer; padding: 10px; background-color: #f44336; color: white; text-align: center;">Daten löschen</div>');
            buttonContainer.append(deleteButton);

            // Clear the data from local storage on button click
            deleteButton.click(function () {
                localStorage.removeItem("ConfirmedGUIEPunkte");
                localStorage.removeItem("GUIEPunkte");
                console.log("Data deleted!");
                renderTable(data);
            });

            // Function to update the confirm button text
            function updateConfirmButton() {
                const confirmedData = JSON.parse(localStorage.getItem("ConfirmedGUIEPunkte")) || {};
                const hasDifferences = JSON.stringify(data) !== JSON.stringify(confirmedData);
                confirmButton.text(hasDifferences ? "Daten bestätigen (Änderungen vorhanden)" : "Daten bestätigen");
            }

            // Initial update of the confirm button text
            updateConfirmButton();
        }

        // Initial render of the table
        renderTable(data);

        // Add CSS for alternating row colors
        const style = document.createElement('style');
        style.innerHTML = `
    table tr:nth-child(even) {
        background-color: #f2f2f2;
    }
    table tr:nth-child(odd) {
        background-color: #ffffff;
    }
`;
        document.head.appendChild(style);


    });
});
