import { isAfter, intervalToDuration } from "date-fns";

function getStringFromInterval(interval) {
  let diff = '?';
  if (interval) {
    if (interval.years) {
      diff = `${interval.years}yr`;
    } else if (interval.months) {
      diff = `${interval.months}mo`;
    } else if (interval.days) {
      diff = `${interval.days}d`;
    } else if (interval.hours) {
      diff = `${interval.hours}h`;
    } else if (interval.minutes) {
      diff = `${interval.minutes}m`;
    } else if (interval.seconds) {
      diff = `${interval.seconds}s`;
    }
  }
  return diff;
}

const getMillisecondsFromDuration = (duraction) => {
  if (duraction) {
    const tb = { 'years': 31536000000, 'months': 2592000000, 'days': 86400000, 'hours': 3600000, 'minutes': 60000, 'seconds': 1000};
    return Object.keys(tb).reduce(
      function(acc, key){
        if (duraction[key]) {
          return acc + tb[key] * duraction[key];
        }
        return acc;
      },
      0
    );
  }
}

const formatDuration = (duration) => {
  return Object.keys(duration).map(
    (key) => {
      if (duration[key]) {
        return `${duration[key]}${key[0]}`;
      }
      return '';
    }
  ).filter(v => !!v).slice(0, 2).join(' ');
}

const getLocalISOString = (date) =>{
  if (date !== 'n/a') {
    const offset = date.getTimezoneOffset();
    const offsetAbs = Math.abs(offset)
    const isoString = new Date(date.getTime() - offset * 60 * 1000).toISOString()
    return `${isoString.slice(0, -1)}${offset > 0 ? '-' : '+'}${String(Math.floor(offsetAbs / 60)).padStart(2, '0')}:${String(offsetAbs % 60).padStart(2, '0')}`
  }
  return date;
}

const getClosestRelease = (timeline, format = ['years', 'months', 'days', 'hours']) => {
  let releaseName = 'n/a';
  let releaseDate = 'n/a';
  let timeToRelease = 'n/a';
  let releaseFeatures = 'n/a';
  if (timeline.length) {
    let minDuration = Number.MAX_SAFE_INTEGER;
    const currentDateTime = new Date();
    timeline.forEach(function(t) {
      const deadline = new Date(t.deadline);
      const duration = intervalToDuration({start: currentDateTime, end: deadline});
      const ms = getMillisecondsFromDuration(duration);
      if (ms > 0 && ms < minDuration) {
        minDuration = ms;
        releaseName = t.id;
        releaseDate = deadline;
        timeToRelease = formatDuration(duration);
        //timeToRelease = dateFns.fp.formatDuration(duration, { format, delimiter: ', ', zero: false });
        releaseFeatures = t.features;
      }
    });
  }
  return {releaseName, releaseDate, timeToRelease, releaseFeatures};

};

const getLastUpdateTime = (summary) => {
  const lut = intervalToDuration({start: new Date(summary.lastCommit), end: new Date() });
  return getStringFromInterval(lut);
}

const getDurationToDate = (date) => {
  const t1 = new Date(date);
  const t2 = new Date();
  if (isAfter(t1, t2)) {
    return getStringFromInterval(intervalToDuration({start: t2, end: t1}));
  }
  return getStringFromInterval(intervalToDuration({start: t1, end: t2}));
}

const checkValue = (value, prefix = '', suffix = '', fallback = '-') => {
  if (value) {
    return `${prefix}${value}${suffix}`;
  }
  return fallback;
}

const checkMember = (object, member, prefix = '', suffix = '', fallback = '-') => {
  if (object && object[member]) {
    return `${prefix}${object[member]}${suffix}`;
  }
  return fallback;
}


export { getLocalISOString, getClosestRelease, getLastUpdateTime, formatDuration, getDurationToDate, checkValue, checkMember };
