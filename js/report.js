window.onload = function () {
    let con = JSON.parse(localStorage.getItem('con'));
    displayCon(con);
};

function displayCon(con) {
    let displayStr = '';
    report = document.getElementById('report');
    displayStr += "<div style='width:100%;height:150px;'><div id='mainInfo'>Staging No:  " + con.stageNum + "<br>Order No: " + con.usNum + "<br>Counter:  " + con.counter1 + "<br>" + con.timeStamp + "</div>"
            + "<table id='conTotals'><tr><td class = 'conTotLabel1'>Pallets:</td><td class = 'conTotLabel'>" + con.totPal + "</td></tr><td class = 'conTotLabel1'>Cases:</td><td class = 'conTotLabel'>" + con.totCase + "</td></tr>"
            + "<tr><td class = 'conTotLabel1'>Units:</td><td class = 'conTotLabel'>" + con.totUnit + "</td></tr><tr><td class = 'conTotLabel1'>Weight:</td><td class = 'conTotLabel'>" + con.totWeight + "</td></tr></table></div><div id='palsContainer'>";
    let x;
    let striped = false;
    displayStr += "<div id='reportHeader1'>Summary</div><table id='conItems'>";
    displayStr += "<tr id='conItemsTitle' style='text-align:center;'><td style='text-align:left;'>Item</td><td>Case Qty</td><td>Unit Qty</td></tr>";
    for (x in con.summary) {
        
            displayStr += "<tr";
            if (striped) {
                displayStr += " style='background-color:lightgray;'";
                striped = false;
            } else {
                striped = true;
            }
            displayStr += "><td>" + con.summary[x].pname + "</td><td style='text-align:center;'>" + con.summary[x].caseQty + "</td><td style='text-align:center;'>" + con.summary[x].unitQty + "</td></tr>";
        

    }
    displayStr += "</table><div id='reportHeader2'>Pallet Breakdown</div>";

    let i;
    let count = 0;
    for (i = 0; i < con.pallets.length; i++) {
        if (count === 2) {
            displayStr += "<div class='divider'></div>";
            count = 0;
        }
        displayStr += "<div id='pallet'><table id='palTotals'>"
                + "<tr><td rowspan=3 id='pNum' style='width:50px;border-right:1px black solid;border-left:1px black solid;'><span>" + con.pallets[i].id + "</span></td><td style='width:130px;text-align:right;border-top:none;'>Cases:</td><td style='text-align:left;width:28px;border-top:none;border-right:1px black solid;'>" + con.pallets[i].cases + "</td></tr>"
                + "<tr><td style='width:130px;text-align:right;border-top:none;'>Units:</td><td style=' width:28px;text-align:left;border-top:none;border-right:1px black solid;'>" + con.pallets[i].units + "</td></tr>"
                + "<tr><td style='width:130px;text-align:right;border-top:none;'>Weight:</td><td style='width:28px;text-align:left;border-top:none;border-right:1px black solid;'>" + con.pallets[i].weight + "</td></tr>"
                + "<tr><td colspan=3 style='border-top:none;'><table id='palItems'><tr id='itemsHeader'><td style='width:55%;text-align:left;'>Item</td><td>Cases</td><td >Units</td></tr>";
        let j;
        for (j = 0; j < con.pallets[i].items.length; j++) {
            displayStr += "<tr ";
            if (j % 2 !== 0) {
                displayStr += "style='background-color:lightgrey;'";
            }
            displayStr += "><td style='text-align:left;width:55%;'>" + con.pallets[i].items[j].pname + "</td><td>" + con.pallets[i].items[j].caseQty + "</td><td >" + con.pallets[i].items[j].unitQty + "</td></tr>";
        }
        displayStr += "</table></td></tr></table></div>";
        if (i + 1 === con.pallets.length) {
            displayStr += "<div class='divider'></div></div>";
        }
        if (count === 0) {
            displayStr += "<div class='centerDiv'></div>";
        }
        count++;
    }
    displayStr += "</div>";

    report.innerHTML = displayStr;
}
