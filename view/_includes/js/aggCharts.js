

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
            const boxSpan = document.createElement('canvas');
            boxSpan.ctx = boxSpan.getContext('2d');
            boxSpan.backgroundColor = boxes[item].border;
            boxSpan.ctx.fillStyle = boxes[item].bg;
            boxSpan.ctx.fillRect(0, 0, 300, 300);
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

function sortData(variable, sortBy, dataType, ignoreColors) {
    let responses = {};

    if (sortBy) {
        sortedSurvey0 = sortSurveyData(survey0, sortBy);
    }

    sortedSurvey0.map(function (row) {
        let y2Val;
        let proj = row.ProjectPseudonym.trim();
        let val = row[variable];
        if (sortBy == "scale") {
            y2Val = row["project-user-count"];
        } else if ("age") {
            y2Val = new Date(agesByProjName[proj]).getFullYear();
        } else {
            //this might not be the default at some point
            y2Val = new Date(agesByProjName[proj]).getFullYear();
        }
        responses[proj] = {
            m0: val,
            y2: y2Val
        };
    });

    let m6And12 = function (arr, month) {
        arr.map(function (row) {
            let proj = row.ProjectPseudonym.trim();
            let val = row[variable];
            responses[proj][month] = val;
        });
    }

    m6And12(survey6, "m6");
    m6And12(survey12, "m12");



    // stripe the data, so the chart likes it.
    let visData = {
        names: Object.keys(responses),
        m0: [], // data for month 0
        m6: [], // data for month 6...
        m12: [], // data for month 12
        y2: [], // but of course, this is data for
        // axis y2, not a year 
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
        visData.y2.push(e.y2);
        if (!ignoreColors) {
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
        }
    });
    return visData;
}



const generateExpChart = function (config, sortBy, elem) {
    try {
        let visData = sortData(config.name, sortBy);
        let fill = Array(visData.m0.length).fill(1);
        let fill1 = Array(visData.m0.length).fill(0);
        // this positions the labels on half-ticks, which looks a lot better.
        let months = [
            null,
            "Month 0",
            null,
            "Month 6",
            null,
            "Month 12"
        ];

        //note that this returns a partially composed function,
        //NOT a static value.
        function datalabelsFormatter(dataset) {
            if (config.datalabels) {
                return function (value, context) {
                    if (dataset[context.dataIndex]) {
                        return dataset[context.dataIndex]
                    }
                    return "";
                }
            } else {
                return function () { return "" }; // no label
            }
        }

        return new Chart(document.getElementById('chart' + config.name + elem), {
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
                        }, yAxisID: 'y'
                    }, {
                        data: fill,
                        backgroundColor: visData.colors.bg.m6,
                        borderColor: visData.colors.border.m6,
                        stack: 'Stack 0',
                        datalabels: {
                            formatter: datalabelsFormatter(visData.m6)
                        }, yAxisID: 'y'
                    }, {
                        data: fill,
                        datalabels: {
                            formatter: datalabelsFormatter(visData.m12)
                        },
                        backgroundColor: visData.colors.bg.m12,
                        borderColor: visData.colors.border.m12,
                        stack: 'Stack 0',
                        yAxisID: 'y'
                    },
                    {
                        data: fill1,
                        labels: visData.y2,
                        yAxisID: 'y2',
                        datalabels: {
                            display: false
                        }
                    }
                ]
            },
            options: {
                aspectRatio: 0.7,
                scales: {
                    x: {
                        ticks: {
                            callback: function (value, index, ticks) {
                                return months[index];
                            }
                        }
                    },
                    y: {

                        position: 'left',
                        ticks: {
                            callback: function (value, index, ticks) {
                                return this.getLabelForValue(value);
                            },
                            autoSkip: false
                        }
                    },
                    y2: {
                        title: {
                            display: true,
                            text: sortLabels[sortBy]
                        },
                        position: 'right',
                        grid: {
                            drawOnChartArea: false // only want the grid lines for one axis to show up
                        },
                        ticks: {
                            callback: function (value, index, ticks) {
                                return visData.y2[index];
                            },
                            autoSkip: false
                        }
                    }
                },
                indexAxis: 'y',
                plugins: {
                    // title: {
                    //     text: questionText[config.name],
                    //     display: true
                    // },
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
                        containerID: `legend${config.name}${elem}`,
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