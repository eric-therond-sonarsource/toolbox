const fetch = require('node-fetch');
const fs = require('fs');

function fetchRules() {
  
  fetch('https://api-3.ripstech.com/applications/scans/issues/types?filter=%7B%22__equal%22:%7B%22language%22:2%7D%7D')
    .then(res => res.json())
    .then(json => { 
      
      json.forEach(function(el) {
        console.log(el.tag+ ";" +el.name+ ";" +el.description+ ";" +el.severity+ ";" +el.second_order+ ";" +el.markup+ ";" +el.cwe+ ";" +el.owasp2017+ ";" +el.category);
        
      });
    })
    .catch(function(error) {
      fetchRules(issuenumber + 1);
    });
}
    
fetchRules();

