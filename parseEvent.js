module.exports = (obj) => {
  // obj is JSON object
  const result = {};

  result.allDay = obj.allDay;
  result.className = obj.className; // 'onderwijs', not sure if other value are possible ('examen'?)
  result.start = obj.start; // e.g. 2017-02-28T12:45
  result.end  = obj.end; // e.g. 2017-02-28T14:45
  result.courseCode = obj.title; // e.g. E630083

  result.id = obj.id; // these id's actually have no real meaning, they vary. Remove this line later (useful for debugging now)

  result.campusWide = false;

  // obj.description example: '<span class='activiteittype'>Onderwijs</span><br/><span class='cursusnaam'>Computersystemen </span><br/><span class='cursuscode'>E630083</span><br/>groep: 34,41<br/>Johan Beke<br/>Campus Kortrijk, 44.01 - Gebouw A, GKG.A.2.01<br/>Hoorcollege<br/>'
  //  => we can extract the following from that: course name, course code (already have it), groups, prof/TA, location, type ('Hoorcollege'/'Labo')

  if(!obj.description) {
    // campus-wide events, like closing days, do not have a description (so no groups either)
    result.campusWide = true;
  } else {
    // this is not pretty, but since it's not in a tag, we don't really have a choice
    result.groups = obj.description.match(/groep: [\-0-9,]*/)[0].split(' ')[1].split(',');

    const split = obj.description.split('<br/>');
    result.location = split[split.length - 2];
    result.taughtBy = split[split.length - 3];

    // this is obvious for me and takes up to much space => remove
    result.location = result.location.replace('Campus Kortrijk, 44.01 - Gebouw A, ', '');
    result.location = result.location.replace('Campus Kortrijk, 44.02 - Gebouw B, ', '');

    const courseNameRegex = /<span class=(\\)?'cursusnaam(\\)?'>[\-a-zA-Z ]*(?=<\/span>)/

    result.courseName = obj.description.match(courseNameRegex)[0].replace(`<span class='cursusnaam'>`, '');
  }

  // obj.tooltip example: '<span class='tijdstip'>13:45-14:45</span><br/><span class='activiteittype'>Onderwijs</span><br/><span class='cursusnaam'>Computersystemen </span><br/><span class='cursuscode'>E630083</span><br/>groep: 34,41<br/>Johan Beke<br/>Campus Kortrijk, 44.01 - Gebouw A, GKG.A.1.01<br/>Labo<br/>'
  //  => nothing we don't already know

  return result;
};

