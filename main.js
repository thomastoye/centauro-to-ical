require('dotenv').config();

const phantom = require('phantom');
const url = require('url');
const qs = require('querystring');
const ical = require('ical-generator');
const cal = ical();
const fs = require('fs');

const parseEvent = require('./parseEvent');

const startPage = 'https://centauro.ugent.be/home?-1.ILinkListener-logonLink'; // start on this page (Centauro log-in page)

const username = process.env.UGENT_USERNAME; // UGent account name, the one you use to log in, not your email address
const password = process.env.UGENT_PASSOWRD; // UGent password
const group = process.env.UGENT_GROUP; // e.g. 41

const startDate = '2017-02-01'; // request calendar from this date
const endDate = '2017-07-01'; // request calendar up to this date

// helper function - time-out that can be await-ed
const wait = (time) => new Promise(resolve => {
  setTimeout(() => resolve(), time)
});

(async function() {
    // Phantom is used here - why? It would take me too much time to understand how the UGent SSO functions; and Centauro uses a framework called Wicket in which the API links are not deterministic - they change every login and refresh.

    const instance = await phantom.create();
    const page = await instance.createPage();
    await page.on("onResourceRequested", function(requestData) {
        console.info('Requesting', requestData.url)
    });

    const status = await page.open(startPage);

    await wait(3000);

    // Go to login (UGent account)

    await page.evaluate(function(){
      Array.prototype.slice.call(
        document.getElementsByClassName("btn btn-primary"),
      0).filter(function(x) { return  x.value.indexOf("UGent-account") != -1})[0].click();
    });

    await wait(3000);

    await page.evaluate(function(username, password) {
      document.getElementById('username').value = username;
      document.getElementById('user_pass').value = password;
      document.getElementById('wp-submit').click();
    }, username, password);

    await wait(3000);

    await page.open('https://centauro.ugent.be/kalender/mijnKalender');

    await wait(3000);

    // can't get the body of received resources with Phantom, so we will capture the URL (which is dynamic) then request it again later
    var calendarUrl = '';

    page.on('onResourceReceived', function(response) {
      if(response.url.startsWith('https://centauro.ugent.be/kalender/mijnKalender?') && response.url.indexOf('.IBehaviorListener.1-tabs-panel-kalenderBekijkenPanel-calendar&start') != -1) {
        // URL we want
        console.log(' ==> The calendar JSON url is ' + response.url);
        calendarUrl = response.url;
      }
    });

    await page.evaluate(function(group) {
      // input changes id
      const input = Array.prototype.slice.call(document.getElementsByTagName('input'), 0).filter(function(x) { return x.name == 'tabs:panel:kalenderBekijkenPanel:formPanel:fieldsWrapper:repeatingView:groep:value' })[0];
      input.value = group; // group number
      input.dispatchEvent(new Event('change'));
    }, group);

    await wait(2000);

    page.off('onResourceReceived');

    console.log('About to request calendar URL: ' + calendarUrl);

    // change calendar URL to request events from a start date up until an end date (default is a month)

    const parsedUrl = url.parse(calendarUrl);
    parsedUrl.query = qs.parse(parsedUrl.query);
    parsedUrl.query.end = endDate;
    parsedUrl.query.start = startDate;

    const urlToRequest = url.format(parsedUrl);

    // we will evaluate an XMLHTTPRequest in the page and extract the result

    calendarJson = await page.evaluate(function(url) {
      // this is synchronous xhr, I know
      // but it's the easiest way and it's only blocking the Phantom page, not Node
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send();
      return JSON.parse(xhr.responseText);
    }, urlToRequest);

    // we now have the JSON, time to parse it into events

    const events = calendarJson.map(x => parseEvent(x));

    cal.name('UGent - ' + username);
    cal.timezone('Europe/Brussels');

    const icalEvents = events.map(event => {
      // if this event is only applicable for some groups and we aren't in them, skip this event
      if(event.groups && (event.groups.indexOf(group) == -1 && event.groups.indexOf(group.toString()) == -1)) {
        console.log('event groups: ' + JSON.stringify(event.groups) + '; ' + group + ' is not in it');
        return false;
      }

      const result = {
        start: new Date(event.start),
        end: new Date(event.end),
      }

      if(!event.courseName) {
        result.summary = event.courseCode;
      } else {
        result.summary = event.courseName;
      }

      result.allDay = event.allDay;

      if(event.location) {
        result.location = event.location;
      }

      // time to build a description

      var description = '';

      if(event.courseName) description += 'Vak: ' + event.courseName + '\n';
      if(event.taughtBy) description += 'Gegeven door ' + event.taughtBy + '\n';
      if(event.location) description += 'Locatie: ' + event.location + '\n';
      if(event.courseCode) description += 'Cursuscode ' + event.courseCode + '\n';
      if(event.groups) description += 'Groepen: ' + event.groups.join(', ');

      result.description = description;

      result.timezone = 'Europe/Brussels';

      return result;
    }).filter(x => x);

    cal.events(icalEvents);

    console.log(JSON.stringify(events));

    console.log(cal.toString());

    cal.saveSync('calendar-' + username + '.ics');

    await instance.exit();
}());

