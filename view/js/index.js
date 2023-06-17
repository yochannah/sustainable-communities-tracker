const sortLabels = {
    "scale": "Project Size",
    "age": "Project Age"
};

const colForChart = {
    "Yes": {
        border: colors.solid.blue,
        bg: colors.faded.blue
    },
    "No": {
        border: colors.solid.yellow,
        bg: colors.faded.yellow
    },
    "No answer": {
        border: colors.solid.grey,
        bg: colors.faded.grey
    },
    "1-10": {
        border: colors.scaled.c30,
        bg: colors.scaled.c20
    },
    "10-20": {
        border: colors.scaled.c40,
        bg: colors.scaled.c30
    },
    "20-50": {
        border: colors.scaled.c50,
        bg: colors.scaled.c40
    },
    "50-100": {
        border: colors.scaled.c60,
        bg: colors.scaled.c50
    },
    "100-1000": {
        border: colors.scaled.c70,
        bg: colors.scaled.c60
    },
    "1000-10,000": {
        border: colors.scaled.c80,
        bg: colors.scaled.c70
    },
    "still active and being maintained/updated, me still contributing": {
        border: colors.solid.purple,
        bg: colors.faded.purple
    },
    "still active and being maintained/updated by my colleagues": {
        border: colors.solid.blue,
        bg: colors.faded.blue
    },
    "still active and being maintained/updated by my community": {
        border: colors.solid.green,
        bg: colors.faded.green
    },
    "finalised with occasional updates": {
        border: colors.solid.orange,
        bg: colors.faded.orange
    },
    "wrapped up and no longer active": {
        border: colors.solid.red,
        bg: colors.faded.red
    },
    "Other, please specify": {
        border: colors.solid.grey,
        bg: colors.faded.grey
    },
    "My community members would keep this project running.": {
        border: colors.solid.green,
        bg: colors.faded.green
    },
    "My colleagues/employees would continue to work on this": {
        border: colors.solid.blue,
        bg: colors.faded.blue
    },
    "I would continue to provide updates in my free time": {
        border: colors.solid.purple,
        bg: colors.faded.purple
    },
    "I would provide periodic but rare updates when I could.": {
        border: colors.solid.orange,
        bg: colors.faded.orange
    },
    "I would close the project down": {
        border: colors.solid.red,
        bg: colors.faded.red
    }
}

//never update this directly, please update by reference to colForChart.
//kthx 
const colForLegend = {
    scale: {
        "1-10": colForChart["1-10"],
        "10-20": colForChart["10-20"],
        "20-50": colForChart["20-50"],
        "50-100": colForChart["50-100"],
        "100-1000": colForChart["100-1000"],
        "1000-10,000": colForChart["1000-10,000"],
        "No answer": colForChart["No answer"]
    },
    bool: {
        "Yes": colForChart["Yes"],
        "No": colForChart["No"],
        "No answer": colForChart["No answer"]
    },
    activity: {
        "still active and being maintained/updated, me still contributing": colForChart["still active and being maintained/updated, me still contributing"],
        "still active and being maintained/updated by my colleagues": colForChart["still active and being maintained/updated by my colleagues"],
        "still active and being maintained/updated by my community": colForChart["still active and being maintained/updated by my community"],
        "finalised with occasional updates": colForChart["finalised with occasional updates"],
        "wrapped up and no longer active": colForChart["wrapped up and no longer active"],
        "Other, please specify": colForChart["Other, please specify"],
        "No answer": colForChart["No answer"]
    }, maintenance: {
        "My community members would keep this project running.": colForChart["My community members would keep this project running."],
        "My colleagues/employees would continue to work on this": colForChart["My colleagues/employees would continue to work on this"],
        "I would continue to provide updates in my free time": colForChart["I would continue to provide updates in my free time"],
        "I would provide periodic but rare updates when I could.": colForChart["I would provide periodic but rare updates when I could."],
        "I would close the project down": colForChart["I would close the project down"]
    }
}

const orderOfThings = {
    scale: ["1-10", "10-20", "20-50", "50-100", "100-1000", "1000-10,000", "Other, please specify", "No answer", "null"],
    bool: ["Yes", "No", "No answer", "null"],
    activity: [
        "still active and being maintained/updated, me still contributing",
        "still active and being maintained/updated by my colleagues",
        "still active and being maintained/updated by my community",
        "finalised with occasional updates",
        "wrapped up and no longer active",
        "Other, please specify",
        "No answer",
        "null"
    ], maintenance: [
        "My community members would keep this project running.",
        "My colleagues/employees would continue to work on this",
        "I would continue to provide updates in my free time",
        "I would provide periodic but rare updates when I could.",
        "I would close the project down",
        "Other, please specify",
        null // apparently this works just as well as the string null does. 
    ],
    permanence: [
        "No",
        "Other, please specify",
        "Yes, as a staff member with a permanent contract",
        "Yes, as a student",
        "Yes, as a staff member with a temporary or fixed-term contract",
        "Other, please specify",
        null]
}

const sortSurveyData = function (anArray, sortBy) {
    let response = anArray.sort(function (a, b) {
        if (sortBy == "age") {
            let ages = agesByProjName;
            let aDate = new Date(ages[a.ProjectPseudonym]);
            let bDate = new Date(ages[b.ProjectPseudonym]);
            if (aDate < bDate) {
                return -1;
            }
            if (bDate < aDate) {
                return 1;
            }
        }
        else if (sortBy == "scale") {
            let scale = orderOfThings.scale;
            aScaleIndex = scale.indexOf(a["project-user-count"]);
            bScaleIndex = scale.indexOf(b["project-user-count"]);

            //handle nulls
            if (!aScaleIndex && bScaleIndex) {
                return 1; //b is "bigger"
            }
            if (!bScaleIndex && aScaleIndex) {
                return -1; //a is "bigger" 
            }
            //normal non-null sort
            if (aScaleIndex > bScaleIndex) {
                return -1;
            }
            if (bScaleIndex > aScaleIndex) {
                return 1;
            }
        } else if (sortBy == "orderedRowName") {
            //this is for when the row has a specific orderr, but it's not alphabetic.
            blah;
        } else {
            if (a[sortBy] < b[sortBy]) {
                return -1;
            }
            if (b[sortBy] < a[sortBy]) {
                return 1;
            }
        }

        //if all else failed, they're equal: 
        return 0;
    });
    return response;
}

//right now all our separators are tabs. 
//also, mcstring was intended to mean "M C string", as in 
// multiple choice string, but now it's making me laugh
// like M C hammer or boaty mcboatface. 
const multichoiceToArr = function (mcString) {
    let separator = /[\t]+/gm;
    let separated;
    if (mcString) {
        separated = mcString.trim().split(separator);
        //sometimes an other might still get in here, 
        //if it's part of a longer string. This is infuriating, 
        //but I don't want to ddo a massively complex regex to fix it
        // so we'll just nip it out of the array. 
        //we snip two items out. 
        //One is "Other" and the other is " please specify"
        if (separated.length > 1) {
            return separated;
        } else {
            return mcString.trim();
        }
    } else if (mcString == "Other, please specify") {
        return mcString;
    }
    else {
        return null;
    }
}

const graphs = [
    { name: "project-open-contrib", type: "bool", datalabels: true },
    { name: "funds-grant-funds", type: "bool", datalabels: true },
    { name: "funds-others-pick-up", type: "bool", datalabels: true },
    { name: "future-funding-plans", type: "bool", datalabels: true },
    { name: "project-user-count", type: "scale", datalabels: true },
    { name: "project-user-potentl", type: "scale", datalabels: true },
    { name: "future-one-year", type: "activity", datalabels: false },
    { name: "future-five-years", type: "activity", datalabels: false }
];

const mcGraphs = [
    {
        name: "future-cant-maintain",
        type: "maintenance",
        datalabels: false,
        multichoice: true
    },
    {
        name: "you-paid",
        type: "permanence",
        datalabels: false,
        multichoice: true
    }];

const staffGraphs = [
    {
        name: "you-role",
        type: "free-text-job-role",
        datalabels: false,
        multichoice: true,
    }
];

//these will require a tidy
const numericGraphs = [
    "leadership-team-size"
];

//filter incomplete answers. I feel like there's a more concise way to do it. 
survey0 = survey0.filter(answer => (answer["project-open-contrib"] == "Yes") || (answer["project-open-contrib"] == "No"));
survey6 = survey6.filter(answer => (answer["project-open-contrib"] == "Yes") || (answer["project-open-contrib"] == "No"));
survey12 = survey12.filter(answer => (answer["project-open-contrib"] == "Yes") || (answer["project-open-contrib"] == "No"));

const surveys = [survey0, survey6, survey12];

//aggregate stats across rows
function agg_completed_bool(survey, variable) {
    return survey.reduce(function (newVal, answer, i) {
        //init datastore object
        if (i === 1) {
            newVal = {
                "Yes": 0,
                "No": 0
            }
        } else {
            if (!(answer[variable] in newVal)) {
                // console.debug('null value, not adding', answer, answer[variable]);
            } else {
                newVal[answer[variable]]++;
            }
        }
        return newVal;
    });
}

//maybe this can be deletedd? idk? I liked some of these grraphs
function generateDataSet(variable) {
    return surveys.map(function (survey, i) {
        return {
            data: agg_completed_bool(survey, variable),
            label: datasetLabels[i],
            backgroundColor: backgroundColor[i],
            borderColor: borderColor[i],
            borderWidth: 1
        }
    });
};

const generateChart = function (variable) {
    try {
        return new Chart(document.getElementById('chart' + variable), {
            type: 'bar',
            data: {
                datasets: generateDataSet(variable)
            },
            options: {

                plugins: {
                    title: {
                        text: questionText[variable],
                        display: true
                    }
                },
                backgroundColor: backgroundColor,
                borderColor: borderColor
            }
        });
    } catch (e) {
        console.error(e);
    }
}

const generateNumChart = function (variable) {
    try {
        return new Chart(document.getElementById('chart' + variable), {
            type: 'bar',
            data: {
                datasets: generateDataSet(variable)
            },
            options: {
                indexAxis: 'x',
                plugins: {
                    title: {
                        text: questionText[variable],
                        display: true
                    }
                },
                backgroundColor: backgroundColor,
                borderColor: borderColor
            }

        });
    } catch (e) {
        console.error(e);
    }
}

const generateElem = function (config, anAnchor, canvas) {
    let chartBox, a, legendHtml, header, txt;
    chartBox = document.createElement("div");
    chartBox.classList = "aggGraph";

    header = document.createElement("div");
    header.classList = "questionText";
    txt = document.createTextNode(questionText[config.name]);
    header.appendChild(txt);

    if (anAnchor) { a = anAnchor; } else { a = "aggregateAnchor" }

    let anchor = document.getElementById(a);
    let chartElemHtml;

    if (canvas) {
        chartElemHtml = `<canvas id="chart${config.name}${a}" width="300" height="400"></canvas>`;
    } else {
        chartElemHtml = `<div id="chart${config.name}${a}" width="300" height="400"></div>`;
    }

    chartBox.innerHTML = chartElemHtml;
    chartBox.prepend(header);

    if (config.type) {
        legendHtml = `<div id="legend${config.name}${a}" class="legend"></div>`;
        chartBox.innerHTML += legendHtml;
    }

    anchor.appendChild(chartBox);
}

function percent(bigNum, littleNum) {
    //cal the percentage...
    let valAsPercent = littleNum / bigNum * 100;
    //two decimals is enough, thx
    valAsPercent = Math.round(valAsPercent * 100) / 100;
    return `${valAsPercent}%`;
}