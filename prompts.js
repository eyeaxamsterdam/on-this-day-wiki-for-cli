import inquirer from 'inquirer';
import open from 'open';
import { wrapAnsiText, capitalizeFirstLetter, findMostRelevantDescription } from './helpers.js'; // Assume wrapAnsi is moved here

const termWidth = process.stdout.columns || 80;
const pageSize = Math.max(Math.floor((process.stdout.rows || 24) * 0.8), 10);

function promptUser(questions) {
  return inquirer.prompt(questions)
    .then(answer => answer)
    .catch(error => {
      if (error.code === 'SIGINT' || error.name === 'ExitPromptError') {
        console.log('\nGoodbye!');
        process.exit(0);
      }
      console.error('An unexpected error occurred:', error);
    });
}

function handleSelectedCategory(sectionData, date) {
  const selectedItems = sectionData.map(event => ({
    name: `${event.year ? event.year + ':' : ''} ${event.text.replace(/\n/g, ' ')}\n`,
    value: event
  }));

  const questions = [{
    type: 'list',
    name: 'event',
    message: '  ' + date + '\n    Select an event:\n\n',
    choices: selectedItems,
    pageSize: pageSize,
    loop: false
  }];

  promptUser(questions).then(answer => handleSelectedEvent(answer.event));
}

function handleAllCategories(parsedData, date, isToday) {
  let categoryMessage;
  isToday ? categoryMessage = '  On This Day In History - ' : categoryMessage = '  On Another Day In History - ';
  const choices = Object.keys(parsedData)
    .filter(key => Array.isArray(parsedData[key]))
    .map(section => ({
      name: capitalizeFirstLetter(section) + '\n',
      value: section
    }));

  const questions = [{
    type: 'list',
    name: 'section',
    message: categoryMessage + date + '\n    Select a category:\n\n',
    choices: choices,
    pageSize: pageSize,
    loop: false
  }];

  promptUser(questions).then(answer => {
    if (!answer) return;
    handleSelectedCategory(parsedData[answer.section], date)
  });
}

function handleSelectedEvent(event) {
  const result = findMostRelevantDescription(event);

  const urlChoices = event.pages.map(page => ({
    name: page.titles.normalized + '\n',
    value: page.content_urls.desktop.page
  }));


  if (!urlChoices.length) {
    console.log("No additional URLs available.");
    return;
  }

  const questions = [{
    type: 'list',
    name: 'url',
    message: 'Read more about this event:\n\n',
    choices: urlChoices,
    pageSize: pageSize,
    loop: false
  }];

   promptUser(questions).then(answer => {
    if (answer.url === 'BACK') {
      handleSelectedCategory(sectionData); // Go back to the event selection
    } else if (answer.url) {
      open(answer.url);
    }
  });

}

export { handleAllCategories, handleSelectedCategory, handleSelectedEvent };