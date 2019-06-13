function clearResults() {
  var container = document.getElementById("results");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function displayResults(res) {
  clearResults();
  var container = document.getElementById("results");
  for (var i = 0; i < res.length; i++) {
    var elem = document.createElement("div");
    var title = document.createElement("b");
    var region = document.createElement("a");
    var select = document.createElement("a");
    title.innerText = res[i][1] + " ";
    region.innerText = res[i][2] + " ";
    select.href = "game.php?id=" + res[i][0];
    select.innerText = "Select";
    elem.className = 'searchitem';
    elem.appendChild(title);
    elem.appendChild(region);
    elem.appendChild(select);
    container.appendChild(elem);
  }
}

initSqlJs().then(function(SQL) {
  var xhr = new XMLHttpRequest();
  // For example: https://github.com/lerocha/chinook-database/raw/master/ChinookDatabase/DataSources/Chinook_Sqlite.sqlite
  xhr.open("GET", "openvgdb.sqlite", true);
  xhr.responseType = "arraybuffer";

  xhr.onload = e => {
    var uInt8Array = new Uint8Array(xhr.response);
    var db = new SQL.Database(uInt8Array);
    var contents = db.exec("SELECT romID, releaseTitleName, TEMPregionLocalizedName FROM RELEASES");
    
    var select = document.getElementById("search");
    
    select.oninput = function() {
      // var result = fuse.search(search.value);
      // result = result.slice(0, 100);
      if (select.value.length == 0) {
        clearResults();
        return;
      }
      displayResults(contents[0].values.filter(function(value) {
        for (var i = 0; i < Math.min(value[1].length, select.value.length); i++) {
          if (value[1][i].toLowerCase() != select.value[i].toLowerCase()) {
            return false;
          }
        }
        return true;
      }).slice(0, 100));
    };    
    
    // contents is now [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
  };
  xhr.send();
});