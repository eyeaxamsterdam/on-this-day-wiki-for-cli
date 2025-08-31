import https from 'https';
import { handleAllCatagories, handleSelectedCatagory } from './prompts.js';

const filterOptions = {
  '-births': 'births',  
  '-deaths': 'deaths',
  '-events': 'events',
  '-holidays': 'holidays',
  '-selected': 'selected'
};

function fetchOnThisDayData() {
  let today = new Date();
  let month = String(today.getMonth() + 1).padStart(2, '0');
  let day = String(today.getDate()).padStart(2, '0');
  let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;

  let options = {
    headers: {
      'User-Agent': 'deadbones/otdih 1.0'
    }
  }

  const args = process.argv.slice(2);
  let filterSection = Object.keys(filterOptions).find(option => args.includes(option));
  if (filterSection) {
      filterSection = filterOptions[filterSection];
  }

  https.get(url, options, (res) => {
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

export { fetchOnThisDayData };