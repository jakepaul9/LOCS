window.onload = function() {
  document.getElementById("stage").focus();
};
let PAL_WEIGHT = 40,
  CELL_COUNT = 5,
  palNum = 1,
  counter1 = "",
  usNum = "",
  stageNum,
  scannedItems = [],
  allItems = [],
  pallets = [],
  exists = false,
  onOtherPal = false;

let itemScanned = document.getElementById("mainScanInput");
let pList = document.getElementById("partsList");
let pTable = document.getElementById("partTable");

//Define an item object
function Item(id, name, cases, units, lbs) {
  this.id = id;
  this.pname = name;
  this.caseQty = cases;
  this.unitQty = units;
  this.weight = lbs;
}

//Define a pallet object
function Pallet(totCases, totUnits, totLbs) {
  this.id = palNum++;
  this.cases = totCases;
  this.units = totUnits;
  this.weight = totLbs;
  this.items = scannedItems.sort(function(a, b) {
    var x = a.id;
    var y = b.id;
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  });
}

//Define a consolidation / count object
function Consolidation(c, u, w, d) {
  this.counter1 = counter1;
  this.usNum = usNum;
  this.stageNum = stageNum;
  this.totPal = pallets.length;
  this.summary = allItems.sort(function(a, b) {
    var x = a.id;
    var y = b.id;
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  });
  this.totCase = c;
  this.totUnit = u;
  this.totWeight = w;
  this.pallets = pallets;
  this.timeStamp = d;
}

//Begin Counting
function beginCon() {
  let req = document.getElementsByClassName("infoRequired");
  let i;
  for (i = 0; i < req.length; i++) {
    if (req[i].value === "") {
      alert("all fields required!");
      return -1;
    }
  }

  stage = document.getElementById("stage");
  us = document.getElementById("us");
  count_1 = document.getElementById("count_1");

  stageNum = stage.value;
  usNum = us.value;
  counter1 = count_1.value;

  document.getElementById("getInfoContainer").style.display = "none";

  stage.value = stage.value++;
  us.value = "";
  count_1.value = "";
  $("#palletNumber").val(palNum);
  itemScanned.focus();
}

function cancelCon() {
  window.location = "../index.html";
}

//If part is entered manually on built in virtual keyboard
/*function(event) {
    if (event.which === 13) {
        scanItem( $("#mainScanInput").val());
    }
});*/

function keyScan(event) {
  if (event.keyCode === 13) {
    scanItem(this.value);
  }
}

//If part barcode is scanned with bluetooth scanner
/*$('#mainScanInput').scannerDetection({

  //https://github.com/kabachello/jQuery-Scanner-Detection

    timeBeforeScanTest: 200, // wait for the next character for upto 200ms
    avgTimeByChar: 100, // it's not a barcode if a character takes longer than 100ms
    preventDefault: true,

    endChar: [13],
    onComplete: function(barcode, qty){
        validScan = true;
        scanItem(barcode);

    } // main callback function ,
    ,
    onError: function(string, qty) {

        $('#mainScanInput').val ($('#mainScanInput').val()  + string);

    }

});*/

//Main item scanning Algorithm recieves part entered/scanned for general pallet building process.
function scanItem(str) {
  if (str != "") {
    //alert(str);
    let item = str.toLowerCase().replace(/[^a-zA-Z0-9+]/g, "");
    //alert(item);
    onOtherPal = false;
    if (allItems.length > 0) {
      let i;
      for (i = 0; i < allItems.length; i++) {
        if (item === allItems[i].id) {
          let addUnits = allItems[i].unitQty / allItems[i].caseQty;
          let addWeight = allItems[i].weight / allItems[i].caseQty;
          allItems[i].caseQty += 1;
          allItems[i].unitQty += addUnits;
          allItems[i].weight += addWeight;
          onOtherPal = true;
        }
      }
    }
    if (!scannedItems.length > 0) {
      exists = false;
    } else {
      let i;
      console.log(allItems);

      for (i = 0; i < scannedItems.length; i++) {
        if (item === scannedItems[i].id) {
          let addUnits = scannedItems[i].unitQty / scannedItems[i].caseQty;
          let addWeight = scannedItems[i].weight / scannedItems[i].caseQty;
          let newCase = (scannedItems[i].caseQty += 1);
          let newUnits = (scannedItems[i].unitQty += addUnits);
          let newWeight = (scannedItems[i].weight += addWeight);
          var two = 2;
          var table = document.getElementById("partsList");
          table.rows[i].cells[1].children[0].value = newCase;
          table.rows[i].cells[2].innerHTML = newUnits;
          table.rows[i].cells[3].innerHTML = Math.round(newWeight);
          exists = true;
          continue;
        }
      }
    }
    if (!exists) {
      let pc = 0;

      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          if (this.responseText == "invalid") {
            alert("Invalid Scan");
          } else {
            var partInfo = JSON.parse(this.responseText);

            pc += 1;
            scannedItems.push(
              new Item(
                partInfo["id"],
                partInfo["pname"],
                pc,
                parseInt(partInfo["units"]),
                partInfo["weight"]
              )
            );
            if (!onOtherPal) {
              allItems.push(
                new Item(
                  partInfo["id"],
                  partInfo["pname"],
                  pc,
                  parseInt(partInfo["units"]),
                  partInfo["weight"]
                )
              );
              onOtherPal = true;
            }
            let row = pList.insertRow(-1);
            let caseInput = document.createElement("input");
            caseInput.setAttribute("class", "caseInput");
            let i;
            for (i = 0; i < CELL_COUNT; i++) {
              let cell = row.insertCell(i);
              if (i === 1) {
                cell.appendChild(caseInput);
                cell.addEventListener("keypress", manQtyEnter, false);
              }
              if (i === 4) {
                cell.addEventListener("click", removeItem, false);
              }
            }
            row.cells[0].innerHTML = partInfo["pname"];
            row.cells[1].children[0].value = pc++;
            row.cells[2].innerHTML = partInfo["units"];
            row.cells[3].innerHTML = Math.round(partInfo["weight"]);
            row.cells[4].innerHTML =
              "<img id='trash' src = '../images/trash.png' alt='delete' />";
          }
        }
      };
      xhttp.open("POST", "../validatePart.php?pname=" + item, true);
      xhttp.send();
    }
    //reset to default values after succesful scan
    exists = false;
    item = "";
    itemScanned.value = "";
    console.log(scannedItems);
  } else if (str === "") {
    alert("invalid Scan");
  }
}

//Delete item from pallet via trash can image
function removeItem(e) {
  let rIndex = this.parentNode.rowIndex - 1;
  let cIndex = this.cellIndex;
  if (allItems.length > 0) {
    for (let i = 0; i < allItems.length; i++) {
      if (scannedItems[rIndex].id == allItems[i].id) {
        if (scannedItems[rIndex].caseQty != allItems[i].caseQty) {
          allItems[i].caseQty =
            allItems[i].caseQty - scannedItems[rIndex].caseQty;
          allItems[i].unitQty =
            allItems[i].unitQty - scannedItems[rIndex].unitQty;
          allItems[i].weight = allItems[i].weight - scannedItems[rIndex].weight;
        } else {
          allItems.splice(i, 1);
        }
      }
      console.log(allItems);
    }
  }
  pList.deleteRow(rIndex);

  scannedItems.splice(rIndex, 1);
  console.log(scannedItems);
}

function manQtyEnter(e) {
  if (e.keyCode === 13) {
    let rIndex = this.parentNode.rowIndex - 1;
    let cIndex = this.cellIndex;
    let addUnits = scannedItems[rIndex].unitQty / scannedItems[rIndex].caseQty;
    let addWeight = scannedItems[rIndex].weight / scannedItems[rIndex].caseQty;
    let newCase = (scannedItems[rIndex].caseQty =
      pList.rows[rIndex].cells[cIndex].children[0].value);
    let newUnits = addUnits * newCase;
    let newWeight = addWeight * newCase;
    scannedItems[rIndex].unitQty = newUnits;
    scannedItems[rIndex].weight = newWeight;
    pList.rows[rIndex].cells[2].innerHTML = newUnits;
    pList.rows[rIndex].cells[3].innerHTML = Math.round(newWeight);
    let partId = scannedItems[rIndex].id;
    for (i = 0; i < allItems.length; i++) {
      if (partId === allItems[i].id) {
        allItems[i].caseQty += eval(newCase) - 1;
        allItems[i].unitQty += eval(newUnits) - 5;
        allItems[i].weight += Math.round(eval(newWeight));
      }
    }

    itemScanned.focus();

    //scannedItems[rIndex, 1);
    //alert(scannedItems);
  }
}

function editPallet(e) {
  if (e.keyCode === 13) {
    let palId = this.value - 1;
    if (pallets[palId] != "undefined") {
      let deletePal = document.createElement("button");
      //deletePal.addEventListener('click', deletePallet, false);
      let addbutton = document.getElementById("footer");
      addbutton.appendChild(deletePal);
      scannedItems = pallets[palId].items;

      let i, j;
      let index = -1;
      for (j = 0; j < scannedItems.length; j++) {
        let row = pList.insertRow(index++);
        let caseInput = document.createElement("input");
        caseInput.setAttribute("class", "caseInput");
        for (i = 0; i < CELL_COUNT; i++) {
          let cell = row.insertCell(i);
          if (i === 1) {
            cell.appendChild(caseInput);
            cell.addEventListener("keypress", manQtyEnter, false);
          }
          if (i === 4) {
            cell.addEventListener("click", removeItem, false);
          }
        }
        row.cells[0].innerHTML = scannedItems[j].pname;
        row.cells[1].children[0].value = scannedItems[j].caseQty;
        row.cells[2].innerHTML = scannedItems[j].unitQty;
        row.cells[3].innerHTML = Math.round(scannedItems[j].weight);
        row.cells[4].innerHTML =
          "<img id='trash' src = '../images/trash.png' alt='delete' />";
      }
    }
    itemScanned.focus();
  }
}

//Add another pallet to the consolidation/count
function addPallet() {
  let i = document.getElementById("palletNumber").value - 1;
  if (pallets[i] !== undefined) {
    palNum = i + 1;
    let c = Totals(1),
      u = Totals(2),
      w = Totals(3);
    if (!(c > 0)) {
      pallets.splice(i, 1);
      scannedItems = [];
      pList.innerHTML = "";
      itemScanned.focus();
      for (i in pallets) {
        pallets[i].id = ++i;
      }
    } else {
      pallets[i] = new Pallet(c, u, w);
      scannedItems = [];
      pList.innerHTML = "";
      itemScanned.focus();
    }
  } else {
    let c = Totals(1),
      u = Totals(2),
      w = Totals(3);
    if (!scannedItems.length > 0) {
      itemScanned.focus();
      return -1;
    } else {
      $("#palletNumber").val(palNum + 1);
      pallets.push(new Pallet(c, u, w));
      scannedItems = [];
      pList.innerHTML = "";
      itemScanned.focus();
      console.log(pallets);
      console.log(allItems);
    }
  }
}

//Get totals for individual pallets and the entire count
function Totals(tots) {
  let sum = 0;
  let i;

  switch (tots) {
    case 1:
      for (i = 0; i < scannedItems.length; i++) {
        sum += eval(scannedItems[i].caseQty);
      }
      break;
    case 2:
      for (i = 0; i < scannedItems.length; i++) {
        sum += scannedItems[i].unitQty;
      }
      break;
    case 3:
      for (i = 0; i < scannedItems.length; i++) {
        sum += scannedItems[i].weight;
      }
      sum += PAL_WEIGHT;
      sum = Math.round(sum);
      break;
    case 4:
      for (i = 0; i < pallets.length; i++) {
        sum += pallets[i].cases;
      }
      break;
    case 5:
      for (i = 0; i < pallets.length; i++) {
        sum += pallets[i].units;
      }
      break;
    case 6:
      for (i = 0; i < pallets.length; i++) {
        sum += pallets[i].weight;
      }
      sum = Math.round(sum);
      break;
  }
  return sum;
}

//Finish count
function completeCon() {
  let c = Totals(4),
    u = Totals(5),
    w = Totals(6);
  let d = new Date();
  let datestring =
    d.getDate() +
    "-" +
    (d.getMonth() + 1) +
    "-" +
    d.getFullYear() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes();

  let con = new Consolidation(c, u, w, datestring);
  let jsonCon = JSON.stringify(con);
  localStorage.setItem("con", jsonCon);
  // window.location = 'report.html';
  displayCon(con);
  document.getElementById("display").style.visibility = "visible";
}
function hide() {
  document.getElementById("display").style.visibility = "hidden";
  itemScanned.focus();
}
// Warning before leaving the page (back button, or outgoinglink)
window.onbeforeunload = function() {
  return "Do you really want to leave our brilliant application?";
  //if we return nothing here (just calling return;) then there will be no pop-up question at all
  //return;
};
function printReport() {
  window.print();
}
itemScanned.addEventListener("keypress", keyScan, false);
palletNumber.addEventListener("keypress", editPallet, false);
