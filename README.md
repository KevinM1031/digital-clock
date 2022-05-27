# Digital Clock

A cool little online digital clock.  
Visit the [website](https://kevinm1031.github.io/digital-clock/).

Includes a floating island (my first every 3D model) orbited by a sun, moon, 8 planets, Pluto, and the ISS.  
Positions of these celestial bodies are calculated based on the local position of the user (neat).

UI texts are green during day, blue during night, and orange during sunrise/sunset (sun altitude between -18 and -18 degrees, i.e. based on astronomical twilight).  
House light turns on when sun altitude is below -6 degrees (i.e. based on civil twilight).

#### Web link parameters
- `lat` and `lon` overrides the local latitude and longitude (in degrees). Use them together; only setting one of them won't have any effect.
- `tz` overrides the local timezone in reference to UTC time.
- 
*Example:* `https://kevinm1031.github.io/digital-clock/?lat=33.3&lon=-84.5&?tz=1` *sets the local position as (-33.3, -84.5) and timezone as UTC+1.*
