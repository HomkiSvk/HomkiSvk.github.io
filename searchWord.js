
// Function to search for a matching word
function searchWord(dbName) {
  let wordLength = document.getElementById('wordLength').value;
  let knownCharacters = '';
  for (let i = 1; i <= wordLength; i++) {
    const char = document.getElementById(`char${i}`).value;
    knownCharacters += (char !== '') ? escapeRegExp(char) : '.'; // If no character is provided, use a wildcard '.'
  }

  // Convert known characters to regex pattern
  const regexPattern = `^${knownCharacters}$`;

  fetch('./files/ignis-'+dbName+'.txt')
    .then(response => response.text())
    .then(data => {
      const words = data.split('\n');
      const matchingWords = words.filter(word => new RegExp(regexPattern).test(word));
      displayResult(matchingWords);
    })
    .catch(error => console.error('Error fetching words:', error));
}

function displayResult(matchingWords) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  if (matchingWords.length > 0) {
    const resultList = document.createElement('ul');

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

// Function to escape special characters in the input for regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escaping special characters
}
