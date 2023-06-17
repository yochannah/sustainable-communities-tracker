//given an id to put it in, generate aggregate summary of a chart. 
function generateAggTable(config, anchor) {
    let a = document.getElementById(anchor);
    let box = document.createElement("div");
    box.className = "aggGraph";
    box.appendChild(title(config));
    a.appendChild(box);
    box.appendChild(aggTable(config));
}

function title(config) {
    let titleElem = document.createElement("h3");
    let titleElemText = document.createTextNode(questionText[config.name]);
    titleElem.appendChild(titleElemText);
    return titleElem;
}

function tableHead(config) {
    let table, thead, captionr, captiond;
    let headers = ["Answer",
        "M0",
        "M06",
        "M12"];

    table = document.createElement("table");
    thead = document.createElement("thead");

    captionr = document.createElement("tr");
    captiond = document.createElement("td");
    captiond.setAttribute("colspan", "4");

    captiond.appendChild(document.createTextNode(questionText[config.name]));
    captionr.appendChild(captiond);
    thead.appendChild(captionr);

    table.appendChild(thead);
    thead = thead.appendChild(document.createElement("tr"));

    headers.map(function (header) {
        let th = document.createElement("th");
        thead.appendChild(th);
        th.appendChild(document.createTextNode(header));
    });
    return table;
}


function getEntryCount(arrayOfObjects, column) {
    let entries = {};
    arrayOfObjects.map(function (row) {
        let item = row[column];
        if (item) { item = item.trim() }
        if (entries.hasOwnProperty(item)) {
            entries[item]++;
        } else { // initialise property
            entries[item] = 1;
        }
    });
    return entries;
}

function getAllKeys(column) {
    var entries = [];
    function addToKeyList(arr) {
        arr.map(function (row) {
            let item = row[column];
            if (item) { item = item.trim() }
            if ((entries.indexOf(item) < 0) && (item !== column)) {
                entries.push(item);
            }
        });
    }

    addToKeyList(survey0);
    addToKeyList(survey6);
    addToKeyList(survey12);
    return entries;
}

function calcAggRows(config) {
    let data = {
        "Respondents": {
            m0: 0,
            m6: 0,
            m12: 0
        }
    };
    let keys = getAllKeys(config.name);

    //multichoice keys have multiple keys in he same string
    //which is a mess. 
    if(config.multichoice) {
        keys = orderOfThings[config.type];
    }

    keys.map(function (k) {
        data[k] = {
            m0: 0,
            m6: 0,
            m12: 0
        };
    });
    countEntries(config, "m0", survey0, data);
    countEntries(config, "m6", survey6, data);
    countEntries(config, "m12", survey12, data);
    return data;
}

function countEntries(config, month, arr, data) {
    let col = config.name;
    let response = data;
    let answerArr = [];


    //sometimes we have multiple selections per answer
    //this splits them and makes one big strrong arrray.
    if (config.multichoice) {
        arr.map(function (row) {
            let item = row[col];
            if (item) { item = item.trim(); }
            answerArr = answerArr.concat(multichoiceToArr(item));
        });
    } else {
        answerArr = arr;
    }

    answerArr.map(function (item) {
        //if we're provided with an array of qualtrics responses
        //we need to select the right columns. 
        //if it's alerady been htrrough multichoice questtion
        //answer processing, that's not needed.
        if (item && typeof item == 'object') {
            if (item && item[col]) {
                item = item[col].trim();
            } else {
                //this is probably a null, which you can't trim.
               item = item[col]
            }
        } // else,  this is a multichoice question. it doesn't need a col selected. 
        if (response.hasOwnProperty(item)) {
            response[item][month]++;
        } else if (!config.multichoice) {
            response[item][month] = 0;
        }
        response.Respondents[month]++;
    });
    return response;
}


function aggTable(config) {
    let table = tableHead(config);
    let tbody = document.createElement('tbody');
    let rows = calcAggRows(config);

    // can't iterate over the rows object directly, because it might
    // come back with the wrong order.
    let sortedResponse = Object.entries(rows);
    sortedResponse = sortedResponse.sort(function ([k1, v1], [k2, v2]) {
        let order1 = orderOfThings[config.type].indexOf(k1),
            order2 = orderOfThings[config.type].indexOf(k2);
        return (order1 - order2);
    });

    sortedResponse.map(function ([rowName, months]) {
        let td1 = document.createElement("td");
        let txt = rowName;
        //how did null become a string? oy vey
        if (rowName == "null") { txt = "No answer" }

        td1.appendChild(document.createTextNode(txt));

        let r = document.createElement("tr");
        tbody.appendChild(r);
        r.appendChild(td1);

        let order = ["m0", "m6", "m12"];

        order.map(function (month) {
            let val = months[month];
            let respondents = rows.Respondents[month];

            let valAsPercent = val / respondents * 100;

            let td2 = document.createElement("td");
            td2.appendChild(document.createTextNode(val));
            //add percent, if it's not 0. 
            //andd if it's not a multichoice question, because
            //it REALLY doesn't work when the totals add up to too much. 
            if ((val > 0) && (!config.multichoice)) {
                //round to two decimals first, pls
                valAsPercent = Math.round(valAsPercent * 100) / 100;
                //  td2.appendChild(document.createElement("br"));
                td2.appendChild(document.createTextNode(` (${valAsPercent}%)`));
            }
            r.appendChild(td2)

        });
    });



    table.appendChild(tbody);
    return table;
}
