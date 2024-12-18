
var counterContainer = document.querySelector(".search-counter");
const numChars = 10; // Number of character inputs
const resultDisplayLimit = 500; // Maximum number of words to display
const charInputs = 'charInputs';
const triedChars1 = 'triedChars1';
const triedChars2 = 'triedChars2';

window.onload = createOptions();

function searchWord(dbName) {
  let wordLength = document.querySelector('input[name="wordLength"]:checked')?.value;

  if (!wordLength) {
    window.alert("You need to select word length");
  }

  document.getElementById('spinner').classList.add('spinner')

  let knownCharacters = '';
  let charDict = {};
  for (let i = 1; i <= wordLength; i++) {
    const char = document.getElementById(`${charInputs}-${i}`).value.toUpperCase();
    knownCharacters += (char !== '') ? escapeRegExp(char) : checkTried(i); // If no character is provided, use a wildcard '.'   
    charDict[i - 1] = char;
  }

  // Convert known characters to regex pattern
  const regexPattern = `^${knownCharacters}$`;

  fetch('./files/ignis-' + dbName + '.txt')
    .then(response => response.text())
    .then(data => {
      const words = data.split('\n');
      const matchingWords = words.filter(word => new RegExp(regexPattern).test(word.toUpperCase()));
      displayResult(matchingWords, charDict);
      document.getElementById('spinner').classList.remove('spinner');
    })
    .catch(error => {
      console.error('Error fetching words:', error)
      document.getElementById('spinner').classList.remove('spinner');
    }
    );
}

function displayResult(matchingWords, charDict) {
  const resultDiv = document.getElementById('result');
  const suggestionDiv = document.getElementById('suggestion');
  resultDiv.innerHTML = '';
  suggestionDiv.innerHTML = '';

  if (matchingWords.length > 0) {
    const resultList = document.createElement('ul');
    matchingWords.sort();


    matchingWords.slice(0,resultDisplayLimit).forEach(word => {
      const listItem = document.createElement('li');
      listItem.textContent = word;
      resultList.appendChild(listItem);
    });

    const guess = nextGuess(matchingWords, charDict);
    let hint = "Next most common character (" + Math.round((guess.count / matchingWords.length) * 100) + "%): ";
    console.log(JSON.stringify(guess));
    console.log(JSON.stringify(charDict));
    for (let i = 0; i < matchingWords[0].length; i++) {
      if (i === guess.index) {
        hint += '<span class="boxed">' + guess.character + '</span> '
      } else if( charDict[i] === "") {
        hint += "_ ";
      } else {
        hint += charDict[i];
      }
    }
    suggestionDiv.innerHTML = hint;
    
    resultDiv.appendChild(resultList);
  } else {
    resultDiv.textContent = 'No matching words found.';
  }
}

// Function to create radio buttons for word length options
function createWordLengthOptions() {
  const wordLengthOptions = document.getElementById('wordLengthForm');

  for (let i = 3; i <= numChars; i++) {
    const radioBtn = document.createElement('input');
    radioBtn.type = 'radio';
    radioBtn.name = 'wordLength';
    radioBtn.id = `length${i}`;
    radioBtn.value = i;

    const label = document.createElement('label');
    label.textContent = `${i}`;
    label.htmlFor = radioBtn.id;

    wordLengthOptions.appendChild(radioBtn);
    wordLengthOptions.appendChild(label);
  }
  disableInputs(0);

  wordLengthOptions.addEventListener('change', function (event) {
    event.preventDefault();
    disableInputs(event.target.value);
  })
}

// Function to create character input fields
function createInputFields() {
  const characterInputs = document.getElementById(charInputs);
  const tried1 = document.getElementById(triedChars1);
  const tried2 = document.getElementById(triedChars2);

  for (let i = 1; i <= numChars + 1; i++) {
    characterInputs.appendChild(createInputContainer(i, charInputs));
    tried1.appendChild(createInputContainer(i, triedChars1));
    tried2.appendChild(createInputContainer(i, triedChars2));
  }
}

function createInputContainer(i, id) {
  const divContainer = document.createElement('div');
  if (i === numChars + 1) {
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Clear';
    clearButton.classList.add('clear-button')
    clearButton.addEventListener('click', function (event) {
      event.preventDefault();
      resetForm(id)
    });

    divContainer.appendChild(clearButton);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `${id}-${i}`;
    input.maxLength = 1;

    const label = document.createElement('label');
    label.textContent = `${i}:`;
    label.htmlFor = input.id;

    divContainer.appendChild(label);
    divContainer.appendChild(input);
  }

  return divContainer;
}

// Create character input fields and word length radio buttons when the page loads
function createOptions() {
  createInputFields();
  createWordLengthOptions();
}

// Function to check if there is already tried character and remove that from regex search
function checkTried(i) {
  const triedChar1 = document.getElementById(`${triedChars1}-${i}`).value.toUpperCase();
  const triedChar2 = document.getElementById(`${triedChars2}-${i}`).value.toUpperCase();
  let regPattern = '';

  if (triedChar1 !== '' || triedChar2 !== '') {
    regPattern += '(?![';
    if (triedChar1 !== '') {
      regPattern += triedChar1;
    }
    if (triedChar2 !== '') {
      regPattern += triedChar2;
    }
    regPattern += ']).';
  } else {
    regPattern = '.';
  }

  return regPattern;
}

// Function to escape special characters in the input for regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escaping special characters
}

function disableInputs(wordLength) {
  let inputChars = document.getElementById(charInputs);
  let tried1 = document.getElementById(triedChars1);
  let tried2 = document.getElementById(triedChars2);

  for (let i = numChars - 1; i >= 0; i--) {
    const disable = i < wordLength ? false : true;

    inputChars[i].disabled = disable;
    tried1[i].disabled = disable;
    tried2[i].disabled = disable;

    inputChars[i].classList.toggle('disabled', i + 1 > wordLength);
    tried1[i].classList.toggle('disabled', i + 1 > wordLength);
    tried2[i].classList.toggle('disabled', i + 1 > wordLength);
  }
}

function resetForm(formName) {
  const form = document.getElementById(formName);
  form.reset();
}

// Determine a suggestion for the next most likely character
function nextGuess(words, charDict) {
  console.log(JSON.stringify(charDict));
  const searchLocations = [];
  for (let i = 0; i < words[0].length; i++) {
    if (charDict[i] === "") {
      searchLocations.push(i);
    }
  }
  const nextDict = {};
  let key = "";
  words.forEach((word) => {
    for (let i = 0; i < searchLocations.length; i++) {
      key = word[searchLocations[i]] + "_" + searchLocations[i];
      if (key in nextDict) {
        nextDict[key] = nextDict[key] + 1;
      } else {
        nextDict[key] = 1;
      }
    }
  });
  const keys = Object.keys(nextDict);
  let minKey = keys[0];
  let min = nextDict[minKey];
  for (let i = 1; i < keys.length; i++) {
    if (nextDict[keys[i]] > min) {
      minKey = keys[i];
      min = nextDict[minKey];
    }
  }
  return {"character": minKey[0], "index": parseInt(minKey.substring(2)), "count": min};
}

// function updateCounter() {
//   var wordsSearched = Number(counterContainer.innerHTML)
//   if (wordsSearched) {
//     wordsSearched = Number(wordsSearched) + 1;
//     localStorage.setItem("words_searched", wordsSearched);
//   } else {
//     wordsSearched = 1;
//     localStorage.setItem("words_searched", 1);
//   }
//   counterContainer.innerHTML = wordsSearched;
// }