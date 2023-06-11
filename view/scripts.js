const generateElem = function (config, anAnchor) {
    let chartBox, a, legendHtml;
    chartBox = document.createElement("div");
    chartBox.classList = "aggGraph";

    if (anAnchor) { a = anAnchor; } else { a = "aggregateAnchor" }

    let anchor = document.getElementById(a);
    let chartElemHtml = `<canvas id="chart${config.name}" width="400" height="400"></canvas>`;

    chartBox.innerHTML = chartElemHtml;

    if (config.type) {
        legendHtml = `<div id="legend${config.name}" class="legend"></div>`;
        chartBox.innerHTML += legendHtml;
    }

    anchor.appendChild(chartBox);
}

const getOrCreateLegendList = (chart, id) => {
    const legendContainer = document.getElementById(id);
    let listContainer = legendContainer.querySelector('ul');

    if (!listContainer) {
        listContainer = document.createElement('ul');
        legendContainer.appendChild(listContainer);
    }

    return listContainer;
};

const htmlLegendPlugin = {
    id: 'htmlLegend',
    afterUpdate(chart, args, options) {
        const ul = getOrCreateLegendList(chart, options.containerID);
        const boxes = options.boxes;

        // Remove old legend items
        while (ul.firstChild) {
            ul.firstChild.remove();
        }
        //
        const items = Object.keys(boxes);

        items.forEach(item => {
            const li = document.createElement('li');

            li.onclick = () => {
                const { type } = chart.config;

                chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));

                chart.update();
            };

            // Color box
            const boxSpan = document.createElement('span');
            boxSpan.style.background = boxes[item].bg;
            boxSpan.style.borderColor = boxes[item].border;
            boxSpan.classList = "box";


            // Text
            const textContainer = document.createElement('p');

            const text = document.createTextNode(item);
            textContainer.appendChild(text);

            li.appendChild(boxSpan);
            li.appendChild(textContainer);
            ul.appendChild(li);
        });
    }
};

function prepData(variable, sortBy, dataType) {
    let responses = {};
    if (sortBy) {
        survey0.sort(function (a, b) {
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
            else {
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
    }

    survey0.map(function (row) {
        let proj = row.ProjectPseudonym.trim();
        responses[proj] = {
            m0: row[variable]
        };
    });

    survey6.map(function (row) {
        let proj = row.ProjectPseudonym.trim();
        responses[proj].m6 = row[variable];

    });
    survey12.map(function (row) {
        let proj = row.ProjectPseudonym.trim();
        responses[proj].m12 = row[variable];
    });

    // stripe the data, so the chart likes it.
    let visData = {
        names: Object.keys(responses),
        m0: [],
        m6: [],
        m12: [],
        colors: {
            bg: {
                m0: [],
                m6: [],
                m12: []
            },
            border: {
                m0: [],
                m6: [],
                m12: []
            }
        }
    };

    Object.values(responses).map(function (e) {
        visData.m0.push(e.m0);
        visData.m6.push(e.m6);
        visData.m12.push(e.m12);
        visData
            .colors
            .bg
            .m0
            .push(colorForChart(e.m0, true));
        visData
            .colors
            .bg
            .m6
            .push(colorForChart(e.m6, true));
        visData
            .colors
            .bg
            .m12
            .push(colorForChart(e.m12, true));
        visData
            .colors
            .border
            .m0
            .push(colorForChart(e.m0));
        visData
            .colors
            .border
            .m6
            .push(colorForChart(e.m6));
        visData
            .colors
            .border
            .m12
            .push(colorForChart(e.m12));
    });
    return visData;
}

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
    }
}

const colorForChart = function (value, bg) {
    if (!value) {
        return colors.faded.grey; // grey for null values
    }
    try {
        if (bg) {
            return colForChart[value.trim()].bg;
        } else {
            return colForChart[value.trim()].border;
        }
    }
    catch (e) {
        console.error(`probably, we were unable to find a colour value for the chart item '${value}'.`, e);
    }
}

const generateExpChart = function (config, sortBy) {
    try {
        let visData = prepData(config.name, sortBy);
        let fill = Array(visData.m0.length).fill(1);

        // this positions the labels on half-ticks, which looks a lot better.
        let months = [
            null,
            "Month 0",
            null,
            "Month 6",
            null,
            "Month 12"
        ];

        function datalabelsFormatter(dataset) {
            if (config.datalabels) {
                return function (value, context) {
                    if (dataset[context.dataIndex]) {
                        return dataset[context.dataIndex]
                    }
                    return "";
                }
            } else {
                return function(){return ""}; // no label
            }
        }

        return new Chart(document.getElementById('chart' + config.name), {
            type: 'bar',
            data: {
                labels: visData.names,
                datasets: [
                    {
                        data: fill,
                        backgroundColor: visData.colors.bg.m0,
                        borderColor: visData.colors.border.m0,
                        stack: 'Stack 0', datalabels: {
                            formatter: datalabelsFormatter(visData.m0)
                        }
                    }, {
                        data: fill,
                        backgroundColor: visData.colors.bg.m6,
                        borderColor: visData.colors.border.m6,
                        stack: 'Stack 0',
                        datalabels: {
                            formatter: datalabelsFormatter(visData.m6)
                        }
                    }, {
                        data: fill,
                        datalabels: {
                            formatter: datalabelsFormatter(visData.m12)
                        },
                        backgroundColor: visData.colors.bg.m12,
                        borderColor: visData.colors.border.m12,
                        stack: 'Stack 0'
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        ticks: {
                            callback: function (value, index, ticks) {
                                return months[index];
                            }
                        }
                    },
                    y: {
                        ticks: {
                            callback: function (value, index, ticks) {
                                return this.getLabelForValue(value);
                            },
                            autoSkip: false
                        }
                    }
                },
                indexAxis: 'y',
                plugins: {
                    title: {
                        text: questionText[config.name],
                        display: true
                    },
                    subtitle: {
                        display: true,
                        text: function () {
                            if (sortBy) {
                                return `Sorted by ${sortBy}, high to low`;
                            } else {
                                return `Sorted by order of response to month0 surveys, most recent to earliest`;
                            }
                        }
                    },
                    htmlLegend: {
                        containerID: `legend${config.name}`,
                        boxes: colForLegend[config.type]
                    },
                    legend: {
                        display: false
                    }
                }
            },
            plugins: [htmlLegendPlugin]
        });
    } catch (e) {
        console.error(e);
    }
}