import * as framerMotion from 'https://esm.run/framer-motion';
import { initRhizomeLabyrinth } from './scenes/rhizome_labyrinth.js';
import { initSymbolTheatre } from './scenes/symbol_theatre.js';
import { generalTexts, getRandomText } from './game_texts.js';
import { applyScreenEffect, clearScreenEffect } from './utils/visual_effects.js';

const motion = framerMotion;
let currentSceneCleanup = null;

const scenes = {
    'rhizome_labyrinth': initRhizomeLabyrinth,
    'symbol_theatre': initSymbolTheatre,
};

const gameWorld = document.getElementById('game-world');
const dynamicPopupContainer = document.getElementById('dynamic-popup-container');
const dynamicPopupTextElement = document.getElementById('dynamic-popup-text');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingTextElement = document.getElementById('loading-text');
const globalMessagePopup = document.getElementById('global-message-popup');
const globalMessageTextElement = document.getElementById('global-message-text');

export function showDynamicPopup(text, options = {}) {
    if (!dynamicPopupContainer || !dynamicPopupTextElement || !motion) return;

    const {
        duration = 3000,
        animationDelay = 1500, // Time text stays visible before fade out starts
        animationType = 'fadeInUp', // 'fadeInUp', 'glitchIn', 'typewriter'
        position = 'center', // 'center', 'top', 'bottom' (more can be added)
        color = 'var(--color-text-primary)',
        backgroundColor = 'var(--color-bg-main)', // Popup container background
        borderColor = 'var(--color-accent2)',
        textShadow = 'none'
    } = options;

    dynamicPopupTextElement.textContent = text;
    dynamicPopupTextElement.style.color = color;
    dynamicPopupTextElement.style.textShadow = textShadow;
    
    dynamicPopupContainer.style.backgroundColor = `${backgroundColor}E6`; // E6 for 90% opacity
    dynamicPopupContainer.style.borderColor = borderColor;
    dynamicPopupContainer.style.boxShadow = `0 0 20px ${borderColor}`;

    dynamicPopupContainer.classList.remove('hidden');
    dynamicPopupTextElement.className = 'text-center'; // Reset classes

    let inAnimation = { opacity: [0, 1], y: [-20, 0], scale: [0.8, 1] };
    let outAnimation = { opacity: [1, 0], y: [0, 20], scale: [1, 0.8] };

    switch (animationType) {
        case 'fadeInUp':
            dynamicPopupTextElement.classList.add('text-anim-fade-in-up');

            break;
        case 'glitchIn':
            dynamicPopupTextElement.classList.add('text-anim-glitch-in');
            inAnimation = { opacity: [0, 1], scale: [0.7, 1] }; // Simpler container anim
            outAnimation = { opacity: [1, 0], scale: [1, 0.7] };
            break;
        case 'typewriter':
            dynamicPopupTextElement.classList.add('text-anim-typewriter');
             inAnimation = { opacity: [0, 1]};
             outAnimation = { opacity: [1, 0]};
            break;
    }
    

    if (position === 'top') {
        dynamicPopupContainer.style.top = '10%';
        dynamicPopupContainer.style.bottom = 'auto';
    } else if (position === 'bottom') {
        dynamicPopupContainer.style.top = 'auto';
        dynamicPopupContainer.style.bottom = '10%';
    } else { // Center
        dynamicPopupContainer.style.top = '50%';
        dynamicPopupContainer.style.bottom = 'auto';
    }


    motion.animate(dynamicPopupContainer, inAnimation, { duration: 0.3 });

    setTimeout(() => {
        motion.animate(dynamicPopupContainer, outAnimation, { duration: 0.3 })
              .then(() => {
                dynamicPopupContainer.classList.add('hidden');
                dynamicPopupTextElement.className = 'text-center'; // Clean up animation classes
              });
    }, duration + animationDelay);
}

function showGlobalMessage(text, duration = 4000) {
    if (!globalMessagePopup || !globalMessageTextElement || !motion) return;
    globalMessageTextElement.textContent = text;
    globalMessagePopup.classList.remove('hidden');
    motion.animate(globalMessagePopup, { opacity: [0, 1], x: [20, 0]}, { duration: 0.4 });
    setTimeout(() => {
        motion.animate(globalMessagePopup, { opacity: [1, 0], x: [0, 20]}, { duration: 0.4 })
              .then(() => globalMessagePopup.classList.add('hidden'));
    }, duration);
}


async function loadScene(sceneName, params = {}) {
    if (currentSceneCleanup) {
        currentSceneCleanup();
        currentSceneCleanup = null;
    }
    gameWorld.innerHTML = '';
    clearScreenEffect(); // Clear any global screen effects from previous scene

    if (loadingOverlay && loadingTextElement) {
        loadingTextElement.textContent = getRandomText(generalTexts.loading);
        loadingOverlay.style.display = 'flex';
        await motion.animate(loadingOverlay, { opacity: [0, 1] }, { duration: 0.3 });
    }

    const sceneInitFn = scenes[sceneName];
    if (sceneInitFn) {
        try {

            currentSceneCleanup = await sceneInitFn(gameWorld, loadSceneCallback, { motion, showDynamicPopup, applyScreenEffect, clearScreenEffect }, params);
        } catch (error) {
            console.error(`Error loading scene ${sceneName}:`, error);
            gameWorld.innerHTML = `<p class=\"text-red-500 text-center p-8\">Error loading scene: ${sceneName}. Check console.</p>`;
        }
    } else {
        console.error(`Scene ${sceneName} not found.`);
        gameWorld.innerHTML = `<p class=\"text-red-500 text-center p-8\">Scene not found: ${sceneName}.</p>`;
    }

    if (loadingOverlay) {
        await motion.animate(loadingOverlay, { opacity: [1, 0] }, { duration: 0.3, delay: 0.2 });
        loadingOverlay.style.display = 'none';
    }
}


function loadSceneCallback(sceneName, params = {}) {
    loadScene(sceneName, params);
}

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadScene('rhizome_labyrinth');

    document.getElementById('nav-rhizome').addEventListener('click', () => loadScene('rhizome_labyrinth'));
    document.getElementById('nav-theatre').addEventListener('click', () => loadScene('symbol_theatre'));
    
    // 添加返回Echo Chamber功能
    const returnButton = document.getElementById('return-to-chamber');
    if (returnButton) {
        returnButton.addEventListener('click', () => {
            const returnURL = sessionStorage.getItem('echoChamberReturnURL') || '/';
            sessionStorage.removeItem('echoChamberReturnURL');
            window.location.href = returnURL;
        });
    }

    setInterval(() => {
        if (generalTexts.randomScreen && generalTexts.randomScreen.length > 0) {
           if (Math.random() < 0.10) { 
             showGlobalMessage(getRandomText(generalTexts.randomScreen));
           }
        }
    }, 20000);
});

