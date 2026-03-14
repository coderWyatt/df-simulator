// ===== 数据导入 =====
import { crisisEnemies } from './data/enemies.js';
import { gearData, GEAR_PRICES } from './data/gear.js';
import { chestConfig } from './data/chests.js';
import { randomEvents } from './data/events.js';
import { itemDatabase } from './data/items.js';
import { upgradeRequirements } from './data/upgrades.js';
import './styles/tailwind-generated.css';
import './styles/game.css';

// 加载页面管理器
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.progressBar = document.getElementById('loading-progress');
        this.percentageText = document.getElementById('loading-percentage');
        this.loadingTips = document.getElementById('loading-tips');
        this.soundToggle = document.getElementById('loading-sound-toggle');
        
        // 初始化时同步全局音效管理器的状态
        this.soundEnabled = window.soundManager ? window.soundManager.enabled : true;
        
        this.loadingMessages = [
            '正在初始化游戏引擎...',
            '正在加载地图资源...',
            '正在配置音效系统...',
            '正在准备游戏数据...',
            '正在优化性能...',
            '正在检查更新...',
            '正在准备零号大坝...',
            '正在加载麦小鼠模型...'
        ];
        
        this.init();
    }
    
    init() {
        if (!this.loadingScreen) return;
        
        // 绑定音效控制
        this.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // 初始化音效按钮显示状态
        this.updateSoundButtonDisplay();
        
        // 开始加载动画
        this.startLoading();
    }
    
    updateSoundButtonDisplay() {
        const icon = this.soundToggle.querySelector('i');
        
        if (this.soundEnabled) {
            icon.className = 'fas fa-volume-up text-xl';
            this.soundToggle.classList.remove('text-red-400');
            this.soundToggle.classList.add('text-green-400');
        } else {
            icon.className = 'fas fa-volume-mute text-xl';
            this.soundToggle.classList.remove('text-green-400');
            this.soundToggle.classList.add('text-red-400');
        }
    }
    
    startLoading() {
        let progress = 0;
        const duration = 2000; // 2秒
        const interval = 50; // 每50ms更新一次
        const increment = 100 / (duration / interval);
        
        const loadingInterval = setInterval(() => {
            progress += increment;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                this.completeLoading();
            }
            
            this.updateProgress(progress);
            this.updateLoadingMessage(progress);
            
            // 播放加载音效
            if (this.soundEnabled && progress % 25 === 0) {
                this.playLoadingSound();
            }
        }, interval);
    }
    
    updateProgress(percentage) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percentage}%`;
        }
        if (this.percentageText) {
            this.percentageText.textContent = `${Math.round(percentage)}%`;
        }
    }
    
    updateLoadingMessage(percentage) {
        if (!this.loadingTips) return;
        
        const messageIndex = Math.floor((percentage / 100) * this.loadingMessages.length);
        const message = this.loadingMessages[Math.min(messageIndex, this.loadingMessages.length - 1)];
        
        this.loadingTips.innerHTML = `<p>${message}</p>`;
    }
    
    playLoadingSound() {
        // 使用现有的音效系统播放加载音效
        if (window.soundManager) {
            window.soundManager.play('notification', 0.5);
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        
        // 同步全局音效管理器的状态
        if (window.soundManager) {
            window.soundManager.enabled = this.soundEnabled;
        }
        
        // 更新按钮显示
        this.updateSoundButtonDisplay();
    }
    
    completeLoading() {
        // 播放完成音效
        if (this.soundEnabled && window.soundManager) {
            window.soundManager.play('success', 0.7);
        }
        
        // 延迟一点时间让完成音效播放
        setTimeout(() => {
            this.hide();
        }, 300);
    }
    
    hide() {
        if (!this.loadingScreen) return;
        
        this.loadingScreen.classList.add('loading-fade-out');
        
        // 完全隐藏后移除元素
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
            this.loadingScreen.remove();
            
            // 触发游戏初始化完成事件
            window.dispatchEvent(new CustomEvent('gameLoaded'));
        }, 500);
    }
}

// 在DOM加载完成后初始化加载页面
document.addEventListener('DOMContentLoaded', () => {
    // 确保音效系统已初始化
    if (!window.soundManager) {
        window.soundManager = new SoundManager();
    }
    
    // 初始化加载页面
    window.loadingScreen = new LoadingScreen();
});

// 音效管理系统
class SoundManager {
    constructor() {
        this.sounds = {};
        this.volume = 0.15; // 默认音量
        this.enabled = true; // 音效开关
        this.ambientTimer = null; // 环境音效定时器
        this.activeOscillators = []; // 跟踪活跃的音效振荡器
        this.initSounds();
    }

    // 初始化音效配置
    initSounds() {
        // 使用Web Audio API创建音效
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 音效配置 - 使用更温和的频率和波形
        this.soundConfigs = {
            // UI音效 - 更轻快的提示音
            click: { frequency: 1200, duration: 0.08, type: 'sine' },
            hover: { frequency: 1000, duration: 0.04, type: 'sine' },
            success: { frequency: 1600, duration: 0.25, type: 'triangle' },
            error: { frequency: 800, duration: 0.3, type: 'triangle' },
            
            // 游戏音效 - 更愉悦的音效
            openChest: { frequency: 1400, duration: 0.3, type: 'triangle' },
            getItem: { frequency: 1800, duration: 0.4, type: 'sine' },
            rareItem: { frequency: 2000, duration: 0.6, type: 'sine' },
            legendaryItem: { frequency: 2200, duration: 0.8, type: 'sine' },
            
            // 战斗音效 - 减少恐怖感
            battle: { frequency: 600, duration: 0.5, type: 'triangle' },
            attack: { frequency: 800, duration: 0.2, type: 'triangle' },
            damage: { frequency: 500, duration: 0.3, type: 'triangle' },
            victory: { frequency: 1600, duration: 1.0, type: 'sine' },
            defeat: { frequency: 400, duration: 1.0, type: 'triangle' },
            
            // 系统音效 - 更友好的提示
            upgrade: { frequency: 1700, duration: 0.5, type: 'triangle' },
            purchase: { frequency: 1300, duration: 0.3, type: 'sine' },
            sell: { frequency: 1100, duration: 0.25, type: 'triangle' },
            evacuate: { frequency: 900, duration: 0.8, type: 'triangle' },
            
            // 特殊音效 - 温和的提醒
            notification: { frequency: 1500, duration: 0.4, type: 'sine' },
            warning: { frequency: 700, duration: 0.5, type: 'triangle' }
        };
    }

    // 播放音效
    play(soundName, volumeMultiplier = 1) {
        if (!this.enabled || !this.soundConfigs[soundName]) return;

        try {
            const config = this.soundConfigs[soundName];
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
            oscillator.type = config.type;

            // 设置音量包络
            const volume = this.volume * volumeMultiplier;
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);

            // 跟踪活跃的振荡器
            this.activeOscillators.push(oscillator);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + config.duration);

            // 音效结束后从活跃列表中移除
            oscillator.onended = () => {
                const index = this.activeOscillators.indexOf(oscillator);
                if (index > -1) {
                    this.activeOscillators.splice(index, 1);
                }
            };
        } catch (error) {
            console.warn('音效播放失败:', error);
        }
    }

    // 播放复合音效（多个频率同时播放）
    playComplex(soundName, frequencies, duration = 0.5) {
        if (!this.enabled) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, duration / frequencies.length);
            }, index * (duration / frequencies.length) * 500);
        });
    }

    // 播放单个音调
    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = type;

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            // 跟踪活跃的振荡器
            this.activeOscillators.push(oscillator);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);

            // 音效结束后从活跃列表中移除
            oscillator.onended = () => {
                const index = this.activeOscillators.indexOf(oscillator);
                if (index > -1) {
                    this.activeOscillators.splice(index, 1);
                }
            };
        } catch (error) {
            console.warn('音调播放失败:', error);
        }
    }

    // 设置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // 切换音效开关
    toggle() {
        this.enabled = !this.enabled;
        
        // 如果关闭音效，停止所有正在播放的音效
        if (!this.enabled) {
            // 清除环境音效定时器
            if (this.ambientTimer) {
                clearTimeout(this.ambientTimer);
                this.ambientTimer = null;
            }
            
            // 停止所有活跃的振荡器
            this.activeOscillators.forEach(oscillator => {
                try {
                    oscillator.stop();
                } catch (error) {
                    // 忽略已经停止的振荡器错误
                }
            });
            this.activeOscillators = [];
        }
        
        return this.enabled;
    }

    // 播放特殊音效序列
    playSequence(frequencies, interval = 100) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.1);
            }, index * interval);
        });
    }

    // 播放环境音效
    playAmbientSound() {
        if (!this.enabled) return;
        
        // 清除之前的定时器
        if (this.ambientTimer) {
            clearTimeout(this.ambientTimer);
            this.ambientTimer = null;
        }
        
        // 随机播放温和的环境音效
        const ambientFreqs = [300, 400, 500, 600];
        const freq = ambientFreqs[Math.floor(Math.random() * ambientFreqs.length)];
        this.playTone(freq, 1.5, 'triangle');
        
        // 随机间隔后再次播放
        this.ambientTimer = setTimeout(() => {
            if (this.enabled && Math.random() < 0.2) { // 20%概率继续播放，且音效仍然开启
                this.playAmbientSound();
            }
        }, Math.random() * 15000 + 10000); // 10-25秒间隔
    }

    // 停止环境音效
    stopAmbientSound() {
        if (this.ambientTimer) {
            clearTimeout(this.ambientTimer);
            this.ambientTimer = null;
        }
    }

    // 播放胜利音效序列
    playVictorySequence() {
        const victoryNotes = [659, 784, 988, 1319]; // E-G-B-E (更明亮的音阶)
        this.playSequence(victoryNotes, 150);
        setTimeout(() => {
            this.playSequence([1319, 988, 784, 659], 120);
        }, 800);
    }

    // 播放品质音效
    playQualitySound(quality) {
        switch(quality) {
            case 'white':
                this.play('getItem');
                break;
            case 'green':
                this.playSequence([1000, 1200], 200);
                break;
            case 'blue':
                this.playSequence([1200, 1400, 1200], 180);
                break;
            case 'purple':
                this.play('rareItem');
                setTimeout(() => this.playSequence([1400, 1600, 1800], 150), 200);
                break;
            case 'gold':
                this.play('legendaryItem');
                setTimeout(() => this.playSequence([1600, 1800, 2000, 1800, 1600], 120), 300);
                break;
            case 'red':
                this.play('legendaryItem');
                setTimeout(() => this.playSequence([1800, 2000, 2200, 2000, 1800, 2200], 100), 400);
                setTimeout(() => this.playTone(2200, 0.4), 800);
                break;
            default:
                this.play('getItem');
        }
    }
}

// 创建全局音效管理器实例
const soundManager = new SoundManager();
window.soundManager = soundManager;

// 显示提示信息的函数
function showTip(message, type = 'info') {
    // 创建提示元素
    const tip = document.createElement('div');
    tip.className = `fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
    
    // 根据类型设置样式
    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white'
    };
    
    tip.className += ` ${styles[type] || styles.info}`;
    tip.textContent = message;
    
    // 添加到页面
    document.body.appendChild(tip);
    
    // 动画显示
    setTimeout(() => {
        tip.classList.remove('translate-x-full');
        tip.classList.add('translate-x-0');
    }, 10);
    
    // 3秒后自动移除
    setTimeout(() => {
        tip.classList.add('translate-x-full');
        tip.classList.remove('translate-x-0');
        setTimeout(() => {
            if (tip.parentNode) {
                tip.parentNode.removeChild(tip);
            }
        }, 300);
    }, 3000);
}

// 音效控制功能 - 更新为支持弹窗
function initSoundControls() {
    const soundToggle = document.getElementById('sound-toggle-modal');
    const volumeSlider = document.getElementById('volume-slider-modal');
    const volumeDisplay = document.getElementById('volume-display');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    
    // 初始化音量显示
    if (volumeSlider && volumeDisplay) {
        volumeSlider.value = soundManager.volume * 100;
        volumeDisplay.textContent = `音量: ${Math.round(soundManager.volume * 100)}%`;
    }
    
    // 更新音效开关状态的函数
    function updateSoundToggleDisplay() {
        if (soundToggle) {
            const isEnabled = soundManager.enabled;
            soundToggle.innerHTML = isEnabled ? 
                '<i class="fas fa-volume-up mr-1"></i>开启' : 
                '<i class="fas fa-volume-mute mr-1"></i>关闭';
            soundToggle.className = isEnabled ? 
                'bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105' :
                'bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105';
        }
    }
    
    // 初始化显示状态
    updateSoundToggleDisplay();
    
    // 音效开关 - 确保事件监听器正常工作
    if (soundToggle) {
        console.log('找到静音按钮元素:', soundToggle);
        
        // 移除可能存在的旧事件监听器
        const newSoundToggle = soundToggle.cloneNode(true);
        soundToggle.parentNode.replaceChild(newSoundToggle, soundToggle);
        
        // 为新元素添加事件监听器
        newSoundToggle.addEventListener('click', function(e) {
            console.log('静音按钮被点击');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                const isEnabled = soundManager.toggle();
                console.log('音效状态切换为:', isEnabled ? '开启' : '关闭');
                
                // 更新按钮显示
                this.innerHTML = isEnabled ? 
                    '<i class="fas fa-volume-up mr-1"></i>开启' : 
                    '<i class="fas fa-volume-mute mr-1"></i>关闭';
                this.className = isEnabled ? 
                    'bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105' :
                    'bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105';
                
                // 播放测试音效
                if (isEnabled) {
                    setTimeout(() => {
                        soundManager.play('success');
                    }, 100);
                }
                
                // 显示提示
                showTip(isEnabled ? '音效已开启' : '音效已关闭', isEnabled ? 'success' : 'info');
                
            } catch (error) {
                console.error('静音按钮点击处理出错:', error);
            }
        });
        
        console.log('静音按钮事件监听器已添加');
    } else {
        console.error('未找到静音按钮元素 #sound-toggle-modal');
    }
    
    // 音量控制 - 移除之前的事件监听器，重新添加
    if (volumeSlider) {
        // 克隆元素来移除所有事件监听器
        const newVolumeSlider = volumeSlider.cloneNode(true);
        volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
        
        // 为新元素添加事件监听器
        newVolumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            soundManager.setVolume(volume);
            if (volumeDisplay) {
                volumeDisplay.textContent = `音量: ${Math.round(volume * 100)}%`;
            }
            
            // 播放测试音效
            soundManager.play('click', 0.5);
        });
    }
    
    // 设置弹窗控制
    if (settingsBtn && settingsModal && closeSettings) {
        // 打开设置弹窗
        settingsBtn.addEventListener('click', () => {
            settingsModal.classList.remove('hidden');
            soundManager.play('click');
        });
        
        // 关闭设置弹窗
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.add('hidden');
            soundManager.play('click');
        });
        
        // 点击弹窗外部关闭
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
                soundManager.play('click');
            }
        });
        
        // ESC键关闭弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
                settingsModal.classList.add('hidden');
                soundManager.play('click');
            }
        });
    }
}

// 为所有按钮添加点击音效
function addButtonSounds() {
    // 为所有按钮添加点击音效，但排除静音按钮避免冲突
    document.addEventListener('click', (e) => {
        const button = e.target.tagName === 'BUTTON' ? e.target : e.target.closest('button');
        if (button && button.id !== 'sound-toggle-modal') {
            soundManager.play('click');
        }
    });
    
    // 为卡片点击添加音效
    document.addEventListener('click', (e) => {
        if (e.target.closest('.cursor-pointer') && !e.target.closest('button')) {
            soundManager.play('hover');
        }
    });
}

// 全局音效控制显示更新函数
function updateSoundControlsDisplay() {
    const soundToggle = document.getElementById('sound-toggle-modal');
    const volumeSlider = document.getElementById('volume-slider-modal');
    const volumeDisplay = document.getElementById('volume-display');
    
    // 更新音效开关显示
    if (soundToggle) {
        const isEnabled = soundManager.enabled;
        soundToggle.innerHTML = isEnabled ? 
            '<i class="fas fa-volume-up mr-1"></i>开启' : 
            '<i class="fas fa-volume-mute mr-1"></i>关闭';
        soundToggle.className = isEnabled ? 
            'bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105' :
            'bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105';
    }
    
    // 更新音量显示
    if (volumeSlider && volumeDisplay) {
        volumeSlider.value = soundManager.volume * 100;
        volumeDisplay.textContent = `音量: ${Math.round(soundManager.volume * 100)}%`;
    }
}

// 玩家装备数据
let playerGear = {
    weapon: null,
    armor: null,
    backpack: null
};

// 查看文件开头部分

// 装备价格配置 - 与卡牌显示价格一致

// 修改游戏状态 - 添加速度属性
let gameState = {
    backpackCoins: 0,
    warehouseCoins: 1000000,
    items: [],
    warehouse: {
        items: [],
        maxSlots: 24
    },
    currentChests: [],
    lastOpenedChest: null,
    // 新增距离属性，初始随机1400-1000米
    distance: 1200,
    // 新增玩家属性
    player: {
        health: 100,
        maxHealth: 100,
        attack: 0,
        defense: 0,
        maxDefense: 0,
        speed: 100 // 新增速度属性，默认为100
    },
    // 背包配置
    backpack: {
        maxSlots: 8
    },
    // 已收集物品集合 - 用于图鉴系统（Map: 物品名称 -> 累计获得数量）
    collectedItems: new Map()
};

// 游戏保存功能
const GameSave = {
    // 保存游戏数据
    save(showSuccessTip = false) {
        try {
            // 将Map转换为数组以便JSON序列化
            const gameStateToSave = JSON.parse(JSON.stringify(gameState));
            gameStateToSave.collectedItems = Array.from(gameState.collectedItems.entries());
            
            const saveData = {
                gameState: gameStateToSave,
                upgradeSystem: JSON.parse(JSON.stringify(upgradeSystem)),
                currentGear: JSON.parse(JSON.stringify(currentGear)),
                ownedGear: JSON.parse(JSON.stringify(ownedGear)),
                armorStates: JSON.parse(JSON.stringify(armorStates)),
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem('deltaForceMouseSave', JSON.stringify(saveData));
            
            // 显示保存成功提示（如果是手动保存）
            if (showSuccessTip) {
                showTip('游戏保存成功！', 'success');
                soundManager.play('success');
                
                // 手动保存后自动关闭设置弹窗
                const settingsModal = document.getElementById('settings-modal');
                if (settingsModal && !settingsModal.classList.contains('hidden')) {
                    settingsModal.classList.add('hidden');
                }
            } else {
                // 静默保存，不显示提示
                console.log('游戏保存成功');
            }
            return true;
        } catch (error) {
            console.error('保存游戏失败:', error);
            showTip('保存失败，请检查浏览器存储权限', 'error');
            return false;
        }
    },
    
    // 加载游戏数据
    load() {
        try {
            const saveDataStr = localStorage.getItem('deltaForceMouseSave');
            if (!saveDataStr) {
                console.log('没有找到存档数据');
                return false;
            }
            
            const saveData = JSON.parse(saveDataStr);
            
            // 验证存档版本
            if (!saveData.version) {
                console.log('存档版本过旧，无法加载');
                return false;
            }
            
            // 恢复游戏状态
            if (saveData.gameState) {
                Object.assign(gameState, saveData.gameState);
                // 将数组转换回Map
                if (saveData.gameState.collectedItems) {
                    // 兼容旧版本Set格式和新版本Map格式
                    if (Array.isArray(saveData.gameState.collectedItems)) {
                        if (saveData.gameState.collectedItems.length > 0 && Array.isArray(saveData.gameState.collectedItems[0])) {
                            // 新版本：[[name, count], ...]
                            gameState.collectedItems = new Map(saveData.gameState.collectedItems);
                        } else {
                            // 旧版本：[name, name, ...]
                            gameState.collectedItems = new Map();
                            saveData.gameState.collectedItems.forEach(name => {
                                gameState.collectedItems.set(name, 1);
                            });
                        }
                    } else {
                        gameState.collectedItems = new Map();
                    }
                } else {
                    gameState.collectedItems = new Map();
                }
                
                // 兼容旧版本的仓库数据结构
                if (Array.isArray(saveData.gameState.warehouse)) {
                    // 旧版本：warehouse是数组
                    gameState.warehouse = {
                        items: saveData.gameState.warehouse,
                        maxSlots: 24
                    };
                } else if (saveData.gameState.warehouse && !saveData.gameState.warehouse.maxSlots) {
                    // 部分新版本：warehouse是对象但没有maxSlots
                    gameState.warehouse.maxSlots = 24;
                } else if (!saveData.gameState.warehouse) {
                    // 如果没有仓库数据，初始化默认结构
                    gameState.warehouse = {
                        items: [],
                        maxSlots: 24
                    };
                }
                
                // 确保仓库items数组存在
                if (!gameState.warehouse.items) {
                    gameState.warehouse.items = [];
                }
            }
            
            // 恢复升级系统
            if (saveData.upgradeSystem) {
                Object.assign(upgradeSystem, saveData.upgradeSystem);
            }
            
            // 恢复当前装备
            if (saveData.currentGear) {
                Object.assign(currentGear, saveData.currentGear);
            }
            
            // 恢复拥有的装备
            if (saveData.ownedGear) {
                Object.assign(ownedGear, saveData.ownedGear);
            }
            
            // 恢复护甲状态记录
            if (saveData.armorStates) {
                Object.assign(armorStates, saveData.armorStates);
            }
            
            // 更新UI
            updateUI();
            renderWarehouse();
            updateGearDisplay();
            
            // 显示加载成功提示
            const saveTime = new Date(saveData.timestamp).toLocaleString();
            showTip(`存档加载成功 (${saveTime})`, 'success');
            console.log('游戏加载成功');
            
            // 加载存档后自动关闭设置弹窗
            const settingsModal = document.getElementById('settings-modal');
            if (settingsModal && !settingsModal.classList.contains('hidden')) {
                settingsModal.classList.add('hidden');
            }
            
            return true;
        } catch (error) {
            console.error('加载游戏失败:', error);
            showTip('加载存档失败', 'error');
            return false;
        }
    },
    
    // 检查是否有存档
    hasSave() {
        return localStorage.getItem('deltaForceMouseSave') !== null;
    },
    
    // 删除存档
    deleteSave() {
        try {
            localStorage.removeItem('deltaForceMouseSave');
            showTip('存档已删除', 'info');
            return true;
        } catch (error) {
            console.error('删除存档失败:', error);
            return false;
        }
    },
    
    // 自动保存功能已移除
};

// 暂存当前获得的道具
let pendingItem = null;

// 添加随机波动函数
function getRandomAttackInRange(baseAttack, maxAttack) {
    return Math.floor(Math.random() * (maxAttack - baseAttack + 1)) + baseAttack;
}

// 计算玩家实际速度（默认值 + 升级加成 + 装备加成）
function calculatePlayerSpeed() {
    // 基础速度值
    const baseSpeed = gameState.player.baseSpeed;
    // 速度升级加成：每升1级增加5点速度
    const levelBonus = (gameState.upgradeLevels.speed - 1) * 5;
    // 装备提供的速度加成
    const equipmentBonus = gameState.player.equipmentSpeedBonus;
    // 返回实际速度，最低速度为50
    return Math.max(baseSpeed + levelBonus + equipmentBonus, 50);
}

// 简化的宝箱配置 - 去除特殊容器设定

// 搞笑随机事件 - 基于三角洲行动角色的搞笑事件

// 三角洲行动真实非武器类道具数据库（按品质分类）

// DOM元素 - 更新元素引用，添加玩家状态元素
const elements = {
    backpackCoins: document.getElementById('backpack-coins'),
    warehouseCoins: document.getElementById('warehouse-coins'),
    chestsContainer: document.getElementById('chests-container'),
    itemsGrid: document.getElementById('items-grid'),
    evacuateBtn: document.getElementById('evacuate-btn'),
    warehouseGrid: document.getElementById('warehouse-grid'),
    sellWarehouseBtn: document.getElementById('sell-warehouse-btn'),
    itemModal: document.getElementById('item-modal'),
    modalItemIcon: document.getElementById('modal-item-icon'),
    modalItemName: document.getElementById('modal-item-name'),
    modalItemValue: document.getElementById('modal-item-value'),
    effectLayer: document.getElementById('effect-layer'),
    // 新增玩家状态元素
    healthDisplay: document.getElementById('health-display'),
    healthBar: document.getElementById('health-bar'),
    attackDisplay: document.getElementById('attack-display'),
    defenseDisplay: document.getElementById('defense-display'),
    speedDisplay: document.getElementById('speed-display'), // 新增速度显示元素
    // 新增距离显示元素
    distanceDisplay: document.getElementById('distance-display')
};

// 添加界面切换相关变量
let currentInterface = 'special-forces'; // 当前界面：special-forces 或 zero-dam

// 添加界面元素引用
const interfaceElements = {
    specialForces: document.getElementById('special-forces-interface'),
    zeroDam: document.getElementById('zero-dam-interface'),
    startGameBtn: document.getElementById('start-game-btn'),
    exitGameBtn: document.getElementById('exit-game-btn')
};

// 在全局变量中添加保存当前宝箱配置的变量
let currentCrisisChest = null;

// 在全局变量区域添加升级系统数据
let upgradeSystem = {
    health: {
        level: 1,
        maxLevel: 10,
        baseValue: 100,
        increment: 5,
        baseCost: 50000, // 从500增加到50000（100倍）
        costMultiplier: 1.5,
        icon: '❤️',
        name: '生命值'
    },
    escape: {
        level: 1,
        maxLevel: 10,
        baseValue: 1.0,
        increment: 0.1,
        baseCost: 40000, // 从400增加到40000（100倍）
        costMultiplier: 1.4,
        icon: '🏃',
        name: '逃离率'
    },
    speed: {
        level: 1,
        maxLevel: 10,
        baseValue: 100,
        increment: 5,
        baseCost: 30000, // 从300增加到30000（100倍）
        costMultiplier: 1.3,
        icon: '⚡',
        name: '速度'
    },
    enemy: {
        level: 1,
        maxLevel: 10,
        baseValue: 1.0,
        increment: -0.05,
        baseCost: 60000, // 从600增加到60000（100倍）
        costMultiplier: 1.6,
        icon: '🎯',
        name: '遇敌率'
    },
    warehouse: {
        level: 1,
        maxLevel: 10,
        baseValue: 24,
        increment: 12,
        baseCost: 35000,
        costMultiplier: 1.4,
        icon: '📦',
        name: '仓库库存'
    }
};

// 替换原有的upgradeRequirements配置 - 根据品质等级重新分配物品

// 配装系统 - 新增

// 当前装备状态
let currentGear = {
    weapon: null,
    armor: null,
    backpack: null
};

// 在全局变量区域添加装备拥有状态
let ownedGear = {
    weapon: [],
    armor: [],
    backpack: []
};

// 添加护甲状态记录系统 - 记录每个护甲的当前耐久度
let armorStates = {
    // 格式: armorIndex: { currentDurability: number, maxDurability: number }
    // 例如: 0: { currentDurability: 5, maxDurability: 10 }
};

// 修改初始化游戏函数
function initGame() {
    // 初始化音效控制
    initSoundControls();
    addButtonSounds();
    
    // 初始化界面
    showInterface('special-forces');
    
    // 确保仓库结构正确初始化
    if (!gameState.warehouse) {
        gameState.warehouse = { items: [], maxSlots: 24 };
    }
    if (!gameState.warehouse.items) {
        gameState.warehouse.items = [];
    }
    if (!gameState.warehouse.maxSlots) {
        gameState.warehouse.maxSlots = 24;
    }
    
    // 尝试加载存档，如果没有存档则使用默认值
    if (!GameSave.load()) {
        // 初始化游戏状态
        gameState.backpackCoins = 0;
        gameState.warehouseCoins = 1000000;
        gameState.items = [];
        gameState.warehouse.items = [];
        gameState.currentChests = [];
        gameState.lastOpenedChest = null;
        gameState.distance = 1200;
        gameState.collectedItems = new Map();
        
        // 重置玩家状态
        gameState.player = {
            health: 100,
            maxHealth: 100,
            attack: 0,
            defense: 0, // 初始护甲值为0
            maxDefense: 0, // 最大护甲值为0
            speed: 100
        };
        
        // 重置升级系统
        resetUpgradeSystem();
        
        // 重置装备拥有状态
        ownedGear = {
            weapon: [],
            armor: [],
            backpack: []
        };
        
        // 重置护甲状态记录
        armorStates = {};
        
        // 重置当前装备
        currentGear = {
            weapon: null,
            armor: null,
            backpack: null
        };
        
        // 移除默认仓库物品，让仓库默认为空
        // 仓库初始化为空数组
        gameState.warehouse.items = [];
        
        // 更新UI
        updateUI();
        
        // 更新装备栏显示
        updateCurrentGearDisplay();
        renderWarehouse();
    }
    
    // 绑定界面切换事件
    bindInterfaceEvents();
    
    // 确保升级效果被正确应用
    applyUpgradeEffects();
    
    // 自动保存已移除，仅在页面关闭或切换标签页时保存
    updateUpgradeUI();
    updateGearButtons();
    updatePlayerStats();
}

// 重置升级系统
function resetUpgradeSystem() {
    upgradeSystem.health.level = 1;
    upgradeSystem.escape.level = 1;
    upgradeSystem.speed.level = 1;
    upgradeSystem.enemy.level = 1;
    upgradeSystem.warehouse.level = 1;
}

// 绑定升级系统事件
function bindUpgradeEvents() {
    const upgradeModalBtn = document.getElementById('upgrade-modal-btn');
    const closeUpgradeModal = document.getElementById('close-upgrade-modal');
    const upgradeModal = document.getElementById('upgrade-modal');
    
    if (upgradeModalBtn) {
        upgradeModalBtn.addEventListener('click', showUpgradeModal);
    }
    
    if (closeUpgradeModal) {
        closeUpgradeModal.addEventListener('click', hideUpgradeModal);
    }
    
    // 点击弹窗背景关闭弹窗
    if (upgradeModal) {
        upgradeModal.addEventListener('click', (e) => {
            if (e.target === upgradeModal) {
                hideUpgradeModal();
            }
        });
    }
    
    // 为能力升级弹窗标题中的箭头图标添加点击事件
    const upgradeArrowIcon = upgradeModal?.querySelector('h2 i.fas.fa-arrow-up');
    if (upgradeArrowIcon) {
        upgradeArrowIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // 防止事件冒泡
            giveAllUpgradeItems();
        });
        
        // 添加鼠标悬停效果，但不改变当前样式
        upgradeArrowIcon.style.cursor = 'pointer';
        upgradeArrowIcon.title = '点击获得所有升级所需道具';
    }
}

// 显示升级界面
function showUpgradeModal() {
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal) {
        upgradeModal.classList.remove('hidden');
        // 更新弹窗中的升级UI
        updateUpgradeModalUI();
        // 播放音效
        soundManager.play('click');
    }
}

// 关闭升级界面
function hideUpgradeModal() {
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal) {
        upgradeModal.classList.add('hidden');
        // 播放音效
        soundManager.play('click');
    }
}

// 修改updateUpgradeUI函数，移除进度条和最大等级限制显示
function updateUpgradeUI() {
    Object.keys(upgradeSystem).forEach(ability => {
        const config = upgradeSystem[ability];
        const levelElement = document.getElementById(`${ability}-level`);
        const currentElement = document.getElementById(`${ability}-current`);
        const nextElement = document.getElementById(`${ability}-next`);
        const costElement = document.getElementById(`${ability}-cost`);
        const buttonElement = document.getElementById(`upgrade-${ability}-btn`);
        
        if (levelElement) {
            levelElement.textContent = `Lv.${config.level}`;
        }
        
        // 计算当前值和下一级值
        const currentValue = config.baseValue + (config.level - 1) * config.increment;
        const nextValue = config.baseValue + config.level * config.increment;
        
        if (currentElement) {
            if (ability === 'escape') {
                // 逃离率显示实际的倍数效果
                const escapeMultiplier = 1 + (config.level - 1) * 0.1;
                currentElement.textContent = `${(escapeMultiplier * 100).toFixed(0)}%`;
            } else if (ability === 'enemy') {
                // 遇敌率显示实际的倍数效果
                const enemyMultiplier = Math.max(0.3, 1 - (config.level - 1) * 0.05);
                currentElement.textContent = `${(enemyMultiplier * 100).toFixed(0)}%`;
            } else if (ability === 'warehouse') {
                // 仓库库存显示格数
                currentElement.textContent = `${Math.floor(currentValue)}格`;
            } else {
                currentElement.textContent = Math.floor(currentValue);
            }
        }
        
        if (nextElement) {
            if (ability === 'escape') {
                // 逃离率显示下一级的倍数效果
                const nextEscapeMultiplier = 1 + config.level * 0.1;
                nextElement.textContent = `${(nextEscapeMultiplier * 100).toFixed(0)}%`;
            } else if (ability === 'enemy') {
                // 遇敌率显示下一级的倍数效果
                const nextEnemyMultiplier = Math.max(0.3, 1 - config.level * 0.05);
                nextElement.textContent = `${(nextEnemyMultiplier * 100).toFixed(0)}%`;
            } else if (ability === 'warehouse') {
                // 仓库库存显示下一级格数
                nextElement.textContent = `${Math.floor(nextValue)}格`;
            } else {
                nextElement.textContent = Math.floor(nextValue);
            }
        }
        
        // 计算升级成本
        const cost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, config.level - 1));
        
        // 显示升级成本
        if (costElement) {
            costElement.textContent = cost.toLocaleString();
            costElement.className = 'text-base font-bold text-yellow-400';
        }
        
        // 更新按钮状态
        if (buttonElement) {
            buttonElement.textContent = '升级';
            buttonElement.disabled = false;
        }
    });
    
    // 更新升级所需道具显示
    updateUpgradeRequirements();
    
    // 检查是否有可升级的项目
    checkUpgradeableItems();
}

// 新增函数：检查是否有可升级的项目
function checkUpgradeableItems() {
    const notificationDot = document.getElementById('upgrade-notification-dot');
    if (!notificationDot) return;
    
    let hasUpgradeable = false;
    
    // 检查每个升级项目
    Object.keys(upgradeRequirements).forEach(ability => {
        const config = upgradeSystem[ability];
        const requirements = upgradeRequirements[ability];
        
        // 获取当前等级对应的道具需求（等级从1开始，数组索引从0开始）
        const currentLevelIndex = config.level - 1;
        
        // 检查是否已达到最高等级
        if (config.level >= config.maxLevel) {
            return; // 跳过已达到最高等级的项目
        }
        
        // 获取下一级所需的道具
        const nextLevelRequirements = requirements[currentLevelIndex] || [];
        
        // 检查是否所有材料都足够
        const canUpgrade = nextLevelRequirements.every(req => {
            const availableCount = gameState.warehouse.items.filter(item => 
                item.name === req.item
            ).length;
            return availableCount >= req.count;
        });
        
        if (canUpgrade) {
            hasUpgradeable = true;
        }
    });
    
    // 显示或隐藏金色点提示
    if (hasUpgradeable) {
        notificationDot.classList.remove('hidden');
    } else {
        notificationDot.classList.add('hidden');
    }
}

// 更新弹窗中的升级UI
function updateUpgradeModalUI() {
    Object.keys(upgradeSystem).forEach(ability => {
        const config = upgradeSystem[ability];
        const levelElement = document.getElementById(`${ability}-level-modal`);
        const currentElement = document.getElementById(`${ability}-current-modal`);
        const nextElement = document.getElementById(`${ability}-next-modal`);
        const costElement = document.getElementById(`${ability}-cost-modal`);
        const buttonElement = document.getElementById(`upgrade-${ability}-btn-modal`);
        
        if (levelElement) {
            levelElement.textContent = `Lv.${config.level}`;
        }
        
        // 计算当前值和下一级值
        const currentValue = config.baseValue + (config.level - 1) * config.increment;
        const nextValue = config.baseValue + config.level * config.increment;
        
        if (currentElement) {
            if (ability === 'escape') {
                // 逃离率显示实际的倍数效果
                const escapeMultiplier = 1 + (config.level - 1) * 0.1;
                currentElement.textContent = `${(escapeMultiplier * 100).toFixed(0)}%`;
            } else if (ability === 'enemy') {
                // 遇敌率显示实际的倍数效果
                const enemyMultiplier = Math.max(0.3, 1 - (config.level - 1) * 0.05);
                currentElement.textContent = `${(enemyMultiplier * 100).toFixed(0)}%`;
            } else if (ability === 'warehouse') {
                // 仓库库存显示格数
                currentElement.textContent = `${Math.floor(currentValue)}格`;
            } else {
                currentElement.textContent = Math.floor(currentValue);
            }
        }
        
        if (nextElement) {
            if (ability === 'escape') {
                // 逃离率显示下一级的倍数效果
                const nextEscapeMultiplier = 1 + config.level * 0.1;
                nextElement.textContent = `${(nextEscapeMultiplier * 100).toFixed(0)}%`;
            } else if (ability === 'enemy') {
                // 遇敌率显示下一级的倍数效果
                const nextEnemyMultiplier = Math.max(0.3, 1 - config.level * 0.05);
                nextElement.textContent = `${(nextEnemyMultiplier * 100).toFixed(0)}%`;
            } else if (ability === 'warehouse') {
                // 仓库库存显示下一级格数
                nextElement.textContent = `${Math.floor(nextValue)}格`;
            } else {
                nextElement.textContent = Math.floor(nextValue);
            }
        }
        
        // 计算升级成本
        const cost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, config.level - 1));
        
        // 显示升级成本
        if (costElement) {
            costElement.textContent = cost.toLocaleString();
            costElement.className = 'text-base font-bold text-yellow-400';
        }
        
        // 更新按钮状态
        if (buttonElement) {
            buttonElement.textContent = '升级';
            buttonElement.disabled = false;
        }
    });
    
    // 更新弹窗中的升级所需道具显示
    updateUpgradeModalRequirements();
}

// 新增函数：更新升级所需道具显示
function updateUpgradeRequirements() {
    Object.keys(upgradeRequirements).forEach(ability => {
        const requirementsContainer = document.getElementById(`${ability}-requirements`);
        if (!requirementsContainer) return;
        
        const config = upgradeSystem[ability];
        const requirements = upgradeRequirements[ability];
        
        // 获取当前等级对应的道具需求（等级从1开始，数组索引从0开始）
        const currentLevelIndex = config.level - 1;
        
        // 检查是否已达到最高等级
        if (config.level >= config.maxLevel) {
            requirementsContainer.innerHTML = '<div class="text-gray-400 text-center">已达到最高等级</div>';
            return;
        }
        
        // 获取下一级所需的道具
        const nextLevelRequirements = requirements[currentLevelIndex] || [];
        
        // 渲染道具需求
        const requirementsHTML = nextLevelRequirements.map(req => {
            const availableCount = gameState.warehouse.items.filter(item => 
                item.name === req.item
            ).length;
            
            const isSufficient = availableCount >= req.count;
            const statusIcon = isSufficient ? '✅' : '❌';
            
            // 根据品质设置颜色
            let colorClass = 'text-gray-400';
            switch(req.rarity) {
                case 'red': colorClass = 'text-red-400'; break;
                case 'gold': colorClass = 'text-yellow-400'; break;
                case 'purple': colorClass = 'text-purple-400'; break;
                case 'blue': colorClass = 'text-blue-400'; break;
                case 'green': colorClass = 'text-green-400'; break;
                case 'white': colorClass = 'text-gray-400'; break;
            }
            
            return `
                <div class="flex items-center justify-between bg-black/40 px-2 py-1 rounded">
                    <div class="flex items-center">
                        <span class="mr-2">${req.icon}</span>
                        <span class="${colorClass}">${req.item} (${availableCount}/${req.count})</span>
                    </div>
                    <span class="text-lg">${statusIcon}</span>
                </div>
            `;
        }).join('');
        
        requirementsContainer.innerHTML = requirementsHTML;
    });
    
    // 检查是否有可升级的项目
    checkUpgradeableItems();
    
    // 修改updateUpgradeUI函数中的文本显示
    Object.keys(upgradeRequirements).forEach(ability => {
        const requirementsElement = document.querySelector(`#${ability}-requirements`);
        if (requirementsElement) {
            const requirementsLabel = requirementsElement.parentElement.querySelector('span.text-xs.text-gray-300');
            if (requirementsLabel && requirementsLabel.textContent.includes('升级所需道具')) {
                requirementsLabel.textContent = '升级消耗：';
            }
        }
    });
}

// 新增函数：更新弹窗中的升级所需道具显示
function updateUpgradeModalRequirements() {
    Object.keys(upgradeRequirements).forEach(ability => {
        const requirementsContainer = document.getElementById(`${ability}-requirements-modal`);
        if (!requirementsContainer) return;
        
        const config = upgradeSystem[ability];
        const requirements = upgradeRequirements[ability];
        
        // 获取当前等级对应的道具需求（等级从1开始，数组索引从0开始）
        const currentLevelIndex = config.level - 1;
        
        // 检查是否已达到最高等级
        if (config.level >= config.maxLevel) {
            requirementsContainer.innerHTML = '<div class="text-gray-400 text-center">已达到最高等级</div>';
            return;
        }
        
        // 获取下一级所需的道具
        const nextLevelRequirements = requirements[currentLevelIndex] || [];
        
        // 渲染道具需求
        const requirementsHTML = nextLevelRequirements.map(req => {
            const availableCount = gameState.warehouse.items.filter(item => 
                item.name === req.item
            ).length;
            
            const isSufficient = availableCount >= req.count;
            const statusIcon = isSufficient ? '✅' : '❌';
            
            // 根据品质设置颜色
            let colorClass = 'text-gray-400';
            switch(req.rarity) {
                case 'red': colorClass = 'text-red-400'; break;
                case 'gold': colorClass = 'text-yellow-400'; break;
                case 'purple': colorClass = 'text-purple-400'; break;
                case 'blue': colorClass = 'text-blue-400'; break;
                case 'green': colorClass = 'text-green-400'; break;
                case 'white': colorClass = 'text-gray-400'; break;
            }
            
            return `
                <div class="flex items-center justify-between bg-black/40 px-2 py-1 rounded">
                    <div class="flex items-center">
                        <span class="mr-2">${req.icon}</span>
                        <span class="${colorClass}">${req.item} (${availableCount}/${req.count})</span>
                    </div>
                    <span class="text-lg">${statusIcon}</span>
                </div>
            `;
        }).join('');
        
        requirementsContainer.innerHTML = requirementsHTML;
    });
    
    // 检查是否有可升级的项目
    checkUpgradeableItems();
}

// 新增函数：获得所有升级所需的道具
// 添加一个新的辅助函数来从itemDatabase中查找道具的真实价值
function getRealItemValue(itemName, rarity) {
    const rarityMap = {
        'white': 'white',
        'green': 'green', 
        'blue': 'blue',
        'purple': 'purple',
        'gold': 'gold',
        'red': 'red'
    };
    
    const actualRarity = rarityMap[rarity];
    if (!actualRarity || !itemDatabase[actualRarity]) {
        return getItemValueByRarity(rarity); // 回退到固定价值
    }
    
    const item = itemDatabase[actualRarity].find(item => item.name === itemName);
    return item ? item.value : getItemValueByRarity(rarity); // 找到真实价值，否则回退
}

function giveAllUpgradeItems() {
    let totalItemsGiven = 0;
    const itemsGiven = [];
    
    // 遍历所有能力的升级需求
    Object.keys(upgradeRequirements).forEach(ability => {
        const config = upgradeSystem[ability];
        const requirements = upgradeRequirements[ability];
        
        // 获取当前等级对应的道具需求（等级从1开始，数组索引从0开始）
        const currentLevelIndex = config.level - 1;
        
        // 检查是否已达到最高等级
        if (config.level >= config.maxLevel || currentLevelIndex >= requirements.length) {
            return; // 跳过已达到最高等级的能力
        }
        
        // 获取下一级所需的道具
        const nextLevelRequirements = requirements[currentLevelIndex];
        
        // 为每种道具添加到仓库
        nextLevelRequirements.forEach(req => {
            for (let i = 0; i < req.count; i++) {
                // 创建道具对象 - 使用真实价值
                const realValue = getRealItemValue(req.item, req.rarity);
                const item = {
                    name: req.item,
                    icon: req.icon,
                    rarity: req.rarity,
                    value: realValue
                };
                
                // 添加到仓库
                gameState.warehouse.items.push(item);
                totalItemsGiven++;
                
                // 标记物品为已收集（用于图鉴系统）并增加计数
                const currentCount = gameState.collectedItems.get(req.item) || 0;
                gameState.collectedItems.set(req.item, currentCount + 1);
                
                // 记录给予的道具
                const existingItem = itemsGiven.find(given => given.name === req.item);
                if (existingItem) {
                    existingItem.count++;
                    existingItem.totalValue += realValue;
                } else {
                    itemsGiven.push({
                        name: req.item,
                        icon: req.icon,
                        count: 1,
                        rarity: req.rarity,
                        totalValue: realValue
                    });
                }
            }
        });
    });
    
    if (totalItemsGiven > 0) {
        // 播放成功音效
        soundManager.play('success');
        
        // 计算总价值
        const totalValue = itemsGiven.reduce((sum, item) => sum + item.totalValue, 0);
        
        // 显示获得道具的提示
        showFloatingText(`获得了 ${totalItemsGiven} 件升级道具！总价值: ${totalValue.toLocaleString()}`, null, '#10b981');
        
        // 更新UI
        updateUI();
        
        // 更新装备栏显示
        updateCurrentGearDisplay();
        renderWarehouse();
        updateUpgradeUI();
        updateUpgradeModalRequirements();
        checkUpgradeableItems();
        
        // 在控制台显示详细信息
        console.log('获得的升级道具:', itemsGiven);
    } else {
        showFloatingText('所有能力已达到最高等级！', null, '#f59e0b');
    }
}

// 修改升级能力函数，修复道具消耗逻辑
function upgradeAbility(ability) {
    const config = upgradeSystem[ability];
    
    if (config.level >= config.maxLevel) {
        showFloatingText('已达到最高等级！', null, '#ef4444');
        return;
    }
    
    // 计算升级成本
    const cost = Math.floor(config.baseCost * Math.pow(config.costMultiplier, config.level - 1));
    
    // 检查哈夫币是否足够
    if (gameState.warehouseCoins < cost) {
        showFloatingText('哈夫币不足！', null, '#ef4444');
        return;
    }
    
    // 获取升级所需道具
    const requirements = upgradeRequirements[ability];
    const currentLevelIndex = config.level - 1;
    
    // 检查是否已达到最高等级
    if (currentLevelIndex >= requirements.length) {
        showFloatingText('已达到最高等级！', null, '#ef4444');
        return;
    }
    
    // 获取下一级所需的道具
    const nextLevelRequirements = requirements[currentLevelIndex];
    const missingItems = [];
    
    // 检查每种道具是否足够
    for (const req of nextLevelRequirements) {
        const availableCount = gameState.warehouse.items.filter(item => 
            item.name === req.item
        ).length;
        
        if (availableCount < req.count) {
            missingItems.push(`${req.item} x${req.count - availableCount}`);
        }
    }
    
    if (missingItems.length > 0) {
        soundManager.play('error');
        showFloatingText(`缺少道具: ${missingItems.join(', ')}`, null, '#ef4444');
        return;
    }
    
    // 扣除哈夫币
    gameState.warehouseCoins -= cost;
    
    // 扣除道具 - 按名称精确扣除
    for (const req of nextLevelRequirements) {
        let remaining = req.count;
        for (let i = gameState.warehouse.items.length - 1; i >= 0 && remaining > 0; i--) {
            if (gameState.warehouse.items[i].name === req.item) {
                gameState.warehouse.items.splice(i, 1);
                remaining--;
            }
        }
    }
    
    // 升级能力
    config.level++;
    
    // 应用升级效果
    applyUpgradeEffects();
    
    // 更新UI
    updateUI();
    renderWarehouse();
    updateUpgradeUI();
    
    // 如果弹窗打开，也更新弹窗UI
    const upgradeModal = document.getElementById('upgrade-modal');
    if (upgradeModal && !upgradeModal.classList.contains('hidden')) {
        updateUpgradeModalUI();
    }
    
    soundManager.play('upgrade');
    showFloatingText(`${config.name}升级成功！`, null, '#10b981');
    
    // 保存游戏进度
    GameSave.save();
}

// 应用升级效果
function applyUpgradeEffects() {
    // 生命值升级
    const healthUpgrade = upgradeSystem.health;
    gameState.player.maxHealth = Math.floor(healthUpgrade.baseValue + (healthUpgrade.level - 1) * healthUpgrade.increment);
    gameState.player.health = Math.min(gameState.player.health, gameState.player.maxHealth);
    
    // 逃离率升级（存储在gameState中供战斗使用）
    if (!gameState.upgrades) gameState.upgrades = {};
    gameState.upgrades.escapeMultiplier = 1 + (upgradeSystem.escape.level - 1) * 0.1;
    
    // 速度升级 - 修改为默认值+升级加成+装备加成
    const speedUpgrade = upgradeSystem.speed;
    gameState.player.baseSpeed = Math.floor(speedUpgrade.baseValue + (speedUpgrade.level - 1) * speedUpgrade.increment);
    
    // 计算装备速度加成
    let equipmentSpeedBonus = 0;
    if (currentGear.weapon) {
        equipmentSpeedBonus += currentGear.weapon.speed || 0;
    }
    if (currentGear.armor) {
        equipmentSpeedBonus += currentGear.armor.speed || 0;
    }
    if (currentGear.backpack) {
        equipmentSpeedBonus += currentGear.backpack.speed || 0;
    }
    
    // 同步更新实际速度显示（基础速度 + 装备加成）
    gameState.player.speed = Math.max(50, gameState.player.baseSpeed + equipmentSpeedBonus);
    
    // 遇敌率升级（存储在gameState中供宝箱使用）
    gameState.upgrades.enemyMultiplier = Math.max(0.3, 1 - (upgradeSystem.enemy.level - 1) * 0.05);
    
    // 仓库库存升级
    const warehouseUpgrade = upgradeSystem.warehouse;
    gameState.warehouse.maxSlots = Math.floor(warehouseUpgrade.baseValue + (warehouseUpgrade.level - 1) * warehouseUpgrade.increment);
}

// 更新装备卡片的显示状态
function updateEquipmentCardsState() {
    const equipmentGrid = document.getElementById('equipment-grid');
    const equipmentContainer = equipmentGrid?.parentElement;
    
    const playerStatusBar = document.getElementById('player-status-bar');
    // 获取玩家属性状态容器（生命值、护甲值、战斗力等的容器）
    const playerStatsContainer = playerStatusBar?.querySelector('div.flex.flex-col');
    
    if (currentInterface === 'zero-dam') {
        // 在零号大坝界面时完全隐藏装备控件
        if (equipmentContainer) {
            equipmentContainer.style.display = 'none';
        }
        // 减少玩家状态栏的下边距
        if (playerStatusBar) {
            playerStatusBar.classList.remove('mb-4');
            playerStatusBar.classList.add('mb-2');
        }
        // 减少玩家属性状态容器的下边距
        if (playerStatsContainer) {
            playerStatsContainer.classList.remove('mb-4');
            playerStatsContainer.classList.add('mb-2');
        }
    } else {
        // 在特勤处界面时显示装备控件
        if (equipmentContainer) {
            equipmentContainer.style.display = '';
            equipmentContainer.style.pointerEvents = '';
        }
        // 恢复玩家状态栏的正常下边距
        if (playerStatusBar) {
            playerStatusBar.classList.remove('mb-2');
            playerStatusBar.classList.add('mb-4');
        }
        // 恢复玩家属性状态容器的正常下边距
        if (playerStatsContainer) {
            playerStatsContainer.classList.remove('mb-2');
            playerStatsContainer.classList.add('mb-4');
        }
        
        // 移除禁用状态并确保装备卡片可点击
        const weaponCard = document.getElementById('weapon-card');
        const armorCard = document.getElementById('armor-card');
        const backpackCard = document.getElementById('backpack-card');
        
        [weaponCard, armorCard, backpackCard].forEach(card => {
            if (card) {
                card.classList.remove('equipment-disabled');
                card.style.pointerEvents = '';
                card.style.opacity = '';
            }
        });
    }
}

// 直升机飞行动效函数
function playHelicopterAnimation() {
    const helicopterContainer = document.getElementById('helicopter-animation');
    const helicopterImg = document.getElementById('helicopter-img');
    const flightTrail = document.getElementById('flight-trail');
    const flightText = document.getElementById('flight-text');
    
    // 显示动效容器
    helicopterContainer.classList.remove('hidden');
    
    // 播放直升机音效（使用现有的音效系统）
    soundManager.play('success', 0.3);
    
    // 重置直升机图标状态
    helicopterImg.style.opacity = '0';
    helicopterImg.style.animation = '';
    helicopterImg.style.transform = 'translateX(-50%) translateY(-50%)';
    helicopterImg.style.top = '50%';
    helicopterImg.style.left = '-300px';
    
    // 立即显示直升机并开始动画
    setTimeout(() => {
        helicopterImg.style.opacity = '1';
        helicopterImg.style.animation = 'helicopterFly 5s linear forwards';
        
        // 显示飞行轨迹
        flightTrail.style.opacity = '0.6';
        flightTrail.style.animation = 'flightTrail 5s linear forwards';
        flightTrail.style.top = '52%';
        flightTrail.style.left = '0';
        flightTrail.style.width = '100vw';
        flightTrail.style.height = '6px';
        
        // 显示文字提示
        setTimeout(() => {
            flightText.style.opacity = '1';
            flightText.style.animation = 'textFadeIn 1s ease-out forwards';
        }, 1000);
        
    }, 100);
    
    // 播放环境音效
    setTimeout(() => {
        soundManager.play('notification', 0.5);
    }, 2500);
    
    // 动效结束后进入零号大坝界面
    setTimeout(() => {
        // 隐藏动效容器
        helicopterContainer.classList.add('hidden');
        
        // 重置动画状态
        helicopterImg.style.opacity = '0';
        helicopterImg.style.animation = '';
        helicopterImg.style.transform = '';
        flightTrail.style.opacity = '0';
        flightTrail.style.animation = '';
        flightText.style.opacity = '0';
        flightText.style.animation = '';
        
        // 启动环境音效
        setTimeout(() => soundManager.playAmbientSound(), 500);
        
        // 进入零号大坝界面
        showInterface('zero-dam');
    }, 5000);
}

// 安全地移除动态创建的弹窗覆盖层（不删除 HTML 预定义弹窗）
function removeDynamicOverlays() {
    const preserveIds = new Set([
        'loading-screen', 'helicopter-animation', 'tip-container', 
        'effect-layer', 'item-glow', 'item-modal', 'settings-modal', 
        'upgrade-modal', 'weapon-modal', 'armor-modal', 'backpack-modal', 
        'collection-modal'
    ]);
    const overlays = document.querySelectorAll('.fixed.inset-0');
    overlays.forEach(el => {
        if (el.id && preserveIds.has(el.id)) return;
        el.remove();
    });
}

// 清除所有动态创建的弹窗覆盖层
function removeAllDynamicModals() {
    // 已知需要保留的 HTML 预定义元素 ID 列表
    const preserveIds = new Set([
        'loading-screen', 'helicopter-animation', 'tip-container', 
        'effect-layer', 'item-glow', 'item-modal', 'settings-modal', 
        'upgrade-modal', 'weapon-modal', 'armor-modal', 'backpack-modal', 
        'collection-modal'
    ]);
    
    // 遍历 body 的所有直接子元素，移除动态创建的覆盖层
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach(el => {
        // 跳过 script、link、style、header、noscript 等非可视标签
        const tag = el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'link' || tag === 'style' || tag === 'header' || tag === 'noscript') return;
        // 跳过已知需要保留的元素
        if (el.id && preserveIds.has(el.id)) return;
        // 跳过主内容区域
        if (el.classList.contains('max-w-6xl') || el.classList.contains('max-w-4xl')) return;
        
        // 移除所有动态创建的 div 覆盖层（它们都是直接 appendChild 到 body 的）
        if (tag === 'div' && !el.id) {
            el.remove();
            return;
        }
        // 额外检查：有 fixed 定位的元素也要移除
        if (el.classList.contains('fixed')) {
            el.remove();
        }
    });
    
    // 同时确保 HTML 中预定义的弹窗被隐藏
    const predefinedModals = ['item-modal', 'settings-modal', 'upgrade-modal', 
                              'weapon-modal', 'armor-modal', 'backpack-modal', 'collection-modal'];
    predefinedModals.forEach(id => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('hidden');
    });
}

// 修改showInterface函数，添加随机距离初始化
function showInterface(interfaceName) {
    try {
        currentInterface = interfaceName;
        
        // 清除所有动态弹窗，防止残留覆盖层阻挡点击
        removeAllDynamicModals();
        
        // 获取版权信息元素
        const copyrightElement = document.querySelector('.max-w-6xl.mx-auto.mt-4.text-center');
        // 获取标题元素
        const titleElement = document.querySelector('h1.text-4xl.font-bold.text-center.mb-8');
        
        if (interfaceName === 'special-forces') {
            interfaceElements.specialForces.classList.remove('hidden');
            interfaceElements.zeroDam.classList.add('hidden');
            
            // 显示版权信息
            if (copyrightElement) {
                copyrightElement.classList.remove('hidden');
            }
            
            // 显示标题
            if (titleElement) {
                titleElement.classList.remove('hidden');
            }
            
            // 停止环境音效
            soundManager.stopAmbientSound();
            
            // 在特勤处界面时，清空背包内容
            gameState.items = [];
            gameState.backpackCoins = 0;
            // 重置距离为随机值（1400-1000米）
            gameState.distance = Math.floor(Math.random() * 401) + 1000;
            
            // 重置玩家状态 - 只恢复生命值，保持护甲值不变
            gameState.player.health = gameState.player.maxHealth;
            // 保持当前护甲值不变，不重置为0
            
            // 切换回特勤处背景（绿黑渐变），保留 font-game 类
            document.body.className = 'bg-gradient-to-br from-gray-900 via-green-900 to-black min-h-screen text-white font-game';
            
            // 更新UI
            updateUI();
            
            // 更新装备栏显示
            updateCurrentGearDisplay();
            renderItems();
            renderWarehouse();
            updateUpgradeUI();
            updateGearButtons();
            updateEquipmentCardsState(); // 更新装备卡片状态
            
            // 更新音效控制显示状态
            updateSoundControlsDisplay();
            
            // 重新绑定装备卡片点击事件，确保返回特勤处后可以正常点击
            rebindEquipmentClickEvents();
        } else if (interfaceName === 'zero-dam') {
        interfaceElements.specialForces.classList.add('hidden');
        interfaceElements.zeroDam.classList.remove('hidden');
        
        // 隐藏版权信息
        if (copyrightElement) {
            copyrightElement.classList.add('hidden');
        }
        
        // 隐藏标题
        if (titleElement) {
            titleElement.classList.add('hidden');
        }
        
        // 进入零号大坝时，生成新的宝箱
        generateRandomChests();
        
        // 重置背包和设置随机初始距离
        gameState.items = [];
        gameState.backpackCoins = 0;
        gameState.distance = Math.floor(Math.random() * 401) + 1000;
        
        // 重置玩家状态 - 使用当前的最大值而不是固定值
        gameState.player.health = gameState.player.maxHealth;
        // 保持当前护甲值不变，不重置为满值
        // 速度保持当前值，不重置为100
        
        // 切换为零号大坝背景（蓝黑渐变），保留 font-game 类
        document.body.className = 'bg-gradient-to-br from-slate-900 via-cyan-900 to-black min-h-screen text-white font-game';
        
        // 更新UI
        updateUI();
        
        // 更新装备栏显示
        updateCurrentGearDisplay();
        renderItems();
        updateEquipmentCardsState(); // 更新装备卡片状态
        
        // 更新音效控制显示状态
        updateSoundControlsDisplay();
    }
    } catch (error) {
        console.error('[showInterface] Error:', error);
        // 确保 currentInterface 正确设置
        currentInterface = interfaceName;
    }
}

// 页签功能已移除，仓库内容直接显示

// 修改bindInterfaceEvents函数，添加测试按钮事件
function bindInterfaceEvents() {
    // 开始游戏按钮
    interfaceElements.startGameBtn.addEventListener('click', () => {
        // 检查仓库是否超过格数上限
        if (isWarehouseOverLimit()) {
            soundManager.play('error');
            showWarehouseOverLimitModal();
            return;
        }
        
        soundManager.play('success');
        // 播放直升机飞行动效，动画完成后会自动切换到零号大坝界面
        playHelicopterAnimation();
    });
    
    // 退出游戏按钮
    interfaceElements.exitGameBtn.addEventListener('click', () => {
        triggerEvacuationFailureAndReturn();
    });
    
    // 测试-一键撤离按钮
    const testEvacuateBtn = document.getElementById('test-evacuate-btn');
    if (testEvacuateBtn) {
        testEvacuateBtn.addEventListener('click', triggerTestEvacuation);
    }
    
    // 原有的撤离按钮事件
    elements.evacuateBtn.addEventListener('click', evacuateItems);
    elements.sellWarehouseBtn.addEventListener('click', sellAllWarehouseItems);
}

// 修改撤离功能
function evacuateItems() {
    if (gameState.distance > 0) {
        soundManager.play('warning');
        showEvacuationWaitModal(gameState.distance);
        return;
    }

    // 播放撤离成功音效
    soundManager.play('evacuate');
    soundManager.play('victory');

    const itemCount = gameState.items.length;
    const coinAmount = gameState.backpackCoins;
    const totalValue = gameState.items.reduce((sum, item) => sum + item.value, 0) + coinAmount;
    
    // 将背包物品转移到仓库
    gameState.warehouse.items.push(...gameState.items);
    
    // 标记所有背包物品为已收集（用于图鉴系统）并增加计数
    gameState.items.forEach(item => {
        const currentCount = gameState.collectedItems.get(item.name) || 0;
        gameState.collectedItems.set(item.name, currentCount + 1);
    });
    
    gameState.items = [];
    
    // 将背包哈夫币转移到仓库
    gameState.warehouseCoins += gameState.backpackCoins;
    gameState.backpackCoins = 0;
    
    // 重置距离
    gameState.distance = 1200;
    
    // 只恢复生命值，保持护甲值不变
    gameState.player.health = gameState.player.maxHealth;
    // 保持当前护甲值不变，不自动恢复
    
    // 显示撤离成功弹窗
    showEvacuationSuccessModal(itemCount, coinAmount, totalValue);
    
    // 更新UI
    updateUI();
    renderItems();
    renderWarehouse();
    
    // 保存游戏进度
    GameSave.save();
}

// 修改退出游戏功能，添加确认弹窗
function triggerEvacuationFailureAndReturn() {
    // 显示确认弹窗
    showExitGameConfirmModal();
}

// 新增确认退出游戏弹窗
function showExitGameConfirmModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-6 border border-orange-600 shadow-2xl">
            <div class="text-center">
                <div class="text-8xl mb-6 animate-pulse">❓</div>
                <h3 class="text-3xl font-bold mb-4 text-orange-400">确认返回特勤处？</h3>
                <p class="text-gray-300 text-lg mb-6">
                    返回特勤处将触发撤离失败！<br>
                    背包中的所有物品和哈夫币将丢失！<br>
                    确定要返回特勤处吗？
                </p>
                <div class="flex gap-4 justify-center">
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                            class="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                        <i class="fas fa-times mr-2"></i>取消
                    </button>
                    <button onclick="confirmExitGame()" 
                            class="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                        <i class="fas fa-check mr-2"></i>确认返回
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 新增确认退出游戏函数
function confirmExitGame() {
    // 关闭确认弹窗（只移除动态弹窗，保留预定义弹窗）
    removeDynamicOverlays();
    
    // 清空背包物品（但保留装备）
    gameState.items = [];
    // 清空背包哈夫币
    gameState.backpackCoins = 0;
    
    // 清空当前装备并同步清除ownedGear中的记录
    const lostEquipment = [];
    
    if (currentGear.weapon) {
        lostEquipment.push(currentGear.weapon.name);
        const weaponIndex = gearData.weapons.findIndex(w => w.name === currentGear.weapon.name);
        if (weaponIndex !== -1) {
            ownedGear.weapon = ownedGear.weapon.filter(index => index !== weaponIndex);
        }
        currentGear.weapon = null;
    }
    
    if (currentGear.armor) {
        lostEquipment.push(currentGear.armor.name);
        const armorIndex = gearData.armors.findIndex(a => a.name === currentGear.armor.name);
        if (armorIndex !== -1) {
            ownedGear.armor = ownedGear.armor.filter(index => index !== armorIndex);
            // 清除丢失护甲的状态记录
            delete armorStates[armorIndex];
        }
        currentGear.armor = null;
    }
    
    if (currentGear.backpack) {
        lostEquipment.push(currentGear.backpack.name);
        const backpackIndex = gearData.backpacks.findIndex(b => b.name === currentGear.backpack.name);
        if (backpackIndex !== -1) {
            ownedGear.backpack = ownedGear.backpack.filter(index => index !== backpackIndex);
        }
        currentGear.backpack = null;
    }
    
    // 只恢复生命值，保持护甲值不变
    gameState.player.health = gameState.player.maxHealth;
    
    // 重置基础属性，但保持护甲值不变
    gameState.player.attack = 0;
    // 保持当前护甲值不变，不重置为0
    // gameState.player.maxDefense = 0; // 注释掉，避免重置最大护甲值
    // 同时重置当前护甲值为0，因为装备已丢失
    gameState.player.defense = 0;
    gameState.player.maxDefense = 0;
    gameState.backpack.maxSlots = 8;
    gameState.player.speed = 100;
    
    // 关闭所有动态弹窗（保留预定义弹窗）
    removeDynamicOverlays();
    
    // 关闭道具弹窗
    elements.itemModal.classList.add('hidden');
    
    // 更新装备显示
    updateCurrentGearDisplay();
    
    // 显示撤离失败弹窗而不是直接返回特勤处
    showEvacuationFailureModal();
    
    // 更新装备按钮状态
    updateGearButtons();
}

// 显示退出游戏提示
function showExitGameModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-6 border border-red-600 shadow-2xl">
            <div class="text-center">
                <div class="text-8xl mb-6 animate-pulse">🚪</div>
                <h3 class="text-3xl font-bold mb-4 text-red-400">退出游戏</h3>
                <p class="text-gray-300 text-lg mb-6">
                    你已退出零号大坝！<br>
                    背包中的所有物品和哈夫币已丢失！<br>
                    返回特勤处...
                </p>
                <button onclick="this.parentElement.parentElement.parentElement.remove(); soundManager.stopAmbientSound(); showInterface('special-forces');" 
                        class="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                    返回特勤处
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 显示撤离成功弹窗
function showEvacuationSuccessModal(itemCount, coinAmount, totalValue) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-green-500 shadow-2xl">
            <div class="text-center">
                <div class="text-8xl mb-6">🎉</div>
                <h3 class="text-3xl font-bold mb-4 text-green-400">撤离成功！</h3>
                <div class="bg-green-800/50 rounded-lg p-4 mb-4">
                    <p class="text-green-300 text-lg mb-2">
                        <i class="fas fa-boxes mr-2"></i>成功带出道具: <span class="font-bold text-white">${itemCount}件</span>
                    </p>
                    <p class="text-green-300 text-lg mb-2">
                        <i class="fas fa-coins mr-2"></i>哈夫币: <span class="font-bold text-yellow-400">${coinAmount.toLocaleString()}</span>
                    </p>
                    <p class="text-green-300 text-lg">
                        <i class="fas fa-chart-line mr-2"></i>总价值: <span class="font-bold text-yellow-300 text-2xl">${totalValue.toLocaleString()}哈夫币</span>
                    </p>
                </div>
                <p class="text-gray-300 mb-6">所有战利品已安全转移到仓库！</p>
                <button onclick="this.parentElement.parentElement.parentElement.remove(); soundManager.stopAmbientSound(); showInterface('special-forces');" 
                        class="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                    返回特勤处
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 显示等待撤离弹窗
function showEvacuationWaitModal(remainingDistance) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gradient-to-br from-orange-900 via-red-900 to-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-orange-500 shadow-2xl">
            <div class="text-center">
                <div class="text-8xl mb-6 animate-bounce">⏳</div>
                <h3 class="text-3xl font-bold mb-4 text-orange-400">无法撤离</h3>
                <div class="bg-orange-800/50 rounded-lg p-4 mb-4">
                    <p class="text-orange-300 text-lg mb-2">
                        <i class="fas fa-clock mr-2"></i>距离撤离点还剩下 <span class="font-bold text-white text-2xl">${remainingDistance}</span> 米
                    </p>
                    <p class="text-gray-300 text-sm">
                        继续开箱来减少撤离点距离
                    </p>
                </div>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        class="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                    继续战斗
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 渲染仓库物品
function renderWarehouse() {
    // 添加安全检查，确保warehouse.items存在
    if (!gameState.warehouse.items) {
        gameState.warehouse.items = [];
    }
    if (gameState.warehouse.items.length === 0) {
        elements.warehouseGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-400">
                <i class="fas fa-warehouse text-6xl mb-4 opacity-50"></i>
                <p>仓库空空如也，将背包物品撤离到这里吧！</p>
            </div>
        `;
    } else {
        elements.warehouseGrid.innerHTML = gameState.warehouse.items.map((item, index) => `
            <div class="warehouse-item-card bg-slate-700/50 rounded p-2 border border-slate-600 rarity-${item.rarity} cursor-pointer hover:scale-105 transition-transform" 
                 onclick="sellWarehouseItem(${index})" title="点击出售 ${item.name} - ${item.value}哈夫币">
                <div class="text-center">
                    <div class="text-2xl mb-1">${item.icon}</div>
                    <div class="font-bold text-[10px] mb-1 truncate">${item.name}</div>
                    <div class="text-[10px] text-yellow-400">${item.value.toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }
    
    // 更新仓库容量显示
    updateWarehouseCapacity();
}

// 出售单个仓库物品
function sellWarehouseItem(index) {
    const item = gameState.warehouse.items[index];
    gameState.warehouseCoins += item.value;
    
    showFloatingText(`+${item.value.toLocaleString()}`, null, '#10b981');
    
    gameState.warehouse.items.splice(index, 1);
    updateUI();
    renderWarehouse();
}

// 辅助函数：判断物品是否为升级材料 (函数定义已移至后面)

// 出售全部仓库物品
function sellAllWarehouseItems() {
    // 添加安全检查，确保warehouse.items存在
    if (!gameState.warehouse.items) {
        gameState.warehouse.items = [];
    }
    if (gameState.warehouse.items.length === 0) {
        soundManager.play('error');
        return;
    }

    // 播放出售音效
    soundManager.play('sell');

    // 获取品质筛选复选框状态
    const allowSellWhiteItems = document.getElementById('sell-white-items')?.checked ?? false;
    const allowSellGreenItems = document.getElementById('sell-green-items')?.checked ?? false;
    const allowSellBlueItems = document.getElementById('sell-blue-items')?.checked ?? false;
    const allowSellPurpleItems = document.getElementById('sell-purple-items')?.checked ?? false;
    const allowSellGoldItems = document.getElementById('sell-gold-items')?.checked ?? false;
    const allowSellRedItems = document.getElementById('sell-red-items')?.checked ?? false;
    const allowSellUpgradeMaterials = document.getElementById('protect-upgrade-materials')?.checked ?? false;

    // 调试信息
    console.log('出售前状态:', {
        白色品质: allowSellWhiteItems,
        绿色品质: allowSellGreenItems,
        蓝色品质: allowSellBlueItems,
        紫色品质: allowSellPurpleItems,
        金色品质: allowSellGoldItems,
        红色品质: allowSellRedItems,
        升级材料: allowSellUpgradeMaterials,
        总物品数: gameState.warehouse.items.length
    });

    // 检查是否有任何品质被选中
    const anyQualitySelected = allowSellWhiteItems || allowSellGreenItems || allowSellBlueItems || 
                               allowSellPurpleItems || allowSellGoldItems || allowSellRedItems;
    
    if (!anyQualitySelected) {
        console.log('警告：未选择任何品质进行出售');
    }

    let itemsToSell = [...gameState.warehouse.items];
    let message = '';
    let filteredCount = 0;

    // 获取当前等级升级材料需求和当前数量
    const localUpgradeReqs = getCurrentLevelUpgradeMaterialRequirements();
    const localUpgradeCounts = getCurrentUpgradeMaterialCounts();

    // 应用筛选条件 - 根据品质筛选
    itemsToSell = itemsToSell.filter(item => {
        let shouldSell = false;
        
        // 根据物品品质决定是否出售
        switch(item.rarity) {
            case 'white':
                shouldSell = allowSellWhiteItems;
                break;
            case 'green':
                shouldSell = allowSellGreenItems;
                break;
            case 'blue':
                shouldSell = allowSellBlueItems;
                break;
            case 'purple':
                shouldSell = allowSellPurpleItems;
                break;
            case 'gold':
                shouldSell = allowSellGoldItems;
                break;
            case 'red':
                shouldSell = allowSellRedItems;
                break;
            default:
                shouldSell = false;
        }
        
        // 如果是升级材料，需要额外检查升级材料复选框
        if (shouldSell && isUpgradeMaterial(item.name) && !allowSellUpgradeMaterials) {
            shouldSell = false;
            console.log(`保护升级材料: ${item.name} (品质: ${item.rarity})`);
        }
        
        if (!shouldSell) {
            filteredCount++;
            console.log(`保护物品: ${item.name} (品质: ${item.rarity})`);
        }
        
        return shouldSell;
    });

    // 如果勾选了升级材料复选框，需要进一步筛选超过所需数量的升级材料
    if (allowSellUpgradeMaterials) {
        // 创建一个临时对象来跟踪每种升级材料的出售数量
        const soldUpgradeMaterials = {};
        
        itemsToSell = itemsToSell.filter(item => {
            // 只处理升级材料
            if (!isUpgradeMaterial(item.name)) {
                return true; // 非升级材料直接保留
            }
            
            const materialName = item.name;
            const requiredCount = localUpgradeReqs[materialName] || 0;
            const currentCount = localUpgradeCounts[materialName] || 0;
            const alreadySoldCount = soldUpgradeMaterials[materialName] || 0;
            
            // 计算还可以出售的数量（当前数量 - 所需数量 - 已出售数量）
            const canSellCount = Math.max(0, currentCount - requiredCount - alreadySoldCount);
            
            if (canSellCount > 0) {
                // 记录已出售数量
                soldUpgradeMaterials[materialName] = alreadySoldCount + 1;
                console.log(`出售升级材料: ${materialName} (当前: ${currentCount}, 需要: ${requiredCount}, 已售: ${alreadySoldCount + 1})`);
                return true;
            } else {
                // 不超过所需数量，保护该物品
                filteredCount++;
                console.log(`保护升级材料: ${materialName} (当前: ${currentCount}, 需要: ${requiredCount}, 已售: ${alreadySoldCount})`);
                return false;
            }
        });
    }

    console.log('筛选结果:', {
        原始物品数: gameState.warehouse.items.length,
        可出售物品数: itemsToSell.length,
        被保护物品数: filteredCount
    });

    // 如果没有物品可出售
    if (itemsToSell.length === 0) {
        soundManager.play('error');
        let errorMessage = '没有可出售的物品';
        
        const selectedQualities = [];
        if (allowSellWhiteItems) selectedQualities.push('白');
        if (allowSellGreenItems) selectedQualities.push('绿');
        if (allowSellBlueItems) selectedQualities.push('蓝');
        if (allowSellPurpleItems) selectedQualities.push('紫');
        if (allowSellGoldItems) selectedQualities.push('金');
        if (allowSellRedItems) selectedQualities.push('红');
        
        if (selectedQualities.length === 0) {
            errorMessage = '请至少选择一种品质进行出售';
        } else if (filteredCount > 0) {
            errorMessage = `已选择出售品质：${selectedQualities.join('、')}，但没有对应物品`;
        }
        
        showFloatingText(errorMessage, null, '#ef4444');
        return;
    }

    const totalValue = itemsToSell.reduce((sum, item) => sum + item.value, 0);
    
    if (totalValue > 0) {
        gameState.warehouseCoins += totalValue;
        showFloatingText(`+${totalValue.toLocaleString()}`, null, '#10b981');
        
        // 从仓库中移除已出售的物品，保留不被出售的物品
        gameState.warehouse.items = gameState.warehouse.items.filter(item => {
            // 检查物品是否在可出售列表中
            return !itemsToSell.some(sellItem => sellItem === item);
        });
        
        // 构建提示信息
        const soldQualities = [];
        if (allowSellWhiteItems) soldQualities.push('白');
        if (allowSellGreenItems) soldQualities.push('绿');
        if (allowSellBlueItems) soldQualities.push('蓝');
        if (allowSellPurpleItems) soldQualities.push('紫');
        if (allowSellGoldItems) soldQualities.push('金');
        if (allowSellRedItems) soldQualities.push('红');
        
        if (soldQualities.length === 6) {
            message = '出售全部品质物品';
        } else {
            message = `出售${soldQualities.join('、')}品质物品`;
        }
        
        if (!allowSellUpgradeMaterials) {
            message += '（已保护升级材料）';
        }
        
        showFloatingText(message, null, '#fbbf24');
    }
    
    updateUI();
    renderWarehouse();
}

// 获取当前等级所需升级材料的具体数量要求
function getCurrentLevelUpgradeMaterialRequirements() {
    const requirements = {};
    
    // 遍历所有能力的升级需求
    Object.keys(upgradeRequirements).forEach(ability => {
        const config = upgradeSystem[ability];
        const abilityRequirements = upgradeRequirements[ability];
        
        // 获取当前等级对应的道具需求（等级从1开始，数组索引从0开始）
        const currentLevelIndex = config.level - 1;
        
        // 检查是否已达到最高等级
        if (config.level >= config.maxLevel || currentLevelIndex >= abilityRequirements.length) {
            return; // 跳过已达到最高等级的能力
        }
        
        // 获取当前等级所需的道具
        const currentLevelRequirements = abilityRequirements[currentLevelIndex] || [];
        
        // 将当前等级所需的道具和数量添加到需求对象中
        currentLevelRequirements.forEach(req => {
            if (requirements[req.item]) {
                requirements[req.item] += req.count;
            } else {
                requirements[req.item] = req.count;
            }
        });
    });
    
    return requirements;
}

// 计算仓库中每种升级材料的当前数量
function getCurrentUpgradeMaterialCounts() {
    const counts = {};
    
    gameState.warehouse.items.forEach(item => {
        if (isUpgradeMaterial(item.name)) {
            if (counts[item.name]) {
                counts[item.name]++;
            } else {
                counts[item.name] = 1;
            }
        }
    });
    
    return counts;
}

// 获取当前等级所需的升级材料（只保护当前等级需要的材料）
function getCurrentLevelUpgradeMaterialItems() {
    const currentLevelItems = new Set();
    
    // 遍历所有能力的升级需求
    Object.keys(upgradeRequirements).forEach(ability => {
        const config = upgradeSystem[ability];
        const requirements = upgradeRequirements[ability];
        
        // 获取当前等级对应的道具需求（等级从1开始，数组索引从0开始）
        const currentLevelIndex = config.level - 1;
        
        // 检查是否已达到最高等级
        if (config.level >= config.maxLevel || currentLevelIndex >= requirements.length) {
            return; // 跳过已达到最高等级的能力
        }
        
        // 获取当前等级所需的道具
        const currentLevelRequirements = requirements[currentLevelIndex] || [];
        
        // 将当前等级所需的道具添加到集合中
        currentLevelRequirements.forEach(req => {
            currentLevelItems.add(req.item);
        });
    });
    
    return Array.from(currentLevelItems);
}

// 获取所有升级消耗物品的函数（保留原函数用于其他用途）
function getAllUpgradeMaterialItems() {
    const upgradeItems = new Set();
    
    // 遍历所有能力的升级需求
    Object.keys(upgradeRequirements).forEach(ability => {
        const requirements = upgradeRequirements[ability];
        
        // 遍历所有等级的要求
        requirements.forEach(levelRequirements => {
            levelRequirements.forEach(req => {
                upgradeItems.add(req.item);
            });
        });
    });
    
    return Array.from(upgradeItems);
}

// 判断物品是否为升级材料的辅助函数
function isUpgradeMaterial(itemName) {
    // 如果传入的是对象，提取name属性
    if (typeof itemName === 'object' && itemName !== null && itemName.name) {
        itemName = itemName.name;
    }
    
    // 确保itemName是字符串
    if (typeof itemName !== 'string') {
        return false;
    }
    
    // 只获取当前等级所需的升级材料
    const currentLevelMaterials = getCurrentLevelUpgradeMaterialItems();
    
    const isMatch = currentLevelMaterials.includes(itemName);
    
    if (isMatch) {
        console.log(`升级材料检测: "${itemName}" 被识别为当前等级升级材料`);
    }
    
    return isMatch;
}

// 生成随机宝箱（根据出现概率选择，确保不重复）
function generateRandomChests() {
    const chestTypes = Object.keys(chestConfig);
    const selectedChests = [];
    const usedTypes = new Set(); // 用于跟踪已选择的类型
    
    // 如果宝箱类型数量少于4个，允许重复
    const allowDuplicates = chestTypes.length < 4;
    
    // 根据概率选择4个宝箱（不重复，除非类型不足）
    for (let i = 0; i < 4; i++) {
        let selectedType = null;
        let attempts = 0;
        const maxAttempts = 50; // 防止无限循环
        
        do {
            // 计算可用宝箱类型的概率总和
            const availableTypes = allowDuplicates ? chestTypes : chestTypes.filter(type => !usedTypes.has(type));
            
            // 如果没有可用类型了，跳出循环
            if (availableTypes.length === 0) {
                break;
            }
            
            const totalProbability = availableTypes.reduce((sum, type) => sum + chestConfig[type].appearanceChance, 0);
            
            // 使用轮盘赌算法根据归一化后的appearanceChance选择宝箱
            const rand = Math.random();
            let cumulativeProbability = 0;
            
            for (const type of availableTypes) {
                // 归一化概率
                const normalizedProbability = chestConfig[type].appearanceChance / totalProbability;
                cumulativeProbability += normalizedProbability;
                
                if (rand <= cumulativeProbability) {
                    selectedType = type;
                    break;
                }
            }
            
            // 如果没有选中任何类型，选择第一个可用类型
            if (!selectedType) {
                selectedType = availableTypes[0];
            }
            
            attempts++;
        } while (!allowDuplicates && usedTypes.has(selectedType) && attempts < maxAttempts);
        
        // 如果经过多次尝试仍然没有找到未使用的类型，随机选择一个可用类型
        if (!allowDuplicates && usedTypes.has(selectedType)) {
            const availableTypes = chestTypes.filter(type => !usedTypes.has(type));
            if (availableTypes.length > 0) {
                selectedType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }
        }
        
        // 如果仍然没有选中类型，使用第一个类型
        if (!selectedType) {
            selectedType = chestTypes[0];
        }
        
        // 记录已使用的类型
        if (!allowDuplicates) {
            usedTypes.add(selectedType);
        }
        
        // 获取基础配置并添加随机波动
        const baseConfig = chestConfig[selectedType];
        const baseCrisisChance = baseConfig.crisisChance;
        
        // 添加±10%的随机波动，但确保在合理范围内
        const minCrisisChance = Math.max(0.05, baseCrisisChance * 0.9);
        const maxCrisisChance = Math.min(0.95, baseCrisisChance * 1.1);
        const randomCrisisChance = Math.max(minCrisisChance, Math.min(maxCrisisChance, 
            baseCrisisChance + (Math.random() - 0.5) * baseCrisisChance * 0.2));
        
        selectedChests.push({
            type: selectedType,
            ...baseConfig,
            crisisChance: randomCrisisChance
        });
    }
    
    // 使用Fisher-Yates洗牌算法完全打乱顺序
    for (let i = selectedChests.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selectedChests[i], selectedChests[j]] = [selectedChests[j], selectedChests[i]];
    }
    
    gameState.currentChests = selectedChests;
    renderChests();
    playRefreshAnimation();
}

// 播放刷新动画（按品质颜色）
function playRefreshAnimation() {
    const chestCards = elements.chestsContainer.children;
    for (let i = 0; i < chestCards.length; i++) {
        const chest = gameState.currentChests[i];
        const animationClass = `chest-refresh-${chest.color}`;
        
        setTimeout(() => {
            chestCards[i].classList.add(animationClass);
            setTimeout(() => {
                chestCards[i].classList.remove(animationClass);
            }, 800);
        }, i * 150);
    }
}

// 更新渲染宝箱函数，重构卡片样式
function renderChests() {
    elements.chestsContainer.innerHTML = gameState.currentChests.map((chest, index) => {
        // 应用遇敌率升级效果并显示实际遇敌率
        const actualCrisisChance = chest.crisisChance * (gameState.upgrades?.enemyMultiplier || 1);
        const crisisChancePercent = Math.floor(actualCrisisChance * 100);
        
        // 根据品质设置颜色映射
        const colorMap = {
            red: { border: 'border-red-500', bg: 'bg-red-900/30', text: 'text-red-400', hover: 'hover:border-red-400' },
            gold: { border: 'border-yellow-500', bg: 'bg-yellow-900/30', text: 'text-yellow-400', hover: 'hover:border-yellow-400' },
            purple: { border: 'border-purple-500', bg: 'bg-purple-900/30', text: 'text-purple-400', hover: 'hover:border-purple-400' },
            blue: { border: 'border-blue-500', bg: 'bg-blue-900/30', text: 'text-blue-400', hover: 'hover:border-blue-400' },
            green: { border: 'border-green-500', bg: 'bg-green-900/30', text: 'text-green-400', hover: 'hover:border-green-400' },
            white: { border: 'border-gray-500', bg: 'bg-gray-900/30', text: 'text-gray-400', hover: 'hover:border-gray-400' }
        };
        
        const colors = colorMap[chest.color] || colorMap.white;
        
        return `
            <div class="chest-card ${colors.bg} rounded-xl p-4 border-2 ${colors.border} ${colors.hover} cursor-pointer 
                          hover:scale-105 transition-all duration-300 transform hover:shadow-lg hover:shadow-${chest.color}-500/30 
                          flex flex-col items-center justify-between min-h-[180px]" 
                 onclick="openChest(${gameState.currentChests.indexOf(chest)})">
                
                <!-- 图标区域 -->
                <div class="text-6xl mb-3 drop-shadow-lg">${chest.icon}</div>
                
                <!-- 名称区域 -->
                <div class="text-center mb-3">
                    <h3 class="font-bold text-lg text-white mb-1">${chest.name}</h3>
                </div>
                
                <!-- 遇敌概率区域 -->
                <div class="text-center">
                    <div class="inline-flex items-center px-3 py-1 rounded-full ${colors.bg}">
                        <i class="fas fa-exclamation-triangle mr-1 ${colors.text}"></i>
                        <span class="text-sm font-bold ${colors.text}">遇敌 ${crisisChancePercent}%</span>
                    </div>
                </div>
                
                <!-- 悬停提示 -->
                <div class="absolute inset-0 bg-black/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="text-white font-bold text-sm"></div>
                </div>
            </div>
        `;
    }).join('');
}

// 修改开启宝箱函数，添加速度影响和随机波动
function openChest(index) {
    const chest = gameState.currentChests[index];
    
    // 播放开箱音效
    soundManager.play('openChest');
    
    // 检查背包容量
    if (isBackpackFull()) {
        soundManager.play('error');
        showBackpackFullModal(index);
        return;
    }

    // 宝箱动画
    const chestCard = elements.chestsContainer.children[index];
    chestCard.classList.add('scale-110');
    setTimeout(() => chestCard.classList.remove('scale-110'), 200);

    // 计算减少的距离：速度值 + 随机波动10米
    const speedValue = gameState.player.speed;
    const randomVariation = Math.floor(Math.random() * 21) - 10; // -10到+10的随机波动
    const totalReduction = Math.max(1, speedValue + randomVariation); // 确保至少减少1米

    // 减少距离
    gameState.distance = Math.max(0, gameState.distance - totalReduction);

    // 检查是否触发危机事件（遇敌）- 应用遇敌率升级效果
    const actualCrisisChance = chest.crisisChance * (gameState.upgrades?.enemyMultiplier || 1);
    if (Math.random() < actualCrisisChance) {
        triggerCrisisEvent(chest);
        return;
    }

    // 生成道具并暂存（不再立即触发随机事件）
    const item = generateRandomItem(chest.rates);
    pendingItem = item;
    
    // 显示道具弹窗
    showItemModal(item);
    
    // 立即刷新宝箱
    generateRandomChests();
    updateUI();
    
    // 保存游戏进度
    GameSave.save();
}

// 修改触发危机事件函数，实现宝箱品质与敌人难度的关联
function triggerCrisisEvent(chest) {
    // 播放危机事件音效
    soundManager.play('warning');
    
    // 保存当前宝箱配置
    currentCrisisChest = chest;
    
    // 根据宝箱品质选择敌人
    const enemy = selectEnemyByChestQuality(chest);
    
    // 获取随机攻击力
    const actualAttack = getRandomAttackInRange(enemy.baseAttack, enemy.maxAttack);
    enemy.attack = actualAttack;
    
    // 计算战斗伤害
    const damage = Math.max(1, actualAttack - (gameState.player.attack + gameState.player.defense));
    // 应用逃离率升级效果并显示实际逃离率
    const actualEscapeChance = Math.min(0.95, enemy.escapeChance * (gameState.upgrades?.escapeMultiplier || 1));
    const escapeChance = Math.floor(actualEscapeChance * 100);
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gradient-to-br from-red-900 via-gray-900 to-red-800 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-red-500 shadow-2xl">
            <div class="text-center">
                <div class="text-8xl mb-6 animate-pulse">${enemy.icon}</div>
                <h3 class="text-3xl font-bold mb-4 text-red-400">${enemy.name}</h3>
                <p class="text-gray-300 text-lg mb-6">${enemy.description}</p>
                
                <div class="bg-red-800/50 rounded-lg p-6 mb-6">
                    <p class="text-red-300 text-2xl font-bold">
                        <i class="fas fa-crosshairs mr-2"></i>敌人战斗力: <span class="text-white font-bold text-3xl">${actualAttack}</span>
                    </p>
                </div>
                
                <div class="text-center mb-4">
                    <p class="text-gray-400 text-sm">伤害=敌人战斗力-战斗力-护甲值</p>
                </div>
                
                <div class="flex gap-4 justify-center">
                    <button onclick="attemptEscape(${enemy.escapeChance}, ${actualAttack}, '${enemy.name}')" 
                            class="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                        <i class="fas fa-running mr-2"></i>逃离 (${escapeChance}%)
                    </button>
                    <button onclick="startCombat(${actualAttack}, '${enemy.name}')" 
                            class="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                        <i class="fas fa-fist-raised mr-2"></i>战斗 (-${damage}生命)
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// 新增：根据宝箱品质选择敌人的函数
function selectEnemyByChestQuality(chest) {
    // 定义敌人品质等级
    const enemyTiers = {
        white: crisisEnemies.filter(e => e.name.includes("跑刀仔") || e.name.includes("阿萨拉士兵") || e.name.includes("哈夫克士兵") || e.name.includes("人机哈基蜂") || e.name.includes("幸运鼠鼠")),
        green: crisisEnemies.filter(e => e.name.includes("制式套鼠鼠") || e.name.includes("麦小鼠同行") || e.name.includes("盾兵") || e.name.includes("阴暗爬行鼠鼠")),
        blue: crisisEnemies.filter(e => e.name.includes("机枪兵") || e.name.includes("喷火兵") || e.name.includes("幽默静步男无名") || e.name.includes("狙击兵") || e.name.includes("火箭兵")),
        purple: crisisEnemies.filter(e => e.name.includes("渡鸦") || e.name.includes("赛伊德") || e.name.includes("曼巴肘击王雷斯") || e.name.includes("超雄老太") || e.name.includes("蓝鹰直升机")),
        gold: crisisEnemies.filter(e => e.name.includes("红皮花来") || e.name.includes("威龙") || e.name.includes("乌鲁鲁") || e.name.includes("三盾狗") || e.name.includes("M14大人")),
        red: crisisEnemies.filter(e => e.name.includes("刘涛全装队") || e.name.includes("佐娅护航队") || e.name.includes("天才少年") || e.name.includes("寻血猎犬") || e.name.includes("清图主播队") || e.name.includes("巅峰5000星威龙"))
    };

    // 根据宝箱品质设置选择概率
    let tierWeights = {};
    
    switch(chest.rarity) {
        case 'legendary': // 红色品质
            tierWeights = { white: 0.02, green: 0.05, blue: 0.13, purple: 0.25, gold: 0.35, red: 0.20 };
            break;
        case 'epic': // 金色品质
            tierWeights = { white: 0.05, green: 0.10, blue: 0.20, purple: 0.35, gold: 0.25, red: 0.05 };
            break;
        case 'rare': // 紫色品质
            tierWeights = { white: 0.10, green: 0.20, blue: 0.35, purple: 0.25, gold: 0.08, red: 0.02 };
            break;
        case 'uncommon': // 蓝色品质
            tierWeights = { white: 0.20, green: 0.35, blue: 0.25, purple: 0.15, gold: 0.05, red: 0.00 };
            break;
        case 'common': // 绿色品质
            tierWeights = { white: 0.35, green: 0.35, blue: 0.20, purple: 0.08, gold: 0.02, red: 0.00 };
            break;
        case 'trash': // 白色品质
        default:
            tierWeights = { white: 0.50, green: 0.30, blue: 0.15, purple: 0.04, gold: 0.01, red: 0.00 };
            break;
    }

    // 根据权重选择敌人等级
    const rand = Math.random();
    let selectedTier = 'white';
    
    let cumulative = 0;
    for (const [tier, weight] of Object.entries(tierWeights)) {
        cumulative += weight;
        if (rand <= cumulative) {
            selectedTier = tier;
            break;
        }
    }

    // 从选中的等级中随机选择敌人
    const availableEnemies = enemyTiers[selectedTier];
    if (availableEnemies && availableEnemies.length > 0) {
        return availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    }

    // 如果找不到对应等级的敌人，返回一个默认敌人
    return crisisEnemies[0];
}

// 恢复玩家状态栏层级的函数已移除

// 修改尝试逃离函数，添加恢复层级逻辑
function attemptEscape(escapeChance, enemyAttack, enemyName) {
    // 应用逃离率升级效果
    const actualEscapeChance = Math.min(0.95, escapeChance * (gameState.upgrades?.escapeMultiplier || 1));
    const success = Math.random() < actualEscapeChance;
    
    // 关闭危机弹窗
    const crisisModal = document.querySelector('.fixed.inset-0.bg-black\\/80');
    if (crisisModal) {
        crisisModal.remove();
    }
    
    if (success) {
        // 播放逃离成功音效
        soundManager.play('success');
        // 逃离成功 - 直接结束，不再获得道具
        showFloatingText(`成功逃离了 ${enemyName}！`, null, '#10b981');
        
        // 清空保存的宝箱配置
        currentCrisisChest = null;
        
        // 立即刷新宝箱
        generateRandomChests();
        updateUI();
    } else {
        // 播放逃离失败音效
        soundManager.play('damage');
        // 逃离失败，显示确认弹窗
        showEscapeFailureModal(enemyName, enemyAttack);
    }
}

// 修改开始战斗函数
function startCombat(enemyAttack, enemyName) {
    // 播放战斗音效
    soundManager.play('battle');
    
    // 立即关闭危机弹窗
    const crisisModal = document.querySelector('.fixed.inset-0.bg-black\\/80');
    if (crisisModal) {
        crisisModal.remove();
    }
    
    // 计算战斗伤害（计入护甲值）
    const damage = Math.max(1, enemyAttack - (gameState.player.attack + gameState.player.defense));
    
    // 计算护甲值减少量：扣除敌人攻击力的1/3
    const armorReduction = Math.max(0, Math.floor(enemyAttack / 3));
    
    // 直接扣除生命值和护甲值
    gameState.player.health = Math.max(0, gameState.player.health - damage);
    gameState.player.defense = Math.max(0, gameState.player.defense - armorReduction);
    
    // 更新当前装备护甲的状态记录
    if (currentGear.armor && armorReduction > 0) {
        const armorIndex = gearData.armors.findIndex(a => a.name === currentGear.armor.name);
        if (armorIndex !== -1 && armorStates[armorIndex]) {
            armorStates[armorIndex].currentDurability = gameState.player.defense;
        }
    }
    
    // 显示战斗结果浮动文字
    showFloatingText(`战斗结束！-${damage}生命 ${armorReduction > 0 ? `-${armorReduction}护甲` : ''}`, null, '#ef4444');
    
    // 更新UI
    updateUI();
    
    // 检查是否死亡 - 确保触发撤离失败
    if (gameState.player.health <= 0) {
        // 播放死亡音效
        soundManager.play('defeat');
        // 立即触发撤离失败，不再延迟
        triggerEvacuationFailure();
        return;
    }
    
    // 继续正常流程
    continueAfterCrisis();
}

// 修改逃离失败函数，确保触发撤离失败
function showEscapeFailureModal(enemyName, enemyAttack) {
    // 立即关闭逃离失败弹窗
    const modal = document.querySelector('.fixed.inset-0.bg-black\\/80');
    if (modal) {
        modal.remove();
    }
    
    // 直接扣除生命值（逃离失败时不扣除护甲值）
    gameState.player.health = Math.max(0, gameState.player.health - enemyAttack);
    
    // 显示逃离失败浮动文字
    showFloatingText(`逃离失败！-${enemyAttack}生命`, null, '#ef4444');
    
    // 更新UI
    updateUI();
    
    // 检查是否死亡 - 确保触发撤离失败
    if (gameState.player.health <= 0) {
        // 播放死亡音效
        soundManager.play('defeat');
        // 立即触发撤离失败，不再延迟
        triggerEvacuationFailure();
        return;
    }
    
    // 继续正常流程
    continueAfterCrisis();
}

// 修改危机事件后继续正常流程
function continueAfterCrisis() {
    // 使用保存的宝箱配置，而不是当前刷新后的配置
    const chest = currentCrisisChest;
    
    // 使用保存的宝箱配置生成道具
    if (chest) {
        const item = generateRandomItem(chest.rates);
        pendingItem = item;
        
        // 显示道具弹窗
        showItemModal(item);
    }
    
    // 清空保存的宝箱配置
    currentCrisisChest = null;
    
    // 立即刷新宝箱
    generateRandomChests();
    updateUI();
    
    // 保存游戏进度
    GameSave.save();
}

// 修改触发撤离失败函数，只显示弹窗，不立即执行清理操作
function triggerEvacuationFailure() {
    // 只显示撤离失败弹窗，不执行清理操作
    showEvacuationFailureModal();
}

// 新增：执行撤离失败后的清理操作
function executeEvacuationFailure() {
    // 清空背包物品
    gameState.items = [];
    // 清空背包哈夫币
    gameState.backpackCoins = 0;
    
    // 丢失当前装备并同步清除ownedGear中的记录
    const lostEquipment = [];
    
    if (currentGear.weapon) {
        lostEquipment.push(currentGear.weapon.name);
        const weaponIndex = gearData.weapons.findIndex(w => w.name === currentGear.weapon.name);
        if (weaponIndex !== -1) {
            ownedGear.weapon = ownedGear.weapon.filter(index => index !== weaponIndex);
        }
        currentGear.weapon = null;
    }
    
    if (currentGear.armor) {
        lostEquipment.push(currentGear.armor.name);
        const armorIndex = gearData.armors.findIndex(a => a.name === currentGear.armor.name);
        if (armorIndex !== -1) {
            ownedGear.armor = ownedGear.armor.filter(index => index !== armorIndex);
            // 清除丢失护甲的状态记录
            delete armorStates[armorIndex];
        }
        currentGear.armor = null;
    }
    
    if (currentGear.backpack) {
        lostEquipment.push(currentGear.backpack.name);
        const backpackIndex = gearData.backpacks.findIndex(b => b.name === currentGear.backpack.name);
        if (backpackIndex !== -1) {
            ownedGear.backpack = ownedGear.backpack.filter(index => index !== backpackIndex);
        }
        currentGear.backpack = null;
    }
    
    // 只恢复生命值，同时重置护甲值
    gameState.player.health = gameState.player.maxHealth;
    
    // 重置基础属性，包括护甲值（因为装备已丢失）
    gameState.player.attack = 0;
    gameState.player.defense = 0;
    gameState.player.maxDefense = 0;
    gameState.backpack.maxSlots = 8;
    gameState.player.speed = 100;
    
    // 关闭所有动态弹窗（保留预定义弹窗）
    removeDynamicOverlays();
    
    // 关闭道具弹窗
    elements.itemModal.classList.add('hidden');
    
    // 更新装备显示
    updateCurrentGearDisplay();
    
    // 显示装备丢失提示
    if (lostEquipment.length > 0) {
        showNotification(`装备已丢失: ${lostEquipment.join(', ')}`, 'error');
    }
    
    // 停止环境音效
    soundManager.stopAmbientSound();
    
    // 返回特勤处
    showInterface('special-forces');
    
    // 更新装备按钮状态
    updateGearButtons();
}

// 确保showEvacuationFailureModal函数存在且正确
function showEvacuationFailureModal() {
    // 先关闭所有其他动态弹窗（保留预定义弹窗）
    removeDynamicOverlays();
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gradient-to-br from-red-900 via-gray-900 to-red-800 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-red-500 shadow-2xl">
            <div class="text-center">
                <div class="text-8xl mb-6">💀</div>
                <h3 class="text-3xl font-bold mb-4 text-red-400">撤离失败！</h3>
                <div class="bg-red-800/50 rounded-lg p-4 mb-4">
                    <p class="text-red-300 text-lg mb-2">
                        <i class="fas fa-heart-broken mr-2"></i>生命值已归零！
                    </p>
                    <p class="text-gray-300 text-lg mb-2">
                        <i class="fas fa-boxes mr-2"></i>背包中的所有物品已丢失！
                    </p>
                    <p class="text-gray-300 text-lg">
                        <i class="fas fa-shield-alt mr-2"></i>当前装备已丢失！
                    </p>
                </div>
                <p class="text-gray-300 mb-6">
                    生命值已恢复，请返回特勤处重新准备！
                </p>
                <button onclick="executeEvacuationFailure();" 
                        class="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                    <i class="fas fa-home mr-2"></i>返回特勤处
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 生成随机道具
function generateRandomItem(rates) {
    const rand = Math.random();
    let rarity;

    // 修复概率计算逻辑，使用正确的累加方式
    const cumulativeRed = rates.red;
    const cumulativeGold = cumulativeRed + rates.gold;
    const cumulativePurple = cumulativeGold + rates.purple;
    const cumulativeBlue = cumulativePurple + rates.blue;
    const cumulativeGreen = cumulativeBlue + rates.green;
    // 剩余的自动分配给白色

    if (rand < cumulativeRed) {
        rarity = 'red';
    } else if (rand < cumulativeGold) {
        rarity = 'gold';
    } else if (rand < cumulativePurple) {
        rarity = 'purple';
    } else if (rand < cumulativeBlue) {
        rarity = 'blue';
    } else if (rand < cumulativeGreen) {
        rarity = 'green';
    } else {
        rarity = 'white';
    }

    const items = itemDatabase[rarity];
    const item = items[Math.floor(Math.random() * items.length)];
    
    return {
        ...item,
        id: Date.now() + Math.random(),
        rarity: rarity
    };
}

// 显示背包已满提示，包含快速丢弃按钮
function showInventoryFullNotification() {
    const tipContainer = document.getElementById('tip-container');
    if (!tipContainer) return;
    
    const notification = document.createElement('div');
    notification.className = 'tip-popup tip-error flex flex-col items-center';
    notification.style.cssText = 'min-width: 300px; padding: 16px;';
    
    notification.innerHTML = `
        <div class="text-center mb-3">
            <h3 class="text-lg font-bold text-red-400 mb-2">背包已满！</h3>
            <p class="text-sm text-gray-300">无法拾取新物品</p>
        </div>
        <div class="flex gap-2">
            <button onclick="quickDiscardLowestValueItem(this)" 
                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                快速丢弃
            </button>
            <button onclick="closeInventoryFullNotification(this)" 
                    class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
                知道了
            </button>
        </div>
    `;
    
    tipContainer.insertBefore(notification, tipContainer.firstChild);
    
    // 限制同时显示的通知数量
    const tips = tipContainer.querySelectorAll('.tip-popup');
    if (tips.length > 5) {
        for (let i = 5; i < tips.length; i++) {
            tips[i].remove();
        }
    }
}

// 关闭背包已满通知
function closeInventoryFullNotification(button) {
    const notification = button.closest('.tip-popup');
    if (notification) {
        notification.remove();
    }
}

// 快速丢弃价值最低的物品
function quickDiscardLowestValueItem(button) {
    if (gameState.items.length === 0) {
        showFloatingText('背包为空！', null, '#fbbf24');
        return;
    }
    
    // 找到价值最低的物品
    let lowestValueIndex = 0;
    let lowestValue = gameState.items[0].value;
    
    for (let i = 1; i < gameState.items.length; i++) {
        if (gameState.items[i].value < lowestValue) {
            lowestValue = gameState.items[i].value;
            lowestValueIndex = i;
        }
    }
    
    const discardedItem = gameState.items[lowestValueIndex];
    
    // 移除物品
    gameState.items.splice(lowestValueIndex, 1);
    
    // 更新UI
    updateUI();
    renderItems();
    
    // 显示丢弃提示
    showFloatingText(`已丢弃 ${discardedItem.name} (${discardedItem.value.toLocaleString()})`, null, '#ef4444');
    
    // 关闭通知
    const notification = button.closest('.tip-popup');
    if (notification) {
        notification.remove();
    }
    
    // 保存游戏进度
    GameSave.save();
}

// 添加道具到背包
function addItemToInventory(item) {
    if (gameState.items.length >= gameState.backpack.maxSlots) {
        showInventoryFullNotification();
        return;
    }
    
    gameState.items.unshift(item);
    
    // 注意：零号大坝背包获得物品时不解锁图鉴，只有仓库获得物品时才解锁
    
    updateUI();
    renderItems();
}

// 出售单个道具
function sellItem(index) {
    const item = gameState.items[index];
    gameState.backpackCoins += item.value;
    
    showFloatingText(`+${item.value.toLocaleString()}`, null, '#10b981');
    
    gameState.items.splice(index, 1);
    updateUI();
    renderItems();
    
    // 保存游戏进度
    GameSave.save();
}

// 显示道具弹窗
function showItemModal(item) {
    elements.modalItemIcon.textContent = item.icon;
    elements.modalItemName.textContent = item.name;
    elements.modalItemValue.textContent = item.value.toLocaleString();
    
    // 播放品质对应的音效
    soundManager.playQualitySound(item.rarity);
    
    // 获取品质颜色映射 - 使用道具的rarity属性
    const colorMap = {
        red: 'red',
        gold: 'yellow',
        purple: 'purple',
        blue: 'blue',
        green: 'green',
        white: 'gray'
    };
    
    const color = colorMap[item.rarity] || 'gray';
    
    // 设置边框颜色
    const modalContainer = document.getElementById('modal-container');
    modalContainer.className = `bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 border-2 border-${color}-500 scale-in`;
    
    // 设置名字背景色 - 使用对应品质的颜色和透明度
    const nameContainer = document.getElementById('modal-item-name-container');
    nameContainer.className = `mb-4 rounded-lg px-4 py-2 bg-${color}-600/30`;
    
    // 显示光效
    showItemGlow(item.rarity);
    
    elements.itemModal.classList.remove('hidden');
}

// 显示道具获得光效
function showItemGlow(rarity) {
    const glowContainer = document.getElementById('item-glow');
    const glowEffect = document.getElementById('glow-effect');
    
    // 清除之前的类
    glowEffect.className = 'w-[1152px] h-[1152px] rounded-full opacity-0';
    
    // 设置对应品质的颜色
    const colorMap = {
        red: 'rgba(220, 38, 38, 0.8)',
        gold: 'rgba(251, 191, 36, 0.8)',
        purple: 'rgba(168, 85, 247, 0.8)',
        blue: 'rgba(37, 99, 235, 0.8)',
        green: 'rgba(34, 197, 94, 0.8)',
        white: 'rgba(255, 255, 255, 0.8)'
    };
    
    const glowClass = `glow-${rarity}`;
    
    // 显示光效容器
    glowContainer.classList.remove('hidden');
    
    // 设置颜色并触发动画
    setTimeout(() => {
        glowEffect.classList.add(glowClass);
    }, 100);
    
    // 1100毫秒后隐藏光效（之前是700ms，现在动画时长为1.1s）
    setTimeout(() => {
        glowContainer.classList.add('hidden');
        glowEffect.classList.remove(glowClass);
    }, 1100);
}

// 关闭弹窗并添加道具到背包，然后在关闭后概率触发随机事件
function closeModal() {
    if (pendingItem) {
        // 将暂存的道具添加到背包
        addItemToInventory(pendingItem);
        
        // 显示获得物品的tip提示
        showFloatingText(`获得 ${pendingItem.name}`, null, '#10b981');
        
        pendingItem = null; // 清空暂存
        
        // 在关闭弹窗后概率触发随机事件（20%概率）
        setTimeout(() => {
            if (Math.random() < 0.2) {
                triggerRandomEvent();
            }
        }, 300); // 延迟300ms，让用户先看到获得物品的提示
    }
    elements.itemModal.classList.add('hidden');
}

// 获取品质颜色
function getRarityColor(rarity) {
    const colorMap = {
        red: 'red',
        gold: 'yellow',
        purple: 'purple',
        blue: 'blue',
        green: 'green',
        white: 'gray'
    };
    return colorMap[rarity];
}

// 添加背包容量显示更新函数
function updateBackpackCapacity() {
    const capacityElement = document.getElementById('backpack-capacity');
    if (capacityElement) {
        capacityElement.textContent = `(${gameState.items.length}/${gameState.backpack.maxSlots})`;
        
        // 当背包满时改变颜色
        if (gameState.items.length >= gameState.backpack.maxSlots) {
            capacityElement.className = 'text-sm text-red-400 ml-2';
        } else {
            capacityElement.className = 'text-sm text-gray-400 ml-2';
        }
    }
}

// 添加仓库容量显示更新函数
function updateWarehouseCapacity() {
    const capacityElement = document.getElementById('warehouse-capacity');
    if (capacityElement) {
        // 添加安全检查，确保warehouse.items存在
        if (!gameState.warehouse.items) {
            gameState.warehouse.items = [];
        }
        capacityElement.textContent = `(${gameState.warehouse.items.length}/${gameState.warehouse.maxSlots})`;
        
        // 当仓库超过格数上限时改变颜色
        if (gameState.warehouse.items.length > gameState.warehouse.maxSlots) {
            capacityElement.className = 'text-sm text-red-400 ml-2';
        } else {
            capacityElement.className = 'text-sm text-gray-400 ml-2';
        }
    }
}

// 检查背包是否已满
function isBackpackFull() {
    return gameState.items.length >= gameState.backpack.maxSlots;
}

// 检查仓库是否超过格数上限
function isWarehouseOverLimit() {
    // 添加安全检查，确保warehouse.items存在
    if (!gameState.warehouse.items) {
        gameState.warehouse.items = [];
    }
    return gameState.warehouse.items.length > gameState.warehouse.maxSlots;
}

// 显示背包已满提示
function showBackpackFullModal(chestIndex = null) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-red-600 shadow-2xl">
            <div class="text-center">
                <div class="text-8xl mb-6 animate-bounce">🎒</div>
                <h3 class="text-3xl font-bold mb-4 text-red-400">背包已满！</h3>
                <div class="bg-red-800/50 rounded-lg p-4 mb-4">
                    <p class="text-red-300 text-lg mb-2">
                        <i class="fas fa-exclamation-triangle mr-2"></i>当前背包容量: <span class="font-bold text-white">${gameState.items.length}/${gameState.backpack.maxSlots}</span>
                    </p>
                    <p class="text-gray-300 text-sm">
                        请整理背包，或点击快速替换丢弃最便宜的物品！
                    </p>
                </div>
                <div class="flex gap-3 justify-center">
                    <button onclick="quickReplaceFromModal(this, ${chestIndex})" 
                            class="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                        快速替换
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                            class="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                        OKK
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 显示仓库超过格数上限提示
function showWarehouseOverLimitModal() {
    // 添加安全检查，确保warehouse.items存在
    if (!gameState.warehouse.items) {
        gameState.warehouse.items = [];
    }
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 border-2 border-red-600 shadow-2xl">
            <div class="text-center">
                <div class="text-8xl mb-6 animate-bounce">🏭</div>
                <h3 class="text-3xl font-bold mb-4 text-red-400">仓库超限！</h3>
                <div class="bg-red-800/50 rounded-lg p-4 mb-4">
                    <p class="text-red-300 text-lg mb-2">
                        <i class="fas fa-exclamation-triangle mr-2"></i>当前仓库容量: <span class="font-bold text-white">${gameState.warehouse.items.length}/${gameState.warehouse.maxSlots}</span>
                    </p>
                    <p class="text-gray-300 text-sm">
                        仓库物品数量超过格数上限，无法开始游戏！<br>
                        请出售部分物品后再开始游戏。
                    </p>
                </div>
                <div class="flex gap-3 justify-center">
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                            class="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105">
                        我知道了
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 从模态框快速替换物品并开启宝箱
function quickReplaceFromModal(button, chestIndex) {
    if (gameState.items.length === 0) {
        showFloatingText('背包为空！', null, '#fbbf24');
        return;
    }
    
    // 找到价值最低的物品
    let lowestValueIndex = 0;
    let lowestValue = gameState.items[0].value;
    
    for (let i = 1; i < gameState.items.length; i++) {
        if (gameState.items[i].value < lowestValue) {
            lowestValue = gameState.items[i].value;
            lowestValueIndex = i;
        }
    }
    
    const discardedItem = gameState.items[lowestValueIndex];
    
    // 移除最便宜的物品
    gameState.items.splice(lowestValueIndex, 1);
    
    // 显示丢弃提示
    showFloatingText(`已丢弃 ${discardedItem.name} (${discardedItem.value.toLocaleString()})`, null, '#ef4444');
    
    // 关闭模态框
    const modal = button.closest('.fixed');
    if (modal) {
        modal.remove();
    }
    
    // 如果提供了宝箱索引，继续开启宝箱
    if (chestIndex !== null && chestIndex !== undefined && gameState.currentChests[chestIndex]) {
        // 延迟一点执行，让用户看到提示
        setTimeout(() => {
            continueOpeningChest(chestIndex);
        }, 500);
    }
    
    // 更新UI
    updateUI();
    renderItems();
    
    // 保存游戏进度
    GameSave.save();
}

// 继续开启宝箱的函数
function continueOpeningChest(chestIndex) {
    const chest = gameState.currentChests[chestIndex];
    
    // 播放开箱音效
    soundManager.play('openChest');
    
    // 宝箱动画
    const chestCard = elements.chestsContainer.children[chestIndex];
    chestCard.classList.add('scale-110');
    setTimeout(() => chestCard.classList.remove('scale-110'), 200);
    
    // 计算减少的距离：速度值 + 随机波动10米
    const speedValue = gameState.player.speed;
    const randomVariation = Math.floor(Math.random() * 21) - 10;
    const totalReduction = Math.max(1, speedValue + randomVariation);
    
    // 减少距离
    gameState.distance = Math.max(0, gameState.distance - totalReduction);
    
    // 检查是否触发危机事件（遇敌）
    const actualCrisisChance = chest.crisisChance * (gameState.upgrades?.enemyMultiplier || 1);
    if (Math.random() < actualCrisisChance) {
        triggerCrisisEvent(chest);
        return;
    }
    
    // 生成道具并暂存
    const item = generateRandomItem(chest.rates);
    pendingItem = item;
    
    // 显示道具弹窗
    showItemModal(item);
    
    // 立即刷新宝箱
    generateRandomChests();
    updateUI();
    
    // 保存游戏进度
    GameSave.save();
}

// 丢弃当前道具
function discardCurrentItem() {
    if (pendingItem) {
        // 直接丢弃，不添加到背包
        showFloatingText(`丢弃了 ${pendingItem.name}`, null, '#ef4444');
        pendingItem = null;
        
        // 在关闭弹窗后概率触发随机事件（20%概率）
        setTimeout(() => {
            if (Math.random() < 0.2) {
                triggerRandomEvent();
            }
        }, 300); // 延迟300ms，让用户先看到丢弃物品的提示
    }
    elements.itemModal.classList.add('hidden');
}

// 丢弃背包中的物品
function discardItem(index) {
    const item = gameState.items[index];
    showFloatingText(`丢弃了 ${item.name}`, null, '#ef4444');
    
    gameState.items.splice(index, 1);
    updateUI();
    renderItems();
}

// 修改渲染道具列表函数，添加丢弃功能
function renderItems() {
    if (gameState.items.length === 0) {
        elements.itemsGrid.innerHTML = `
            <div class="col-span-full text-center py-12 text-slate-400">
                <i class="fas fa-box-open text-6xl mb-4 opacity-50"></i>
                <p>还没有获得任何道具，快去开启宝箱吧！</p>
            </div>
        `;
        return;
    }

    elements.itemsGrid.innerHTML = gameState.items.map((item, index) => `
        <div class="item-card bg-slate-700/50 rounded p-2 border border-slate-600 rarity-${item.rarity} cursor-pointer hover:scale-105 transition-transform" 
             title="点击丢弃 ${item.name}">
            <div class="text-center">
                <div class="text-2xl mb-1">${item.icon}</div>
                <div class="font-bold text-[10px] mb-1 truncate">${item.name}</div>
                <div class="text-[10px] text-yellow-400">${item.value.toLocaleString()}</div>
            </div>
        </div>
    `).join('');

    // 为每个道具卡片添加点击事件
    const itemCards = elements.itemsGrid.querySelectorAll('.item-card');
    itemCards.forEach((card, index) => {
        card.addEventListener('click', () => discardItem(index));
    });
}

// 出售全部道具
function sellAllItems() {
    if (gameState.items.length === 0) return;

    const totalValue = gameState.items.reduce((sum, item) => sum + item.value, 0);
    gameState.backpackCoins += totalValue;
    
    showFloatingText(`+${totalValue.toLocaleString()}`, elements.sellBtn, '#10b981');
    
    gameState.items = [];
    updateUI();
    renderItems();
}

// 修改更新UI函数，添加背包容量更新
function updateUI() {
    updateCoins();
    updateEvacuateButton();
    updateWarehouseSellButton();
    updatePlayerStatus();
    updateBackpackCapacity();
    updateWarehouseCapacity();
    
    // 应用升级效果
    applyUpgradeEffects();
    
    // 新增：更新右侧距离显示
    const distanceDisplayRight = document.getElementById('distance-display-right');
    if (distanceDisplayRight) {
        distanceDisplayRight.textContent = `${gameState.distance}米`;
    }
    
    // 添加生命值等级显示更新
    const healthLevelDisplay = document.getElementById('health-level-display');
    if (healthLevelDisplay) {
        healthLevelDisplay.textContent = `Lv.${upgradeSystem.health.level}`;
    }
    
    // 添加其他等级显示更新
    const escapeLevel = document.getElementById('escape-level');
    if (escapeLevel) {
        escapeLevel.textContent = `Lv.${upgradeSystem.escape.level}`;
    }
    
    const speedLevel = document.getElementById('speed-level');
    if (speedLevel) {
        speedLevel.textContent = `Lv.${upgradeSystem.speed.level}`;
    }
    
    const enemyLevel = document.getElementById('enemy-level');
    if (enemyLevel) {
        enemyLevel.textContent = `Lv.${upgradeSystem.enemy.level}`;
    }
}

// 更新哈夫币显示
function updateCoins() {
    elements.backpackCoins.textContent = gameState.backpackCoins.toLocaleString();
    elements.warehouseCoins.textContent = gameState.warehouseCoins.toLocaleString();
}

// 更新撤离按钮状态 - 确保始终可点击
function updateEvacuateButton() {
    const hasItems = gameState.items.length > 0 || gameState.backpackCoins > 0;
    const canEvacuate = gameState.distance === 0;
    
    // 移除之前的颜色类
    elements.evacuateBtn.classList.remove(
        'from-green-600', 'to-emerald-600', 'hover:from-green-700', 'hover:to-emerald-700',
        'from-red-600', 'to-red-700', 'hover:from-red-700', 'hover:to-red-800',
        'from-gray-600', 'to-gray-700', 'hover:from-gray-700', 'hover:to-gray-800',
        'evacuate-ready'
    );
    
    if (canEvacuate) {
        // 可撤离 - 绿色
        elements.evacuateBtn.classList.add('from-green-600', 'to-emerald-600', 'hover:from-green-700', 'hover:to-emerald-700');
        elements.evacuateBtn.classList.add('evacuate-ready');
    } else {
        // 无法撤离 - 灰色
        elements.evacuateBtn.classList.add('from-gray-600', 'to-gray-700', 'hover:from-gray-700', 'hover:to-gray-800');
        elements.evacuateBtn.classList.remove('evacuate-ready');
    }
    
    // 更新距离显示
    if (elements.distanceDisplay) {
        elements.distanceDisplay.textContent = `${gameState.distance}米`;
    }
    
    // 新增：更新绿色进度条
    const progressBar = document.getElementById('evacuate-progress');
    if (progressBar) {
        // 计算进度百分比（从1400米到0米）
        const maxDistance = 1400;
        const progress = Math.max(0, Math.min(100, ((maxDistance - gameState.distance) / maxDistance) * 100));
        progressBar.style.width = `${progress}%`;
        
        // 始终使用绿色，不再根据进度改变颜色
        progressBar.className = 'bg-green-500 h-2 rounded-full transition-all duration-500 relative';
        
        // 确保箭头元素存在并跟随进度
        let arrow = document.getElementById('evacuate-arrow');
        if (!arrow) {
            const progressContainer = progressBar.parentElement;
            arrow = document.createElement('div');
            arrow.id = 'evacuate-arrow';
            arrow.className = 'absolute';
            arrow.style.top = '-8px';
            arrow.innerHTML = '<i class="fas fa-chevron-right text-green-300 text-sm animate-pulse" style="text-shadow: 0 0 8px #10b981, 0 0 12px #10b981, 0 0 16px #10b981;"></i>';
            progressContainer.appendChild(arrow);
        }
        
        // 更新箭头位置以跟随进度
        if (arrow) {
            arrow.style.left = `calc(${progress}% - 2px)`;
        }
    }
}

// 更新仓库出售按钮状态 - 修改为绿色
function updateWarehouseSellButton() {
    // 添加安全检查，确保warehouse.items存在
    if (!gameState.warehouse.items) {
        gameState.warehouse.items = [];
    }
    const hasWarehouseItems = gameState.warehouse.items.length > 0;
    
    // 移除之前的颜色类
    elements.sellWarehouseBtn.classList.remove(
        'bg-gradient-to-r', 'from-red-600', 'to-orange-600', 'hover:from-red-700', 'hover:to-orange-700',
        'bg-gradient-to-r', 'from-green-600', 'to-emerald-600', 'hover:from-green-700', 'hover:to-emerald-700'
    );
    
    if (hasWarehouseItems) {
        // 有物品 - 绿色
        elements.sellWarehouseBtn.classList.add('bg-gradient-to-r', 'from-green-600', 'to-emerald-600', 'hover:from-green-700', 'hover:to-emerald-700');
        elements.sellWarehouseBtn.disabled = false;
        elements.sellWarehouseBtn.classList.remove('opacity-50');
    } else {
        // 无物品 - 灰色
        elements.sellWarehouseBtn.classList.add('bg-gradient-to-r', 'from-gray-600', 'to-gray-700', 'hover:from-gray-700', 'hover:to-gray-800');
        elements.sellWarehouseBtn.disabled = true;
        elements.sellWarehouseBtn.classList.add('opacity-50');
    }
}

// 更新玩家状态显示
function updatePlayerStatus() {
    // 更新特勤处界面的状态显示
    if (elements.healthDisplay) {
        elements.healthDisplay.textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;
    }
    if (elements.healthBar) {
        const healthPercentage = (gameState.player.health / gameState.player.maxHealth) * 100;
        elements.healthBar.style.width = `${healthPercentage}%`;
        
        // 根据生命值改变颜色
        if (healthPercentage <= 20) {
            elements.healthBar.className = 'bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all duration-300';
        } else if (healthPercentage <= 50) {
            elements.healthBar.className = 'bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-300';
        } else {
            elements.healthBar.className = 'bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-300';
        }
    }
    if (elements.attackDisplay) {
        elements.attackDisplay.textContent = gameState.player.attack;
    }
    if (elements.defenseDisplay) {
        elements.defenseDisplay.textContent = `${gameState.player.defense}/${gameState.player.maxDefense}`;
    }
    
    // 添加护甲值进度条更新
    const defenseBar = document.getElementById('defense-bar');
    if (defenseBar) {
        // 修复护甲值为0/0时进度条显示问题
        const defensePercentage = gameState.player.maxDefense === 0 ? 0 : (gameState.player.defense / gameState.player.maxDefense) * 100;
        defenseBar.style.width = `${defensePercentage}%`;
        
        // 根据护甲值改变颜色，确保进度条为空时也保持正确的高度
        if (defensePercentage === 0) {
            // 护甲为空时，使用透明背景但保持高度
            defenseBar.className = 'bg-transparent h-3 rounded-full transition-all duration-300';
        } else if (defensePercentage <= 20) {
            defenseBar.className = 'bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all duration-300';
        } else if (defensePercentage <= 50) {
            defenseBar.className = 'bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-300';
        } else {
            defenseBar.className = 'bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300';
        }
    }
    
    // 添加速度显示更新
    if (elements.speedDisplay) {
        elements.speedDisplay.textContent = gameState.player.speed;
    }
    
    // 更新零号大坝界面的状态显示
    const healthDisplayDam = document.getElementById('health-display-dam');
    if (healthDisplayDam) {
        healthDisplayDam.textContent = `${gameState.player.health}/${gameState.player.maxHealth}`;
    }
    
    const healthBarDam = document.getElementById('health-bar-dam');
    if (healthBarDam) {
        const healthPercentage = (gameState.player.health / gameState.player.maxHealth) * 100;
        healthBarDam.style.width = `${healthPercentage}%`;
        
        // 根据生命值改变颜色
        if (healthPercentage <= 20) {
            healthBarDam.className = 'bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all duration-300';
        } else if (healthPercentage <= 50) {
            healthBarDam.className = 'bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-300';
        } else {
            healthBarDam.className = 'bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-300';
        }
    }
    
    const attackDisplayDam = document.getElementById('attack-display-dam');
    if (attackDisplayDam) {
        attackDisplayDam.textContent = gameState.player.attack;
    }
    
    const defenseDisplayDam = document.getElementById('defense-display-dam');
    if (defenseDisplayDam) {
        defenseDisplayDam.textContent = `${gameState.player.defense}/${gameState.player.maxDefense}`;
    }
    
    const defenseBarDam = document.getElementById('defense-bar-dam');
    if (defenseBarDam) {
        // 修复护甲值为0/0时进度条显示问题
        const defensePercentage = gameState.player.maxDefense === 0 ? 0 : (gameState.player.defense / gameState.player.maxDefense) * 100;
        defenseBarDam.style.width = `${defensePercentage}%`;
        
        // 根据护甲值改变颜色，确保进度条为空时也保持正确的高度
        if (defensePercentage === 0) {
            // 护甲为空时，使用透明背景但保持高度
            defenseBarDam.className = 'bg-transparent h-3 rounded-full transition-all duration-300';
        } else if (defensePercentage <= 20) {
            defenseBarDam.className = 'bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all duration-300';
        } else if (defensePercentage <= 50) {
            defenseBarDam.className = 'bg-gradient-to-r from-orange-500 to-orange-400 h-3 rounded-full transition-all duration-300';
        } else {
            defenseBarDam.className = 'bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300';
        }
    }
    
    const speedDisplayDam = document.getElementById('speed-display-dam');
    if (speedDisplayDam) {
        speedDisplayDam.textContent = gameState.player.speed;
    }
}

// 显示Tip弹窗 - 显示在屏幕中上方
function showFloatingText(text, element = null, color = '#10b981') {
    const tipContainer = document.getElementById('tip-container');
    if (!tipContainer) return;
    
    const tipPopup = document.createElement('div');
    tipPopup.className = 'tip-popup';
    tipPopup.textContent = text;
    
    // 根据颜色设置不同的样式类
    if (color === '#10b981' || color === '#22c55e') {
        tipPopup.classList.add('tip-success');
    } else if (color === '#ef4444') {
        tipPopup.classList.add('tip-error');
    } else if (color === '#fbbf24') {
        tipPopup.classList.add('tip-warning');
    } else {
        tipPopup.classList.add('tip-info');
    }
    
    // 将新的tip插入到容器顶部
    tipContainer.insertBefore(tipPopup, tipContainer.firstChild);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (tipPopup.parentNode) {
            tipPopup.remove();
        }
    }, 3000);
    
    // 限制同时显示的tip数量，最多5个
    const tips = tipContainer.querySelectorAll('.tip-popup');
    if (tips.length > 5) {
        for (let i = 5; i < tips.length; i++) {
            tips[i].remove();
        }
    }
}

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!elements.itemModal.classList.contains('hidden')) {
            closeModal();
        }
    }
});

// 全局函数
window.closeModal = closeModal;
window.sellItem = sellItem;
window.openChest = openChest;
window.sellWarehouseItem = sellWarehouseItem;
window.evacuateItems = evacuateItems;
window.sellAllWarehouseItems = sellAllWarehouseItems;
window.discardCurrentItem = discardCurrentItem;
window.discardItem = discardItem;
window.showInterface = showInterface;
window.triggerEvacuationFailureAndReturn = triggerEvacuationFailureAndReturn;
window.closeUpgradeModal = function() {
    // 空函数，保持兼容性
};
window.upgradeAbility = upgradeAbility;
window.confirmExitGame = confirmExitGame;
window.attemptEscape = attemptEscape;
window.startCombat = startCombat;
window.executeEvacuationFailure = executeEvacuationFailure;
window.quickDiscardLowestValueItem = quickDiscardLowestValueItem;
window.closeInventoryFullNotification = closeInventoryFullNotification;
window.quickReplaceFromModal = quickReplaceFromModal;
window.buyGear = buyGear;
window.equipGear = equipGear;
window.unequipGear = unequipGear;
window.GameSave = GameSave;
window.confirmDeleteSave = confirmDeleteSave;

// 出售当前弹窗中的道具
window.sellCurrentItem = function() {
    // 获取当前弹窗中的道具信息
    const itemName = elements.modalItemName.textContent;
    const itemValue = parseInt(elements.modalItemValue.textContent.replace(/,/g, ''));
    
    // 找到对应的道具
    const itemIndex = gameState.items.findIndex(item => item.name === itemName);
    if (itemIndex !== -1) {
        // 出售道具
        gameState.backpackCoins += itemValue;
        gameState.items.splice(itemIndex, 1);
        
        // 更新UI
        updateCoins();
        updateSellButton();
        renderItems();
        
        // 显示出售成功提示 - 使用鼠标光标位置
        showFloatingText(`+${itemValue.toLocaleString()}`, null, '#10b981');
    }
    
    // 关闭弹窗
    closeModal();
};

// 应用随机事件效果的函数
function applyRandomEventEffect(event) {
    switch(event.effect) {
        case 'gain':
            gameState.backpackCoins += event.amount;
            // 显示获得哈夫币的tip提示
            showFloatingText(`+${event.amount.toLocaleString()} 哈夫币`, null, '#10b981');
            break;
        case 'lose':
            gameState.backpackCoins = Math.max(0, gameState.backpackCoins - event.amount);
            // 显示失去哈夫币的tip提示
            showFloatingText(`-${event.amount.toLocaleString()} 哈夫币`, null, '#ef4444');
            break;
        case 'distance_increase':
            gameState.distance += event.amount;
            // 显示距离增加的tip提示
            showFloatingText(`撤离点距离 +${event.amount}米`, null, '#ef4444');
            break;
        case 'distance_decrease':
            gameState.distance = Math.max(0, gameState.distance - event.amount);
            // 显示距离减少的tip提示
            showFloatingText(`撤离点距离 -${event.amount}米`, null, '#10b981');
            break;
        case 'health_increase':
            gameState.player.health = Math.min(gameState.player.maxHealth, gameState.player.health + event.amount);
            // 显示生命值增加的tip提示
            showFloatingText(`生命值 +${event.amount}`, null, '#10b981');
            break;
        case 'health_decrease':
            gameState.player.health = Math.max(0, gameState.player.health - event.amount);
            // 显示生命值减少的tip提示
            showFloatingText(`生命值 -${event.amount}`, null, '#ef4444');
            break;
        case 'armor_increase':
            gameState.player.defense = Math.min(gameState.player.maxDefense || 100, gameState.player.defense + event.amount);
            // 显示护甲值增加的tip提示
            showFloatingText(`护甲值 +${event.amount}`, null, '#3b82f6');
            break;
        case 'armor_decrease':
            gameState.player.defense = Math.max(0, gameState.player.defense - event.amount);
            // 显示护甲值减少的tip提示
            showFloatingText(`护甲值 -${event.amount}`, null, '#f97316');
            break;
        // 装备相关事件已删除，专注于生命恢复和游戏体验
    }
    
    // 更新UI显示
    updateUI();
}

// 触发随机事件
function triggerRandomEvent() {
    // 智能过滤不适用的随机事件
    const availableEvents = randomEvents.filter(event => {
        switch(event.effect) {
            case 'health_increase':
                // 玩家生命值满时，不选择增加生命值的随机事件
                return gameState.player.health < gameState.player.maxHealth;
            
            case 'armor_increase':
                // 玩家护甲值满时，不选择增加护甲值的随机事件
                return gameState.player.defense < (gameState.player.maxDefense || 100);
            
            case 'armor_decrease':
                // 玩家护甲值空时，不选择减少护甲值的随机事件
                return gameState.player.defense > 0;
            
            case 'lose':
                // 玩家背包哈夫币为空时，不选择减少背包哈夫币的随机事件
                return gameState.backpackCoins > 0;
            
            default:
                // 其他事件始终可用
                return true;
        }
    });
    
    // 如果没有可用事件，则不触发事件
    if (availableEvents.length === 0) {
        return;
    }
    
    // 从可用事件中随机选择一个
    const event = availableEvents[Math.floor(Math.random() * availableEvents.length)];
    
    // 播放随机事件音效
    soundManager.play('notification');
    
    let effectText = '';
    let effectColor = '';
    
    // 根据事件类型设置显示文本和颜色
    switch(event.effect) {
        case 'gain':
            effectText = `+${event.amount.toLocaleString()} 哈夫币`;
            effectColor = 'text-green-400';
            break;
        case 'lose':
            effectText = `-${event.amount.toLocaleString()} 哈夫币`;
            effectColor = 'text-red-400';
            break;
        case 'distance_increase':
            effectText = `撤离点距离 +${event.amount}米`;
            effectColor = 'text-red-400';
            break;
        case 'distance_decrease':
            effectText = `撤离点距离 -${event.amount}米`;
            effectColor = 'text-green-400';
            break;
        case 'health_increase':
            effectText = `生命值 +${event.amount}`;
            effectColor = 'text-green-400';
            break;
        case 'health_decrease':
            effectText = `生命值 -${event.amount}`;
            effectColor = 'text-red-400';
            break;
        case 'armor_increase':
            effectText = `护甲值 +${event.amount}`;
            effectColor = 'text-blue-400';
            break;
        case 'armor_decrease':
            effectText = `护甲值 -${event.amount}`;
            effectColor = 'text-orange-400';
            break;
        // 装备相关事件已删除
    }
    
    // 创建事件弹窗
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border-2 border-yellow-500 shadow-2xl">
            <div class="text-center">
                <div class="text-6xl mb-4">${event.icon}</div>
                <h3 class="text-2xl font-bold mb-2 text-yellow-400">${event.name}</h3>
                <p class="text-gray-300 mb-4">${event.description}</p>
                <div class="text-xl font-bold mb-4 ${effectColor}">
                    ${effectText}
                </div>
                <button id="confirmEventBtn" 
                        class="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 px-6 py-2 rounded-full font-bold transition-all">
                    知道了
                </button>
            </div>
        </div>
    `;
    
    // 显示弹窗
    document.body.appendChild(modal);
    
    // 为确认按钮添加事件监听器
    const confirmBtn = modal.querySelector('#confirmEventBtn');
    confirmBtn.addEventListener('click', function() {
        // 点击知道了按钮后才应用事件效果
        applyRandomEventEffect(event);
        // 移除弹窗
        modal.remove();
    });
    
    // 更新UI
    updateUI();
}

// 修改原有的绑定事件函数
function bindEvents() {
    // 界面切换事件已在bindInterfaceEvents中处理
    // 这里只处理其他事件
}

// 测试功能已移除

// 获取所有升级道具的函数
// 测试功能已移除

// 根据品质获取道具价值
function getItemValueByRarity(rarity) {
    const valueMap = {
        white: 100,
        green: 500,
        blue: 2000,
        purple: 8000,
        gold: 25000,
        red: 100000
    };
    return valueMap[rarity] || 100;
}

// 生成随机装备
function generateRandomGear(type, level) {
    // 确保类型和等级参数有效
    if (!type || !gearData[type + 's']) {
        console.error('Invalid gear type:', type);
        return null;
    }
    
    // 确保等级在有效范围内
    const gearArray = gearData[type + 's'];
    const validLevel = Math.max(0, Math.min(level, gearArray.length - 1));
    
    // 获取对应等级的装备
    const gear = gearArray[validLevel];
    
    // 返回装备的副本，添加唯一ID
    return {
        ...gear,
        id: Date.now() + Math.random(),
        type: type
    };
}

// 初始化配装系统
function initGearSystem() {
    // 渲染装备列表到弹窗中
    renderGearLists();
    
    // 初始化装备显示
    updateGearDisplay();
}

// 渲染武器/护甲/背包列表到对应弹窗
function renderGearLists() {
    const weaponList = document.getElementById('weapon-list');
    if (weaponList) {
        weaponList.innerHTML = gearData.weapons.map((weapon, index) => `
            <div class="bg-gray-800/80 rounded-lg p-3 border border-gray-700 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${weapon.icon}</span>
                    <div>
                        <div class="font-bold ${weapon.color}">${weapon.name}</div>
                        <div class="text-xs text-gray-400">攻击+${weapon.attack} 速度${weapon.speed} | ${weapon.rarity}</div>
                    </div>
                </div>
                <button onclick="buyGear('weapon', ${index})" class="w-28 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-md flex items-center justify-center">
                    <i class="fas fa-shopping-cart mr-1"></i>${weapon.cost.toLocaleString()}
                </button>
            </div>
        `).join('');
    }

    const armorList = document.getElementById('armor-list');
    if (armorList) {
        armorList.innerHTML = gearData.armors.map((armor, index) => `
            <div class="bg-gray-800/80 rounded-lg p-3 border border-gray-700 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${armor.icon}</span>
                    <div>
                        <div class="font-bold ${armor.color}">${armor.name}</div>
                        <div class="text-xs text-gray-400">护甲+${armor.defense} 速度${armor.speed} | ${armor.rarity}</div>
                    </div>
                </div>
                <button onclick="buyGear('armor', ${index})" class="w-28 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-md flex items-center justify-center">
                    <i class="fas fa-shopping-cart mr-1"></i>${armor.cost.toLocaleString()}
                </button>
            </div>
        `).join('');
    }

    const backpackList = document.getElementById('backpack-list');
    if (backpackList) {
        backpackList.innerHTML = gearData.backpacks.map((backpack, index) => `
            <div class="bg-gray-800/80 rounded-lg p-3 border border-gray-700 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span class="text-3xl">${backpack.icon}</span>
                    <div>
                        <div class="font-bold ${backpack.color}">${backpack.name}</div>
                        <div class="text-xs text-gray-400">容量+${backpack.capacity} 速度${backpack.speed} | ${backpack.rarity}</div>
                    </div>
                </div>
                <button onclick="buyGear('backpack', ${index})" class="w-28 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-md flex items-center justify-center">
                    <i class="fas fa-shopping-cart mr-1"></i>${backpack.cost.toLocaleString()}
                </button>
            </div>
        `).join('');
    }
}

// 添加卸下装备函数
function unequipGear(type) {
    const oldGear = currentGear[type];
    if (!oldGear) return;
    
    // 如果是护甲，保存当前耐久度状态
    if (type === 'armor') {
        const armorIndex = gearData.armors.findIndex(a => a.name === oldGear.name);
        if (armorIndex !== -1 && armorStates[armorIndex]) {
            armorStates[armorIndex].currentDurability = gameState.player.defense;
        }
        // 卸下护甲后，护甲值归零
        gameState.player.defense = 0;
        gameState.player.maxDefense = 0;
    }
    
    // 卸下装备
    currentGear[type] = null;
    
    // 更新玩家属性
    updatePlayerStats();
    
    // 更新显示
    updateGearDisplay();
    updateCurrentGearDisplay();
    updateGearButtons();
    
    showNotification(`已卸下 ${oldGear.name}！`, 'success');
    
    // 自动关闭对应的装备弹窗
    switch(type) {
        case 'weapon':
            closeWeaponModal();
            break;
        case 'armor':
            closeArmorModal();
            break;
        case 'backpack':
            closeBackpackModal();
            break;
    }
}

// 修改更新装备按钮状态的函数
function updateGearButtons() {
    // 更新所有购买按钮
    const gearTypes = ['weapon', 'armor', 'backpack'];
    
    gearTypes.forEach(type => {
        const items = gearData[type + 's'];
        items.forEach((gear, index) => {
            const button = document.querySelector(`button[onclick*=\"buyGear('${type}', ${index})\"], button[onclick*=\"equipGear('${type}', ${index})\"], button[onclick*=\"unequipGear('${type}')\"]`);
            if (button) {
                if (currentGear[type] && currentGear[type].name === gear.name) {
                    // 检查是否是护甲且需要维修
                    if (type === 'armor' && checkArmorRepairNeeded()) {
                        // 护甲需要维修 - 橙色维修按钮
                        const basePrice = GEAR_PRICES.armor[index];
                        const damagePercentage = 1 - (gameState.player.defense / gameState.player.maxDefense);
                        const repairCost = Math.floor(basePrice * damagePercentage * 0.6);
                        
                        button.innerHTML = `<i class="fas fa-wrench mr-1"></i>维修 ${repairCost.toLocaleString()}`;
                        button.className = 'w-28 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-md flex items-center justify-center shrink-0';
                        button.onclick = () => buyGear(type, index); // 复用buyGear函数，内部会检测维修逻辑
                    } else {
                        // 当前已装备且无需维修 - 红色卸下按钮
                        button.innerHTML = '<i class="fas fa-times mr-1"></i>卸下';
                        button.className = 'w-28 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-md flex items-center justify-center shrink-0';
                        button.onclick = () => unequipGear(type);
                    }
                } else if (ownedGear[type].includes(index)) {
                    // 已拥有但未装备 - 蓝色装备按钮
                    button.innerHTML = '<i class="fas fa-check mr-1"></i>装备';
                    button.className = 'w-28 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-md flex items-center justify-center shrink-0';
                    button.onclick = () => equipGear(type, index);
                } else {
                    // 未拥有 - 绿色购买按钮
                    button.innerHTML = `<i class="fas fa-shopping-cart mr-1"></i>${gear.cost.toLocaleString()}`;
                    button.className = 'w-28 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-3 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-md flex items-center justify-center shrink-0';
                    button.onclick = () => buyGear(type, index);
                }
            }
        });
    });
}

// 修改装备函数，添加卸下功能
function equipGear(type, index) {
    const gear = gearData[type + 's'][index];
    
    // 如果已经有装备，先保存当前护甲状态
    if (currentGear[type] && type === 'armor') {
        const currentArmorIndex = gearData.armors.findIndex(a => a.name === currentGear[type].name);
        if (currentArmorIndex !== -1 && armorStates[currentArmorIndex]) {
            armorStates[currentArmorIndex].currentDurability = gameState.player.defense;
        }
    }
    
    currentGear[type] = gear;
    
    // 如果是护甲，恢复该护甲的耐久度状态
    if (type === 'armor' && armorStates[index]) {
        gameState.player.defense = armorStates[index].currentDurability;
        gameState.player.maxDefense = armorStates[index].maxDurability;
    }
    
    // 更新玩家属性
    updatePlayerStats();
    
    // 更新显示
    updateGearDisplay();
    updateCurrentGearDisplay();
    updateGearButtons();
    
    showNotification(`已装备 ${gear.name}！`, 'success');
    
    // 自动关闭对应的装备弹窗
    switch(type) {
        case 'weapon':
            closeWeaponModal();
            break;
        case 'armor':
            closeArmorModal();
            break;
        case 'backpack':
            closeBackpackModal();
            break;
    }
}

// 修改购买装备函数，支持卸下功能
function buyGear(type, index) {
    const gear = gearData[type + 's'][index];
    const price = GEAR_PRICES[type][index];
    
    // 检查是否是护甲维修
    if (type === 'armor' && currentGear.armor && currentGear.armor.name === gear.name && checkArmorRepairNeeded()) {
        repairArmor(index);
        return;
    }
    
    if (gameState.warehouseCoins < price) {
        soundManager.play('error');
        showNotification('哈夫币不足！', 'error');
        return;
    }
    
    // 扣除哈夫币
    gameState.warehouseCoins -= price;
    
    // 更新当前装备
    currentGear[type] = gear;
    
    // 标记为已拥有
    if (!ownedGear[type].includes(index)) {
        ownedGear[type].push(index);
        
        // 如果是护甲，初始化护甲状态为满耐久度
        if (type === 'armor') {
            armorStates[index] = {
                currentDurability: gear.defense,
                maxDurability: gear.defense
            };
        }
    }
    
    // 如果是护甲，设置玩家的护甲值为该护甲的当前耐久度
    if (type === 'armor' && armorStates[index]) {
        gameState.player.defense = armorStates[index].currentDurability;
        gameState.player.maxDefense = armorStates[index].maxDurability;
    }
    
    // 更新玩家属性
    updatePlayerStats();
    
    // 更新显示
    updateGearDisplay();
    updateCurrentGearDisplay();
    updateCoinsDisplay();
    
    // 更新购买按钮状态
    updateGearButtons();
    
    soundManager.play('purchase');
    showNotification(`成功购买 ${gear.name}！`, 'success');
    
    // 自动关闭对应的装备弹窗
    switch(type) {
        case 'weapon':
            closeWeaponModal();
            break;
        case 'armor':
            closeArmorModal();
            break;
        case 'backpack':
            closeBackpackModal();
            break;
    }
    
    // 保存游戏进度
    GameSave.save();
}

// 新增护甲维修函数
function repairArmor(index) {
    const gear = gearData.armors[index];
    const basePrice = GEAR_PRICES.armor[index];
    
    // 计算维修费用：根据损坏百分比计算
    const damagePercentage = 1 - (gameState.player.defense / gameState.player.maxDefense);
    const repairCost = Math.floor(basePrice * damagePercentage * 0.6); // 维修费用为原价的60%乘以损坏百分比
    
    if (gameState.warehouseCoins < repairCost) {
        showNotification('哈夫币不足！', 'error');
        return;
    }
    
    // 扣除维修费用
    gameState.warehouseCoins -= repairCost;
    
    // 恢复护甲值到满值
    gameState.player.defense = gameState.player.maxDefense;
    
    // 更新护甲状态记录
    if (armorStates[index]) {
        armorStates[index].currentDurability = armorStates[index].maxDurability;
    }
    
    // 更新显示 - 调整顺序，确保维修状态最后更新
    updateGearDisplay();
    updateCoinsDisplay();
    updateGearButtons();
    updatePlayerStatus(); // 更新护甲条显示
    updateArmorRepairStatus(); // 更新护甲维修状态显示 - 最后调用确保状态正确
    
    showNotification(`成功维修 ${gear.name}！花费 ${repairCost} 哈夫币`, 'success');
    
    // 自动关闭护甲弹窗
    closeArmorModal();
}

// 更新玩家属性
function updatePlayerStats() {
    // 重置基础属性
    gameState.player.attack = 0;
    gameState.player.maxDefense = 0;
    const oldDefense = gameState.player.defense; // 保存当前护甲值
    gameState.backpack.maxSlots = 8;
    
    // 计算基础速度（100 + 升级加成）
    const baseSpeed = gameState.player.baseSpeed || 100;
    
    // 应用装备加成
    let equipmentSpeedBonus = 0;
    
    if (currentGear.weapon) {
        gameState.player.attack += currentGear.weapon.attack;
        equipmentSpeedBonus += currentGear.weapon.speed;
    }
    
    if (currentGear.armor) {
        gameState.player.maxDefense += currentGear.armor.defense;
        // 护甲值现在由装备/卸下函数管理，这里不再修改
        equipmentSpeedBonus += currentGear.armor.speed;
    } else {
        // 没有装备护甲时，护甲值为0
        gameState.player.defense = 0;
        gameState.player.maxDefense = 0;
    }
    
    if (currentGear.backpack) {
        gameState.backpack.maxSlots += currentGear.backpack.capacity;
        equipmentSpeedBonus += currentGear.backpack.speed;
    }
    
    // 计算最终速度：基础速度 + 装备加成
    gameState.player.speed = Math.max(50, baseSpeed + equipmentSpeedBonus);
    
    // 更新显示
    updatePlayerStatus();
}

// 更新装备显示
function updateGearDisplay() {
    // 更新主界面显示
    document.getElementById('attack-display').textContent = gameState.player.attack;
    document.getElementById('defense-display').textContent = `${gameState.player.defense}/${gameState.player.maxDefense}`;
    document.getElementById('speed-display').textContent = gameState.player.speed;
}

// 检查护甲是否需要维修
function checkArmorRepairNeeded() {
    if (!currentGear.armor) return false;
    
    // 如果护甲值小于最大值的80%，认为需要维修
    const repairThreshold = Math.floor(gameState.player.maxDefense * 0.8);
    const needsRepair = gameState.player.defense < repairThreshold;
    
    // 调试信息
    if (window.debugArmorRepair) {
        console.log('护甲维修检查:', {
            currentDefense: gameState.player.defense,
            maxDefense: gameState.player.maxDefense,
            repairThreshold: repairThreshold,
            needsRepair: needsRepair,
            condition: `${gameState.player.defense} < ${repairThreshold} = ${needsRepair}`
        });
    }
    
    return needsRepair;
}

// 更新护甲维修状态显示
function updateArmorRepairStatus() {
    if (!currentGear.armor) return;
    
    const isRepairNeeded = checkArmorRepairNeeded();
    
    // 调试信息
    console.log('更新护甲维修状态:', {
        currentDefense: gameState.player.defense,
        maxDefense: gameState.player.maxDefense,
        threshold: gameState.player.maxDefense * 0.8,
        isRepairNeeded: isRepairNeeded
    });
    
    // 更新特勤处界面的护甲卡片
    const armorCard = document.getElementById('armor-card');
    const repairIcon = document.getElementById('armor-repair-icon');
    
    if (armorCard && repairIcon) {
        if (isRepairNeeded) {
            armorCard.classList.add('armor-repair-needed');
            repairIcon.classList.remove('opacity-0');
            repairIcon.classList.add('opacity-100');
        } else {
            armorCard.classList.remove('armor-repair-needed');
            repairIcon.classList.remove('opacity-100');
            repairIcon.classList.add('opacity-0');
        }
    }
    
    // 更新零号大坝界面的护甲卡片
    const armorCardDam = document.getElementById('armor-display-card-dam');
    const repairIconDam = document.getElementById('armor-repair-icon-dam');
    
    if (armorCardDam) {
        if (isRepairNeeded) {
            armorCardDam.classList.add('armor-repair-needed');
            // 确保维修图标存在
            if (!repairIconDam) {
                const newRepairIcon = document.createElement('div');
                newRepairIcon.id = 'armor-repair-icon-dam';
                newRepairIcon.className = 'absolute top-1 right-1 text-yellow-400 text-xs opacity-100 transition-opacity duration-300';
                newRepairIcon.innerHTML = '<i class="fas fa-tools"></i>';
                armorCardDam.appendChild(newRepairIcon);
            } else {
                repairIconDam.classList.remove('opacity-0');
                repairIconDam.classList.add('opacity-100');
            }
        } else {
            armorCardDam.classList.remove('armor-repair-needed');
            if (repairIconDam) {
                repairIconDam.classList.remove('opacity-100');
                repairIconDam.classList.add('opacity-0');
            }
        }
    }
    
    // 更新护甲显示文字颜色
    const armorDisplay = document.getElementById('current-armor');
    const armorDisplayDam = document.getElementById('current-armor-dam');
    
    if (armorDisplay && isRepairNeeded) {
        armorDisplay.classList.add('armor-durability-warning');
    } else if (armorDisplay) {
        armorDisplay.classList.remove('armor-durability-warning');
    }
    
    if (armorDisplayDam && isRepairNeeded) {
        armorDisplayDam.classList.add('armor-durability-warning');
    } else if (armorDisplayDam) {
        armorDisplayDam.classList.remove('armor-durability-warning');
    }
}

// 更新当前装备显示
function updateCurrentGearDisplay() {
    // 更新特勤处界面的装备显示
    const weaponDisplay = document.getElementById('current-weapon');
    const armorDisplay = document.getElementById('current-armor');
    const backpackDisplay = document.getElementById('current-backpack');
    const armorCard = document.getElementById('armor-card');
    
    if (weaponDisplay) {
        weaponDisplay.textContent = currentGear.weapon ? currentGear.weapon.name : '点击装备';
        weaponDisplay.className = `font-bold ${currentGear.weapon ? currentGear.weapon.color : 'text-red-600'}`;
    }
    
    // 护甲显示逻辑
    if (armorDisplay) {
        if (currentGear.armor) {
            // 只显示护甲名称，不显示耐久度
            armorDisplay.textContent = currentGear.armor.name;
            armorDisplay.className = `font-bold ${currentGear.armor.color}`;
            
            // 检查护甲是否受损
            if (gameState.player.defense < gameState.player.maxDefense && armorCard) {
                armorCard.classList.add('armor-damaged');
            } else if (armorCard) {
                armorCard.classList.remove('armor-damaged');
            }
        } else {
            armorDisplay.textContent = '点击装备';
            armorDisplay.className = 'font-bold text-red-600';
            if (armorCard) {
                armorCard.classList.remove('armor-damaged');
            }
        }
    }
    
    if (backpackDisplay) {
        backpackDisplay.textContent = currentGear.backpack ? currentGear.backpack.name : '点击装备';
        backpackDisplay.className = `font-bold ${currentGear.backpack ? currentGear.backpack.color : 'text-red-600'}`;
    }
    
    // 更新零号大坝界面的装备显示
    const weaponDisplayDam = document.getElementById('current-weapon-dam');
    const armorDisplayDam = document.getElementById('current-armor-dam');
    const backpackDisplayDam = document.getElementById('current-backpack-dam');
    const armorCardDam = document.getElementById('armor-display-card-dam');
    
    if (weaponDisplayDam) {
        weaponDisplayDam.textContent = currentGear.weapon ? currentGear.weapon.name : '点击装备';
        weaponDisplayDam.className = `font-bold ${currentGear.weapon ? currentGear.weapon.color : 'text-red-600'}`;
    }
    
    // 零号大坝界面护甲显示逻辑
    if (armorDisplayDam) {
        if (currentGear.armor) {
            // 只显示护甲名称，不显示耐久度
            armorDisplayDam.textContent = currentGear.armor.name;
            armorDisplayDam.className = `font-bold ${currentGear.armor.color}`;
            
            // 检查护甲是否受损
            if (gameState.player.defense < gameState.player.maxDefense && armorCardDam) {
                armorCardDam.classList.add('armor-damaged');
            } else if (armorCardDam) {
                armorCardDam.classList.remove('armor-damaged');
            }
        } else {
            armorDisplayDam.textContent = '点击装备';
            armorDisplayDam.className = 'font-bold text-red-600';
            if (armorCardDam) {
                armorCardDam.classList.remove('armor-damaged');
            }
        }
    }
    
    if (backpackDisplayDam) {
        backpackDisplayDam.textContent = currentGear.backpack ? currentGear.backpack.name : '点击装备';
        backpackDisplayDam.className = `font-bold ${currentGear.backpack ? currentGear.backpack.color : 'text-red-600'}`;
    }
    
    // 更新护甲维修状态
    updateArmorRepairStatus();
}

// 更新哈夫币显示
function updateCoinsDisplay() {
    document.getElementById('warehouse-coins').textContent = gameState.warehouseCoins.toLocaleString();
}

// 显示通知
function showNotification(message, type = 'info') {
    // 播放对应类型的音效
    if (type === 'success') {
        soundManager.play('success');
    } else if (type === 'error') {
        soundManager.play('error');
    } else {
        soundManager.play('notification');
    }
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg text-white font-bold z-50 transition-all transform translate-x-full`;
    
    if (type === 'success') {
        notification.className += ' bg-green-600';
    } else if (type === 'error') {
        notification.className += ' bg-red-600';
    } else {
        notification.className += ' bg-blue-600';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // 动画效果
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 页签功能已移除
document.addEventListener('DOMContentLoaded', function() {
    // 原有的初始化代码...
    
    // 初始化配装系统
    initGearSystem();
    
    // 绑定升级弹窗事件
    bindUpgradeEvents();
});

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}

// 添加键盘事件监听（ESC关闭配装界面）
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeGearConfig();
    }
});

// 添加装备点击处理函数
window.handleEquipmentClick = function(equipmentType) {
    // 在零号大坝界面时禁用装备点击
    if (currentInterface === 'zero-dam') {
        return;
    }
    
    // 在特勤处界面时正常处理点击
    switch(equipmentType) {
        case 'weapon':
            openWeaponModal();
            break;
        case 'armor':
            openArmorModal();
            break;
        case 'backpack':
            openBackpackModal();
            break;
    }
}

// 重新绑定装备卡片的点击事件（防止 inline onclick 在某些情况下失效）
function rebindEquipmentClickEvents() {
    const weaponCard = document.getElementById('weapon-card');
    const armorCard = document.getElementById('armor-card');
    const backpackCard = document.getElementById('backpack-card');
    
    if (weaponCard) {
        weaponCard.onclick = function() { handleEquipmentClick('weapon'); };
    }
    if (armorCard) {
        armorCard.onclick = function() { handleEquipmentClick('armor'); };
    }
    if (backpackCard) {
        backpackCard.onclick = function() { handleEquipmentClick('backpack'); };
    }
}

// 添加新的弹窗控制函数 - 确保全局可用
window.openWeaponModal = function() {
    document.getElementById('weapon-modal').classList.remove('hidden');
}

window.closeWeaponModal = function() {
    document.getElementById('weapon-modal').classList.add('hidden');
}

window.openArmorModal = function() {
    document.getElementById('armor-modal').classList.remove('hidden');
    // 更新按钮状态，确保维修按钮正确显示
    updateGearButtons();
}

window.closeArmorModal = function() {
    document.getElementById('armor-modal').classList.add('hidden');
}

window.openBackpackModal = function() {
    document.getElementById('backpack-modal').classList.remove('hidden');
}

window.closeBackpackModal = function() {
    document.getElementById('backpack-modal').classList.add('hidden');
}

// 修改原有的配装中心函数（保留兼容性）
function openGearConfig() {
    // 现在打开枪械弹窗作为默认
    openWeaponModal();
}

function closeGearConfig() {
    // 关闭所有弹窗
    closeWeaponModal();
    closeArmorModal();
    closeBackpackModal();
}

// 修改事件监听器 - 装备区域现在使用HTML onclick属性
document.addEventListener('DOMContentLoaded', function() {
    // 初始化装备显示
    updateCurrentGearDisplay();
    updateUI();
    updateEquipmentCardsState(); // 初始化装备卡片状态
    
    // 装备区域点击现在通过HTML onclick属性处理，无需JavaScript监听器
    
    // 修复：添加空值检查
    const gearConfigBtn = document.getElementById('gear-config-btn');
    if (gearConfigBtn) {
        gearConfigBtn.addEventListener('click', openGearConfig);
    }
    
    // 搜索物资已改为纯展示文本，无需交互功能
});

// 在全局函数区域添加测试撤离函数
window.triggerTestEvacuation = function() {
    // 测试功能：立即完成撤离
    gameState.distance = 0;
    
    // 添加一些测试道具到背包
    const testItems = [
        { name: "测试道具1", icon: "🎁", value: 10000, rarity: "gold", id: Date.now() },
        { name: "测试道具2", icon: "💎", value: 50000, rarity: "red", id: Date.now() + 1 },
        { name: "测试哈夫币", icon: "💰", value: 25000, rarity: "purple", id: Date.now() + 2 }
    ];
    
    gameState.items = [...testItems];
    gameState.backpackCoins = 50000;
    
    // 更新UI
    updateUI();
    renderItems();
    
    // 显示测试成功提示
    showFloatingText("测试模式：已添加测试道具并设置距离为0！", null, "#10b981");
    
    // 自动触发撤离
    setTimeout(() => {
        evacuateItems();
    }, 1000);
};

// 设置按钮和音效控制功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取设置按钮和设置弹窗元素
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings');
    
    // 音效控制元素
    const soundToggleBtn = document.getElementById('sound-toggle-modal');
    const volumeSlider = document.getElementById('volume-slider-modal');
    const volumeDisplay = document.getElementById('volume-display');
    
    // 设置按钮点击事件
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            settingsModal.classList.remove('hidden');
            soundManager.play('click');
            // 更新存档状态显示
            setTimeout(updateSaveStatus, 100);
        });
    }
    
    // 关闭设置弹窗
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', function() {
            settingsModal.classList.add('hidden');
            soundManager.play('click');
        });
    }
    
    // 点击弹窗外部关闭
    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
                soundManager.play('click');
            }
        });
    }
    
    // 音效开关功能 - 移除重复的事件监听器，使用initSoundControls中的实现
    // 音量滑块功能已在initSoundControls中处理，避免重复添加事件监听器
    
    // 更新音效开关显示
    function updateSoundToggle() {
        if (soundToggleBtn) {
            if (soundManager.enabled) {
                soundToggleBtn.innerHTML = '<i class="fas fa-volume-up mr-1"></i>开启';
                soundToggleBtn.className = 'bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105';
            } else {
                soundToggleBtn.innerHTML = '<i class="fas fa-volume-mute mr-1"></i>关闭';
                soundToggleBtn.className = 'bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-bold text-sm transition-all transform hover:scale-105';
            }
        }
    }
    
    // 更新音量显示
    function updateVolumeDisplay() {
        if (volumeDisplay) {
            volumeDisplay.textContent = `音量: ${Math.round(soundManager.volume * 100)}%`;
        }
        if (volumeSlider) {
            volumeSlider.value = Math.round(soundManager.volume * 100);
        }
    }
    
    // 初始化音效控制显示
    updateSoundToggle();
    updateVolumeDisplay();
});

// ESC键关闭设置弹窗
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal && !settingsModal.classList.contains('hidden')) {
            settingsModal.classList.add('hidden');
            soundManager.play('click');
        }
    }
});

// 页面关闭时自动保存
window.addEventListener('beforeunload', function(e) {
    // 保存游戏进度
    GameSave.save();
});

// 页面隐藏时也保存（如切换标签页）
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        GameSave.save();
    }
});

// 确认删除存档
function confirmDeleteSave() {
    if (!GameSave.hasSave()) {
        showTip('没有找到存档文件', 'info');
        return;
    }
    
    if (confirm('确定要删除存档吗？此操作不可恢复！')) {
        if (GameSave.deleteSave()) {
            // 重新初始化游戏到默认状态
            initGame();
            
            // 自动关闭设置弹窗
            const settingsModal = document.getElementById('settings-modal');
            if (settingsModal && !settingsModal.classList.contains('hidden')) {
                settingsModal.classList.add('hidden');
            }
        }
    }
}

// 更新存档状态显示
function updateSaveStatus() {
    const saveStatusElement = document.getElementById('save-status');
    if (saveStatusElement) {
        if (GameSave.hasSave()) {
            const saveData = JSON.parse(localStorage.getItem('deltaForceMouseSave'));
            const saveTime = new Date(saveData.timestamp).toLocaleString();
            saveStatusElement.textContent = `上次保存: ${saveTime}`;
            saveStatusElement.className = 'text-xs text-green-400';
        } else {
            saveStatusElement.textContent = '暂无存档';
            saveStatusElement.className = 'text-xs text-gray-400';
        }
    }
}

// 存档状态更新已集成到设置按钮点击事件中

// ===== 图鉴功能 =====
class CollectionManager {
    constructor() {
        this.modal = document.getElementById('collection-modal');
        this.closeBtn = document.getElementById('close-collection');
        this.bindEvents();
    }

    bindEvents() {
        // 图鉴按钮点击事件
        const collectionBtn = document.getElementById('collection-btn');
        if (collectionBtn) {
            collectionBtn.addEventListener('click', () => this.openCollection());
        }

        // 关闭按钮点击事件
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.closeCollection());
        }

        // 点击弹窗外部关闭
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeCollection();
                }
            });
        }

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && !this.modal.classList.contains('hidden')) {
                this.closeCollection();
            }
        });
    }

    openCollection() {
        if (this.modal) {
            this.renderCollection();
            this.modal.classList.remove('hidden');
            soundManager.play('click');
        }
    }

    closeCollection() {
        if (this.modal) {
            this.modal.classList.add('hidden');
            soundManager.play('click');
        }
    }

    renderCollection() {
        // 获取所有物品并按价值排序
        const allItems = this.getAllItemsSorted();
        
        // 按品质分组
        const itemsByRarity = {
            red: allItems.filter(item => item.rarity === '红色'),
            gold: allItems.filter(item => item.rarity === '金色'),
            purple: allItems.filter(item => item.rarity === '紫色'),
            blue: allItems.filter(item => item.rarity === '蓝色'),
            green: allItems.filter(item => item.rarity === '绿色'),
            white: allItems.filter(item => item.rarity === '白色')
        };

        // 更新收集进度
        this.updateCollectionProgress(itemsByRarity);

        // 渲染每个品质的物品
        Object.keys(itemsByRarity).forEach(rarity => {
            const container = document.getElementById(`${rarity}-items`);
            if (container) {
                this.renderItemsByRarity(container, itemsByRarity[rarity], rarity);
            }
        });
    }

    getAllItemsSorted() {
        const allItems = [];
        
        // 从itemDatabase获取所有物品
        Object.keys(itemDatabase).forEach(rarity => {
            itemDatabase[rarity].forEach(item => {
                allItems.push({
                    ...item,
                    rarity: item.rarity || this.getRarityName(rarity)
                });
            });
        });

        // 按价值从高到低排序
        return allItems.sort((a, b) => b.value - a.value);
    }

    getRarityName(rarityKey) {
        const rarityMap = {
            red: '红色',
            gold: '金色',
            purple: '紫色',
            blue: '蓝色',
            green: '绿色',
            white: '白色'
        };
        return rarityMap[rarityKey] || rarityKey;
    }

    updateCollectionProgress(itemsByRarity) {
        // 计算各品质的收集进度
        const progressData = {};
        let totalItems = 0;
        let totalCollected = 0;

        Object.keys(itemsByRarity).forEach(rarity => {
            const items = itemsByRarity[rarity];
            const collected = items.filter(item => gameState.collectedItems.has(item.name) && gameState.collectedItems.get(item.name) > 0).length;
            
            progressData[rarity] = {
                collected: collected,
                total: items.length
            };
            
            totalItems += items.length;
            totalCollected += collected;
        });

        // 更新总体进度
        const totalPercentage = totalItems > 0 ? Math.round((totalCollected / totalItems) * 100) : 0;
        
        const progressText = document.getElementById('collection-progress-text');
        const progressBar = document.getElementById('collection-progress-bar');
        const totalPercentageElement = document.getElementById('collection-total-percentage');
        
        if (progressText) {
            progressText.textContent = `${totalCollected}/${totalItems}`;
        }
        
        if (progressBar) {
            progressBar.style.width = `${totalPercentage}%`;
        }
        
        if (totalPercentageElement) {
            totalPercentageElement.textContent = `${totalPercentage}%`;
        }

        // 更新各品质进度
        Object.keys(progressData).forEach(rarity => {
            const element = document.getElementById(`${rarity}-progress`);
            if (element) {
                const data = progressData[rarity];
                element.textContent = `${data.collected}/${data.total}`;
            }
        });
    }

    renderItemsByRarity(container, items, rarity) {
        if (items.length === 0) {
            container.innerHTML = '<div class="text-gray-500 text-center py-4">暂无物品</div>';
            return;
        }

        container.innerHTML = items.map(item => {
            const isCollected = gameState.collectedItems.has(item.name) && gameState.collectedItems.get(item.name) > 0;
            const collectedCount = gameState.collectedItems.get(item.name) || 0;
            const collectionClass = isCollected ? 'collection-item-collected' : 'collection-item-uncollected';
            const lockIcon = isCollected ? '' : `
                <div class="collection-lock-icon absolute top-1 right-1">
                    <i class="fas fa-lock text-gray-300 text-xs"></i>
                </div>
            `;
            const countBadge = isCollected ? `
                <div class="absolute top-1 left-1 text-white text-xs font-bold px-1 py-0.5" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">
                    ×${collectedCount}
                </div>
            ` : '';
            
            return `
                <div class="bg-gray-700/50 rounded-lg p-3 border border-gray-600 hover:border-gray-500 transition-all duration-300 relative ${collectionClass}">
                    ${lockIcon}
                    ${countBadge}
                    <div class="text-center">
                        <div class="text-3xl mb-2">${item.icon}</div>
                        <div class="font-bold text-sm mb-1 truncate" title="${item.name}">${item.name}</div>
                        <div class="text-yellow-400 font-bold text-sm">${item.value.toLocaleString()}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// 初始化图鉴管理器
let collectionManager;

// 在DOM加载完成后初始化图鉴功能
document.addEventListener('DOMContentLoaded', function() {
    collectionManager = new CollectionManager();
});

// 确保在initGame函数中也初始化图鉴管理器
const originalInitGame = initGame;
initGame = function() {
    originalInitGame();
    if (!collectionManager) {
        collectionManager = new CollectionManager();
    }
};