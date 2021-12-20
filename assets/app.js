`use strict`;

let filename = "";
let result;
let builderDiagramAll = false;
let builderDiagramOne = false;
let thisSelectedAll = 0;
let thisSelectedOne = 0;
let thisClassName = "";

document.querySelector(".inputFile").addEventListener('change', function (event) {
    if (this.files && this.files.length > 1) {
        filename = (this.getAttribute('data-multiple-caption' ) || '').replace('{count}', this.files.length);
    } else {
        filename = event.target.value.split('\\').pop();
    }

    if (filename) {
        document.querySelector(".inputFile").nextElementSibling.querySelector('span').innerHTML = filename;
    }
});

document.querySelector(".downloadBtn").addEventListener('click', function () {
    const CSV = ArrToCSV(result)
    download(filename, CSV);
});

document.querySelector(".inputFile").addEventListener('change', function (event) {
    const f = event.target.files[0];
    if (f) {
        const r = new FileReader();
        r.onload = e => {
            result = CSVToArray(e.target.result, ";")
            console.log(result)
            patchMatrix(result)
            console.log(result)
            CreateTableFromArray(result)
            generateInputButtons(result)
            generateClassButtons(result)
            document.querySelector(".downloadSection").classList.remove("disabled")
            document.querySelectorAll(".disabledLink").forEach(function (e) {
                e.classList.remove("disabled")
            })
            generateButtons(result)
        }
        r.readAsText(f)
    } else {
        console.log("Failed to load file")
    }
});

document.querySelector(".AddBtn").addEventListener('click', function () {
    let newArr = []

    document.querySelectorAll(".inputField").forEach(function (e) {
        newArr.push(e.value)
        e.value = "";
    });
    result.push(newArr)
    CreateTableFromArray(result)
});

document.querySelector(".AllClassesBtn").addEventListener('click', function () {
    document.querySelector(".AllClass").classList.remove("disabled")
    document.querySelector(".OneClass").classList.add("disabled")
});

document.querySelector(".OneClassesBtn").addEventListener('click', function () {
    document.querySelector(".OneClass").classList.remove("disabled")
    document.querySelector(".AllClass").classList.add("disabled")
});

function patchMatrix(Arr) {
    for (let i = 0; i < Arr.length; i++) {
        for (let j = 0; j < Arr[i].length; j++) {
            if (Arr[i][j] === "") {
                Arr[i][j] = 0
            }
        }
    }
}

function CreateTableFromArray(Arr) {
    document.querySelectorAll(".fileTableBody").forEach(function (e) {
        e.textContent = "";

        for (let i = 0; i < Arr.length; i++) {
            let tr = document.createElement("TR")
            e.appendChild(tr); {
                for (let j = 0; j < Arr[i].length; j++) {
                    let td = document.createElement("TD")
                    td.innerHTML = Arr[i][j];
                    tr.appendChild(td)
                }
            }
        }
    });
    classesButtons()
    if (builderDiagramAll) {
        buildStatsTables(getColumnInt(Arr, thisSelectedAll))
    }
    if (builderDiagramOne) {
        buildStatsOneClassTables(getColumnInt(getClassArr(Arr, thisClassName), thisSelectedOne))
    }
}

function CSVToArray(strData, strDelimiter) {
    strDelimiter = (strDelimiter || ",");

    const objPattern = new RegExp(
        (
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );

    const arrData = [[]];

    let arrMatches = null;

    while (arrMatches = objPattern.exec(strData)) {
        const strMatchedDelimiter = arrMatches[1];

        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
        ) {
            arrData.push([]);
        }

        let strMatchedValue;

        if (arrMatches[2]) {
            strMatchedValue = arrMatches[2].replace(
                new RegExp("\"\"", "g"),
                "\""
            );
        } else {
            strMatchedValue = arrMatches[3];
        }

        arrData[arrData.length - 1].push(strMatchedValue);
    }

    return(arrData);
}

function ArrToCSV(Arr) {
    let content = "data:text/csv;charset=utf-8,";

    Arr.forEach(function (row) {
        content += row.join(";") + "\n";
    });

    return content
}

function download(filename, text) {
    const pom = document.createElement('a');
    pom.setAttribute('href', text);
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        const event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function generateInputButtons(Arr) {
    document.querySelector(".inputs").textContent = "";
    for (let i = 0; i < Arr[0].length; i++) {
        let input = document.createElement("input")
        let br = document.createElement("br")
        input.classList.add("input")
        input.classList.add("inputField")
        input.placeholder = Arr[0][i]
        document.querySelector(".inputs").appendChild(input)
        document.querySelector(".inputs").appendChild(br)
    }
    document.querySelector(".AddBtn").classList.remove("noLoadFile")
}

function calcMedian(Arr) {
    const half = Math.floor(Arr.length / 2);
    Arr.sort(function(a, b) { return a - b;});

    if (Arr.length % 2) {
        return Arr[half];
    } else {
        return (Arr[half] + Arr[half] + 1) / 2.0;
    }
}

function calcAverageCost(Arr) {
    return Arr.reduce((partial_sum, a) => partial_sum + a, 0) / Arr.length;
}

function calcPercentage(Arr) {
    const data = {};

    Arr.map(el=>{
        if(!data[el]){
            return data[el]=parseFloat((Arr.filter(ob=>ob===el).length*100/Arr.length).toFixed(2))
        }
    })

    return [data, Arr.length]
}

function getColumnInt(Arr, colNum) {
    let col = [];
    for (let i = 1; i < Arr.length; i++) {
        col.push(parseInt(Arr[i][colNum]));
    }
    return col
}

function getColumnString(Arr, colNum) {
    let col = [];
    for (let i = 1; i < Arr.length; i++) {
        col.push(Arr[i][colNum]);
    }
    return col
}

function getUniqueArr(Arr) {
    return Array.from(new Set(Arr))
}

function generateButtons(Arr) {
    document.querySelector(".inputsStats").textContent = "";
    for (let i = 2; i < Arr[0].length; i++) {
        let button = document.createElement("label")
        let br = document.createElement("br")
        button.classList.add("btn")
        button.addEventListener('click', function () {
            document.querySelector(".statsHead").textContent = Arr[0][i]
            thisSelectedAll = i
            buildStatsTables(getColumnInt(Arr, i))
            document.querySelector(".statsDisabled").classList.remove("disabled")
        })
        button.textContent = Arr[0][i]
        document.querySelector(".inputsStats").appendChild(button)
        document.querySelector(".inputsStats").appendChild(br)
    }
}

function getClassArr(Arr, className) {
    let ClassArr = [[]]
    for (let i = 0; i < Arr.length; i++ ) {
        if (Arr[i][1] === className) {
            ClassArr.push(Arr[i])
        }
    }
    return ClassArr
}

function generateOneClassButtons(Arr, className) {
    document.querySelector(".statsOneBtn").textContent = "";
    for (let i = 2; i < Arr[0].length; i++) {
        let button = document.createElement("label")
        let br = document.createElement("br")
        button.classList.add("btn")
        button.addEventListener('click', function () {
            document.querySelector(".statsOneLHead").textContent = Arr[0][i]
            thisSelectedOne = i;
            thisClassName = className;
            buildStatsOneClassTables(getColumnInt(getClassArr(Arr, className), i))
            document.querySelector(".statsOneClassDisabled").classList.remove("disabled")
        })
        button.textContent = Arr[0][i]
        document.querySelector(".statsOneBtn").appendChild(button)
        document.querySelector(".statsOneBtn").appendChild(br)
    }
}

function buildStatsOneClassTables(Arr) {
    document.querySelector(".statsOneTables").textContent = "";
    let median = calcMedian(Arr);
    let averageCost = calcAverageCost(Arr);
    let [Percentage, length] = calcPercentage(Arr);
    buildOneClassDiagram(Percentage, length)
    let br = document.createElement("br")
    let AVC = document.createElement("div")
    let M = document.createElement("div")
    AVC.textContent = "Медианное значение " + median.toFixed(2)
    M.textContent = "Среднее значение " + averageCost.toFixed(2)
    document.querySelector(".statsOneTables").appendChild(br)
    document.querySelector(".statsOneTables").appendChild(AVC)
    document.querySelector(".statsOneTables").appendChild(br)
    document.querySelector(".statsOneTables").appendChild(M)
    builderDiagramOne = true
}

function buildOneClassDiagram(Arr, length) {
    let canvas = document.createElement("canvas")
    let Legend = document.createElement("div")
    Legend.classList.add("legend")
    canvas.width = 300
    canvas.height = 300

    Diagram({canvas: canvas, data: Arr, length: length, colors: ["#fe0000", "#ff4001", "#ff7f00", "#ffbe00", "#ffff01", "#c0ff00", "#80ff00", "#40ff01", "#01ff01", "#01ff41", "#01ff7f", "#02ffbf", "#02ffff", "#00bffe", "#0080ff", "#0140ff", "#0000fe", "#3f00ff", "#7f00ff", "#bf00fe", "#ff00ff", "#ff00c0", "#ff0080", "#ff0141"], doughnutHoleSize:0.5, legend:Legend});
    document.querySelector(".statsOneTables").appendChild(canvas)
    document.querySelector(".statsOneTables").appendChild(Legend)
}

function generateClassButtons(Arr) {
    document.querySelector(".oneStats").textContent = "";
    let unique = getUniqueArr(getColumnString(Arr, 1))

    for (let i = 0; i < unique.length; i++) {
        let button = document.createElement("label")
        let br = document.createElement("br")
        button.classList.add("btn")
        button.addEventListener('click', function () {
            document.querySelector(".statsOneHead").textContent = unique[i]

            document.querySelector(".statsOneDisabled").classList.remove("disabled")
            generateOneClassButtons(Arr, unique[i])
            document.querySelector(".statsOneClassDisabled").classList.add("disabled")
        })
        button.textContent = unique[i]
        document.querySelector(".oneStats").appendChild(button)
        document.querySelector(".oneStats").appendChild(br)
    }
}

function buildStatsTables(Arr) {
    document.querySelector(".statsTables").textContent = "";
    let median = calcMedian(Arr);
    let averageCost = calcAverageCost(Arr);
    let [Percentage, length] = calcPercentage(Arr);
    buildDiagram(Percentage, length)
    let br = document.createElement("br")
    let AVC = document.createElement("div")
    let M = document.createElement("div")
    AVC.textContent = "Медианное значение " + median.toFixed(2)
    M.textContent = "Среднее значение " + averageCost.toFixed(2)
    document.querySelector(".statsTables").appendChild(br)
    document.querySelector(".statsTables").appendChild(AVC)
    document.querySelector(".statsTables").appendChild(br)
    document.querySelector(".statsTables").appendChild(M)
    builderDiagramAll = true
}

const Diagram = function(options){
    let slice_angle;
    let val;
    let category;
    this.options = options;
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.colors = options.colors;

    let total_value = 0;
    let color_index = 0;
    for (category in this.options.data){
        val = this.options.data[category];
        total_value += val;
    }

    let start_angle = 0;
    for (category in this.options.data){
        val = this.options.data[category];
        slice_angle = 2 * Math.PI * val / total_value;

        drawPieSlice(
            this.ctx,
            this.canvas.width/2,
            this.canvas.height/2,
            Math.min(this.canvas.width/2,this.canvas.height/2),
            start_angle,
            start_angle+slice_angle,
            this.colors[color_index%this.colors.length]
        );

        start_angle += slice_angle;
        color_index++;
    }
    if (this.options.legend){
        color_index = 0;
        let legendHTML = "";
        for (category in this.options.data){
            legendHTML += "<div><span style='text-align:center;display:inline-block;min-width:20px;background-color:"+this.colors[color_index++]+";'>"+category+"</span> "+(this.options.length*(this.options.data[category]/100)).toFixed(0)+"</div>";
            if (this.colors.length === color_index) {
                color_index = 0;
            }
        }
        this.options.legend.innerHTML = legendHTML;
    }

    if (this.options.doughnutHoleSize){
        drawPieSlice(
            this.ctx,
            this.canvas.width/2,
            this.canvas.height/2,
            this.options.doughnutHoleSize * Math.min(this.canvas.width/2,this.canvas.height/2),
            0,
            2 * Math.PI,
            "#fff"
        );
    }

    start_angle = 0;
    for (category in this.options.data){
        val = this.options.data[category];
        slice_angle = 2 * Math.PI * val / total_value;
        const pieRadius = Math.min(this.canvas.width / 2, this.canvas.height / 2);
        let labelX = this.canvas.width / 2 + (pieRadius / 2) * Math.cos(start_angle + slice_angle / 2);
        let labelY = this.canvas.height / 2 + (pieRadius / 2) * Math.sin(start_angle + slice_angle / 2);

        if (this.options.doughnutHoleSize){
            const offset = (pieRadius * this.options.doughnutHoleSize) / 2;
            labelX = this.canvas.width/2 + (offset + pieRadius / 2) * Math.cos(start_angle + slice_angle/2);
            labelY = this.canvas.height/2 + (offset + pieRadius / 2) * Math.sin(start_angle + slice_angle/2);
        }

        const labelText = Math.round(100 * val / total_value);
        this.ctx.fillStyle = "white";
        this.ctx.font = "bold 16px Arial";
        this.ctx.fillText(labelText+"%", labelX,labelY);
        start_angle += slice_angle;
    }
};

function buildDiagram(Arr, length) {
    let canvas = document.createElement("canvas")
    let Legend = document.createElement("div")
    Legend.classList.add("legend")
    canvas.width = 300
    canvas.height = 300
    Diagram({canvas: canvas, data: Arr, length: length, colors: ["#fe0000", "#ff4001", "#ff7f00", "#ffbe00", "#ffff01", "#c0ff00", "#80ff00", "#40ff01", "#01ff01", "#01ff41", "#01ff7f", "#02ffbf", "#02ffff", "#00bffe", "#0080ff", "#0140ff", "#0000fe", "#3f00ff", "#7f00ff", "#bf00fe", "#ff00ff", "#ff00c0", "#ff0080", "#ff0141"], doughnutHoleSize:0.5, legend:Legend});
    document.querySelector(".statsTables").appendChild(canvas)
    document.querySelector(".statsTables").appendChild(Legend)
}

function drawPieSlice(ctx,centerX, centerY, radius, startAngle, endAngle, color ){
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(centerX,centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
}

function classesButtons() {
    let classes = getUniqueArr(getColumnString(result, 1))
    if (classes.length > 1) {
        document.querySelector(".QClasses").classList.remove("disabled")
    } else {
        document.querySelector(".AllClass").classList.remove("disabled")
    }
}

document.querySelector(".deleteFieldBtn").addEventListener('click', function () {
    let NewMatrix = [[]]
    let Deleted = document.querySelector(".deleteField").value;
    for (let i = 0; i < result.length; i++) {
        if (result[i][0] !== Deleted) {
            NewMatrix.push(result[i])
        }
    }
    result = NewMatrix
    CreateTableFromArray(result)
    document.querySelector(".deleteField").value = "";
});