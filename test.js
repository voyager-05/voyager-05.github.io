const sheetID='1JSjqrH2QGnOwns5hOsWQaYgppDRjWzmP05ZZCUqVVnY';
const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`;
const sheetName = 'Sheet2';

document.addEventListener('DOMContentLoaded', init);
 
const output = document.querySelector('.output');
 
function init() {
    console.log('ready');
    clearBox();

    if (document.getElementById("sID").value.length == 0)
    {
        console.log("XXXXXXXXX");
        return;
    }

    if (document.getElementById("sID").value.length != 6)
    {
        console.log("WWWWWWW");
        output.innerHTML = "<br /><br />ID SHOULD BE 6 DIGITS!!!";
        return;
    }
    
    let sID = parseInt(document.getElementById("sID").value, 10);

    // let sID_s = sID.toString();

    let qu = `Select * WHERE A = ${sID}`;
    //let qu = `Select A,C,D WHERE D >= ${point}`;
    // qu = 'Select * WHERE B ="Svekis"';
    // qu = 'Select * WHERE A contains "Jo"';
    // qu = 'Select * WHERE A contains "Jo"';
    // qu = 'Select * WHERE E > date "2021-12-31"';
    // qu = 'Select * WHERE C = "active" And B = "Svekis"';
    const query = encodeURIComponent(qu);
    const url = `${base}&sheet=${sheetName}&tq=${query}`;
    const data = [];
    fetch(url)
        .then(res => res.text())
        .then(rep => {
            console.log(rep)
            //console.log(rep);
            const jsData = JSON.parse(rep.substr(47).slice(0, -2));
            if (jsData.table.rows != 0)
            {
                console.log(jsData);
                const colz = [];
                jsData.table.cols.forEach((heading) => {
                    if (heading.label) {
                        colz.push(heading.label.toLowerCase().replace(/\s/g, ''));
                    }
                })
                jsData.table.rows.forEach((main) => {
                    //console.log(main);
                    const row = {};
                    colz.forEach((ele, ind) => {
                        //console.log(ele);
                        row[ele] = (main.c[ind] != null) ? main.c[ind].v : '';
                    })
                    data.push(row);
                })
                maker(data);
            }
            else
            {
                output.innerHTML = "<br /><br />NO SUCH ID FOUND!!!";
            }
        })    
}
 
function clearBox()
{
    output.innerHTML = "";
}

function maker(json) {
    const div = document.createElement('div');

    output.innerHTML = "";
    output.innerHTML = "<br /><br />"
    div.style.display = 'grid';
 
    output.append(div);
    let first = true;
    json.forEach((el) => {
        //console.log(ele);
        const keys = Object.keys(el);
        div.style.gridTemplateColumns = `repeat(${keys.length} ,1fr)`;
        if (first) {
            first = false;
            keys.forEach((heading) => {
                const ele = document.createElement('div');
                ele.textContent = heading.toUpperCase();
                ele.style.background = 'black';
                ele.style.color = 'white';
                div.append(ele);
            })
 
        }
        keys.forEach((key) => {
            const ele = document.createElement('div');
            ele.style.border = '1px solid #ddd';
            ele.textContent = el[key];
            div.append(ele);
        })
        console.log(keys);
    })
 
}
 
