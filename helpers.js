import wrapAnsi from 'wrap-ansi';

// Capitalize first letter of a string
// Used for categories
function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helps to wrap text in the terminal
// Used for events and descriptions of events
function wrapAnsiText(text, width) {
  return wrapAnsi(text, width);
}

// Each event has an array of wiki pages related to that event
// The most relevant wiki isn't at any particular index 
// This function finds the most relevant wiki page by looking at the description/overview of each related page from the payload
//  and compares it to the event description   
function findMostRelevantDescription(event) { 
  const descriptionKeywords = event.text.toLowerCase().match(/\w+/g);

  let maxScore = 0;
  let mostRelevantUrl;
  let mostRelevantExtract;
  let displayTitle;

  event.pages.forEach(page => {
    let score = 0;
    const pageContentKeywords = (page.title + ' ' + page.extract).toLowerCase().match(/\w+/g);
    
    descriptionKeywords.forEach(keyword => {
      if (pageContentKeywords.includes(keyword)) {
        score++;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      mostRelevantUrl = page.content_urls.desktop.page;
      mostRelevantExtract = page.extract;
      displayTitle = page.titles.display;
    }
  });

  if (!mostRelevantUrl && event.pages[0]) {
    mostRelevantUrl = event.pages[0].content_urls.desktop.page;
    mostRelevantExtract = event.pages[0].extract;
    displayTitle = event.pages[0].titles.display;
  }

  return {
    url: mostRelevantUrl || 'No URL available',
    extract: mostRelevantExtract || 'No Extract Available',
    displayTitle: displayTitle || 'No Title Available'
  };
}

export { capitalizeFirstLetter, wrapAnsiText, findMostRelevantDescription  }