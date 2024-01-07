
var counterContainer = document.querySelector(".search-counter");
const numChars = 10; // Number of character inputs
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
  for (let i = 1; i <= wordLength; i++) {
    const char = document.getElementById(`${charInputs}-${i}`).value.toUpperCase();
    knownCharacters += (char !== '') ? escapeRegExp(char) : checkTried(i); // If no character is provided, use a wildcard '.'    
  }

  // Convert known characters to regex pattern
  const regexPattern = `^${knownCharacters}$`;

  fetch('./files/ignis-' + dbName + '.txt')
    .then(response => response.text())
    .then(data => {
      const words = data.split('\n');
      const matchingWords = words.filter(word => new RegExp(regexPattern).test(word.toUpperCase()));
      displayResult(matchingWords);
      document.getElementById('spinner').classList.remove('spinner');
    })
    .catch(error => {
      console.error('Error fetching words:', error)
      document.getElementById('spinner').classList.remove('spinner');
    }
    );
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