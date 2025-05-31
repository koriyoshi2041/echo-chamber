import * as framerMotion from 'https://esm.run/framer-motion';

const motion = framerMotion;
const globalEffectsOverlay = document.getElementById('global-effects-overlay');


let activeEffectCleanups = new Map();

export function applyScreenEffect(effectType, duration = 1000, options = {}) {
    if (!globalEffectsOverlay) return () => {};


    if (activeEffectCleanups.has(effectType)) {
        activeEffectCleanups.get(effectType)();
    }

    let cleanupFunction = () => {};

    switch (effectType) {
        case 'subtleGlitch': {
            const glitchDiv = document.createElement('div');
            glitchDiv.className = 'glitch-overlay'; // Basic glitch line styling from style.css
            for (let i = 0; i < 5; i++) { // Fewer lines for subtle effect
                const line = document.createElement('div');
                line.className = 'glitch-line';
                line.style.setProperty('--glitch-y-start', `${Math.random() * 100}vh`);
                line.style.setProperty('--glitch-y-mid', `${Math.random() * 100}vh`);
                line.style.setProperty('--glitch-y-end', `${Math.random() * 100}vh`);
                line.style.setProperty('--glitch-color', `hsla(${Math.random()*360}, 100%, 70%, 0.3)`);
                line.style.setProperty('--glitch-color-alt', `hsla(${Math.random()*360}, 100%, 70%, 0.2)`);
                line.style.animationDuration = `${Math.random() * 0.3 + 0.1}s`;
                glitchDiv.appendChild(line);
            }
            globalEffectsOverlay.appendChild(glitchDiv);
            cleanupFunction = () => {
                motion.animate(glitchDiv, { opacity: 0 }, { duration: 0.3, onComplete: () => glitchDiv.remove() });
            };
            break;
        }
        case 'transitionGlitch': { // More intense glitch
            const glitchDiv = document.createElement('div');
            glitchDiv.className = 'glitch-overlay';
             for (let i = 0; i < 15; i++) {
                const line = document.createElement('div');
                line.className = 'glitch-line';
                line.style.setProperty('--glitch-y-start', `${Math.random() * 100}vh`);
                line.style.setProperty('--glitch-y-mid', `${Math.random() * 100}vh`);
                line.style.setProperty('--glitch-y-end', `${Math.random() * 100}vh`);
                line.style.setProperty('--glitch-x-start', `${(Math.random()-0.5)*20}px`);
                line.style.setProperty('--glitch-x-mid', `${(Math.random()-0.5)*30}px`);
                line.style.setProperty('--glitch-x-end', `${(Math.random()-0.5)*20}px`);
                line.style.setProperty('--glitch-color', `hsla(${Math.random()*360}, 100%, 60%, 0.6)`);
                line.style.setProperty('--glitch-color-alt', `hsla(${Math.random()*360}, 100%, 50%, 0.5)`);
                line.style.animationDuration = `${Math.random() * 0.1 + 0.05}s`;
                glitchDiv.appendChild(line);
            }
            globalEffectsOverlay.appendChild(glitchDiv);
            cleanupFunction = () => {
                motion.animate(glitchDiv, { opacity: 0 }, { duration: 0.2, onComplete: () => glitchDiv.remove() });
            };
            break;
        }
        case 'screenTear': {
            const tearContainer = document.createElement('div');
            tearContainer.className = 'screen-effect-overlay';
            const numStrips = options.numStrips || 10;
            const stripHeight = options.stripHeight || (window.innerHeight / numStrips);
            const maxOffset = options.maxOffset || 20;

            for (let i = 0; i < numStrips; i++) {
                const strip = document.createElement('div');
                strip.className = 'bwo-screen-tear-strip';
                strip.style.height = `${stripHeight}px`;
                strip.style.top = `${i * stripHeight}px`;
                strip.style.setProperty('--random-offset', `${(Math.random() - 0.5) * maxOffset}px`);
                strip.style.animationDelay = `${Math.random() * 0.1}s`;
                
                const contentClone = document.createElement('div');
                contentClone.style.backgroundImage = `url(${document.documentElement.style.backgroundImage || getComputedStyle(document.body).backgroundImage})`; // This is tricky for dynamic content.
                contentClone.style.backgroundPosition = `0 -${i * stripHeight}px`; // This needs real screen capture or canvas for accuracy
                

                const gameWorldBg = document.getElementById('game-world').style.backgroundImage;
                if (gameWorldBg) {
                    contentClone.style.backgroundImage = gameWorldBg;
                    contentClone.style.backgroundSize = document.getElementById('game-world').style.backgroundSize || 'cover';
                    contentClone.style.backgroundPosition = `center -${i * stripHeight}px`;
                } else {
                    contentClone.style.backgroundColor = `hsl(${i * (360/numStrips)}, 50%, 30%)`; // Fallback
                }
                strip.appendChild(contentClone);
                tearContainer.appendChild(strip);
            }
            globalEffectsOverlay.appendChild(tearContainer);
            cleanupFunction = () => tearContainer.remove();
            break;
        }
        case 'pixelation': {
            const pixelOverlay = document.createElement('div');
            pixelOverlay.className = 'bwo-pixelation-overlay screen-effect-overlay';
            const cols = options.cols || 40;
            const rows = options.rows || 30;
            pixelOverlay.style.setProperty('--pixel-cols', cols);
            pixelOverlay.style.setProperty('--pixel-rows', rows);

            for (let i = 0; i < cols * rows; i++) {
                const pixel = document.createElement('div');
                pixel.style.setProperty('--h', Math.random() * 360);
                pixel.style.animationDelay = `${Math.random() * 0.2}s`;
                pixelOverlay.appendChild(pixel);
            }
            globalEffectsOverlay.appendChild(pixelOverlay);
            cleanupFunction = () => pixelOverlay.remove();
            break;
        }
         case 'colorPulse': { // Renamed from bwo-color-burst for clarity
            const colorOverlay = document.createElement('div');
            colorOverlay.className = 'bwo-color-burst-overlay screen-effect-overlay';
            colorOverlay.style.animationDuration = `${(options.interval || 200) / 1000 * 4}s`; // Ensure full cycle matches roughly
            globalEffectsOverlay.appendChild(colorOverlay);
            cleanupFunction = () => colorOverlay.remove();
            break;
        }
        case 'scanlines': {
            const scanlinesOverlay = document.createElement('div');
            scanlinesOverlay.className = 'bwo-scanlines-overlay screen-effect-overlay';
            globalEffectsOverlay.appendChild(scanlinesOverlay);
            cleanupFunction = () => scanlinesOverlay.remove();
            break;
        }
        case 'bwoSuccessVision': {
            const successOverlay = document.createElement('div');
            successOverlay.className = 'screen-effect-overlay';
            successOverlay.style.mixBlendMode = 'difference'; // Example effect
            successOverlay.style.backgroundColor = 'var(--color-accent7)';
            successOverlay.style.opacity = '0'; // Start transparent
            
            const dataStream = document.createElement('div'); // Abstract data stream
            dataStream.style.position = 'absolute';
            dataStream.style.inset = '0';
            dataStream.style.overflow = 'hidden';
            dataStream.style.opacity = '0';
            for(let i=0; i<30; i++) {
                const p = document.createElement('p');
                p.textContent = Array(50).fill(0).map(() => Math.random() > 0.5 ? '1' : '0').join('');
                p.style.color = `hsla(${Math.random()*360}, 70%, 80%, 0.7)`;
                p.style.fontSize = `${Math.random()*0.5 + 0.5}rem`;
                p.style.position = 'absolute';
                p.style.whiteSpace = 'nowrap';
                p.style.left = `${Math.random()*100}%`;
                p.style.top = `${Math.random()*100}%`;
                motion.animate(p, {y: [Math.random()*100+100, -200 - Math.random()*100]}, {duration: Math.random()*5+5, repeat: Infinity, delay: Math.random()*5, ease:'linear'});
                dataStream.appendChild(p);
            }
            successOverlay.appendChild(dataStream);
            
            document.getElementById('game-world').style.filter = 'invert(1) hue-rotate(180deg) contrast(1.2)';
            globalEffectsOverlay.appendChild(successOverlay);
            motion.animate(successOverlay, {opacity: 0.15}, {duration:1});
            motion.animate(dataStream, {opacity: 0.3}, {duration:1, delay:0.5});

            cleanupFunction = () => {
                document.getElementById('game-world').style.filter = '';
                successOverlay.remove();
            };
            break;
        }
        case 'sceneDistortion': { // A persistent, subtle distortion
            const gameWorld = document.getElementById('game-world');
            gameWorld.classList.add('scene-distortion-effect');
            cleanupFunction = () => {
                gameWorld.classList.remove('scene-distortion-effect');
            };
            break;
        }
    }

    if (duration) {
        setTimeout(() => {
            cleanupFunction();
            activeEffectCleanups.delete(effectType);
        }, duration);
    }
    
    activeEffectCleanups.set(effectType, cleanupFunction);
    return cleanupFunction; // Return cleanup in case manual clearing is needed
}

export function clearScreenEffect(effectType = null) {
    if (effectType && activeEffectCleanups.has(effectType)) {
        activeEffectCleanups.get(effectType)();
        activeEffectCleanups.delete(effectType);
    } else if (!effectType) { // Clear all
        activeEffectCleanups.forEach(cleanup => cleanup());
        activeEffectCleanups.clear();
        if(globalEffectsOverlay) globalEffectsOverlay.innerHTML = ''; // Brute force clear remaining DOM
        document.getElementById('game-world').style.filter = ''; // Reset game world filter
        document.getElementById('game-world').classList.remove('scene-distortion-effect');
    }
}


export function createParticleExplosion(parentElement, originRect, text, color, motionInstance, count = 10, particleClassName = 'symbol-fragment-particle') {
    const parentRect = parentElement.getBoundingClientRect();
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('span');
        particle.textContent = text.length > 1 ? text[Math.floor(Math.random() * text.length)] : text;
        particle.className = particleClassName;
        particle.style.color = color;
        particle.style.position = 'absolute';
        particle.style.left = `${(originRect.left - parentRect.left) + originRect.width / 2}px`;
        particle.style.top = `${(originRect.top - parentRect.top) + originRect.height / 2}px`;
        particle.style.opacity = '1';
        parentElement.appendChild(particle);

        motionInstance.animate(particle, {
            x: (Math.random() - 0.5) * (80 + Math.random() * 100),
            y: (Math.random() - 0.5) * (80 + Math.random() * 100),
            scale: [1, 0.2 + Math.random() * 0.3],
            rotate: (Math.random() - 0.5) * 720,
            opacity: [1, 0],
            filter: ['blur(0px)', `blur(${Math.random()*3}px)`]
        }, {
            duration: 0.5 + Math.random() * 0.5,
            ease: "easeOut",
            delay: Math.random() * 0.1,
            onComplete: () => particle.remove()
        });
    }
}

export function createDragTrail(draggedElement, containerElement, motionInstance, color) {
    let lastPos = { x: parseFloat(draggedElement.style.left), y: parseFloat(draggedElement.style.top) };
    const trailInterval = setInterval(() => {
        const currentPos = { x: parseFloat(draggedElement.style.left), y: parseFloat(draggedElement.style.top) };
        const dx = currentPos.x - lastPos.x;
        const dy = currentPos.y - lastPos.y;
        if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return; // Don't create if not moving much

        lastPos = currentPos;

        const particle = document.createElement('div');
        particle.className = 'symbol-trail-particle';
        particle.style.backgroundColor = color;
        particle.style.opacity = '0.7';
        particle.style.left = `${currentPos.x + draggedElement.offsetWidth / 2 - 4}px`; // Centered
        particle.style.top = `${currentPos.y + draggedElement.offsetHeight / 2 - 4}px`;
        containerElement.appendChild(particle);

        motionInstance.animate(particle, {
            scale: [1, 0],
            opacity: [0.7, 0],
            x: (Math.random() - 0.5) * 20,
            y: (Math.random() - 0.5) * 20
        }, {
            duration: 0.3 + Math.random() * 0.3,
            ease: 'easeOut',
            onComplete: () => particle.remove()
        });
    }, 50); // Create particle every 50ms if moving

    return () => clearInterval(trailInterval); // Return cleanup function
}
