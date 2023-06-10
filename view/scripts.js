const generateElem = function (variable, anAnchor, legend) {
    let chartElemHtml = `<canvas id="chart${variable}" width="400" height="400" class="aggGraph"></canvas>`;
    let a;
    if (anAnchor)
    {a = anAnchor;} else {a = "aggregateAnchor"}
    let anchor = document.getElementById(a);

    if (legend) {
        legendHtml = `<div id="legend${variable}" class="legend"></div>`;
        chartElemHtml = legendHtml+chartElemHtml;
    }

    anchor.innerHTML += chartElemHtml;
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

function prepData(variable) {
    let responses = {}
    survey0.map(function(row) {
      let proj = row.ProjectPseudonym.trim();
      responses[proj] = {
        m0: row[variable]
      };
    });

    survey6.map(function(row) {
      let proj = row.ProjectPseudonym.trim();
      responses[proj].m6 = row[variable];

    });
    survey12.map(function(row) {
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

    Object.values(responses).map(function(e) {
      visData.m0.push(e.m0);
      visData.m6.push(e.m6);
      visData.m12.push(e.m12);
      visData
        .colors
        .bg
        .m0
        .push(colorForBool(e.m0, true));
      visData
        .colors
        .bg
        .m6
        .push(colorForBool(e.m6, true));
      visData
        .colors
        .bg
        .m12
        .push(colorForBool(e.m12, true));
      visData
        .colors
        .border
        .m0
        .push(colorForBool(e.m0));
      visData
        .colors
        .border
        .m6
        .push(colorForBool(e.m6));
      visData
        .colors
        .border
        .m12
        .push(colorForBool(e.m12));
    });
    return visData;
  }

  var colForBool = {
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
    }
  }

// I know it's not a real bool, but functionally it's a bool!
  const colorForBool = function(bool, bg) {
    if (! bool) {
      return colors.faded.grey; // grey for null values
    }if (bg) {
      return colForBool[bool].bg;
    } else {
      return colForBool[bool].border;
    }

  }

  const generateExpChart = function(variable) {
    try {
      let visData = prepData(variable);
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

      return new Chart(document.getElementById('chart' + variable), {
        type: 'bar',
        data: {
          labels: visData.names,
          datasets: [
            {

              data: fill,
              backgroundColor: visData.colors.bg.m0,
              borderColor: visData.colors.border.m0,
              stack: 'Stack 0'
            }, {
              data: fill,
              backgroundColor: visData.colors.bg.m6,
              borderColor: visData.colors.border.m6,
              stack: 'Stack 0'
            }, {
              data: fill,
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
                callback: function(value, index, ticks) {
                  return months[index];
                }
              }
            },
            y: {
              ticks: {
                callback: function(value, index, ticks) {
                  return this.getLabelForValue(value);
                },
                autoSkip: false
              }
            }
          },
          indexAxis: 'y',
          plugins: {
            title: {
              text: questionText[variable],
              display: true
            },
            htmlLegend: {
              containerID: `legend${variable}`,
              boxes: colForBool
            },
            legend: {
              display: false
            }
          }
        },
        plugins: [htmlLegendPlugin]
      });
    } catch (e) {
      console.log(e);
    }
  }