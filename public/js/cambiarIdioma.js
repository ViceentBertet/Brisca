let currentLanguage = "es";
let texts;


window.onload = () => {
    let options = optionsList.querySelectorAll(".custom-option");
    selectedOption.addEventListener("click", () => {
        let optionsList = document.getElementById("optionsList");
        optionsList.style.display = optionsList.style.display === "block" ? "none" : "block";
    });
    options.forEach(option => {
        option.addEventListener("click", () => {
            let imgSrc = option.getAttribute("data-img");
            currentLanguage =  option.getAttribute("data-value")
            selectedOption.innerHTML = `<img src="${imgSrc}" class="flag" alt="${currentLanguage}">`;
            optionsList.style.display = "none";
            getIdioma(currentLanguage);
        });
    });
    document.addEventListener("click", (e) => {
    if (!toggle.contains(e.target)) {
        let optionsList = document.getElementById("optionsList");
        optionsList.style.display = "none";
    }
    });
}





/**
 * Envia una petición al servidor para obtener los textos del idioma seleccionado
 * @param {string} idioma - El idioma seleccionado
 */
function sacarOpcion() {
    const toggle = document.getElementById("language-toggle");
    
    return selectedOption;
}
async function getIdioma(idioma) {
    let url = "/lang-" + idioma;
    try {
        let response = await fetch(url);
        
        if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
        }
        texts = await response.json();
        updateContent();
    } catch (error) {
        console.error('Error:', error);
    }
}
/** 
 * Actualiza el contenido de la página según el idioma seleccionado
 */
function updateContent() {
    document.querySelector("header h1").textContent = texts.welcome;
    document.querySelector(".container h2:nth-of-type(1)").textContent = texts.whatIs;
    document.querySelector(".container p:nth-of-type(1)").textContent = texts.description;
    document.querySelector(".container h2:nth-of-type(2)").textContent = texts.basicRules;

    let rulesList = document.querySelector(".container ul:nth-of-type(1)");
    rulesList.innerHTML = "";
    texts.rules.forEach((rule, index) => {
        if (index === 2) {
            let sublist = document.createElement("ul");
            texts.cardValues.forEach(value => {
                let li = document.createElement("li");
                li.textContent = value;
                sublist.appendChild(li);
            });
            let li = document.createElement("li");
            li.textContent = rule;
            li.appendChild(sublist);
            rulesList.appendChild(li);
        } else {
            let li = document.createElement("li");
            li.textContent = rule;
            rulesList.appendChild(li);
        }
    });

    document.querySelector(".container h2:nth-of-type(3)").textContent = texts.howToWin;
    document.querySelector(".container p:nth-of-type(2)").textContent = texts.winDescription;
    document.querySelector("footer p").textContent = texts.footer;
}