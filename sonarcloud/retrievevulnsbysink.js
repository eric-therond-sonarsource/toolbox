const fetch = require('node-fetch');
const fs = require('fs');

var id = 0;
var vulns = [];

function lookforSinks(idissue, rule, language, data, sinkstofind) {

  console.log("lookforSinks idissue = "+idissue);
  if(typeof data.issues[idissue] !== 'undefined') {
      
    var issue = data.issues[idissue];
      
    fetch('https://sonarcloud.io/api/sources/issue_snippets?issueKey='+issue.key)
      .then(res => res.json())
      .then(json => { 

        console.log("lookforSinks fetched");            
        if (json.hasOwnProperty(issue.component)) {
              
          for(var j = 0; j < json[issue.component].sources.length; j ++) {
                
            var source = json[issue.component].sources[j];
                
            for(var i = 0; i < sinkstofind.length; i ++) {
              //console.log("source is '"+source.code+"' and sink to find is '"+sinkstofind[i]);
                 
              if(source.code.indexOf(sinkstofind[i]) > 0) {
                console.log("I HAVE FOUND THE SOURCE");
                    
                var obj = {
                  "issueKey": issue.key,
                  "position": j,
                  "component":issue.component
                };
                    
                vulns[id] = obj;
                id ++;
        
                break;
              }
            }
          }
        }
        
        lookforSinks(idissue + 1, rule, language, data, sinkstofind);
      });
  }
  else {
    
    var whereiam = data.p * data.ps;
        
    if(data.total > whereiam) {
      fetchVulns(data.p + 1, rule, language, sinkstofind);
    }
    else {
      // end
      //stats.sort((a, b) => (a.nbissues > b.nbissues) ? -1 : 1);
          
      var completeData = "var mydata = "+JSON.stringify(vulns)+";";
      fs.writeFile("./data.json", completeData, function(err) {

        if(err) {
          return console.log(err);
        }

        console.log("The data was saved in data.json file!");
      });
    }
  }
}

function fetchVulns(page, rule, language, sinks) {
  // first page
  console.log("fetchVulns page = "+page);
  fetch('https://sonarcloud.io/api/issues/search?rules='+rule+'&languages='+language+'&ps=500&p='+page)
      .then(res => res.json())
      .then(json => { 
        
        lookforSinks(0, rule, language, json, sinks);
    });
}
    
if(process.argv.length != 5) {
  console.log("node vulnsbysink.js rule language sinks");
  console.log("where rule type could be one rule: component:id");
  console.log("where language type could be one language like php");
  console.log("where sinks could be sinks seperated by comma");
  console.log("example: node vulnsbysink.js phpsecurity:S3649 php years");
}   
else {
  var sinksArray = process.argv[4].split(",");
  
  fetchVulns(1, process.argv[2], process.argv[3], sinksArray);
}


 
