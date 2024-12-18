(function() {
  var xhr = new XMLHttpRequest();
  var url = "http://localhost:6661/log/dl";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onerror = function() {
    console.error('oblog', 'res.err', xhr.status);
  };
  xhr.send(JSON.stringify(dataLayer[dataLayer.length - 1]));
})();