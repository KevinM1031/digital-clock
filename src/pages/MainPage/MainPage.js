import { Stack, Box, Fade } from '@material-ui/core';
import { useWindowDimensions } from '../../components/ui/Window.js';
import NavBar from "../../components/ui/NavBar.js";
import Section1 from "./Section1.js";
import Section2 from "./Section2.js";
import Section3 from "./Section3.js";
import Section4 from "./Section4.js";
import Section5 from "./Section5.js";
import Section6 from "./Section6.js";
import Section7 from "./Section7.js";
import Section8 from "./Section8.js";
import RellaxWrapper from "react-rellax-wrapper";
import { useEffect } from "react";

import a0 from '../../images/bg_a0.png';
import a1 from '../../images/bg_a1.png';
import a2 from '../../images/bg_a2.png';
import a3 from '../../images/bg_a3.png';

import b0 from '../../images/bg_b0.png';
import b1 from '../../images/bg_b1.png';
import b2 from '../../images/bg_b2.png';
import b3 from '../../images/bg_b3.png';

import c0 from '../../images/bg_c0.png';
import c1 from '../../images/bg_c1.png';
import c2 from '../../images/bg_c2.png';
import c3 from '../../images/bg_c3.png';

import d0 from '../../images/bg_d0.png';
import d1 from '../../images/bg_d1.png';
import d2 from '../../images/bg_d2.png';
import d3 from '../../images/bg_d3.png';

import e0 from '../../images/bg_e0.png';
import e1 from '../../images/bg_e1.png';
import e2 from '../../images/bg_e2.png';
import e3 from '../../images/bg_e3.png';

import f0 from '../../images/bg_f0.png';
import f1 from '../../images/bg_f1.png';
import f2 from '../../images/bg_f2.png';
import f3 from '../../images/bg_f3.png';

import g0 from '../../images/bg_g0.png';
import g1 from '../../images/bg_g1.png';
import g2 from '../../images/bg_g2.png';
import g3 from '../../images/bg_g3.png';

import h0 from '../../images/bg_h0.png';
import h1 from '../../images/bg_h1.png';
import h2 from '../../images/bg_h2.png';
import h3 from '../../images/bg_h3.png';

function SectionBG(props) {

    const k0 = -10;
    const k1 = -8;
    const k2 = -4;

    return (
        <Box style={{height: props.height, overflow: 'hidden'}}>
            <RellaxWrapper speed={k0} percentage={0.5} style={{
                width: '100%', height: props.height, 
                backgroundImage: `url(${props.backgrounds[0]})`,
                backgroundSize: 'auto 100%', zIndex: -100
            }}/>
            <RellaxWrapper speed={k1} percentage={0.5} style={{
                width: '100%', height: props.height, marginTop: -props.height,
                backgroundImage: `url(${props.backgrounds[1]})`,
                backgroundSize: 'auto 100%', zIndex: -100
            }}/>
            <RellaxWrapper speed={k2} percentage={0.5} style={{
                width: '100%', height: props.height, marginTop: -props.height,
                backgroundImage: `url(${props.backgrounds[2]})`,
                backgroundSize: 'auto 100%', zIndex: -100
            }}/>
            <div style={{
                width: '100%', height: props.height * 1.01, 
                backgroundImage: `url(${props.backgrounds[3]})`, marginTop: -props.height,
                backgroundSize: 'auto 100%', zIndex: 100, transform: `translate3d(0px, 0px, 0px)`
            }}/>
        </Box>
    );
}

export function MainPage() {
    const sectionCount = 8;

    const queryParams = new URLSearchParams(window.location.search);
    const page = parseInt(queryParams.get('p'));
    if (!page || !(page > 0) || !(page <= sectionCount))
        window.location.href = 'https://kevinm1031.github.io/main-page/?p=1';

    const width = useWindowDimensions().width;
    const height = useWindowDimensions().height * 1.5;
    
    const handleScroll = () => {
        const currHeight = window.innerHeight * 1.5;

        if (page === 1) {
            if (window.pageYOffset > currHeight * 2.1)
                window.location.href = '/?p=' + (page + 1);
        } else if (page === sectionCount) {
            if (window.pageYOffset < currHeight * 0.1)
                window.location.href = '/?p=' + (page - 1) + '&b=true';
        }else {
            if (window.pageYOffset < currHeight * 0.1)
                window.location.href = '/?p=' + (page - 1) + '&b=true';
            else if (window.pageYOffset > currHeight * 3.1)
                window.location.href = '/?p=' + (page + 1);
        }
    };

    useEffect(() => {
        let fromBottom = queryParams.get('b');
        if (page === 1) window.scroll(0, fromBottom ? height : 0);
        else window.scroll(0, fromBottom ? height*2 : height);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div>
            <NavBar/>

            <Fade timeout={2000} in={true}>
            {
                page === 1 ?
                    <Stack>
                        <SectionBG height={height} backgrounds={[a0, a1, a2, a3]} />
                        <Section1 width={width} height={height} />
                        <Box style={{background: 'linear-gradient(to bottom, #151515, #000000)'}} height={height}/>
                    </Stack>

                : page === 2 ?
                    <Stack>
                        <Box style={{background: 'linear-gradient(to top, #151515, #000000)'}} height={height}/>
                        <SectionBG height={height} backgrounds={[b0, b1, b2, b3]} />
                        <Section2 width={width} height={height} />
                        <Box style={{background: 'linear-gradient(to bottom, #151515, #000, #000)'}} height={height}/>
                    </Stack>
                    
                : page === 3 ?
                    <Stack>
                        <Box style={{background: 'linear-gradient(to top, #151515, #000000)'}} height={height}/>
                        <SectionBG height={height} backgrounds={[c0, c1, c2, c3]} />
                        <Section3 width={width} height={height} />
                        <Box style={{background: 'linear-gradient(to bottom, #151515, #000000)'}} height={height}/>
                    </Stack>

                : page === 4 ?
                    <Stack>
                        <Box style={{background: 'linear-gradient(to top, #151515, #000000)'}} height={height}/>
                        <SectionBG height={height} backgrounds={[d0, d1, d2, d3]} />
                        <Section4 width={width} height={height} />
                        <Box style={{background: 'linear-gradient(to bottom, #151515, #000000)'}} height={height}/>
                    </Stack>
                
                : page === 5 ?
                    <Stack>
                        <Box style={{background: 'linear-gradient(to top, #151515, #000000)'}} height={height}/>
                        <SectionBG height={height} backgrounds={[e0, e1, e2, e3]} />
                        <Section5 width={width} height={height} />
                        <Box style={{background: 'linear-gradient(to bottom, #151515, #000000)'}} height={height}/>
                    </Stack>

                : page === 6 ?
                    <Stack>
                        <Box style={{background: 'linear-gradient(to top, #151515, #000000)'}} height={height}/>
                        <SectionBG height={height} backgrounds={[f0, f1, f2, f3]} />
                        <Section6 width={width} height={height} />
                        <Box style={{background: 'linear-gradient(to bottom, #151515, #000000)'}} height={height}/>
                    </Stack>

                : page === 7 ?
                    <Stack>
                        <Box style={{background: 'linear-gradient(to top, #151515, #000000)'}} height={height}/>
                        <SectionBG height={height} backgrounds={[g0, g1, g2, g3]} />
                        <Section7 width={width} height={height} />
                        <Box style={{background: 'linear-gradient(to bottom, #151515, #000000)'}} height={height}/>
                    </Stack>

                : page === 8 ?
                    <Stack>
                        <Box style={{background: 'linear-gradient(to top, #151515, #000000)'}} height={height}/>
                        <SectionBG height={height} backgrounds={[h0, h1, h2, h3]} />
                        <Section8 width={width} height={height} />
                        <Box style={{background: 'linear-gradient(to bottom, #151515, #000000)'}} height={height}/>
                        <Box backgroundColor='#000000' height={height*10}/>
                    </Stack>

                : <Box backgroundColor='#161b26' height={height}/>
            }
            </Fade>
        </div>
    )
}