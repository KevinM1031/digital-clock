import Clock from "./Clock.js";

const App = () => {
    const queryParams = new URLSearchParams(window.location.search);
    const lat = queryParams.get('lat');
    const lon = queryParams.get('lon');
    const tz = queryParams.get('tz');

    return (
        <Clock lat={lat} lon={lon} tz={tz}/>
    )
}

export default App;
