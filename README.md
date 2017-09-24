# Centauro to iCalendar

This project turns the UGent Centauro calendar into an `.ics` file. Born out of my frustration with the existing solutions.

## Usage

First install dependencies using `npm install`. Then run the following:

```bash
UGENT_USERNAME=namehere UGENT_PASSOWRD=hunter2 UGENT_GROUP=41 node main.js
```

This wil create a a file `output/calendar-$USERNAME.ics`.

You can also put the variables in a `.env` file:

```
UGENT_USERNAME=namehere
UGENT_PASSWORD=hunter2
UGENT_GROUP=41
```

I also include a script, `run.sh`, that I use. It will generate the iCal file and then push it to Github pages (on the `gh-pages` branch), so I can add the Github pages link to my Google calendar.

## Requirements

Make sure to use Node.js 7+. This project makes use of async/await.

## Technology

This project uses Phantom to go log in to the Centauro website and navigate to the calendar page. It will then extract the calendar JSON API URL, request it and turn it into iCal.

## Disclaimer

* The code was quickly thrown together. It's ugly and doesn't handle any edge cases.
* The configuration requires you to add your UGent username and password, which it will use to log in to Centauro. Run this locally to keep them safe.

