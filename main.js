const DICT_API = "160318e2-2c7c-4f22-82d0-424411422c32";


async function spanDict(word){
    let res = await fetch(`https://www.spanishdict.com/translate/${word}`);
    let text = await res.text();
    document.write(text);
}

async function defineRequest(word){
    let res = await fetch(`https://www.dictionaryapi.com/api/v3/references/spanish/json/${word}?key=${DICT_API}`);
    return res.json();
}

function getResultType(result){
    if(result.length == 0)return "nothing";
    if(typeof result[0] === "string")return "suggestion";
    return "definition";
}

function topOfArray(array, amount){
    return array.slice(0, amount);
}

function getDefinitions(definitions){
    let result = [];
    definitions.forEach(definition => {
        let lang = definition.meta.lang;
        let word = definition.hwi.hw;
        let type = definition.fl;
        let def = definition.shortdef;
        result.push({lang, word, type, def});
    })
    return result;
}

async function define(word){
    let json = await defineRequest(word);
    let type = getResultType(json);
    if(type == "suggestion")return {type, suggestions: json};
    if(type == "definition")return {type, definitions: getDefinitions(json)};
}

let suggestionsElement = document.querySelector(".suggestions ul");
function updateSuggestions(_suggestions){
    let suggestions = topOfArray(_suggestions, 9);
    suggestionsElement.innerHTML = "";
    suggestions.forEach(text => {
        let li = document.createElement("li");
        li.tabIndex = 0;
        li.addEventListener("click", () => {
            search.value = text;
            submit();
            suggestionsElement.innerHTML = "";
        })
        li.textContent = text;
        suggestionsElement.appendChild(li);
    })
}

function updateDefinitions(definitions){
    let ul = document.createElement("ul");
    definitions.forEach(def => {
        let li = document.createElement("li");
        li.tabIndex = 0;
        let defs = def.def.reduce((pre, cur) => pre+", "+cur, "").substring(1)
        li.innerHTML = `${def.word} <span class="dim">- ${defs}<span>`;

        li.addEventListener("click", () => {
            search.value = def.word;
            submit();
        })

        ul.appendChild(li);
    })
    suggestionsElement.innerHTML = "";
    results.innerHTML = "";
    results.appendChild(ul);
}

let search = document.querySelector("#search");
let results = document.querySelector("#results");
async function submit(){
    let result = await define(search.value);
    if(result.type == "suggestion")updateSuggestions(result.suggestions);
    else if(result.type == "definition")updateDefinitions(result.definitions);
    else results.innerHTML = "";
}

let submitTimeout;

search.addEventListener("keyup", e => {
    clearTimeout(submitTimeout);
    submitTimeout = setTimeout(submit, 500);
    e.key == "Enter" && submit();
})