#!/usr/bin/env node

import https from 'https';
import inquirer from 'inquirer';
import open from 'open';
import wrapAnsi from 'wrap-ansi';

const width = process.stdout.columns || 80;

function capitalizeFirstLetter(str) {
  if (!str) {
    return str; // Handle non-string or empty input
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function selectedSection(section) {
  console.log(section);
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
        const sectionsArray = Object.keys(parsedData);

        const selections = sectionsArray.map((section) => ({
          name: section === 'selected' ? 'Highlights\n' : capitalizeFirstLetter(section) + '\n',
          value: section
        }));

        inquirer.prompt([
    {
      type: 'list',
      name: 'section',
      message: 'Select a section to see events:\n',
      choices: selections,
      pageSize: 40,
      loop: false
    }
  ]).then((answers) => {
    const sectionData = parsedData[answers.section];
    const selectedItems = sectionData.map((event) => {
      // Adjust based on the available data in each section
      const year = event.year ? event.year : null;
      const text = event.text || event.description || 'Details not available';
      return {
        name: `${year ? year + ': ' : ''  } ${text} \n`,
        value: event
      };
    });

    inquirer.prompt([
      {
        type: 'list',
        name: 'event',
        message: `Items in ${answers.section}:\n`,
        choices: selectedItems,
        pageSize: 40,
        loop: false
        }
      ]).then((eventAnswer) => {
        // Handle the selected event
        console.log(wrapAnsi(eventAnswer.event.pages[0].extract,width));
        console.log(eventAnswer.event.pages[0].content_urls.desktop.page);
        });
        });
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });

    }).on('error', (err) => {
      console.error('Error fetching data: ' + err.message);
    });
  }

  fetchOnThisDayData();
