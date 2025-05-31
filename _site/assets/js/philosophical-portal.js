/**
 * Echo Chamber 集成 - 哲学游戏门户
 * 针对Netlify部署优化的版本 - 新增3D门户而不替换原有元素
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
        const chamberEntrance = document.querySelector('.chamber-entrance');
        if (!chamberEntrance) {
            console.warn('Chamber entrance not found');
            return;
        }

        // 创建3D门户容器，添加到manifesto下方
        const portalContainer = document.createElement('div');
        portalContainer.className = 'philosophical-portal';
        portalContainer.setAttribute('role', 'button');
        portalContainer.setAttribute('tabindex', '0');
        portalContainer.setAttribute('aria-label', '进入德勒兹式哲学游戏');
        
        portalContainer.innerHTML = `
            <div class="portal-stage">
                <div class="portal-core">
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

        // 添加到chamber-manifesto下方
        const manifesto = chamberEntrance.querySelector('.chamber-manifesto');
        if (manifesto) {
            manifesto.insertAdjacentElement('afterend', portalContainer);
        } else {
            // 如果没有manifesto，添加到chamber-entrance末尾
            chamberEntrance.appendChild(portalContainer);
        }

        this.setupEventListeners(portalContainer);
        this.createParticles(portalContainer.querySelector('.portal-particles'));
    }

    setupEventListeners(container) {
        const portalCore = container.querySelector('.portal-core');
        
        // 点击事件
        const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Philosophical portal activated!');
            this.enterGame();
        };

        portalCore.addEventListener('click', handleClick);
        
        // 键盘支持
        portalCore.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(e);
            }
        });

        // 悬停效果
        portalCore.addEventListener('mouseenter', () => {
            portalCore.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });

        portalCore.addEventListener('mouseleave', () => {
            portalCore.style.transform = 'translate(-50%, -50%) scale(1)';
        });
    }

    enterGame() {
        console.log('Entering philosophical game...');
        
        // 保存当前页面内容
        this.originalContent = document.body.innerHTML;
        
        // 创建游戏容器
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'philosophical-game-container';
        this.gameContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 10000;
            background: var(--primary-bg, #0f0f23);
        `;
        
        // 加载游戏iframe
        const gameFrame = document.createElement('iframe');
        gameFrame.src = '/9o9xlPa/index.html';
        gameFrame.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: var(--primary-bg, #0f0f23);
        `;
        
        // 添加返回按钮
        const backButton = document.createElement('button');
        backButton.innerHTML = '← 返回回声室';
        backButton.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            z-index: 10001;
            padding: 12px 24px;
            background: var(--glass-bg, rgba(20, 25, 45, 0.8));
            border: 1px solid var(--border-color, rgba(201, 169, 110, 0.3));
            color: var(--text-primary, #f8f6f0);
            border-radius: 30px;
            cursor: pointer;
            font-size: 14px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
        `;
        
        backButton.addEventListener('click', () => this.exitGame());
        backButton.addEventListener('mouseenter', () => {
            backButton.style.background = 'var(--accent-color, #c9a96e)';
            backButton.style.color = 'var(--primary-bg, #0f0f23)';
        });
        backButton.addEventListener('mouseleave', () => {
            backButton.style.background = 'var(--glass-bg, rgba(20, 25, 45, 0.8))';
            backButton.style.color = 'var(--text-primary, #f8f6f0)';
        });
        
        this.gameContainer.appendChild(gameFrame);
        this.gameContainer.appendChild(backButton);
        
        // 显示游戏
        document.body.appendChild(this.gameContainer);
        this.isGameLoaded = true;
        
        // 添加ESC键退出功能
        document.addEventListener('keydown', this.handleEscapeKey.bind(this));
        
        console.log('Game loaded successfully');
    }

    exitGame() {
        if (this.gameContainer) {
            this.gameContainer.remove();
            this.gameContainer = null;
        }
        this.isGameLoaded = false;
        
        // 移除ESC键监听
        document.removeEventListener('keydown', this.handleEscapeKey.bind(this));
        
        console.log('Exited game, returned to Echo Chamber');
    }

    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.isGameLoaded) {
            this.exitGame();
        }
    }

    createParticles(container) {
        if (!container) return;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'portal-particle';
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: var(--accent-color, #c9a96e);
                border-radius: 50%;
                opacity: 0.6;
                pointer-events: none;
                animation: particle-float ${4 + Math.random() * 4}s linear infinite;
                animation-delay: ${Math.random() * 4}s;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
            `;
            container.appendChild(particle);
        }
        
        // 添加粒子动画CSS如果不存在
        if (!document.querySelector('#portal-particle-styles')) {
            const style = document.createElement('style');
            style.id = 'portal-particle-styles';
            style.textContent = `
                @keyframes particle-float {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.6; }
                    90% { opacity: 0.6; }
                    100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// 自动初始化（适配Echo Chamber环境）
if (typeof window !== 'undefined') {
    // 检查是否在Echo Chamber环境中
    const isEchoChamber = document.title.includes('Echo Chamber') || 
                         document.querySelector('.chamber-entrance') ||
                         document.querySelector('.echo-chamber') ||
                         window.location.pathname === '/';
    
    if (isEchoChamber) {
        new PhilosophicalPortal();
    }
}

// 导出供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhilosophicalPortal;
} 