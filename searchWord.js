
var counterContainer = document.querySelector(".search-counter");

window.onload = createOptions();

// Function to search for a matching word
function searchWord(dbName) {
  let wordLength = document.querySelector('input[name="wordLength"]:checked')?.value;

  if (!wordLength) {
    window.alert("You need to select word length");
  }

  let knownCharacters = '';
  for (let i = 1; i <= wordLength; i++) {
    const char = document.getElementById(`char${i}`).value;
    knownCharacters += (char !== '') ? escapeRegExp(char) : checkTried(i); // If no character is provided, use a wildcard '.'    
  }

  // Convert known characters to regex pattern
  const regexPattern = `^${knownCharacters}$`;

  console.log("🚀 ~ file: searchWord.js:24 ~ searchWord ~ regexPattern:", regexPattern)
  fetch('./files/ignis-' + dbName + '.txt')
    .then(response => response.text())
    .then(data => {
      const words = data.split('\n');
      const matchingWords = words.filter(word => new RegExp(regexPattern).test(word));
      // updateCounter();
      displayResult(matchingWords);
    })
    .catch(error => console.error('Error fetching words:', error));
}

function displayResult(matchingWords) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  if (matchingWords.length > 0) {
    const resultList = document.createElement('ul');
    matchingWords.sort();

    matchingWords.forEach(word => {
      const listItem = document.createElement('li');
      listItem.textContent = word;
      resultList.appendChild(listItem);
    });

    resultDiv.appendChild(resultList);
  } else {
    resultDiv.textContent = 'No matching words found.';
  }
}

// Function to create radio buttons for word length options
function createWordLengthOptions() {
  const wordLengthOptions = document.getElementById('wordLengthForm');

  for (let i = 3; i <= 10; i++) {
    const divContainer = document.createElement('div');
    const radioBtn = document.createElement('input');
    radioBtn.type = 'radio';
    radioBtn.name = 'wordLength';
    radioBtn.id = `length${i}`;
    radioBtn.value = i;

    const label = document.createElement('label');
    label.textContent = `${i}:`;

    divContainer.appendChild(label);
    divContainer.appendChild(radioBtn);

    wordLengthOptions.appendChild(divContainer);
  }
}

// Function to create character input fields
function createInputFields() {
  const characterInputs = document.getElementById('characterInputs');
  const tried1 = document.getElementById('tried1');
  const tried2 = document.getElementById('tried2');

  const numChars = 10; // Number of character inputs
  for (let i = 1; i <= numChars; i++) {
    characterInputs.appendChild(createInputContainer(i, 'char'));
    tried1.appendChild(createInputContainer(i, 'tried1char'));
    tried2.appendChild(createInputContainer(i, 'tried2char'));
  }

  const clearButton = document.createElement('button');
  clearButton.textContent = 'X';
  clearButton.classList.add('clear-button')

  // characterInputs.appendChild(clearButton);
}

function createInputContainer(i, id) {
  const divContainer = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = `${i}:`;
  const input = document.createElement('input');
  input.type = 'text';
  input.id = `${id}${i}`;
  input.maxLength = 1;

  divContainer.appendChild(label);
  divContainer.appendChild(input);

  return divContainer;
}

function updateCounter() {
  // var wordsSearched = Number(counterContainer.innerHTML)
  // if (wordsSearched) {
  //   wordsSearched = Number(wordsSearched) + 1;
  //   localStorage.setItem("words_searched", wordsSearched);
  // } else {
  //   wordsSearched = 1;
  //   localStorage.setItem("words_searched", 1);
  // }
  // counterContainer.innerHTML = wordsSearched;
}

// Create character input fields and word length radio buttons when the page loads
function createOptions() {
  createInputFields();
  createWordLengthOptions();
}

// Function to check if there is already tried character and remove that from regex search
function checkTried(i) {
  const triedChar1 = document.getElementById(`tried1char${i}`).value;
  const triedChar2 = document.getElementById(`tried2char${i}`).value;
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
