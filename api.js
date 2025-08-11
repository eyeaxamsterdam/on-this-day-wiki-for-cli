import https from 'https';
import { handleAllCategories, handleSelectedCategory } from './prompts.js';

let dateIndex;
let dateFlag;
let isToday = true;

// if a date is specified, grab thd date
const args = process.argv.slice(2);
if (args.includes('-date')) {
  dateIndex = args.indexOf('-date') + 1;
  dateFlag = args[dateIndex];
}

// flags for specific categories can be added to the command
const filterOptions = {
  '-births': 'births',  
  '-deaths': 'deaths',
  '-events': 'events',
  '-holidays': 'holidays',
  '-selected': 'selected',
};



let filterSection = Object.keys(filterOptions).find(option => args.includes(option));
if (filterSection) {
  filterSection = filterOptions[filterSection];
}

function whichDate(dateFlag) {
    let month = dateFlag.slice(0, 2);
    let day = dateFlag.slice(3, 5);
    let specificDate = new Date(new Date().getYear(), month - 1, day);
    isToday = false;
    return specificDate;
}
 
function fetchOnThisDayData() {
  let selectedDay = dateFlag ? whichDate(dateFlag) : new Date(); 
  let dayShort = selectedDay.toLocaleString('default', { weekday: 'short' });
  let monthShort = selectedDay.toLocaleString('default', { month: 'short' });
  let year = selectedDay.getFullYear();
  let month = String(selectedDay.getMonth() + 1).padStart(2, '0');
  let day = String(selectedDay.getDate()).padStart(2, '0');
  let url = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/${month}/${day}`;
  let formattedCurrentDate = `${dayShort} ${monthShort} ${day} ${year}`;
  let anotherDate = `${monthShort} ${day}`;
  let date = dateFlag ? anotherDate : formattedCurrentDate;
  

  https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const parsedData = JSON.parse(data);
        if (filterSection && parsedData[filterSection]) {
          handleSelectedCategory(parsedData[filterSection], date);
        } else {
          handleAllCategories(parsedData, date, isToday);
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