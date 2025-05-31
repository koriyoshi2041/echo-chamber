import { theatreTexts, bwoTexts, getRandomText } from '../game_texts.js';
import { applyScreenEffect, clearScreenEffect, createParticleExplosion, createDragTrail } from '../utils/visual_effects.js';

export async function initSymbolTheatre(container, loadSceneCallback, gameUtils, params = {}) {
    const { motion, showDynamicPopup } = gameUtils; // applyScreenEffect and clearScreenEffect are also in gameUtils
    const sceneId = `theatre-${Date.now()}`;

    container.innerHTML = `
        <div id="${sceneId}" class="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-4 text-center">
            <!-- Philosophical background layers -->
            <div class="theatre-void-layer absolute inset-0 z-0"></div>
            <div class="theatre-fragments-layer absolute inset-0 z-0"></div>
            <div class="theatre-meaning-decay-layer absolute inset-0 z-0"></div>
            <div class="absolute inset-0 rhizome-noise-overlay opacity-10 z-0"></div>
            
            <div class="relative z-10">
                <h1 class="text-3xl md:text-5xl font-bold mb-4 text-[var(--color-accent2)] filter-neon-glow-cyan animate-pulse">符号剧场与意义的废墟</h1>
                <p class="text-md md:text-xl text-[var(--color-text-secondary)] mb-6 max-w-2xl">在此，符号舞蹈，意义消解。你的互动只会加剧这场荒诞的表演。拖拽、点击、尝试瓦解。</p>
            </div>

            <div id="symbol-display" class="w-full max-w-3xl h-64 md:h-96 relative p-2 md:p-4 overflow-hidden z-10 touch-none">
            </div>
            
            <div class="relative z-10 mt-6 flex flex-wrap justify-center gap-2 md:gap-4 items-center">
                <button id="interact-btn" class="text-sm md:text-base">触发混乱</button>
                <input type="text" id="absurd-input" placeholder="输入无用之词..." class="text-sm md:text-base w-32 md:w-auto">
                <button id="bwo-attempt-btn" class="text-sm md:text-base filter-neon-glow-green">尝试: 无器官化</button>
                <button id="to-rhizome-btn" class="text-sm md:text-base mt-2 md:mt-0">逃回迷宫</button>
            </div>
        </div>
    `;

    const symbolDisplay = container.querySelector('#symbol-display');
    const interactButton = container.querySelector('#interact-btn');
    const toRhizomeButton = container.querySelector('#to-rhizome-btn');
    const absurdInput = container.querySelector('#absurd-input');
    const bwoAttemptButton = container.querySelector('#bwo-attempt-btn');
    
    // Background layer references for interactive effects
    const voidLayer = container.querySelector('.theatre-void-layer');
    const fragmentsLayer = container.querySelector('.theatre-fragments-layer');
    const meaningDecayLayer = container.querySelector('.theatre-meaning-decay-layer');
    
    const documentMouseUpListeners = new Set();
    const documentMouseMoveListeners = new Set();
    let isBwoActive = false;
    let bwoEffectCleanup = null;

    const symbols = ['∑', '∆', '◊', '≈', '∞', 'א', '↯', '⁈', '⁂', '∮', '∯', '∰', '∅', '∴', '∵', '¬', '⇔', '∀', '∃', '¤', '¶', '§', '⁂', '※', '‽'];
    const existingTextsForFragments = [
        "意义在滑移...", "编码的幽灵", "欲望的轨迹是断裂的", "此地无银三百两",
        "The function is undefined at this point.", "Error 404: Meaning not found.",
        "重复，但并非相同。", "解构一切！", "荒诞是自由的另一种形态。", "你的输入毫无意义，但值得赞赏。",
        "符号正在嘲笑你。", "为什么不试试别的？或者什么都不试。", "生成，即变化。", "意义的空洞回响。"
    ];
    
    function makeSymbolDraggable(symEl) {
        let isDragging = false;
        let offsetX, offsetY;
        let trailCleanup = null;

        const onMouseDown = (e) => {
            if (isBwoActive || e.button !== 0) return;
            e.preventDefault();
            isDragging = true;
            offsetX = e.clientX - symEl.getBoundingClientRect().left;
            offsetY = e.clientY - symEl.getBoundingClientRect().top;
            symEl.style.cursor = 'grabbing';
            symEl.style.zIndex = '100';
            motion.animate(symEl, { scale: [1, 1.3], filter: ['drop-shadow(0 0 10px ' + symEl.style.color + ')', 'drop-shadow(0 0 20px ' + symEl.style.color + ')'] }, { duration: 0.1 });
            
            trailCleanup = createDragTrail(symEl, symbolDisplay, motion, symEl.style.color);

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            documentMouseMoveListeners.add(onMouseMove);
            documentMouseUpListeners.add(onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;
            const parentRect = symbolDisplay.getBoundingClientRect();
            let x = e.clientX - parentRect.left - offsetX;
            let y = e.clientY - parentRect.top - offsetY;
            
            x = Math.max(0, Math.min(x, parentRect.width - symEl.offsetWidth));
            y = Math.max(0, Math.min(y, parentRect.height - symEl.offsetHeight));
            
            symEl.style.left = `${x}px`;
            symEl.style.top = `${y}px`;
        };

        const onMouseUp = () => {
            if (isDragging) {
                isDragging = false;
                symEl.style.cursor = 'grab';
                symEl.style.zIndex = 'auto';
                motion.animate(symEl, { scale: [1.3, 1], filter: ['drop-shadow(0 0 20px ' + symEl.style.color + ')', 'drop-shadow(0 0 8px ' + symEl.style.color + ')'] }, { duration: 0.1 });
                showDynamicPopup(getRandomText(theatreTexts.dragSymbol), { animationType: 'fadeInUp', duration: 1500, animationDelay: 500 });
                
                if (trailCleanup) trailCleanup();
                
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                documentMouseMoveListeners.delete(onMouseMove);
                documentMouseUpListeners.delete(onMouseUp);
            }
        };
        symEl.addEventListener('mousedown', onMouseDown);
    }

    function addRandomElement() {
        if (symbolDisplay.children.length > 30) return; // Performance cap

        if (Math.random() < 0.7) { 
            const sym = document.createElement('span');
            const initialSymbolText = symbols[Math.floor(Math.random() * symbols.length)];
            sym.textContent = initialSymbolText;
            sym.className = 'draggable-symbol absolute text-2xl md:text-5xl opacity-0 select-none'; // Start opacity 0
            const symbolColor = `hsl(${Math.random() * 360}, 100%, 75%)`;
            sym.style.color = symbolColor;
            sym.style.left = `${Math.random() * 80 + 10}%`;
            sym.style.top = `${Math.random() * 80 + 10}%`;
            const initialRotation = (Math.random() - 0.5) * 20; // Less extreme initial rotation
            const initialScale = Math.random() * 0.4 + 0.8;
            sym.style.transform = `rotate(${initialRotation}deg) scale(${initialScale})`;
            sym.style.textShadow = `0 0 5px ${symbolColor}, 0 0 10px #ffffffaa`;
            symbolDisplay.appendChild(sym);
            makeSymbolDraggable(sym);

            motion.animate(sym, {
                opacity: [0, 0.6 + Math.random() * 0.3],
                scale: [0.1, initialScale],
                rotate: [initialRotation + (Math.random()-0.5) * 90, initialRotation],
                x: (Math.random() - 0.5) * 30,
                y: (Math.random() - 0.5) * 30,
            }, { duration: Math.random() * 1 + 0.5, ease: "easeOut" });
            

            motion.animate(sym, {
                scale: [initialScale, initialScale * (1 + (Math.random() - 0.5) * 0.1)],
                filter: [`hue-rotate(0deg)`, `hue-rotate(${(Math.random()-0.5)*20}deg)`]
            }, {duration: Math.random() * 5 + 5, repeat: Infinity, repeatType: 'mirror', delay: Math.random()});


            sym.addEventListener('click', (e) => {
                if (isBwoActive || e.target !== sym || sym.dataset.deconstructing === 'true') return;
                sym.dataset.deconstructing = 'true';

                const originalText = sym.textContent;
                const rect = sym.getBoundingClientRect();
                const color = sym.style.color;
                
                // Background responds to symbol deconstruction
                if (voidLayer) {
                    motion.animate(voidLayer, {
                        filter: ['blur(0px) contrast(1)', 'blur(2px) contrast(1.3)', 'blur(0px) contrast(1)'],
                        opacity: [1, 0.7, 1]
                    }, { duration: 0.5 });
                }
                
                if (fragmentsLayer) {
                    motion.animate(fragmentsLayer, {
                        transform: ['scale(1)', 'scale(1.02)', 'scale(1)'],
                        filter: ['hue-rotate(0deg)', `hue-rotate(${Math.random() * 30 - 15}deg)`, 'hue-rotate(0deg)']
                    }, { duration: 0.4 });
                }

                motion.animate(sym, [
                    { opacity: 1, filter: 'hue-rotate(0deg) saturate(1) contrast(1) blur(0px)', transform: sym.style.transform + ' translateX(0px)' },
                    { opacity: 0.8, filter: 'hue-rotate(90deg) saturate(5) contrast(2) blur(1px)', transform: sym.style.transform + ' translateX(-10px)' },
                    { opacity: 1, filter: 'hue-rotate(-90deg) saturate(3) contrast(1.5) blur(0.5px)', transform: sym.style.transform + ' translateX(10px)' },
                    { opacity: 0, filter: 'hue-rotate(0deg) saturate(1) contrast(1) blur(5px) grayscale(1)', transform: sym.style.transform + ' scale(0.3)' }
                ], { duration: 0.3, ease: "circIn" });

                createParticleExplosion(symbolDisplay, rect, originalText, color, motion, 10, 'symbol-fragment-particle');

                const newSymbolText = symbols[Math.floor(Math.random() * symbols.length)];
                setTimeout(() => {
                    sym.textContent = newSymbolText;
                    const newScale = Math.random() * 0.5 + 0.7;
                    sym.style.transform = `rotate(${(Math.random()-0.5)*10}deg) scale(${newScale})`;
                    motion.animate(sym, { opacity: [0, 0.5 + Math.random() * 0.4], scale: [0.3, newScale], filter: ['blur(5px)', 'blur(0px)'] }, { duration: 0.25 })
                        .then(() => delete sym.dataset.deconstructing);
                }, 300);
                showDynamicPopup(getRandomText(theatreTexts.clickSymbol).replace('{symbol}', originalText), {animationType: 'glitchIn', color: color, duration:1500, animationDelay:500});

                const clickBurst = document.createElement('div');
                clickBurst.style.position = 'absolute';
                clickBurst.style.left = `${rect.left - symbolDisplay.getBoundingClientRect().left + rect.width / 2}px`;
                clickBurst.style.top = `${rect.top - symbolDisplay.getBoundingClientRect().top + rect.height / 2}px`;
                clickBurst.style.width = '10px';
                clickBurst.style.height = '10px';
                clickBurst.style.borderRadius = '50%';
                clickBurst.style.backgroundColor = color;
                clickBurst.style.transform = 'translate(-50%, -50%) scale(0)';
                clickBurst.style.pointerEvents = 'none';
                symbolDisplay.appendChild(clickBurst);
                motion.animate(clickBurst, { scale: [0, 8 + Math.random()*8], opacity: [1, 0] }, { duration: 0.3, ease: 'easeOut', onComplete: () => clickBurst.remove() });
            });

        } else { 
            const txtEl = document.createElement('p');
            txtEl.textContent = existingTextsForFragments[Math.floor(Math.random() * existingTextsForFragments.length)].substring(0, Math.floor(Math.random()*20)+10) + (Math.random() > 0.3 ? "..." : "");
            txtEl.className = 'absolute text-xs md:text-sm opacity-0 select-none'; // Start opacity 0
            txtEl.style.color = `hsl(${Math.random() * 360}, 50%, 70%)`;
            txtEl.style.left = `${Math.random() * 70 + 15}%`;
            txtEl.style.top = `${Math.random() * 70 + 15}%`;
            txtEl.style.transform = `rotate(${(Math.random()-0.5) * 30}deg) skew(${(Math.random()-0.5)*15}deg)`;
            txtEl.style.fontFamily = ['monospace', 'cursive', 'fantasy'][Math.floor(Math.random()*3)];
            symbolDisplay.appendChild(txtEl);
             motion.animate(txtEl, {
                opacity: [0, 0.2 + Math.random() * 0.2, 0],
                 x: (Math.random() - 0.5) * (20 + Math.random() * 20),
                y: (Math.random() - 0.5) * (20 + Math.random() * 20),
                filter: ['blur(2px)', 'blur(0px)', 'blur(2px)']
            }, { duration: Math.random() * 10 + 8, repeat: Infinity, repeatType: 'mirror', delay: Math.random() * 1.5 });
            
            txtEl.addEventListener('click', () => {
                if (isBwoActive) return;
                const oldText = txtEl.textContent;
                if (Math.random() > 0.5) {
                    txtEl.textContent = oldText.split('').sort(() => 0.5 - Math.random()).join('');
                } else {
                    txtEl.textContent = existingTextsForFragments[Math.floor(Math.random() * existingTextsForFragments.length)].substring(0, Math.floor(Math.random()*20)+10) + (Math.random() > 0.3 ? "..." : "");
                }
                motion.animate(txtEl, { scale: [1, 1.4, 1], opacity: [txtEl.style.opacity || 0.4 ,1, txtEl.style.opacity || 0.4], filter: ['blur(0px)', 'blur(3px)', 'blur(0px)']}, {duration:0.3});
                showDynamicPopup(getRandomText(theatreTexts.clickTextFragment), { color: txtEl.style.color, animationType: 'fadeInUp', duration:1500, animationDelay:500 });
            });
        }
    }

    for (let i = 0; i < 12; i++) addRandomElement(); // Initial elements

    interactButton.addEventListener('click', () => {
        if (isBwoActive) return;
        
        // Intense background reaction to chaos
        if (voidLayer) {
            motion.animate(voidLayer, {
                filter: ['blur(0px) contrast(1)', 'blur(5px) contrast(2)', 'blur(1px) contrast(1.2)'],
                transform: ['scale(1)', 'scale(1.05)', 'scale(1.01)']
            }, { duration: 1.2 });
        }
        
        if (fragmentsLayer) {
            motion.animate(fragmentsLayer, {
                opacity: [0.6, 1, 0.8],
                filter: ['hue-rotate(0deg)', 'hue-rotate(45deg)', 'hue-rotate(10deg)'],
                transform: ['scale(1)', 'scale(1.1)', 'scale(1.02)']
            }, { duration: 1.0 });
        }
        
        if (meaningDecayLayer) {
            motion.animate(meaningDecayLayer, {
                opacity: [0.15, 0.4, 0.2],
                filter: ['blur(2px)', 'blur(0px)', 'blur(3px)']
            }, { duration: 0.8 });
        }
        
        const allElements = Array.from(symbolDisplay.querySelectorAll('span, p'));
        allElements.forEach(el => {
            motion.animate(el, {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
                rotate: `+=${(Math.random() - 0.5) * 360}` ,
                opacity: Math.random() * 0.4 + 0.1, // More drastic opacity change
                scale: Math.random() * 0.6 + 0.3, // More drastic scale change
                filter: [`blur(${Math.random()*5}px)`, `hue-rotate(${(Math.random()-0.5)*180}deg)`]
            }, { duration: 0.8, type: "spring", stiffness: 150, damping: 15 });
        });
        if (Math.random() < 0.9) setTimeout(addRandomElement, 200 + Math.random()*200);
        showDynamicPopup(getRandomText(theatreTexts.chaosButton), {animationType:'glitchIn', color:'var(--color-accent4)', duration:1500, animationDelay:500});
        gameUtils.applyScreenEffect('subtleGlitch', 800);
    });
    
    absurdInput.addEventListener('input', (e) => {
        if (isBwoActive) { e.target.value = ""; return; }
        
        // Subtle background response to input
        if (meaningDecayLayer && e.target.value.length > 0) {
            motion.animate(meaningDecayLayer, {
                opacity: [0.15, 0.25, 0.15],
                filter: ['blur(2px)', 'blur(1px)', 'blur(2px)']
            }, { duration: 0.3 });
        }
        
        if(e.target.value.length > 0 && e.target.value.length % (Math.floor(Math.random()*3)+1) === 0) {
             const newSymbol = document.createElement('span');
             newSymbol.textContent = e.target.value.slice(-1); 
             newSymbol.className = 'absolute text-5xl pointer-events-none'; // Larger
             const inputColor = `var(--color-accent${Math.ceil(Math.random()*3)})`;
             newSymbol.style.color = inputColor;
             newSymbol.style.left = `${Math.random() * 70 + 15}%`;
             newSymbol.style.top = `${Math.random() * 70 + 15}%`;
             newSymbol.style.textShadow = `0 0 15px ${inputColor}, 0 0 5px #fff`;
             newSymbol.style.transform = `rotate(${(Math.random()-0.5)*45}deg)`;
             symbolDisplay.appendChild(newSymbol);
             motion.animate(newSymbol, {
                 opacity: [1, 0],
                 scale: [0.5, 4 + Math.random()*4], // Larger expansion
                 y: [0, -150 - Math.random()*150],
                 x: (Math.random()-0.5) * 100,
                 filter: ['blur(0px)', 'blur(10px)']
             }, { duration: 0.8 + Math.random()*0.5, ease: "easeIn", onComplete: () => newSymbol.remove() });
        }
        if(e.target.value.length > (8 + Math.floor(Math.random()*5))) { // Shorter limit
            showDynamicPopup(getRandomText(theatreTexts.absurdInput).replace('{input}', e.target.value), {animationType:'typewriter', color:'var(--color-accent6)', duration:2000, animationDelay:800});
            e.target.value = ""; 
        }
    });

    bwoAttemptButton.addEventListener('click', async () => {
        if (isBwoActive || container.querySelector('.bwo-active-indicator')) return;
        isBwoActive = true;
        bwoAttemptButton.disabled = true;
        bwoAttemptButton.classList.add('bwo-active-indicator');

        showDynamicPopup(getRandomText(bwoTexts.preActivation), {animationType:'glitchIn', color:'var(--color-accent5)', duration:2500, animationDelay:500, position:'top'});


        const effectDuration = 4000; // Total duration of BwO attempt visuals
        const effectCleanups = [];
        effectCleanups.push(gameUtils.applyScreenEffect('screenTear', effectDuration, { stripHeight: 20, maxOffset: 15 }));
        effectCleanups.push(gameUtils.applyScreenEffect('pixelation', effectDuration, { cols: 30, rows: 20 }));
        effectCleanups.push(gameUtils.applyScreenEffect('colorPulse', effectDuration, { interval: 150 }));
        effectCleanups.push(gameUtils.applyScreenEffect('scanlines', effectDuration));
        

        const uiElementsToDistort = [interactButton, toRhizomeButton, absurdInput, bwoAttemptButton];
        const originalTexts = uiElementsToDistort.map(el => el.tagName === 'INPUT' ? el.placeholder : el.textContent);
        const distortionChars = "!@#$%^&*()_+=-`~[]{}|;:',./<>? Deleuze Chaos BwO ";
        let textDistortionInterval = setInterval(() => {
            uiElementsToDistort.forEach(el => {
                let original = el.tagName === 'INPUT' ? el.placeholder : el.textContent;
                if(original.length == 0) original = "ERROR"; // Handle empty string case
                let distorted = "";
                for(let i=0; i < original.length; i++) {
                    distorted += Math.random() > 0.3 ? original[i] : distortionChars[Math.floor(Math.random()*distortionChars.length)];
                }
                if(el.tagName === 'INPUT') el.placeholder = distorted; else el.textContent = distorted;
                motion.set(el, { x: (Math.random()-0.5)*5, y: (Math.random()-0.5)*5, rotate:(Math.random()-0.5)*3 });
            });
        }, 100);
        effectCleanups.push(() => {
            clearInterval(textDistortionInterval);
            uiElementsToDistort.forEach((el, i) => {
                if(el.tagName === 'INPUT') el.placeholder = originalTexts[i]; else el.textContent = originalTexts[i];
                motion.set(el, {x:0, y:0, rotate:0});
            });
        });
        

        motion.animate(symbolDisplay, {
            filter: ['blur(0px) contrast(1) saturate(1)', 'blur(8px) contrast(3) saturate(5) hue-rotate(90deg)', 'blur(0px) contrast(1) saturate(1)'],
            borderColor: [symbolDisplay.style.borderColor, 'var(--color-accent4)', symbolDisplay.style.borderColor]
        }, {duration: effectDuration/2, repeat: 1, repeatType: "mirror", ease: "easeInOut"});


        setTimeout(() => showDynamicPopup(getRandomText(bwoTexts.duringBWO), {animationType:'glitchIn', color:'var(--color-accent5)', duration:2000, animationDelay:1000, position:'center'}), effectDuration/3);


        const bwoSuccess = Math.random() < 0.4; // 40% chance of success

        setTimeout(() => {
            effectCleanups.forEach(cleanup => cleanup()); // Clear all temporary visual effects
            
            if (bwoSuccess) {
                showDynamicPopup(getRandomText(bwoTexts.successBWO), {animationType:'fadeInUp', color:'var(--color-accent2)', duration:3000, animationDelay:1000, position:'top'});

                bwoEffectCleanup = gameUtils.applyScreenEffect('bwoSuccessVision', null); // Persists until scene change or explicit clear

                absurdInput.placeholder = "BwO 感知中...";
                interactButton.textContent = "重构现实";

            } else {
                showDynamicPopup(getRandomText(bwoTexts.failureBWO), {animationType:'glitchIn', color:'var(--color-accent4)', duration:3000, animationDelay:1000, position:'bottom'});

                const mainSceneDiv = container.querySelector(`#${sceneId}`);
                motion.animate(mainSceneDiv, { rotate: [(Math.random()-0.5)*5, 0], scale: [1.05,1] }, {duration: 0.5, type: 'spring'});
                

                uiElementsToDistort.forEach(el => {
                    motion.animate(el, {
                        x: (Math.random()-0.5)*50, 
                        y: (Math.random()-0.5)*50, 
                        rotate: (Math.random()-0.5)*45,
                        opacity: Math.random()*0.5 + 0.5
                    }, { duration: 0.3, type: 'spring', onComplete: () => motion.animate(el, {x:0,y:0,rotate:0, opacity:1}, {duration:0.2}) });
                    if(el.tagName === 'INPUT') el.value = "错误"; else if (el.textContent.length > 0) el.textContent = el.textContent.split('').reverse().join('');
                });
                setTimeout(() => { // Restore text after a bit
                     uiElementsToDistort.forEach((el, i) => {
                        if(el.tagName === 'INPUT') el.value = ""; else if (el.textContent.length > 0 && originalTexts[i]) el.textContent = originalTexts[i];
                    });
                }, 1500);
            }
            
            isBwoActive = bwoSuccess; // Only remains true on success for this demo
            if (!bwoSuccess) {
                bwoAttemptButton.disabled = false;
                bwoAttemptButton.classList.remove('bwo-active-indicator');
            }

            
        }, effectDuration);
    });


    toRhizomeButton.addEventListener('click', async () => {
        if (bwoEffectCleanup) bwoEffectCleanup(); // Clear persistent BwO effects
        gameUtils.clearScreenEffect(); // Clear any other screen effects
        gameUtils.applyScreenEffect('transitionGlitch', 800);

        await motion.animate(container.querySelector(`#${sceneId}`), { 
            opacity: [1,0], 
            filter: ['blur(0px) contrast(1)', 'blur(20px) contrast(8) hue-rotate(-120deg) opacity(0)'],
            scale: [1, 0.7]
        }, { duration: 0.6, ease: "anticipate" });
        loadSceneCallback('rhizome_labyrinth', { navigated: true });
    });

    return () => { // Cleanup function
        documentMouseUpListeners.forEach(listener => document.removeEventListener('mouseup', listener));
        documentMouseMoveListeners.forEach(listener => document.removeEventListener('mousemove', listener));
        documentMouseUpListeners.clear();
        documentMouseMoveListeners.clear();
        if (bwoEffectCleanup) bwoEffectCleanup();
        gameUtils.clearScreenEffect(); // Ensure all effects are cleared
    };
}

