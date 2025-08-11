On This Day In History

This is a simple CLI program written in Node.js that utilizes Wikipedias "On this Day" API and brings relevant events, births, deaths, and holidays to your terminal. Running this program will fetch the history of the current day to your terminal. You can also specify a date. Be distracted without being too distracted by the format and fluff of a typical web page or browser.

Installation: 
    Clone the Repository:
        git clone <repository-url>
        cd <repository-folder>

Install Dependencies and Link Globally:
    npm install && npm link

Usage: 
    Run the program with the command: otdih
    flags for specific categories can be added to the command:
        -selected
        -births
        -deaths
        -holidays
    
    Use the -date flag to specify a date for which to fetch the data. E.g:

        otdih -date 0308
    
    ctrl+c to exit.

    updates in the future:
        currently you can add more than one catagory flag. Soon an error will be thrown if you try to add more than one catagory flag.