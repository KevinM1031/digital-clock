import { Component, createRef } from 'react';
import * as THREE from 'three';
import * as POSTPROCESSING from 'postprocessing';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { 
    getWidth, getHeight, isLandscape, getSunPos, getMoonPos, 
    getDateStr, getTimeStr, getTimezoneStr, getPlanetsPos, getISSPos
} from './Util.js';

import landModel from './land.glb';
import cloudsModel from './clouds.glb';

class Clock extends Component {
    constructor(props) {
        super(props);

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.myRef = createRef();

        this.posFixed = props.lat && props.lon;
        this.lat = 0;
        this.lon = 0;
        if (this.posFixed) {
            this.lat = Math.max(-89.999999, Math.min(89.999999, 1 * props.lat));
            this.lon = 1 * props.lon;
        } else {
            navigator.geolocation.getCurrentPosition((pos) => {
                this.lat = Math.max(-89.999999, Math.min(89.999999, pos.coords.latitude));
                this.lon = pos.coords.longitude;
            });
        }

        const date = new Date();
        this.nextISSTrack = date.getTime() + 100;

        if (props.tz) this.tz = -1 * props.tz;
        this.delay = 100;
        this.pov = 3;

        window.addEventListener('resize', () => {this.resize()});
    }

    componentDidMount() {

        this.canvas = document.createElement('canvas');
        this.mount.appendChild(this.canvas);

        const width = getWidth();
        const height = getHeight();

        this.camera = new THREE.PerspectiveCamera( 60, width / height, 0.01, 100 );
        this.camera.position.set(-9, 4, -4);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#000000');
        this.scene.add(this.camera);
        
        this.ctx = this.canvas.getContext('webgl');

        this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas,
			context: this.ctx,
			antialias: true,
            alpha: true
		})
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.listenToKeyEvents(this.canvas);
        this.controls.minDistance = 5;
        this.controls.maxDistance = 50;

        this.initAmbientLight();
        this.initSun();
        this.initMoon();
        this.initPlanets();
        this.initSatellites();
        this.initLand();
        this.initClouds();
        this.initLampLight();
        this.initGodRays();

        this.start();
    }

    initAmbientLight() {
		const light = new THREE.AmbientLight( '#222222' );
		this.scene.add( light );
        const ambientLight = new THREE.DirectionalLight('#335599', 0.3);
        ambientLight.position.set(-40, 10, 20);
        this.scene.add(ambientLight);
        this.ambientLight = ambientLight;

    }

    initSun() {
        const group = new THREE.Group();
        const sun_geo = new THREE.SphereGeometry(0.15, 10, 10);
        const sun_mat = new THREE.MeshLambertMaterial({ emissive: '#ffbb77' });
        const sun = new THREE.Mesh(sun_geo, sun_mat);

        const sun_light = new THREE.DirectionalLight('#775533', 5);
        sun_light.castShadow = true;
        sun_light.shadow.bias = -0.0002;
        sun_light.shadow.mapSize.width = 1400;
        sun_light.shadow.mapSize.height = 1400;
        sun.add(sun_light);

        group.add(sun);
        this.scene.add(group);
        this.sun = group;
    }

    initMoon() {
        const group = new THREE.Group();
        const moon_geo = new THREE.SphereGeometry(0.16, 40, 40);
        const moon_mat = new THREE.MeshBasicMaterial({ emissive: '#9999cc' });
        const moon = new THREE.Mesh(moon_geo, moon_mat);

        const moon_light = new THREE.DirectionalLight( '#444499', 0 );
        moon_light.castShadow = true;
        moon_light.receiveShadow = true;
        moon_light.shadow.bias = -0.0002;
        moon_light.shadow.mapSize.width = 1400;
        moon_light.shadow.mapSize.height = 1400;
        moon.add(moon_light);

        const moon_cover_geo = new THREE.SphereGeometry(0.165, 40, 20, Math.PI, Math.PI);
        const moon_cover_mat = new THREE.MeshBasicMaterial({ color: '#000000' });
        const moon_cover = new THREE.Mesh(moon_cover_geo, moon_cover_mat);
        moon.add(moon_cover);

        group.add(moon);
        this.scene.add(group);
        this.moon = group;
    }

    initPlanets() {
        const group = new THREE.Group();

        const mercury_geo = new THREE.SphereGeometry(0.008, 10, 10);
        const mercury_mat = new THREE.MeshLambertMaterial({ color: '#f8ffa8', emissive: '#f8ffa8' });
        const mercury = new THREE.Mesh(mercury_geo, mercury_mat);
        group.add(mercury);
        this.mercury = mercury;

        const venus_geo = new THREE.SphereGeometry(0.024, 10, 10);
        const venus_mat = new THREE.MeshLambertMaterial({ color: '#f5f7a1', emissive: '#f5f781' });
        const venus = new THREE.Mesh(venus_geo, venus_mat);
        group.add(venus);
        this.venus = venus;

        const mars_geo = new THREE.SphereGeometry(0.016, 10, 10);
        const mars_mat = new THREE.MeshLambertMaterial({ color: '#e3a184', emissive: '#e36124' });
        const mars = new THREE.Mesh(mars_geo, mars_mat);
        group.add(mars);
        this.mars = mars;

        const jupiter_geo = new THREE.SphereGeometry(0.020, 10, 10);
        const jupiter_mat = new THREE.MeshLambertMaterial({ color: '#f0dabf', emissive: '#b0aa8f' });
        const jupiter = new THREE.Mesh(jupiter_geo, jupiter_mat);
        group.add(jupiter);
        this.jupiter = jupiter;

        const saturn_geo = new THREE.SphereGeometry(0.014, 10, 10);
        const saturn_mat = new THREE.MeshLambertMaterial({ color: '#f7c4a7', emissive: '#c7a477' });
        const saturn = new THREE.Mesh(saturn_geo, saturn_mat);
        group.add(saturn);
        this.saturn = saturn;

        const uranus_geo = new THREE.SphereGeometry(0.01, 10, 10);
        const uranus_mat = new THREE.MeshLambertMaterial({ color: '#a2e8f7', emissive: '#72e8f7' });
        const uranus = new THREE.Mesh(uranus_geo, uranus_mat);
        group.add(uranus);
        this.uranus = uranus;

        const neptune_geo = new THREE.SphereGeometry(0.007, 10, 10);
        const neptune_mat = new THREE.MeshLambertMaterial({ color: '#aeb8f7', emissive: '#5e78f7' });
        const neptune = new THREE.Mesh(neptune_geo, neptune_mat);
        group.add(neptune);
        this.neptune = neptune;

        const pluto_geo = new THREE.SphereGeometry(0.005, 10, 10);
        const pluto_mat = new THREE.MeshLambertMaterial({ color: '#d9d3d1', emissive: '#696361' });
        const pluto = new THREE.Mesh(pluto_geo, pluto_mat);
        group.add(pluto);
        this.pluto = pluto;

        group.castShadow = false;
        group.receiveShadow = false;
        this.scene.add(group);
    }

    initSatellites() {
        const group = new THREE.Group();

        const iss_geo = new THREE.SphereGeometry(0.01, 10, 10);
        const iss_mat = new THREE.MeshLambertMaterial({ color: '#212636', emissive: '#ff0000' });
        const iss = new THREE.Mesh(iss_geo, iss_mat);
        group.add(iss);
        this.iss = iss;

        group.castShadow = false;
        group.receiveShadow = false;
        this.scene.add(group);
    }

    initLand() {
        const group = new THREE.Group();
        const loader = new GLTFLoader();

        loader.load(landModel, (gltf) => {
            gltf.scene.traverse(function(node) { 
                if (node instanceof THREE.Mesh) { 
                    node.position.set(0, -1, 0);
                    node.castShadow = true;
                    node.receiveShadow = true;
                } 
            });
            group.add( gltf.scene );
            this.scene.add(group);
        }, undefined, function (error) {
            console.error(error);
        });
    }

    initClouds() {
        const group = new THREE.Group();
        const loader = new GLTFLoader();

        loader.load(cloudsModel, (gltf) => {
            gltf.scene.traverse(function(node) { 
                if (node instanceof THREE.Mesh) { 
                    node.position.set(-3.5, 8, -2.5);
                    node.castShadow = true;
                    node.receiveShadow = true;
                } 
            });
            group.scale.set(0.3, 0.3, 0.3);
            group.add( gltf.scene );
            this.scene.add(group);
            this.clouds = group;
        }, undefined, function (error) {
            console.error(error);
        });
    }

    initLampLight() {
        const group = new THREE.Group();
        const lamp_geo = new THREE.SphereGeometry(0.02, 1, 1);
        const lamp_mat = new THREE.MeshLambertMaterial({ color: '#000000' });
        const lamp = new THREE.Mesh(lamp_geo, lamp_mat);

        const lamp_light = new THREE.PointLight('#ff5500', 5, 0.8, 1);
        lamp.add(lamp_light);

        lamp.position.set(-0.63, 0.15, 0.35);
        group.add(lamp);
        this.scene.add(group);
        this.lampLight = lamp_light;
    }

    initGodRays() {
        let godraysEffect_sun = new POSTPROCESSING.GodRaysEffect(this.camera, this.sun.children[0], {
            resolutionScale: 0.7,
            density: 0.5,
            decay: 0.9,
            weight: 0.9,
            samples: 10
        });
        let godraysEffect_mercury = new POSTPROCESSING.GodRaysEffect(this.camera, this.mercury, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_venus = new POSTPROCESSING.GodRaysEffect(this.camera, this.venus, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_mars = new POSTPROCESSING.GodRaysEffect(this.camera, this.mars, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_jupiter = new POSTPROCESSING.GodRaysEffect(this.camera, this.jupiter, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_saturn = new POSTPROCESSING.GodRaysEffect(this.camera, this.saturn, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_uranus = new POSTPROCESSING.GodRaysEffect(this.camera, this.uranus, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_neptune = new POSTPROCESSING.GodRaysEffect(this.camera, this.neptune, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_pluto = new POSTPROCESSING.GodRaysEffect(this.camera, this.pluto, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let godraysEffect_iss = new POSTPROCESSING.GodRaysEffect(this.camera, this.iss, {
            resolutionScale: 0.5, density: 0.5, decay: 0.9, weight: 0.9, samples: 10 });
        let smaaEffect = new POSTPROCESSING.SMAAEffect({});
        let renderPass = new POSTPROCESSING.RenderPass(this.scene, this.camera);
        let effectPass = new POSTPROCESSING.EffectPass(this.camera, 
            godraysEffect_sun, godraysEffect_mercury, godraysEffect_venus, godraysEffect_mars, 
            godraysEffect_jupiter, godraysEffect_saturn, godraysEffect_uranus, godraysEffect_neptune, 
            godraysEffect_pluto, godraysEffect_iss);
        let smaaPass = new POSTPROCESSING.EffectPass(this.camera, smaaEffect);
        this.composer = new POSTPROCESSING.EffectComposer(this.renderer);
        this.composer.addPass(renderPass);
        this.composer.addPass(effectPass);
        this.composer.addPass(smaaPass);
    }

    componentWillUnmount() {
        this.stop();
        window.removeEventListener('resize', () => {this.resize()});
        this.mount.removeChild(this.renderer.domElement);
    }

    start() {
        if (!this.frameId);
            this.frameId = requestAnimationFrame(this.animate)
    }

    stop() {
        window.cancelAnimationFrame(this.frameId);
    }

    animate() {

        // Get date
        let date = new Date();
        if (this.tz) {
            const tOff = this.tz - date.getTimezoneOffset();
            date.setTime(date.getTime() + tOff * 60000);
        }

        //if (!this.offset) this.offset = 0;
        //date.setTime(date.getTime() + this.offset);
        //this.offset += 500000;

        // Get screen dimensions
        const width = getWidth();
        const height = getHeight();

        // Clouds movement
        if (this.clouds)
            this.clouds.rotation.set(0, date.getTime() % 900000 / 450000 * Math.PI, 0);

        // Sun position calculation
        const sunDist = 6;
        const sunPos = getSunPos(date, this.lat, this.lon);
        const sx = Math.sin(sunPos.azimuth) * Math.cos(sunPos.altitude) * sunDist;
        const sy = Math.sin(sunPos.altitude) * sunDist;
        const sz = -Math.cos(sunPos.azimuth) * Math.cos(sunPos.altitude) * sunDist;
        this.sun.position.set(sx, sy, sz);

        // Sun light color & intensity calculation
        const sunRedness = Math.pow(Math.abs(Math.cos(sunPos.altitude)), 30) * 0.2 + 0.4;
        const sunMesh = this.sun.children[0];
        const sunMat = sunMesh.material;
        sunMat.emissive.setRGB(sunRedness + 0.3, 0.7 - sunRedness/2, 0.5 - sunRedness/2);

        const sunLight = sunMesh.children[0];
        sunLight.color.setRGB(sunRedness, 0.5 - sunRedness/2, 0.33 - sunRedness/2);
        sunLight.intensity = Math.max(Math.min(Math.sin(sunPos.altitude + 0.2)*20, 5), 0);

        // Moon position calculation
        const moonDist = 5.6;
        const moonPos = getMoonPos(date, this.lat, this.lon);
        const mx = Math.sin(moonPos.azimuth) * Math.cos(moonPos.altitude) * moonDist;
        const my = Math.sin(moonPos.altitude) * moonDist;
        const mz = -Math.cos(moonPos.azimuth) * Math.cos(moonPos.altitude) * moonDist;
        this.moon.position.set(mx, my, mz);

        // Moon light intensity calculation (based on phase)
        const msV = new THREE.Vector3((sx*1000)-mx, (sy*1000)-my, (sz*1000)-mz);
        const mlV = new THREE.Vector3(mx, my, mz);
        const moonIllum = Math.max(-msV.normalize().dot(mlV.normalize()) + 1, 0) * 2.5;

        const moonMesh = this.moon.children[0];
        const moonLight = moonMesh.children[0];
        moonLight.intensity = Math.max(Math.sin(-sunPos.altitude), 0) * Math.max(Math.sin(moonPos.altitude)) * moonIllum;

        // Moon phase calculation
        const moonCover = moonMesh.children[1];
        moonCover.lookAt((sx*1000), (sy*1000), (sz*1000));

        // Planets position calculation
        const planetsDist = 6;
        const planetsPos = getPlanetsPos(date, this.lat, this.lon);
        this.mercury.position.set(
            Math.sin(planetsPos.mercury.azimuth) * Math.cos(planetsPos.mercury.altitude) * planetsDist,
            Math.sin(planetsPos.mercury.altitude) * planetsDist,
            -Math.cos(planetsPos.mercury.azimuth) * Math.cos(planetsPos.mercury.altitude) * planetsDist);
        this.venus.position.set(
            Math.sin(planetsPos.venus.azimuth) * Math.cos(planetsPos.venus.altitude) * planetsDist,
            Math.sin(planetsPos.venus.altitude) * planetsDist,
            -Math.cos(planetsPos.venus.azimuth) * Math.cos(planetsPos.venus.altitude) * planetsDist);
        this.mars.position.set(
            Math.sin(planetsPos.mars.azimuth) * Math.cos(planetsPos.mars.altitude) * planetsDist,
            Math.sin(planetsPos.mars.altitude) * planetsDist,
            -Math.cos(planetsPos.mars.azimuth) * Math.cos(planetsPos.mars.altitude) * planetsDist);
        this.jupiter.position.set(
            Math.sin(planetsPos.jupiter.azimuth) * Math.cos(planetsPos.jupiter.altitude) * planetsDist,
            Math.sin(planetsPos.jupiter.altitude) * planetsDist,
            -Math.cos(planetsPos.jupiter.azimuth) * Math.cos(planetsPos.jupiter.altitude) * planetsDist);
        this.saturn.position.set(
            Math.sin(planetsPos.saturn.azimuth) * Math.cos(planetsPos.saturn.altitude) * planetsDist,
            Math.sin(planetsPos.saturn.altitude) * planetsDist,
            -Math.cos(planetsPos.saturn.azimuth) * Math.cos(planetsPos.saturn.altitude) * planetsDist);
        this.uranus.position.set(
            Math.sin(planetsPos.uranus.azimuth) * Math.cos(planetsPos.uranus.altitude) * planetsDist,
            Math.sin(planetsPos.uranus.altitude) * planetsDist,
            -Math.cos(planetsPos.uranus.azimuth) * Math.cos(planetsPos.uranus.altitude) * planetsDist);
        this.neptune.position.set(
            Math.sin(planetsPos.neptune.azimuth) * Math.cos(planetsPos.neptune.altitude) * planetsDist,
            Math.sin(planetsPos.neptune.altitude) * planetsDist,
            -Math.cos(planetsPos.neptune.azimuth) * Math.cos(planetsPos.neptune.altitude) * planetsDist);
        this.pluto.position.set(
            Math.sin(planetsPos.pluto.azimuth) * Math.cos(planetsPos.pluto.altitude) * planetsDist,
            Math.sin(planetsPos.pluto.altitude) * planetsDist,
            -Math.cos(planetsPos.pluto.azimuth) * Math.cos(planetsPos.pluto.altitude) * planetsDist);

        // Satellite position calculation
        const satellitesDist = 5.4
        const satelliteUpdateFreq = 2000;
        if (this.nextISSTrack <= date.getTime()) {
            this.nextISSTrack = date.getTime() + satelliteUpdateFreq;
            getISSPos(date, this.lat, this.lon).then((issPos) => {
                this.iss.material.emissive.set('#ff0000');
                this.iss.position.set(
                    Math.sin(issPos.azimuth) * Math.cos(issPos.altitude) * satellitesDist,
                    Math.sin(issPos.altitude) * satellitesDist,
                    -Math.cos(issPos.azimuth) * Math.cos(issPos.altitude) * satellitesDist);
            });
        } else if(this.nextISSTrack - satelliteUpdateFreq/2 <= date.getTime()) {
            this.iss.material.emissive.set('#000000');
        }

        // Lamp light calculation (based on civil twilight)
        if (sunPos.altitude > -0.10472) this.lampLight.color.setRGB(0, 0, 0);
        else this.lampLight.color.setRGB(Math.random()*0.2 + 0.8, 0.4, 0);

        // Ambient light calculation
        const ambientIllum = Math.max(Math.sin(sunPos.altitude), 0) * 0.4 - 0.2;
        this.ambientLight.intensity = ambientIllum * 1.5 + 0.8;
        this.ambientLight.color.setRGB(0.5 + ambientIllum, 0.5, 0.5 - ambientIllum);

        // Time text update
        const landscape = isLandscape();
        const textColor = sunPos.altitude < -0.314159 ? 'cornflowerblue' 
            : sunPos.altitude > 0.314159 ? '#5de356' : 'coral'; // based on astronomical twilight

        const timeText = this.mount.parentElement.children[1];
        timeText.style.left = width/2 - timeText.clientWidth/2 + 'px';
        timeText.style.top = height * 0.08 + 'px';
        timeText.style.color = textColor;
        timeText.style.fontSize = landscape ? '70px' : '47px';
        timeText.replaceChildren(getTimeStr(date));

        // Date text update
        const dateText = this.mount.parentElement.children[2];
        dateText.style.left = width/2 - dateText.clientWidth/2 + 'px';
        dateText.style.top = height * 0.2 + 'px';
        dateText.style.color = textColor;
        dateText.style.fontSize = landscape ? '40px' : '27px';
        dateText.replaceChildren(getDateStr(date));

        // Timezone text update
        const timezoneText = this.mount.parentElement.children[3];
        timezoneText.style.left = width/2 - timezoneText.clientWidth/2 + 'px';
        timezoneText.style.top = height * 0.78 + 'px';
        timezoneText.style.color = textColor;
        timezoneText.style.fontSize = landscape ? '40px' : '27px';
        timezoneText.replaceChildren(getTimezoneStr(this.tz ? this.tz : date.getTimezoneOffset()));

        // Coordinate text update
        const coordText = this.mount.parentElement.children[4];
        coordText.style.left = width/2 - coordText.clientWidth/2 + 'px';
        coordText.style.top = height * 0.85 + 'px';
        coordText.style.color = textColor;
        coordText.style.fontSize = landscape ? '15px' : '10px';
        coordText.replaceChildren("GCS [" + this.lat + ", " + this.lon + "]");

        // Sun position text update
        const sunPosText = this.mount.parentElement.children[5];
        sunPosText.style.left = width/2 - sunPosText.clientWidth/2 + 'px';
        sunPosText.style.top = height * 0.88 + 'px';
        sunPosText.style.color = textColor;
        sunPosText.style.fontSize = landscape ? '15px' : '10px';
        sunPosText.replaceChildren("☉ Alt/Az [" 
            + Math.round(sunPos.altitude / Math.PI * 18000) / 100 + ", " 
            + Math.round(sunPos.azimuth / Math.PI * 18000) / 100 + "]");

        // Moon position text update
        const moonPosText = this.mount.parentElement.children[6];
        moonPosText.style.left = width/2 - moonPosText.clientWidth/2 + 'px';
        moonPosText.style.top = height * 0.905 + 'px';
        moonPosText.style.color = textColor;
        moonPosText.style.fontSize = landscape ? '15px' : '10px';
        moonPosText.replaceChildren("☾ Alt/Az [" 
            + Math.round(moonPos.altitude / Math.PI * 18000) / 100 + ", " 
            + Math.round(moonPos.azimuth / Math.PI * 18000) / 100 + "]");

        // FPS button update
        const fpsBtn = this.mount.parentElement.children[7];
        fpsBtn.style.left = width/2 - fpsBtn.clientWidth/2 - timezoneText.clientWidth*0.8 + 'px';
        fpsBtn.style.top = height * 0.78 - fpsBtn.clientHeight/2 + timezoneText.clientHeight/2 + 'px';
        fpsBtn.style.color = textColor;
        fpsBtn.style.border = '2px solid ' + textColor;
        fpsBtn.style.fontSize = landscape ? '21px' : '14px';
        fpsBtn.replaceChildren(this.delay === 100 ? '10 FPS' : '40 FPS');

        // POV button update
        const povBtn = this.mount.parentElement.children[8];
        povBtn.style.left = width/2 - povBtn.clientWidth/2 + timezoneText.clientWidth*0.8 + 'px';
        povBtn.style.top = height * 0.78 - povBtn.clientHeight/2 + timezoneText.clientHeight/2 + 'px';
        povBtn.style.color = textColor;
        povBtn.style.border = '2px solid ' + textColor;
        povBtn.style.fontSize = landscape ? '21px' : '14px';
        povBtn.replaceChildren(this.pov === 1 ? '1st POV' : '3rd POV');

        // Coordinate update
        if (!this.posFixed) {
            navigator.geolocation.getCurrentPosition((pos) => {
                this.lat = pos.coords.latitude;
                this.lon = pos.coords.longitude;
            });
        }

        this.composer.render();
        setTimeout( () => {
            this.frameId = window.requestAnimationFrame(this.animate);
        }, this.delay );
    }

    updatePerspective() {

        if (this.pov === 3) {
            this.controls.minDistance = 5;
            this.controls.maxDistance = 50;
            this.controls.reset();
            this.controls.target.set(0, 0, 0);

            this.camera.position.set(-9, 4, -4);
            

        } else {
            this.controls.minDistance = 0;
            this.controls.maxDistance = 0.001;
            this.controls.reset();
            this.controls.target.set(-0.9972, 0.1017, 0.395);

            this.camera.position.set(-1, 0.1, 0.4);
            this.camera.lookAt(2, 2, -5);
        }

        this.camera.updateProjectionMatrix();
    }

    resize() {
        if (!this.composer || !this.camera) return;
            const width = getWidth();
            const height = getHeight();
            this.composer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.initGodRays();
    }

    render() {

        return (
            <div ref={this.myRef}>
                <div style={{position: 'relative'}}
                    ref={(mount) => { this.mount = mount }}/>

                <div style={{
                    fontSize: '550%',
                }}/>
                
                <div style={{
                    fontSize: '300%',
                }}/>

                <div style={{
                    fontSize: '270%',
                }}/>

                <div style={{
                    fontSize: '120%',
                }}/>

                <div style={{
                    fontSize: '120%',
                }}/>

                <div style={{
                    fontSize: '120%',
                }}/>

                <button onClick={() => {
                    this.delay = this.delay === 100 ? 25 : 100;
                }} style={{
                    fontSize: '200%',
                }}/>

                <button onClick={() => {
                    this.pov = this.pov === 1 ? 3 : 1;
                    this.updatePerspective();
                }}style={{
                    fontSize: '200%',
                }}/>
            </div>
        )
    }
}

export default Clock;