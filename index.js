#!/usr/bin/env node

import https from 'https';
import inquirer from 'inquirer';
import open from 'open';
import wrapAnsi from 'wrap-ansi';

const termWidth = process.stdout.columns || 80;
const pageSize = Math.max(Math.floor((process.stdout.rows || 24) * 0.8), 10);

const args = process.argv.slice(2);
const filterOptions = {
  '-births': 'births',  
  '-deaths': 'deaths',
  '-events': 'events',
  '-holidays': 'holidays',
  '-selected': 'selected'
};

let filterSection = Object.keys(filterOptions).find(option => args.includes(option));
if (filterSection) {
    filterSection = filterOptions[filterSection];
}

function capitalizeFirstLetter(str) {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function findMostRelevantUrl(event) {
  const descriptionKeywords = event.text.toLowerCase().match(/\w+/g);

  let maxScore = 0;
  let mostRelevantUrl;
  let mostRelevantExtract; // Variable to store the extract 
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
      mostRelevantExtract = page.extract;  // Store the title along with the URL
      displayTitle = page.titles.display;
    }
  });

  // Check if a URL was found; if not, default to the first page if it exists.
  if (!mostRelevantUrl && event.pages[0]) {
    mostRelevantUrl = event.pages[0].content_urls.desktop.page;
    mostRelevantExtract = event.pages[0].extract;
    displayTitle = event.pages[0].titles.display;
  }

  // Return both the URL and the title as an object
  return {
    url: mostRelevantUrl || 'No URL available',
    extract: mostRelevantExtract || 'No Extract Available',
    displayTitle: displayTitle || 'No Title Available'
  };
}

function fetchOnThisDayData() {
  let today = new Date();
  let month = String(today.getMonth() + 1).padStart(2, '0');
  let day = String(today.getDate()).padStart(2, '0');
  let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;

  https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);

        if (filterSection && parsedData[filterSection]) {
          handleSelectedCatagory(parsedData[filterSection]);
        } else {
          handleAllCatagories(parsedData);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching data:', error.message);
  });
}

function handleSelectedCatagory(sectionData) {
  const selectedItems = sectionData.map((event) => {
    const year = event.year ? `${event.year} : ` : '';
    const text = event.text.replace(/\n/g, ' ');
    return {
      name: `${year}${text}\n`,
      value: event
    };
  });

  inquirer.prompt([
    {
      type: 'list',
      name: 'event',
      message: 'Select an event:\n\n',
      choices: selectedItems,
      pageSize: pageSize,
      loop: false
    }
  ]).then((eventAnswer) => {
    handleSelectedEvent(eventAnswer.event);
  });
}


function handleAllCatagories(parsedData) {
  const sectionsArray = Object.keys(parsedData).filter(key => typeof parsedData[key] === 'object');
  const selections = sectionsArray.map((section) => ({
    name: capitalizeFirstLetter(section) + '\n',
    value: section
  }));

  inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Select a section to see events:\n',
      choices: selections,
      pageSize: pageSize,
      loop: false
    }
  ]).then((answers) => {
    handleSelectedCatagory(parsedData[answers.section]);
  });
}

function handleSelectedEvent(event) {
  const result = findMostRelevantUrl(event);
  const extract = wrapAnsi(result.extract, termWidth);
  console.log(extract + '\n'); // Optionally display the extract

  // Build an array for inquirer choices
  let urlList = event.pages.map(page => {
    return {
      name: page.titles.normalized, // displayed text
      value: page.content_urls.desktop.page // actual URL
    };
  });

  // Ensure there is a fallback
  if (!urlList.length) {
    console.log("No additional URLs available.");
    return;
  }

  inquirer.prompt([
    {
      type: 'list',
      name: 'url',
      message: 'Read more about this event:\n',
      choices: urlList,
      pageSize: pageSize,
      loop: false
    }
  ]).then((answers) => {
    if (answers.url) {
      open(answers.url); // Uses the `open` library to open the URL in the default browser
    }
  }).catch(error => {
    console.error('An error occurred:', error);
  });
}


fetchOnThisDayData();