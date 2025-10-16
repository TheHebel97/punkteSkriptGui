// ==UserScript==
// @name         punkteSkript
// @namespace    http://tampermonkey.net/
// @version      2024-10-30
// @description  try to take over the world!
// @author       TheHebel97
// @match        https://lms.hs-osnabrueck.de/ilias.php?baseClass=ilexercisehandlergui&cmdNode=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hs-osnabrueck.de
// @grant        none
// ==/UserScript==

$(document).ready(function () {
    const csvImportHtml = `
    <div id="importWrapper" style="margin-bottom:10px;">
      <div style="margin-bottom:8px;">
        <label for="csvImport">CSV Import</label>
      </div>
      <div style="display:flex; gap:10px; align-items:flex-start; margin-bottom:12px;">
        <textarea id="csvImport" name="csvImport" style="width: 75%; height: 100px;"></textarea>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <input class="btn btn-default" value="Importieren" id="csvImportBtn">
        </div>
      </div>

      <div style="margin-bottom:8px;"><label for="jsonImport">JSON Import</label></div>
      <div style="display:flex; gap:10px; align-items:flex-start;">
        <textarea id="jsonImport" name="jsonImport" style="width: 75%; height: 100px;"></textarea>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <input class="btn btn-default" value="JSON Importieren" id="jsonImportBtn">
          <input class="btn btn-default" value="JSON Exportieren" id="jsonExportBtn">
        </div>
      </div>

      <!-- Host für die Tabelle: hier wird die Tabelle reingepackt -->
      <div id="tableHost" style="margin-top:12px;"></div>
    </div>`;


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
  .my-table { border-collapse: collapse; border: 1px solid #ccc; }
  .my-table th, .my-table td { border: 1px solid #ccc; padding: 6px; }
`;
    document.head.appendChild(style);

    function waitForElm(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(() => {
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


    waitForElm(".ilTabsContentOuter").then(() => {
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
                        let tryToFindName = $("#exc_mem").find("tr:contains(" + name + ")");
                        console.log(tryToFindName)
                        if (tryToFindName.length > 0) {
                            console.log("Name gefunden")
                            if (points < 5) {
                                let selectElement = $(tryToFindName).find("option[value='failed']").closest('select');
                                if (selectElement.length > 0 && selectElement[0].value !== 'failed') {
                                    selectElement[0].value = 'failed';
                                    selectElement[0].classList.add('highlight');
                                }
                            } else {
                                let selectElement = $(tryToFindName).find("option[value='passed']").closest('select');
                                if (selectElement.length > 0 && selectElement[0].value !== 'passed') {
                                    selectElement[0].value = 'passed';
                                    selectElement[0].classList.add('highlight');
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
                        if (textareaElement.length > 0 && textareaElement[0].value !== taskDetails) {
                            textareaElement[0].value = taskDetails;
                            textareaElement[0].classList.add('highlight');
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
        $(".ilToolbarContainer").after(csvImportHtml)


        $("#csvImportBtn").click(function () {
            // Native JS: Wert aus Textarea holen
            let csvLines = document.getElementById("csvImport").value.split("\n");
            let names = [];
            let taskNumber;
            let points = [];

            // Native JS: Textarea leeren
            document.getElementById("csvImport").value = "";
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
                            // Ersetze Komma durch Punkt und setze direkt
                            taskData[trimName] = parseFloat(points[j].replace(",", "."));
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
            // Native JS: Wert aus Textarea holen
            let jsonData = document.getElementById("jsonImport").value;
            try {
                let parsedData = JSON.parse(jsonData);
                localStorage.setItem("GUIEPunkte", JSON.stringify(parsedData));
                console.log("JSON data imported and stored!");
                renderTable(parsedData);
                // Native JS: Textarea leeren
                document.getElementById("jsonImport").value = "";
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

        // Create a container for the table as a real DOM node and a jQuery wrapper
        const tableContainer = document.createElement('div');
        tableContainer.id = 'tableContainer';
        tableContainer.style.margin = '15px';
        // Wenn ein Host-Div vorhanden ist (in der Import-HTML), füge das tableContainer dort ein
        const tableHost = document.getElementById('tableHost');
        if (tableHost) {
            tableHost.appendChild(tableContainer);
        } else {
            // Insert after the jsonImport element if present, otherwise try toolbar, otherwise append to body
            const jsonImportEl = document.getElementById('jsonImport');
            if (jsonImportEl && jsonImportEl.parentNode) {
                jsonImportEl.parentNode.insertBefore(tableContainer, jsonImportEl.nextSibling);
            } else {
                const toolbar = document.querySelector('.ilToolbarContainer');
                if (toolbar && toolbar.parentNode) {
                    toolbar.parentNode.insertBefore(tableContainer, toolbar.nextSibling);
                } else {
                    document.body.appendChild(tableContainer);
                }
            }
        }

        // Create a persistent toggle button (native DOM) and a content container
        const toggleButton = document.createElement('div');
        toggleButton.textContent = 'Toggle Table';
        toggleButton.style.cursor = 'pointer';
        toggleButton.style.padding = '10px';
        toggleButton.style.backgroundColor = '#d5d1d1';
        toggleButton.style.marginBottom = '10px';
        // Content area where table and buttons will be rendered
        const contentDiv = document.createElement('div');
        contentDiv.id = 'tableContent';
        // Apply initial visibility from localStorage
        const initialVisible = localStorage.getItem('tableVisible') === 'true';
        contentDiv.style.display = initialVisible ? '' : 'none';

        tableContainer.appendChild(toggleButton);
        tableContainer.appendChild(contentDiv);

        // Toggle behavior (native)
        toggleButton.addEventListener('click', function () {
            const currentlyVisible = contentDiv.style.display !== 'none';
            contentDiv.style.display = currentlyVisible ? 'none' : '';
            localStorage.setItem('tableVisible', !currentlyVisible);
        });

        // Function to render the table
        function renderTable(data) {
            // Clear only the content area (leave the persistent toggle button alone)
            contentDiv.innerHTML = '';

            // Create the table element (jQuery for rows is still fine)
            const table = $('<table class="my-table" style="width: 100%;"></table>');
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
            // Append the table into the contentDiv (native DOM)
            contentDiv.appendChild(table[0]);

            // Create a flexbox container for the buttons
            const buttonContainer = $('<div style="display: flex; gap: 10px; margin-top: 10px;"></div>');
            // Append button container to contentDiv
            contentDiv.appendChild(buttonContainer[0]);

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
