const fetch = require('node-fetch');
const fs = require('fs');

var savedDescriptions = new Map();
var subtasks = new Map();
var keysIssues = new Map();
    
function transformSubtasks(json) {
  json.issues.forEach(function(element) {
    if(typeof element.key !== 'undefined' && element.key !== null) {
      savedDescriptions.set(element.key, element.fields.description);
      subtasks.set(element.key, element.fields.parent.key);
    }
  });
}

function checkIssues(json) {
  if (json.hasOwnProperty('issues')) {
    
    json.issues.forEach(function(element) {
      
      keysIssues.set(element.key, element.fields.issuetype.name);
      
      if(typeof element.fields.description !== "undefined") {
        if(element.fields.issuetype.name == "Security Hotspot Detection") {
          
          if(!element.fields.description.includes("Ask Yourself Whether\r\n") && !element.fields.description.includes("Ask Yourself Whether\n")) {
            console.log("'Ask Yourself Whether' is missing in "+element.key+" ("+element.fields.issuetype.name+")");
          }
          
          if(!element.fields.description.includes("Recommended Secure Coding Practices\r\n") && !element.fields.description.includes("Recommended Secure Coding Practices\n")) {
            console.log("'Recommended Secure Coding Practices' is missing in "+element.key+" ("+element.fields.issuetype.name+")");
          }
          
          if(!element.fields.description.includes("There is a risk if you")) {
            console.log("'There is a risk if you...' is missing in "+element.key+" ("+element.fields.issuetype.name+")");
          }
          
          if(element.fields.subtasks.length == 0) {
            if(!element.fields.description.includes("Sensitive Code Example\r\n") && !element.fields.description.includes("Sensitive Code Example\n")) {
              console.log(element.key+" ("+element.fields.issuetype.name+") has no subtasks and 'Sensitive Code Example' is missing");
            }
            
            if(!element.fields.description.includes("Compliant Solution\r\n") && !element.fields.description.includes("Compliant Solution\n")) {
              console.log(element.key+" ("+element.fields.issuetype.name+") has no subtasks and 'Compliant Solution' is missing");
            }
          }
        }
        else {
          if(element.fields.subtasks.length == 0) {
            if(!element.fields.description.includes("Noncompliant Code Example\r\n") && !element.fields.description.includes("Noncompliant Code Example\n")) {
              console.log(element.key+" ("+element.fields.issuetype.name+") has no subtasks and 'Noncompliant Code Example' is missing");
            }
            
            if(!element.fields.description.includes("Compliant Solution\r\n") && !element.fields.description.includes("Compliant Solution\n")) {
              console.log(element.key+" ("+element.fields.issuetype.name+") has no subtasks and 'Compliant Solution' is missing");
            }
          }
        }
      }
    });
    
    subtasks.forEach(function(element, index) {
      if(keysIssues.get(element) !== 'undefined') {
        if(keysIssues.get(element) === "Security Hotspot Detection" && savedDescriptions.get(index) !== null) {
          if(!savedDescriptions.get(index).includes("Sensitive Code Example\r\n") && !savedDescriptions.get(index).includes("Sensitive Code Example\n")) {
            console.log("'Sensitive Code Example' is missing in "+element+" ("+keysIssues.get(element)+") subtask "+index+"");
          }
            
          if(!savedDescriptions.get(index).includes("Compliant Solution\r\n") && !savedDescriptions.get(index).includes("Compliant Solution\n")) {
            console.log("'Compliant Solution' is missing in "+element+" ("+keysIssues.get(element)+") subtask "+index+"");
          }
        }
        else if(keysIssues.get(element) === "Vulnerability Detection" && savedDescriptions.get(index) !== null) {
          if(!savedDescriptions.get(index).includes("Noncompliant Code Example\r\n") && !savedDescriptions.get(index).includes("Noncompliant Code Example\n")) {
            console.log("'Noncompliant Code Example' is missing in "+element+" ("+keysIssues.get(element)+") subtask "+index+"");
          }
          if(!savedDescriptions.get(index).includes("Compliant Solution\r\n") && !savedDescriptions.get(index).includes("Compliant Solution\n")) {
            console.log("'Compliant Solution' is missing in "+element+" ("+keysIssues.get(element)+") subtask "+index+"");
          }
        }
      }
    }); 
  }
}

// first page

fetch('https://jira.sonarsource.com/rest/api/2/search?jql=project%20=%20RSPEC%20AND%20issuetype%20in%20subTaskIssueTypes()%20AND%20resolution%20=%20Unresolved%20AND%20status%20=%20Active%20ORDER%20BY%20updated%20DESC&maxResults=5000')
    .then(res => res.json())
    .then(json => {
      
      transformSubtasks(json);
      
      // second page
      fetch('https://jira.sonarsource.com/rest/api/2/search?jql=project%20=%20RSPEC%20AND%20issuetype%20in%20subTaskIssueTypes()%20AND%20resolution%20=%20Unresolved%20AND%20status%20=%20Active%20ORDER%20BY%20updated%20DESC&maxResults=5000&startAt=1000')
          .then(res => res.json())
          .then(json => {
            
            transformSubtasks(json);
          
            // third page
            fetch('https://jira.sonarsource.com/rest/api/2/search?jql=project%20=%20RSPEC%20AND%20issuetype%20in%20subTaskIssueTypes()%20AND%20resolution%20=%20Unresolved%20AND%20status%20=%20Active%20ORDER%20BY%20updated%20DESC&maxResults=5000&startAt=2000')
                .then(res => res.json())
                .then(json => {
                  
                  transformSubtasks(json);  
                
                  // in last
                  fetch('https://jira.sonarsource.com/rest/api/2/search?jql=issuetype%20in%20(%22Security%20Hotspot%20Detection%22%2C%20%22Vulnerability%20Detection%22)%20AND%20status%20=%20Active%20&maxResults=5000')
                      .then(res => res.json())
                      .then(json => checkIssues(json));
            });
      });
});
    
