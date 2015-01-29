
var submitButton = document.querySelector('button.submit');
var storage = chrome.storage.local;
var myAppended = document.querySelector('#myAppended');
var mySubstring = document.querySelector('#mySubstring');

submitButton.addEventListener('click', addDump);
loadThisDude();
function addDump() {
  // Get the current CSS snippet from the form.
  var appended = myAppended.value;
  var substring = mySubstring.value;

  // Check that there's some code there.
  if (!appended) {
    message("missing something!");
    return;
  }

  var dump = {
    'appended': appended,
    'substring': substring,
    'active': true
  };

  // Check if there is CSS specified.
  storage.get('dumpConfig', function(items) {
    console.log("items: " + items);
    // If there is CSS specified, inject it into the page.
    var dumpConfig = items.dumpConfig;
    if (dumpConfig) {
      for (var i=0; i<dumpConfig.length; i++) {
        if(dumpConfig[i].active)
          dumpConfig[i].active = false;
      }
      dump.id = dumpConfig.length;
      dumpConfig[dumpConfig.length] = dump;
    } else {
      dumpConfig = [];
      dump.id = 0;
      dumpConfig[0] = dump;
    }

    // Save it using the Chrome extension storage API.
    storage.set({'dumpConfig': dumpConfig}, function() {
      // Notify that we saved.
      message('Settings saved');
      reloadTable();
    });
  });
}





// To do:
// 1. add dumpConfig items to ordered list
// -----DONE
// 2. hook up the "make active" radio button logic
// -----DONE
// 3. make a remove button for each line item, hook up logic
// -----ALMOST THERE!!! cover edge cases. update table dynamically.
// -----Just need to figure out why last click event isnt hooking up properly....
// 4. update table after adding dump







function message(msg) {
  var message = document.querySelector('#theMessage');
  message.innerText = msg;
  setTimeout(function() {
    message.innerText = '';
  }, 3000);
}

function loadThisDude() {
  // Check if there is CSS specified.
  storage.get('dumpConfig', function(items) {
    // If there is CSS specified, inject it into the page.
    if (items.dumpConfig) {
      var dumpConfig = items.dumpConfig;

      if (dumpConfig) {
        var theDumpTable = document.getElementById('theDumpTable');
        for (var i = 0; i < dumpConfig.length; i++) {
          var removeBtn = document.createElement("INPUT");
          removeBtn.setAttribute("type", "button");
          removeBtn.setAttribute("name", "remove");
          removeBtn.setAttribute("value", "X");
          removeBtn.setAttribute("id", dumpConfig[i].id);

          var appended = dumpConfig[i].appended;
          var substring = dumpConfig[i].substring;

          var active = document.createElement("INPUT");
          active.setAttribute("type", "radio");
          active.setAttribute("name", "activeStatus");
          active.setAttribute("id", dumpConfig[i].id);
          active.checked = dumpConfig[i].active;

          var row = theDumpTable.insertRow(-1);
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);
          var cell4 = row.insertCell(3);

          cell1.appendChild(removeBtn);
          cell2.innerHTML = appended;
          cell3.innerHTML = substring;
          cell4.appendChild(active);
        }

        var statuses = document.forms["dumpTableForm"].elements["activeStatus"];
        for (var i=0; i<statuses.length; i++) {
          statuses[i].onclick = activate;
        }

        var removeBtns = document.forms["dumpTableForm"].elements["remove"];
        for (var i=0; i<removeBtns.length; i++) {
          removeBtns[i].onclick = remove;
          console.log("CLICK!");
        }
      }
    } else {
      console.log("well i got here i guess");
    }
  });
  
}

var activate = function() {
  var id = this.id;
  storage.get('dumpConfig', function(items) {
    var dumpConfig = items.dumpConfig;
    if (dumpConfig) {
      for (var i=0; i<dumpConfig.length; i++) {
        if (dumpConfig[i].active) {
          dumpConfig[i].active = false;
        }
        if (i == id) {
          console.log("truthify!");
          dumpConfig[i].active = true;
        }
      }
      // Save it using the Chrome extension storage API.
      storage.set({'dumpConfig': dumpConfig}, function() {
        // Notify that we saved.
        message('Settings saved');
      });
    } else {
      console.log("well i got here i guess2");
    }
  });
}

var remove = function() {
  // grab id of 'this'
  var id = this.id;
  console.log("got here");

  storage.get('dumpConfig', function(items) {
    var dumpConfig = items.dumpConfig;
    if (dumpConfig) {
      // activate a new dump if one exists
      if (dumpConfig[id].active && dumpConfig.length > 1) {
        if (id > 0) {
          dumpConfig[id - 1].active = true;
        } else {
          dumpConfig[id + 1].active = true;
        }
      }

      for (var i=parseInt(id); i<dumpConfig.length; i++) {
        console.log("got here too");
        if (i + 1 == dumpConfig.length) {
          console.log("got here as well");
          --dumpConfig.length;
          break;
        } else {
          dumpConfig[i] = dumpConfig[i+1];
          dumpConfig[i].id = i;
        }
      }
      // Save it using the Chrome extension storage API.
      storage.set({'dumpConfig': dumpConfig}, function() {
        // Notify that we saved.
        message('Settings saved');
        reloadTable();
      });
    } else {
      console.log("well i got here i guess2");
    }
  });
}

var reloadTable = function() {
  var theDumpTable = document.getElementById('theDumpTable');        
  var tableLength = theDumpTable.rows.length;

  while (theDumpTable.rows.length > 1) {
    theDumpTable.deleteRow(1);
  }

  loadThisDude();
}