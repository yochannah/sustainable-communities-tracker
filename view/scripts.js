const generateElem = function (variable, anAnchor, legend) {
    let chartElemHtml = `<canvas id="chart${variable}" width="400" height="400" class="aggGraph"></canvas>`;
    let a;
    if (anAnchor)
    {a = anAnchor;} else {a = "aggregateAnchor"}
    let anchor = document.getElementById(a);

    if (legend) {
        legendHtml = `<div id="legend${variable}"></div>`;
        chartElemHtml = legendHtml+chartElemHtml;
    }

    anchor.innerHTML += chartElemHtml;
}   

const getOrCreateLegendList = (chart, id) => {
    const legendContainer = document.getElementById(id);
    let listContainer = legendContainer.querySelector('ul');

    if (!listContainer) {
        listContainer = document.createElement('ul');
        listContainer.style.display = 'flex';
        listContainer.style.flexDirection = 'row';
        listContainer.style.margin = 0;
        listContainer.style.padding = 0;

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
            li.style.alignItems = 'center';
            li.style.cursor = 'pointer';
            li.style.display = 'flex';
            li.style.flexDirection = 'row';
            li.style.marginLeft = '10px';

            li.onclick = () => {
                const { type } = chart.config;

                chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));

                chart.update();
            };

            // Color box
            const boxSpan = document.createElement('span');
            boxSpan.style.background = boxes[item].bg;
            boxSpan.style.borderColor = boxes[item].border;
            boxSpan.style.borderWidth = '2px';
            boxSpan.style.borderStyle = 'solid';
            boxSpan.style.display = 'inline-block';
            boxSpan.style.height = '20px';
            boxSpan.style.marginRight = '10px';
            boxSpan.style.width = '20px';

            // Text
            const textContainer = document.createElement('p');
            textContainer.style.margin = 0;
            textContainer.style.padding = 0;
   
            const text = document.createTextNode(item);
            textContainer.appendChild(text);

            li.appendChild(boxSpan);
            li.appendChild(textContainer);
            ul.appendChild(li);
        });
    }
};