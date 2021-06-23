import * as d3 from 'd3';
import * as Plotly from 'plotly.js';
import Swal from 'sweetalert2';

const normalize = require('array-normalize')
let druid = require('@saehrimnir/druidjs');


let file_data;
let csv_data;
let dr;
let columns;
let filename: string = undefined;
let sep_sel: HTMLElement;
let marker_size_sel: HTMLElement;
let marker_color_sel: HTMLElement;
let marker_shape_sel: HTMLElement;
let selected_sep: any;
let selected_dimensions = [];
let all_dimensions = [];

let marker_color = 'blue';
let marker_size: any = 4;
let marker_shape = 'circle';


const el: HTMLElement = document.getElementById('csv_upload');
el.onchange = (ev: Event) => openFile(ev.target as HTMLInputElement);

const method_sel: HTMLElement = document.getElementById('dim_method');
method_sel.onchange = (ev: Event) => selectData();

const about_act: HTMLElement = document.getElementById('about_act');
about_act.onclick = (ev: Event) => about();

document.getElementById('toggle-dims').onclick = function() {
    showLoader()
    tabulate()
};

const marker_style: HTMLElement = document.getElementById('marker-style');
marker_style.onclick = (ev: Event) => setMarkerStyle();

document.getElementById('dataset-nav').onclick = () => el.click();

let html_select_csv = '' +
    '<div class="columns" id="dimensions">' +
    '<div class="m-2">' +
    '<label class="label" for="data-language">CSV Encoding</label>' +
    '        <div class="control">' +
    '            <div class="select">' +
    '                <select id="data-language" name="data-language">' +
    '                    <option>UTF-8</option>' +
    '                    <option>UTF-16</option>' +
    '                </select>' +
    '            </div>' +
    '        </div></div>' +
    '        <div class="m-2"><label class="label" for="data-separator">CSV Separator</label>' +
    '        <div class="control">' +
    '            <div class="select">' +
    '                <select id="data-separator" name="data-separator">' +
    '                    <option></option>' +
    '                    <option>,</option>' +
    '                    <option>;</option>' +
    '                    <option>|</option>' +
    '                    <option>Tabulator</option>' +
    '                </select>' +
    '            </div>' +
    '        </div>' +
    '</div>' +
    '</div>';


function about() {
    Swal.fire({
        icon: 'info',
        title: 'About the project',
        width: 600,
        html: '<p>' +
            '            <strong>IVIS 2021</strong> <br/>' +
            '            <strong>Authors:</strong> Jihad Itani, Piotr Kupiec, Emanuel Moser, Martin Sackl <br/>' +
            '            Copyright 2021 by the authors, except as otherwise noted. <br/>' +
            '            This work is placed under a reative Commons Attribution 4.0 International (CC BY 4.0) licence' +
            '        </p>',
    })
}


let tabulate = function () {
    document.getElementById('data-display').innerHTML = '';

    setTimeout(function () {
        let table = d3.select('#data-display').append('div')
            .attr('class', 'sm-table-holder is-size-6').append('table')
        table.attr('class', 'table')
        let thead = table.append('thead')
        let tbody = table.append('tbody')
        let table_data = csv_data;
        if (table_data.length > 5) {
            table_data = table_data.slice(0, 5);
        }


        thead.append('tr')
            .selectAll('th')
            .data(columns)
            .enter()
            .append('th')
            .attr('align', function (d: any) {
                let val = table_data[1][d]
                return Number(val) ? 'right' : 'left'
            })
            .html(function(d: any) {
                let is_checked = 'checked'
                if(selected_dimensions.indexOf(d) === -1) {
                    is_checked = ''
                }
                return '<input class="sm-dim-sel mr-1" type="checkbox" '+is_checked+' value="'+d+'" id="dimselect_' + d + '" name="dimselect_' + d + '"><label for="dimselect_"'+d+'">'+d+'</label>';
            })


        let rows = tbody.selectAll('tr')
            .data(table_data)
            .enter()
            .append('tr')

        let cells = rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    return {column: column, value: row[column]}
                })
            })
            .enter()
            .append('td')
            .attr('align', function (d: any) {
                return Number(d.value) ? 'right' : 'left'
            })
            .text(function (d: any) {
                if (Number(d.value))
                    return Math.round(d.value).toFixed(2)
                else
                    return d.value
            })

        // displayDimensions()

        let displayhtml = html_select_csv +
            document.getElementById('data-display').innerHTML
            // + document.getElementById('dimensions_selector').innerHTML


        hideLoader()

        Swal.fire({
            title: 'Data Preview',
            width: '80%',
            html: displayhtml,
            confirmButtonText: 'Select dataset',
            showCancelButton: true,
        }).then((result) => {
            if (result.isConfirmed) {
                let element = document.getElementById('vizcontainer')
                element.classList.remove('is-invisible', 'hider')
                selectData()
            }
        });


        document.getElementById('data-display').innerHTML = '';

        (document.getElementById('data-separator') as HTMLInputElement).value = selected_sep;
        sep_sel = document.getElementById('data-separator')
        sep_sel.onchange = (ev: Event) => processData(file_data, (ev.target as HTMLInputElement).value);

        for (let i = 0; i < all_dimensions.length; i++) {
            let cbx = document.getElementById('dimselect_' + all_dimensions[i])
            cbx.onchange = (ev: Event) => selectDimension((ev.target as HTMLInputElement).value);
        }

    }, 1000)
}



function processData(item: any, separator = ',') {

    showLoader()

    selected_sep = separator
    let dat: any;
    try {
        switch (separator) {
            case ',':
                dat = d3.csvParse(item);
                break;
            case 'Tabulator':
                dat = d3.tsvParse(item);
                break;
            default:
                let psv = d3.dsvFormat(separator);
                dat = psv.parse(item);
        }
    } catch (e) {
        alert(e);
    }
    OnDataGet(dat);
}


function openFile(ev: HTMLInputElement) {
    event.preventDefault();
    let f = ev.files;
    let fil: File = f[0];
    let reader = new FileReader();
    filename = fil.name.split('.')[0];

    reader.onerror = function (e) {
        alert(e.target.result);
    }

    reader.onload = function (e) {
        showLoader()
        let tar: FileReader = e.target;
        file_data = tar.result;
        let separator = sep_sel ? (sep_sel as HTMLInputElement).value : ','
        processData(file_data, separator);
    }
    reader.readAsText(fil);
    document.getElementById('file-name-upload').innerText = fil.name
}


function OnDataGet(new_data: any) {
    csv_data = new_data;
    columns = csv_data.columns;

    for (const [key, value] of Object.entries(csv_data[0])) {
        selected_dimensions.push(key);
        all_dimensions.push(key);
    }

    tabulate();
}


function selectData() {
    showLoader()

    setTimeout(function () {
        reduceDimension()

        let viz_add = <HTMLInputElement>document.getElementById('viz_add');
        if (!viz_add.checked) {
            document.getElementById('data_viz').innerHTML = "";
        }

        let x = [];
        let y = [];

        for (let val of dr) {
            x.push(val[0])
            y.push(val[1])
        }

        normalize(x)
        normalize(y)

        let data: Plotly.Data[] = [{
            x: x,
            y: y,
            type: 'scatter',
            mode: 'markers',
            marker: {
                color: marker_color,
                size: marker_size,
                symbol: marker_shape
            },
        }];

        let dim_select: any = document.getElementById("dim_method");
        let dim_method: any = dim_select.options[dim_select.selectedIndex].value;

        let plot = document.getElementById('data_viz');
        let plot_col = document.createElement("div");
        plot_col.setAttribute('class', 'column is-half');
        plot.appendChild(plot_col);

        let plot_width = plot_col.offsetWidth - 10;
        let plot_height = plot_col.offsetWidth - 10;

        let layout = {
            title: 'Method: ' + dim_method,
            height: plot_height,
        };

        var icon1 = {
            'width': 1200,
            'height': 600,
            'path': 'm500 450c-83 0-150-67-150-150 0-83 67-150 150-150 83 0 150 67 150 150 0 83-67 150-150 150z m400 150h-120c-16 0-34 13-39 29l-31 93c-6 15-23 28-40 28h-340c-16 0-34-13-39-28l-31-94c-6-15-23-28-40-28h-120c-55 0-100-45-100-100v-450c0-55 45-100 100-100h800c55 0 100 45 100 100v450c0 55-45 100-100 100z m-400-550c-138 0-250 112-250 250 0 138 112 250 250 250 138 0 250-112 250-250 0-138-112-250-250-250z m365 380c-19 0-35 16-35 35 0 19 16 35 35 35 19 0 35-16 35-35 0-19-16-35-35-35z',
        }

        Plotly.newPlot(plot_col, data, layout, {
            responsive: false,
            toImageButtonOptions: {
                filename: 'plot_export',
                format: 'svg'
            },
            modeBarButtonsToAdd: [
                {
                    name: 'Save as SVG',
                    title: 'Save as SVG',
                    icon: icon1,
                    click: () => exportSVG(true)
                },
            ],
            modeBarButtonsToRemove: ['toImage', 'hoverClosestGl2d', 'hoverClosestGeo', 'hoverClosestCartesian', 'sendDataToCloud', 'lasso2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d', 'toggleSpikelines', 'hoverCompareCartesian'],
            displaylogo: false,
        });

        exportSVG()
        document.getElementById('csv-upload-holder').classList.add('hider')
        document.getElementById("toggle-dims").classList.remove('hider');
        document.getElementById("marker-style").classList.remove('hider');
        hideLoader()
    }, 500);
}


function exportSVG(download = false) {
    let all_svg = document.getElementsByClassName("main-svg");
    downloadSVG(all_svg[0], download);

    // if(download) {
    //     for(let i = 0; i < all_svg.length; i++) {
    //         let svg = all_svg[i];
    //         downloadSVG(svg, download);
    //     }
    // }
    // else {
    //     downloadSVG(all_svg[0], download);
    // }
}


function downloadSVG(svg, download) {
    let width = svg.getAttribute('width')
    let height = svg.getAttribute('height')
    let svgData = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height + '">';
    svgData += svg.innerHTML;
    svgData += '</svg>'

    let svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
    let svgUrl = URL.createObjectURL(svgBlob);
    let download_link = document.getElementById("svg-link");
    download_link.setAttribute('href', svgUrl);
    download_link.setAttribute('download', 'visualization.svg');
    download_link.classList.remove('hider');

    if (download) {
        download_link.click()
    }
}


function removeSVGAttr() {
    let svg = document.getElementsByClassName('main-svg')[0];
    svg.removeAttribute('width')
    svg.removeAttribute('height')
}


function reduceDimension() {
    let values = csv_data.map((row) => {
        let x = []

        for (const [key, value] of Object.entries(row)) {
            if(selected_dimensions.indexOf(key) > -1) {
                if (Number(value))
                    x.push(value)
                else
                    x.push('')
            }
        }
        return x
    })

    let X = druid.Matrix.from(values)

    let dim_select: any = document.getElementById("dim_method");
    let dim_method: any = dim_select.options[dim_select.selectedIndex].value;

    dr = new druid[dim_method](X)
    dr = dr.transform().to2dArray
}


function showLoader() {
    document.getElementById('sm-loader').style.visibility = 'visible';
    document.getElementById('sm-loader').style.zIndex = '9999';
}


function hideLoader() {
    document.getElementById('sm-loader').style.visibility = 'hidden';
    document.getElementById('sm-loader').style.zIndex = '-1';
}


function selectDimension(dimension) {
    const index = selected_dimensions.indexOf(dimension);
    if (index > -1) {
        selected_dimensions.splice(index, 1);
    }
    else {
        selected_dimensions.push(dimension)
    }
}


function setMarkerStyle() {
    let styler = '<div class="columns"><div class="m-2"><label class="label" for="marker-shape">Shape</label>' +
        '        <div class="control">' +
        '            <div class="select">' +
        '                <select id="marker-shape" name="marker-shape">' +
        '                    <option>circle</option>' +
        '                    <option>diamond</option>' +
        '                    <option>cross</option>' +
        '                    <option>x</option>' +
        '                    <option>triangle</option>' +
        '                    <option>hexagram</option>' +
        '                    <option>pentagon</option>' +
        '                    <option>star</option>' +
        '                    <option>diamond</option>' +
        '                    <option>hourglass</option>' +
        '                    <option>bowtie</option>' +
        '                    <option>asterisk</option>' +
        '                    <option>square</option>' +
        '                </select>' +
        '            </div>' +
        '        </div></div>' +
        '        <div class="m-2"><label class="label" for="marker-size">Size</label>' +
        '        <div class="control">' +
        '            <div class="field">' +
        '                <input class="input" id="marker-size" name="marker-size" type="number"/>' +
        '            </div>' +
        '        </div></div>' +
        '        <div class="m-2"><label class="label" for="marker-color">Color</label>' +
        '        <div class="control">' +
        '            <div class="select">' +
        '                <select id="marker-color" name="marker-color">' +
        '                    <option>red</option>' +
        '                    <option>blue</option>' +
        '                    <option>black</option>' +
        '                    <option>green</option>' +
        '                    <option>orange</option>' +
        '                    <option>pink</option>' +
        '                    <option>yellow</option>' +
        '                </select>' +
        '            </div>' +
        '        </div></div></div>';

    Swal.fire({
        title: 'Glyph Styling',
        width: '60%',
        html: styler,
        confirmButtonText: 'Done',
        showCancelButton: false,
    })

    markerListener()
}


function markerListener() {
    (document.getElementById('marker-size') as HTMLInputElement).value = marker_size;
    marker_size_sel = document.getElementById('marker-size')
    marker_size_sel.onchange = (ev: Event) => {
        marker_size = (ev.target as HTMLInputElement).value
    };

    (document.getElementById('marker-color') as HTMLInputElement).value = marker_color;
    marker_color_sel = document.getElementById('marker-color')
    marker_color_sel.onchange = (ev: Event) => {
        marker_color = (ev.target as HTMLInputElement).value
    };

    (document.getElementById('marker-shape') as HTMLInputElement).value = marker_shape;
    marker_shape_sel = document.getElementById('marker-shape')
    marker_shape_sel.onchange = (ev: Event) => {
        marker_shape = (ev.target as HTMLInputElement).value
    };
}