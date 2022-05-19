import { Component, createRef } from 'react';
import * as THREE from 'three';
import * as POSTPROCESSING from 'postprocessing';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getWidth, getHeight, isLandscape, getSunPos, getMoonPos, getDateStr, getTimeStr, getTimezoneStr } from './Util.js';

import landModel from './land.glb';
import cloudsModel from './clouds.glb';

const FRAME_INTERVAL = 100;

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

        this.date = new Date();
        if (props.tz) this.tz = -1 * props.tz;

        window.addEventListener('resize', () => {this.resize()});
    }

    componentDidMount() {

        this.canvas = document.createElement('canvas');
        this.mount.appendChild(this.canvas);

        const width = getWidth();
        const height = getHeight();

        this.camera = new THREE.PerspectiveCamera( 60, width / height, 1, 1000 );
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
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;

        this.initAmbientLight();
        this.initSun();
        this.initMoon();
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

        const sun_light = new THREE.PointLight('#775533', 5);
        sun_light.castShadow = true;
        sun_light.shadow.bias = -0.0002;
        sun_light.shadow.mapSize.width = 1400;
        sun_light.shadow.mapSize.height = 1400;
        sun.add(sun_light);

        sun.position.set(0, 0, 0);
        group.add(sun);
        this.scene.add(group);
        this.sun = group;
    }

    initMoon() {
        const group = new THREE.Group();
        const moon_geo = new THREE.SphereGeometry(0.17, 20, 20);
        const moon_mat = new THREE.MeshLambertMaterial({ emissive: '#888899' });
        const moon = new THREE.Mesh(moon_geo, moon_mat);
        moon.castShadow = true;

        const moon_light = new THREE.PointLight( '#444499', 0 );
        moon_light.castShadow = true;
        moon_light.receiveShadow = true;
        moon_light.shadow.bias = -0.0002;
        moon_light.shadow.mapSize.width = 1400;
        moon_light.shadow.mapSize.height = 1400;
        moon.add(moon_light);

        const moon_cover_geo = new THREE.SphereGeometry(0.18, 20, 10, Math.PI, Math.PI);
        const moon_cover_mat = new THREE.MeshLambertMaterial({ color: '#000000' });
        const moon_cover = new THREE.Mesh(moon_cover_geo, moon_cover_mat);
        moon.add(moon_cover);

        moon.position.set(0, 0, 0);
        group.add(moon);
        this.scene.add(group);
        this.moon = group;
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
            //const earth_geo = new THREE.SphereGeometry(0.17, 20, 20);
            //const earth_mat = new THREE.MeshLambertMaterial({ color: '#ff0000' });
            //const earth = new THREE.Mesh(earth_geo, earth_mat);
            //earth.castShadow = true;
            group.add( gltf.scene );
            //group.add(earth);
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
                    node.position.set(-3, 8, -2);
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

        const lamp_light = new THREE.PointLight('#ff5500', 3, 0.8, 1);
        lamp.add(lamp_light);

        lamp.position.set(-0.63, 0.14, 0.35);
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
        let godraysEffect_moon = new POSTPROCESSING.GodRaysEffect(this.camera, this.moon.children[0], {
            resolutionScale: 0.7,
            density: 0.2,
            decay: 0.8,
            weight: 0.9,
            samples: 10
        });
        let smaaEffect = new POSTPROCESSING.SMAAEffect({});
        let renderPass = new POSTPROCESSING.RenderPass(this.scene, this.camera);
        let effectPass = new POSTPROCESSING.EffectPass(this.camera, godraysEffect_sun, godraysEffect_moon);
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
        //this.offset += 100000;

        // Atlanta solar eclipse time
        //date.setFullYear(2017, 7, 21);
        //date.setHours(14, 36, 0);

        // Atlanta lunar eclipse time
        //date.setFullYear(2022, 4, 16);
        //date.setHours(1, 36, 0);

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
        console.log(sunLight.intensity)

        // Moon position calculation
        const moonDist = 5.4;
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

        // Lamp light calculation (based on civil twilight)
        if (sunPos.altitude > -0.10472) this.lampLight.color.setRGB(0, 0, 0);
        else this.lampLight.color.setRGB(Math.random()*0.2 + 0.8, 0.4, 0);

        // Ambient light calculation
        const ambientIllum = Math.max(Math.sin(sunPos.altitude), 0) * 0.4 - 0.2;
        this.ambientLight.intensity = ambientIllum * 2 + 0.5;
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
        }, FRAME_INTERVAL );
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
                <div ref={(mount) => { this.mount = mount }}/>

                <div style={{
                    position: 'absolute', 
                    color: 'cornflowerblue',
                    fontFamily: 'monospace', 
                    fontSize: '550%',
                }}/>
                
                <div style={{
                    position: 'absolute', 
                    color: 'cornflowerblue',
                    fontFamily: 'monospace', 
                    fontSize: '300%',
                }}/>

                <div style={{
                    position: 'absolute', 
                    color: 'cornflowerblue',
                    fontFamily: 'monospace', 
                    fontSize: '270%',
                }}/>

                <div style={{
                    position: 'absolute', 
                    color: 'cornflowerblue',
                    fontFamily: 'monospace', 
                    fontSize: '120%',
                }}/>

                <div style={{
                    position: 'absolute', 
                    color: 'cornflowerblue',
                    fontFamily: 'monospace', 
                    fontSize: '120%',
                }}/>

                <div style={{
                    position: 'absolute', 
                    color: 'cornflowerblue',
                    fontFamily: 'monospace', 
                    fontSize: '120%',
                }}/>
            </div>
        )
    }
}

export default Clock;