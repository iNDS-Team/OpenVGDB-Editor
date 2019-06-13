var dropArea = document.getElementById("drop-area");
var filebtn = document.getElementById("file");
var uploadbtn = document.getElementById("submit");
var loadingICN = document.getElementById("loading");
var lastOffset = 0;
var fileMD5 = null;
var fileSHA1 = null;
var fileCRC = null;
var fileSize = null;

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight(e) {
  preventDefaults(e);
  dropArea.classList.add("highlight");
}

function unhighlight(e) {
  preventDefaults(e);
  dropArea.classList.remove("highlight");
}

dropArea.addEventListener("dragenter", highlight, false);
dropArea.addEventListener("dragover", highlight, false);
dropArea.addEventListener("dragleave", unhighlight, false);
dropArea.addEventListener("drop", unhighlight, false);
dropArea.addEventListener("drop", dropped, false);

filebtn.onchange = function(e) {
  hash(e.target.files);
};

uploadbtn.onclick = function(e) {
  var urlParams = new URLSearchParams(window.location.search);
  if (fileMD5 != null && fileSHA1 != null && fileCRC != null && fileSize != null) {
    window.location.replace(
      window.location.href.split("?")[0] +
        "?id=" +
        urlParams.get("id") +
        "&md5=" +
        fileMD5 +
        "&sha1=" +
        fileSHA1 +
        "&crc=" +
        fileCRC + 
        "&size=" +
        fileSize
    );
  }
};

function hash(files) {
  var file = files[0];
  fileSize = file.size;
  loadingICN.style.opacity = 1;
  hashChainMD5(file);
}

function hashChainMD5(file) {
  var MD5 = CryptoJS.algo.MD5.create();
  var counter = 0;
  loading(
    file,
    function(data) {
      var wordBuffer = CryptoJS.lib.WordArray.create(data);
      MD5.update(wordBuffer);
      counter += data.byteLength;
      console.log(((counter / file.size) * 100).toFixed(0) + "%");
    },
    function(data) {
      console.log("100%");
      var encrypted = MD5.finalize().toString();
      lastOffset = 0;
      fileMD5 = encrypted;
      console.log("encrypted: " + encrypted);
      hashChainSHA1(file);
    }
  );
}

function hashChainSHA1(file) {
  var SHA1 = CryptoJS.algo.SHA1.create();
  var counter = 0;
  loading(
    file,
    function(data) {
      var wordBuffer = CryptoJS.lib.WordArray.create(data);
      SHA1.update(wordBuffer);
      counter += data.byteLength;
      console.log(((counter / file.size) * 100).toFixed(0) + "%");
    },
    function(data) {
      console.log("100%");
      var encrypted = SHA1.finalize().toString();
      lastOffset = 0;
      fileSHA1 = encrypted;
      console.log("encrypted: " + encrypted);
      hashChainCRC(file);
    }
  );
}

function hashChainCRC(file) {
  var reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = function(evt) {
    fileCRC = crc32(evt.target.result);
    uploadbtn.removeAttribute("disabled");
    loadingICN.style.opacity = 0;
  };
}

function callbackRead(reader, file, evt, callbackProgress, callbackFinal) {
  if (lastOffset === reader.offset) {
    // in order chunk
    lastOffset = reader.offset + reader.size;
    callbackProgress(evt.target.result);
    if (reader.offset + reader.size >= file.size) {
      callbackFinal();
    }
  } else {
    // not in order chunk
    timeout = setTimeout(function() {
      callbackRead(reader, file, evt, callbackProgress, callbackFinal);
    }, 10);
  }
}

function loading(file, callbackProgress, callbackFinal) {
  var chunkSize = 1024 * 1024; // bytes
  var offset = 0;
  var size = chunkSize;
  var partial;
  var index = 0;

  if (file.size === 0) {
    callbackFinal();
  }
  while (offset < file.size) {
    partial = file.slice(offset, offset + size);
    var reader = new FileReader();
    reader.size = chunkSize;
    reader.offset = offset;
    reader.index = index;
    reader.onload = function(evt) {
      callbackRead(this, file, evt, callbackProgress, callbackFinal);
    };
    reader.readAsArrayBuffer(partial);
    offset += chunkSize;
    index += 1;
  }
}

function dropped(e) {
  preventDefaults(e);
  var dt = e.dataTransfer;
  var files = dt.files;
  hash(files);
}
