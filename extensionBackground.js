document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    var keywordInput = document.getElementById("keywordInput");
    var keywordList =  document.getElementById("keyword-list");
    var keywordSubmit = document.getElementById("keywordSubmit");

    // Update Keyword List
    function updateList(){
        chrome.storage.local.get(["toxicKeywords"]).then((data) => {
            if (typeof data.toxicKeywords !== 'undefined') {
                let keywords = data.toxicKeywords;
                let keywordsSize = keywords.length;

                let currentKeywords = keywordList.children;
                let currentKeywordSize = keywordList.childElementCount;

                let template = document.getElementById("template");

                
                // Remove current keywords in the list
                for(let k = currentKeywordSize-1; k > 0; k--){
                    currentKeywords[k].getElementsByTagName('i')[0].removeEventListener('click', deleteKeyword);
                    currentKeywords[k].getElementsByTagName('input')[0].removeEventListener('click', toggleKeyword);
                    keywordList.removeChild(currentKeywords[k]);
                }
                
                // Add new keywords in the list
                for(let i = 0; i < keywordsSize; i++){
                    let clone = template.cloneNode(true);
                    let values = keywords[i].split("|");
                    clone.id = "key"+i;
                    let checkBox = clone.getElementsByTagName('input')[0];
                    if(values[1] === "F"){ 
                        checkBox.checked  = false;
                    }else{
                        checkBox.checked  = true;
                    }
                    checkBox.setAttribute('data-checkbox-id', i);
                    checkBox.addEventListener('click', toggleKeyword);
                    clone.getElementsByTagName('label')[1].innerHTML = values[0];
                    let deleteButton = clone.getElementsByTagName('i')[0];
                    deleteButton.id = i;
                    deleteButton.addEventListener('click', deleteKeyword);
                    keywordList.appendChild(clone);
                }
                filterSearch();
            } 
        });
    }
    
    // Add input to Chrome Storage then call Update List
    async function addToStorage(){
        let input = keywordInput.value.trim().toLowerCase();
        var keyword = input+"|T";
        if(input.length > 2){
            await chrome.storage.local.get(["toxicKeywords"]).then((data) => {
                var values = [keyword];
                if (typeof data.toxicKeywords !== 'undefined') {
                    values = data.toxicKeywords;
                    if (values.includes(keyword) || values.includes(input+"|F")){  
                       console.log("Keyword \""+ keyword + "\" already in the list.")
                    }else{
                        values.push(keyword);
                    }
                    chrome.storage.local.remove('toxicKeywords');
                } 
                chrome.storage.local.set({ 'toxicKeywords': values.sort() }).then(() => {
                    if (chrome.extension.lastError) {
                        console.log('An error occurred: ' + chrome.extension.lastError.message);
                    }
                    updateList();
                });
            });
        }
        keywordInput.value = "";
    }

    // Delete Keyword from Chrome Storage and update keyword list
    function deleteKeyword(event){
        chrome.storage.local.get(["toxicKeywords"]).then((data) => {
            var keywordID = event.target.id;
            var value = data.toxicKeywords;
            value.splice(keywordID, 1);  
            chrome.storage.local.remove('toxicKeywords');
            chrome.storage.local.set({ 'toxicKeywords': value }).then(() => {
                if (chrome.extension.lastError) {
                    console.log('An error occurred: ' + chrome.extension.lastError.message);
                }
                updateList();
            });
        });
    }
    function toggleKeyword(event){
        let target = event.target;
        let targetID = target.getAttribute('data-checkbox-id');
        chrome.storage.local.get(["toxicKeywords"]).then((data) => {
            var values = [];
            if (typeof data.toxicKeywords !== 'undefined') {
                values = data.toxicKeywords;
                let word = values[targetID].split("|")[0];
                if(!target.checked){
                    values[targetID] = word+"|F";
                }else{
                    values[targetID] = word+"|T";
                } 
                chrome.storage.local.remove('toxicKeywords');
            } 
            chrome.storage.local.set({ 'toxicKeywords': values.sort() }).then(() => {
                if (chrome.extension.lastError) {
                    console.log('An error occurred: ' + chrome.extension.lastError.message);
                }
            });
        });
        
    }

    // Show similar keywords
    function filterSearch() {
        let  filter, keywords, label;
        filter = keywordInput.value.toLowerCase();
        keywords = keywordList.getElementsByClassName("keyword-block");
        for (let i = 0; i < keywords.length; i++) {
            label = keywords[i].getElementsByTagName("label")[1].innerHTML;
            if (label.indexOf(filter) > -1) {
                keywords[i].style.display = "";
            } else {
                keywords[i].style.display = "none";
            }
        }
    }

    keywordSubmit.addEventListener("click", addToStorage);
    keywordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            addToStorage();
        }
            filterSearch();
    });

    updateList();

 });