import { rhizomeTexts, getRandomText } from '../game_texts.js';

export async function initRhizomeLabyrinth(container, loadSceneCallback, gameUtils, params = {}) {
    const { motion, showDynamicPopup, applyScreenEffect, clearScreenEffect } = gameUtils;
    const sceneId = `rhizome-${Date.now()}`;
    
    let entryText = getRandomText(rhizomeTexts.entry);
    let cycleText = '';
    if (params.reEntry && params.cycleCount > 0) {
        if (rhizomeTexts.cycle[params.cycleCount]) {
            cycleText = rhizomeTexts.cycle[params.cycleCount];
        } else if (params.cycleCount > 3 && rhizomeTexts.cycle.N && rhizomeTexts.cycle.N.length > 0) {
            cycleText = getRandomText(rhizomeTexts.cycle.N).replace('{N}', params.cycleCount);
        }

        applyScreenEffect('sceneDistortion', null); // Persists until cleared
    } else {
        clearScreenEffect(); // Clear any persistent effects if it's a fresh entry
    }


    container.innerHTML = `
        <div id="${sceneId}" class="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-4">
            <div class="rhizome-bg-layer rhizome-noise-overlay"></div>
            <div class="rhizome-bg-layer rhizome-gradient-overlay" style="--g1h:${Math.random()*360}; --g2h:${Math.random()*360}; --g3h:${Math.random()*360}; --g4h:${Math.random()*360};"></div>
            <div class="absolute inset-0 bg-[var(--color-bg-main)] opacity-60 z-0"></div>
            
            <div class="relative z-10 text-center">
                <h1 class="text-3xl md:text-5xl font-bold mb-4 text-[var(--color-accent1)] filter-neon-glow animate-pulse">根茎迷宫的入口</h1>
                <p class="text-md md:text-xl text-[var(--color-text-secondary)] mb-2 max-w-2xl">${entryText}</p>
                ${cycleText ? `<p class="text-lg md:text-xl text-[var(--color-accent2)] mt-2 filter-neon-glow-cyan">${cycleText}</p>` : ''}
                <p id="rhizome-passage-discovery-text" class="text-sm md:text-base text-[var(--color-text-secondary)] mt-3 max-w-xl italic"></p>
            </div>

            <div id="passages-container" class="relative z-10 flex flex-wrap justify-center items-center mt-8">
            </div>
            <svg id="dynamic-lines-svg" class="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-50"></svg>
            <svg id="svg-filters">
                <filter id="filter-flowing-line">
                    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="3" result="turbulence"/>
                    <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/>
                </filter>
            </svg>
        </div>
    `;

    const discoveryTextElement = container.querySelector('#rhizome-passage-discovery-text');
    if (discoveryTextElement) {
        discoveryTextElement.textContent = getRandomText(rhizomeTexts.newPassage);
        motion.animate(discoveryTextElement, { opacity: [0, 1, 0, 1], y: [10,0,10,0] }, { duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" });
    }

    const passagesContainer = container.querySelector('#passages-container');
    const svgLines = container.querySelector('#dynamic-lines-svg');
    const passageOptions = [
        { text: "扭曲的通道", target: "symbol_theatre", color: "var(--color-accent1)"},
        { text: "闪烁的裂隙", target: "rhizome_labyrinth", color: "var(--color-accent2)"}, 
        { text: "不稳定的奇点", target: "symbol_theatre", color: "var(--color-accent5)"},
        { text: "虚无的彼岸", target: "rhizome_labyrinth", color: "var(--color-accent3)"},
        { text: "破碎的回响", target: "symbol_theatre", color: "var(--color-accent6)"},
        { text: "流动的空洞", target: "rhizome_labyrinth", color: "var(--color-accent7)"}
    ];

    const numPassages = Math.floor(Math.random() * 2) + 3; 
    const selectedPassages = passageOptions.sort(() => 0.5 - Math.random()).slice(0, numPassages);

    selectedPassages.forEach((opt, index) => {
        const passageEl = document.createElement('div');
        passageEl.className = 'passage m-2 md:m-4 text-sm md:text-base';
        passageEl.textContent = opt.text;
        passageEl.style.borderColor = opt.color;
        passageEl.style.color = opt.color;
        passageEl.style.setProperty('--passage-accent', opt.color);
        
        motion.animate(passageEl, 
            {
                y: [0, (Math.random() - 0.5) * 10, 0],
                skewX: [(Math.random() -0.5) * 3, 0]
            },
            { 
                duration: Math.random() * 3 + 2, 
                delay: index * 0.1, 
                repeat: Infinity, 
                repeatType: "mirror",
                ease: "easeInOut"
            }
        );

        passageEl.addEventListener('click', async () => {
            applyScreenEffect('transitionGlitch', 700); // Intense glitch during transition

            motion.animate(passageEl, { scale: [1, 1.5, 0], opacity: [1, 0.3, 0], rotate: [0, (Math.random()-0.5)*90] }, { duration: 0.4 });
            

            const sceneElementToAnimate = container.querySelector(`#${sceneId}`);
            if (sceneElementToAnimate) {
                 motion.animate(sceneElementToAnimate, 
                    { 
                        filter: ['blur(0px) saturate(1)', 'blur(15px) saturate(10) hue-rotate(180deg)', 'blur(30px) saturate(0.1) opacity(0)'],
                        scale: [1, 1.5, 0.5]
                    }, 
                    { duration: 0.7, delay: 0.1 }
                 );
            }
            
            await new Promise(resolve => setTimeout(resolve, 600)); // Wait for part of animation

            let nextSceneParams = {};
            if (opt.target === 'rhizome_labyrinth') {
                nextSceneParams = { 
                    reEntry: true, 
                    cycleCount: (params.cycleCount || 0) + 1 
                };
            }
            loadSceneCallback(opt.target, nextSceneParams);
        });
        passagesContainer.appendChild(passageEl);
    });

    const sceneElement = container.querySelector(`#${sceneId}`);
    for (let i = 0; i < 20; i++) { // Increased fragments
        const fragment = document.createElement('div');
        const size = Math.random() * 30 + 5; // Smaller, more numerous
        fragment.className = 'absolute opacity-20 pointer-events-none';
        fragment.style.width = `${size}px`;
        fragment.style.height = `${size}px`;
        fragment.style.left = `${Math.random() * 100}%`;
        fragment.style.top = `${Math.random() * 100}%`;
        const randomColor = `hsl(${Math.random() * 360}, 80%, ${60 + Math.random() * 20}%)`;
        fragment.style.backgroundColor = randomColor;
        fragment.style.clipPath = Math.random() > 0.5 ? 
            `polygon(${Math.random()*20}% 0%, ${80+Math.random()*20}% ${Math.random()*30}%, ${100-Math.random()*20}% 100%, ${Math.random()*30}% ${80+Math.random()*20}%)` :
            `circle(${30 + Math.random()*20}% at ${Math.random()*100}% ${Math.random()*100}%)`;
        fragment.style.transform = `rotate(${Math.random() * 360}deg) skew(${Math.random()*30-15}deg, ${Math.random()*30-15}deg)`;
        fragment.style.zIndex = '1'; // Above background, below text/passages
        sceneElement.appendChild(fragment);
        motion.animate(fragment,
            {
                opacity: [0, 0.1 + Math.random() * 0.2, 0],
                scale: [0.3, 1 + Math.random()*0.5, 0.3],
                x: (Math.random() - 0.5) * (80 + Math.random() * 150),
                y: (Math.random() - 0.5) * (80 + Math.random() * 150),
                rotate: `+=${(Math.random()-0.5) * 720}`,
                filter: ['blur(0px)', `blur(${Math.random()*3}px)`, 'blur(0px)']
            },
            { duration: Math.random() * 10 + 8, repeat: Infinity, repeatType: "mirror", delay: Math.random() * 3 }
        );
    }

    let lineIntervalId = null;
    function drawDynamicLine() {
        if(!svgLines) return;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const x1 = Math.random() * window.innerWidth;
        const y1 = Math.random() * window.innerHeight;
        const x2 = Math.random() * window.innerWidth;
        const y2 = Math.random() * window.innerHeight;
        const cx1 = Math.random() * window.innerWidth;
        const cy1 = Math.random() * window.innerHeight;
        const cx2 = Math.random() * window.innerWidth;
        const cy2 = Math.random() * window.innerHeight;

        line.setAttribute('d', `M${x1},${y1} C${cx1},${cy1} ${cx2},${cy2} ${x2},${y2}`);
        line.setAttribute('class', 'rhizome-line');
        line.style.stroke = `hsla(${Math.random() * 360}, 100%, 70%, 0.4)`; // Lowered opacity slightly
        line.style.strokeWidth = `${Math.random() * 1.5 + 0.5}px`; // Varied stroke width
        svgLines.appendChild(line);

        const length = line.getTotalLength();
        motion.animate(line, {
            strokeDasharray: [`0 ${length}`, `${length*0.3} ${length*0.7}`, `${length} ${length}`, `${length*0.3} ${length*0.7}`, `0 ${length}`],
            opacity: [0, 0.8, 0.8, 0.4, 0]
        }, {
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "circInOut" // Changed easing
        });
        
        setTimeout(() => { 
             if(svgLines && svgLines.contains(line)) svgLines.removeChild(line);
        }, (Math.random() * 6 + 10) * 1000);
    }
    lineIntervalId = setInterval(drawDynamicLine, 600 + Math.random()*600); // More frequent lines
    for(let i=0; i<8; i++) drawDynamicLine(); // Initial burst of lines

    return () => {
        if (lineIntervalId) clearInterval(lineIntervalId);
        clearScreenEffect(); // Ensure effects are cleared when leaving scene
    };
}
