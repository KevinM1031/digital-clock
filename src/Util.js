export function getWidth() {
    return document.documentElement.clientWidth;
}

export function getHeight() {
    return document.documentElement.clientHeight;
}

export function isLandscape() {
    return getHeight() / getWidth() < 1.5;
}

export function getDateStr(date) {
    let str = date.getFullYear() + '/';
    str += (date.getMonth() < 9 ? '0' + (date.getMonth()+1) : date.getMonth()+1) + '/';
    str += (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) + ' ';
    switch(date.getDay()) {
        case 0: str += '(SUN)'; break;
        case 1: str += '(MON)'; break;
        case 2: str += '(TUE)'; break;
        case 3: str += '(WED)'; break;
        case 4: str += '(THU)'; break;
        case 5: str += '(FRI)'; break;
        case 6: str += '(SAT)'; break;
        default: str += '(?)';
    }
    return str;
}

export function getTimeStr(date) {
    const hr = date.getHours() > 12 ? date.getHours() - 12 : date.getHours() === 0 ? 12 : date.getHours();
    let str = (hr < 10 ? '0' + hr : hr) + ':';
    str += (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    str += (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds()) + ' ';
    str += date.getHours() > 11 ? 'PM' : 'AM';
    return str;
}

export function getTimezoneStr(tOff) {
    let str = tOff < 0 ? "UTC + " : "UTC - ";
    str += (Math.floor(Math.abs(tOff / 60)) < 10 ? '0' + Math.floor(Math.abs(tOff / 60)) : Math.floor(Math.abs(tOff / 60))) + ":";
    str += "" + Math.floor(Math.abs(tOff % 60)) < 10 ? '0' + Math.floor(Math.abs(tOff % 60)) : Math.floor(Math.abs(tOff % 60));
    return str;
}

export function getSunPos(date, lat, lon) {

    lat = lat / 180 * Math.PI;

    // calculating equatorial coordinates
    // from https://en.wikipedia.org/wiki/Position_of_the_Sun
    const n = (date.getTime() - 946728000000) / 86400000;

    const L = 4.89495042 + 0.0172027923937 * n;
    const g = 6.240040768 + 0.0172019703436 * n;

    const gamma = L + 0.033423055 * Math.sin(g) + 0.0003490659 * Math.sin(2*g);
    const epsilon = 0.409087723 - 0.000000006981317 * n;

    const RA = Math.atan2(Math.cos(epsilon) * Math.sin(gamma), Math.cos(gamma));
    const delta = Math.asin(Math.sin(epsilon) * Math.sin(gamma));

    // calculating local sidereal time
    const UTC_hours = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;
    const LST = (100.46 + 0.985647332 * n + lon + 15 * UTC_hours) % 360 / 180 * Math.PI;

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}

export function getMoonPos(date, lat, lon) {

    lat = lat / 180 * Math.PI;

    // calculating equatorial coordinates
    // from https://www.aa.quae.nl/en/reken/hemelpositie.html#4
    const n = (date.getTime() - 946728000000) / 86400000;

    const L = 3.81033301 + 0.229971493746 * n;
    const g = 2.355548718 + 0.228027144599 * n;
    const F = 1.6279035 + 0.2308957154 * n;

    const gamma = L + 0.10976376 * Math.sin(g);
    const beta = 0.089500484 * Math.sin(F);
    const epsilon = 0.4090999407;

    const RA = Math.atan2(Math.cos(epsilon) * Math.sin(gamma), Math.cos(gamma));
    const delta = Math.asin(Math.sin(beta) * Math.cos(epsilon) + Math.cos(beta) * Math.sin(epsilon) * Math.sin(gamma));

    // calculating local sidereal time
    const UTC_hours = date.getUTCHours() + date.getUTCMinutes()/60 + date.getUTCSeconds()/3600;
    const LST = (100.46 + 0.985647332 * n + lon + 15 * UTC_hours) % 360 / 180 * Math.PI;

    // converting equatorial coordinates to horizontal coordinates
    // from http://www.stargazing.net/kepler/altaz.html
    const H = RA - LST;

    const a = Math.asin(Math.sin(delta) * Math.sin(lat) + Math.cos(delta) * Math.cos(lat) * Math.cos(H));
    const A0 = Math.acos((Math.sin(delta) - Math.sin(a) * Math.sin(lat)) / (Math.cos(a) * Math.cos(lat)));
    const A = Math.sin(H) > 0 ? A0 : Math.PI * 2 - A0;

    return {
        altitude: a,
        azimuth: A,
    };
}