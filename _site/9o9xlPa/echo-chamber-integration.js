/**
 * Echo Chamber 集成 - 哲学游戏入口
 * 3D数字艺术装置触发器
 */

class PhilosophicalPortal {
    constructor() {
        this.isGameLoaded = false;
        this.gameContainer = null;
        this.originalContent = null;
        this.init();
    }

    init() {
        // 等待Echo Chamber加载完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createPortal());
        } else {
            this.createPortal();
        }
    }

    createPortal() {
        // 寻找Echo Chamber的标题区域
        const chamberEntrance = document.querySelector('.chamber-entrance') || 
                              document.querySelector('header') || 
                              document.body;

        // 创建3D艺术装置容器
        const portalContainer = document.createElement('div');
        portalContainer.className = 'philosophical-portal';
        portalContainer.innerHTML = `
            <div class="portal-stage">
                <div class="portal-core" role="button" tabindex="0" aria-label="进入德勒兹式哲学游戏">
                    <div class="core-geometry">
                        <div class="face face-1">∑</div>
                        <div class="face face-2">∆</div>
                        <div class="face face-3">◊</div>
                        <div class="face face-4">∞</div>
                        <div class="face face-5">※</div>
                        <div class="face face-6">⁂</div>
                    </div>
                    <div class="portal-glow"></div>
                </div>
                
                <div class="portal-text-orbit">
                    <div class="orbit-text">
                        <span>Se perdre dans une parodie ratée de jeu deleuzien.</span>
                    </div>
                </div>
                
                <div class="portal-particles"></div>
            </div>
        `;

        // 插入到标题下方
        const titleElement = chamberEntrance.querySelector('.chamber-title') || 
                           chamberEntrance.querySelector('h1');
        if (titleElement) {
            titleElement.insertAdjacentElement('afterend', portalContainer);
        } else {
            chamberEntrance.appendChild(portalContainer);
        }

        this.setupEventListeners(portalContainer);
        this.createParticles(portalContainer.querySelector('.portal-particles'));
    }

    setupEventListeners(container) {
        const portalCore = container.querySelector('.portal-core');
        
        portalCore.addEventListener('click', () => this.enterGame());
        portalCore.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.enterGame();
            }
        });

        // 鼠标悬停效果
        portalCore.addEventListener('mouseenter', () => {
            container.classList.add('portal-hover');
        });
        
        portalCore.addEventListener('mouseleave', () => {
            container.classList.remove('portal-hover');
        });
    }

    createParticles(container) {
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'portal-particle';
            particle.style.setProperty('--delay', `${i * 0.8}s`);
            particle.style.setProperty('--angle', `${i * 30}deg`);
            container.appendChild(particle);
        }
    }

    async enterGame() {
        if (this.isGameLoaded) return;
        this.isGameLoaded = true;

        // 显示loading状态
        this.showGameLoading();

        try {
            // 动态加载游戏资源
            await this.loadGameAssets();
            
            // 创建全屏游戏容器
            this.createGameOverlay();
            
            // 启动游戏
            await this.initializeGame();
            
        } catch (error) {
            console.error('Failed to load philosophical game:', error);
            this.showError('游戏启动失败，请重试');
            this.isGameLoaded = false;
        }
    }

    showGameLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'game-loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-symbol">∆</div>
                <p>正在进入德勒兹的根茎迷宫...</p>
                <p class="loading-sub">Entering the rhizomatic labyrinth...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
        this.loadingOverlay = loadingOverlay;
    }

    async loadGameAssets() {
        // 加载游戏所需的CSS和JS文件
        const stylesheetPromise = this.loadStylesheet('./9o9xlPa/style.css');
        const scriptsPromise = Promise.all([
            this.loadScript('./9o9xlPa/game_texts.js'),
            this.loadScript('./9o9xlPa/utils/visual_effects.js'),
            this.loadScript('./9o9xlPa/scenes/rhizome_labyrinth.js'),
            this.loadScript('./9o9xlPa/scenes/symbol_theatre.js'),
            this.loadScript('./9o9xlPa/main.js')
        ]);

        await Promise.all([stylesheetPromise, scriptsPromise]);
    }

    loadStylesheet(href) {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            link.onload = resolve;
            link.onerror = reject;
            document.head.appendChild(link);
        });
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    createGameOverlay() {
        // 保存原始内容
        this.originalContent = document.body.innerHTML;
        
        // 创建游戏容器
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'philosophical-game-overlay';
        this.gameContainer.className = 'game-overlay-fullscreen';
        this.gameContainer.innerHTML = `
            <div class="game-header">
                <button class="game-exit-btn" aria-label="退出游戏">
                    <span>×</span>
                </button>
                <div class="game-title">生成·坍缩 - 概念原型</div>
            </div>
            <div id="game-container" class="game-content"></div>
        `;

        document.body.appendChild(this.gameContainer);

        // 添加退出按钮功能
        this.gameContainer.querySelector('.game-exit-btn').addEventListener('click', () => {
            this.exitGame();
        });

        // ESC键退出
        this.escKeyHandler = (e) => {
            if (e.key === 'Escape') {
                this.exitGame();
            }
        };
        document.addEventListener('keydown', this.escKeyHandler);
    }

    async initializeGame() {
        // 移除loading
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
        }

        // 等待游戏主类加载
        let attempts = 0;
        while (typeof PhilosophicalGame === 'undefined' && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (typeof PhilosophicalGame !== 'undefined') {
            // 启动游戏
            const gameContent = this.gameContainer.querySelector('#game-container');
            new PhilosophicalGame(gameContent);
        } else {
            throw new Error('游戏资源加载失败');
        }
    }

    exitGame() {
        // 清理游戏资源
        if (this.gameContainer) {
            this.gameContainer.remove();
            this.gameContainer = null;
        }

        // 移除ESC监听器
        if (this.escKeyHandler) {
            document.removeEventListener('keydown', this.escKeyHandler);
            this.escKeyHandler = null;
        }

        this.isGameLoaded = false;
    }

    showError(message) {
        if (this.loadingOverlay) {
            this.loadingOverlay.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'portal-error';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 3000);
    }
}

// 等待Framer Motion加载完成后初始化
if (typeof window !== 'undefined') {
    // 检查是否在Echo Chamber环境中
    if (document.querySelector('.echo-chamber') || document.title.includes('Echo Chamber')) {
        new PhilosophicalPortal();
    }
} 