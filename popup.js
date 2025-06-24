/**
 * DeepSeek AI幻觉检测器 - 弹窗交互脚本
 */

class PopupController {
  constructor() {
    this.isEnabled = true;
    this.currentTab = null;
    this.settings = {
      sensitivity: 'medium',
      showHighRisk: true,
      showMediumRisk: true,
      showLowRisk: true,
      realTimeDetection: true,
      compactMode: false,
      animationEnabled: true,
      detectPersonal: true,
      detectTemporal: true,
      detectAuthority: true,
      detectNumbers: true
    };
    
    this.init();
  }

  /**
   * 初始化弹窗
   */
  async init() {
    console.log('🎉 弹窗初始化中...');
    
    try {
      // 获取当前标签页
      this.currentTab = await this.getCurrentTab();
      
      // 检查是否在支持的页面
      if (!this.currentTab || !this.currentTab.url.includes('chat.deepseek.com')) {
        console.log('📋 不在DeepSeek页面');
        this.showNotAvailable();
        return;
      }
      
      // 加载设置
      await this.loadSettings();
      
      // 绑定事件监听器
      this.bindEventListeners();
      
      // 更新UI
      await this.updateUI();
      
      // 尝试更新统计信息（可能失败，但不影响UI加载）
      setTimeout(() => {
        this.updateStats();
      }, 500); // 延迟500ms等待内容脚本加载
      
      // 启动定期更新
      this.startPeriodicUpdate();
      
      console.log('✅ 弹窗初始化完成');
    } catch (error) {
      console.error('❌ 弹窗初始化失败:', error);
      this.showNotAvailable();
    }
  }

  /**
   * 获取当前标签页
   */
  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  /**
   * 加载设置
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'hallucinationDetectorSettings',
        'hallucinationDetectorEnabled'
      ]);
      
      if (result.hallucinationDetectorSettings) {
        this.settings = { ...this.settings, ...result.hallucinationDetectorSettings };
      }
      
      if (result.hallucinationDetectorEnabled !== undefined) {
        this.isEnabled = result.hallucinationDetectorEnabled;
      }
      
      console.log('✅ 设置已加载:', this.settings);
    } catch (error) {
      console.error('❌ 加载设置失败:', error);
    }
  }

  /**
   * 保存设置
   */
  async saveSettings() {
    try {
      await chrome.storage.sync.set({
        hallucinationDetectorSettings: this.settings,
        hallucinationDetectorEnabled: this.isEnabled
      });
      
      // 通知内容脚本更新设置
      this.sendMessageToContent('update_settings', { settings: this.settings });
      
      console.log('✅ 设置已保存');
    } catch (error) {
      console.error('❌ 保存设置失败:', error);
    }
  }

  /**
   * 绑定事件监听器
   */
  bindEventListeners() {
    // 切换检测状态
    document.getElementById('toggle-btn').addEventListener('click', () => {
      this.toggleDetection();
    });

    // 清除警告
    document.getElementById('clear-warnings-btn').addEventListener('click', () => {
      this.clearWarnings();
    });

    // 强制重新分析
    document.getElementById('force-analyze-btn').addEventListener('click', () => {
      this.forceAnalyze();
    });

    // 设置展开/收起
    document.getElementById('settings-toggle').addEventListener('click', () => {
      this.toggleSettings();
    });

    // 敏感度设置
    document.querySelectorAll('input[name="sensitivity"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.settings.sensitivity = e.target.value;
        this.saveSettings();
      });
    });

    // 风险等级显示设置
    document.getElementById('show-high-risk').addEventListener('change', (e) => {
      this.settings.showHighRisk = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('show-medium-risk').addEventListener('change', (e) => {
      this.settings.showMediumRisk = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('show-low-risk').addEventListener('change', (e) => {
      this.settings.showLowRisk = e.target.checked;
      this.saveSettings();
    });

    // 检测类别设置
    document.getElementById('detect-personal').addEventListener('change', (e) => {
      this.settings.detectPersonal = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('detect-temporal').addEventListener('change', (e) => {
      this.settings.detectTemporal = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('detect-authority').addEventListener('change', (e) => {
      this.settings.detectAuthority = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('detect-numbers').addEventListener('change', (e) => {
      this.settings.detectNumbers = e.target.checked;
      this.saveSettings();
    });

    // 高级选项
    document.getElementById('real-time-detection').addEventListener('change', (e) => {
      this.settings.realTimeDetection = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('compact-mode').addEventListener('change', (e) => {
      this.settings.compactMode = e.target.checked;
      this.saveSettings();
    });

    document.getElementById('animation-enabled').addEventListener('change', (e) => {
      this.settings.animationEnabled = e.target.checked;
      this.saveSettings();
    });

    // 帮助和反馈链接
    document.getElementById('help-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelpPage();
    });

    document.getElementById('feedback-link').addEventListener('click', (e) => {
      e.preventDefault();
      this.openFeedbackPage();
    });
  }

  /**
   * 更新UI状态
   */
  async updateUI() {
    // 更新状态指示器
    this.updateStatusIndicator();
    
    // 更新设置表单
    this.updateSettingsForm();
    
    // 获取并更新统计信息
    await this.updateStats();
  }

  /**
   * 更新状态指示器
   */
  updateStatusIndicator() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const toggleBtn = document.getElementById('toggle-btn');
    const btnText = toggleBtn.querySelector('.btn-text');

    if (this.isEnabled) {
      statusDot.className = 'status-dot active';
      statusText.textContent = '检测已启用';
      toggleBtn.className = 'toggle-btn active';
      btnText.textContent = '停用检测';
    } else {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = '检测已停用';
      toggleBtn.className = 'toggle-btn inactive';
      btnText.textContent = '启用检测';
    }
  }

  /**
   * 更新设置表单
   */
  updateSettingsForm() {
    // 敏感度设置
    document.querySelector(`input[name="sensitivity"][value="${this.settings.sensitivity}"]`).checked = true;
    
    // 风险等级显示
    document.getElementById('show-high-risk').checked = this.settings.showHighRisk;
    document.getElementById('show-medium-risk').checked = this.settings.showMediumRisk;
    document.getElementById('show-low-risk').checked = this.settings.showLowRisk;
    
    // 检测类别
    document.getElementById('detect-personal').checked = this.settings.detectPersonal;
    document.getElementById('detect-temporal').checked = this.settings.detectTemporal;
    document.getElementById('detect-authority').checked = this.settings.detectAuthority;
    document.getElementById('detect-numbers').checked = this.settings.detectNumbers;
    
    // 高级选项
    document.getElementById('real-time-detection').checked = this.settings.realTimeDetection;
    document.getElementById('compact-mode').checked = this.settings.compactMode;
    document.getElementById('animation-enabled').checked = this.settings.animationEnabled;
  }

  /**
   * 更新统计信息
   */
  async updateStats() {
    try {
      // 检查是否在支持的页面
      if (!this.currentTab || !this.currentTab.url.includes('chat.deepseek.com')) {
        console.log('📊 不在DeepSeek页面，跳过统计更新');
        return;
      }

      const response = await this.sendMessageToContent('get_stats');
      
      if (response && response.success) {
        const stats = response.stats;
        
        // 更新UI
        document.getElementById('warning-count').textContent = stats.activeWarnings || 0;
        
        if (stats.averageConfidence > 0) {
          document.getElementById('confidence-score').textContent = 
            Math.round(stats.averageConfidence * 100) + '%';
        } else {
          document.getElementById('confidence-score').textContent = '--';
        }
        
        // 确定主要风险等级
        const riskLevels = stats.warningsByRisk || {};
        let dominantRisk = '低';
        if (riskLevels.high > 0) dominantRisk = '高';
        else if (riskLevels.medium > 0) dominantRisk = '中';
        
        document.getElementById('risk-level').textContent = dominantRisk;
        
        // 更新风险等级颜色
        const riskElement = document.getElementById('risk-level');
        riskElement.className = 'stat-number';
        if (dominantRisk === '高') riskElement.style.color = '#dc3545';
        else if (dominantRisk === '中') riskElement.style.color = '#ffc107';
        else riskElement.style.color = '#28a745';
      }
    } catch (error) {
      // 优雅处理通信错误，不在控制台显示错误（避免打扰调试）
      if (error.message.includes('Could not establish connection') || 
          error.message.includes('Receiving end does not exist')) {
        console.log('📊 内容脚本未就绪，跳过统计更新');
      } else {
        console.error('❌ 更新统计信息失败:', error);
      }
    }
  }

  /**
   * 切换检测状态
   */
  async toggleDetection() {
    this.showLoading(true);
    
    try {
      this.isEnabled = !this.isEnabled;
      
      const response = await this.sendMessageToContent('toggle_detection');
      
      if (response && response.success) {
        this.updateStatusIndicator();
        await this.saveSettings();
        
        this.showSuccess(this.isEnabled ? '检测已启用' : '检测已停用');
      } else {
        // 回滚状态
        this.isEnabled = !this.isEnabled;
        this.showError('操作失败，请重试');
      }
    } catch (error) {
      console.error('❌ 切换检测状态失败:', error);
      this.isEnabled = !this.isEnabled; // 回滚
      this.showError('操作失败，请重试');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * 清除警告
   */
  async clearWarnings() {
    this.showLoading(true);
    
    try {
      const response = await this.sendMessageToContent('clear_warnings');
      
      if (response && response.success) {
        this.showSuccess('警告已清除');
        await this.updateStats();
      } else {
        this.showError('清除失败，请重试');
      }
    } catch (error) {
      console.error('❌ 清除警告失败:', error);
      this.showError('清除失败，请重试');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * 强制重新分析
   */
  async forceAnalyze() {
    this.showLoading(true);
    
    try {
      const response = await this.sendMessageToContent('force_analyze');
      
      if (response && response.success) {
        this.showSuccess('重新分析完成');
        // 延迟更新统计信息，等待分析完成
        setTimeout(() => this.updateStats(), 1000);
      } else {
        this.showError('分析失败，请重试');
      }
    } catch (error) {
      console.error('❌ 强制分析失败:', error);
      this.showError('分析失败，请重试');
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * 切换设置面板
   */
  toggleSettings() {
    const settingsContent = document.getElementById('settings-content');
    const expandIcon = document.querySelector('.expand-icon');
    
    if (settingsContent.classList.contains('collapsed')) {
      settingsContent.classList.remove('collapsed');
      settingsContent.classList.add('expanded');
      expandIcon.style.transform = 'rotate(180deg)';
    } else {
      settingsContent.classList.remove('expanded');
      settingsContent.classList.add('collapsed');
      expandIcon.style.transform = 'rotate(0deg)';
    }
  }

  /**
   * 向内容脚本发送消息
   */
  async sendMessageToContent(action, data = {}) {
    if (!this.currentTab) {
      throw new Error('当前标签页未找到');
    }

    // 检查是否在支持的页面
    if (!this.currentTab.url.includes('chat.deepseek.com')) {
      throw new Error('请在DeepSeek聊天页面使用此功能');
    }

    return new Promise((resolve, reject) => {
      try {
        chrome.tabs.sendMessage(this.currentTab.id, {
          action: action,
          ...data
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 启动定期更新
   */
  startPeriodicUpdate() {
    setInterval(() => {
      this.updateStats();
    }, 3000); // 每3秒更新一次统计信息
  }

  /**
   * 显示加载状态
   */
  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  /**
   * 显示成功消息
   */
  showSuccess(message) {
    // 可以实现一个简单的提示系统
    console.log('✅ 成功:', message);
  }

  /**
   * 显示错误消息
   */
  showError(message) {
    console.error('❌ 错误:', message);
    // 这里可以实现更友好的错误提示UI
  }

  /**
   * 显示不可用状态
   */
  showNotAvailable() {
    document.body.innerHTML = `
      <div style="padding: 40px; text-align: center; color: #666;">
        <div style="font-size: 48px; margin-bottom: 16px;">🚫</div>
        <h3>插件不可用</h3>
        <p>请在DeepSeek聊天页面使用此插件</p>
        <a href="https://chat.deepseek.com/" target="_blank" style="color: #667eea;">
          前往DeepSeek →
        </a>
      </div>
    `;
  }

  /**
   * 打开帮助页面
   */
  openHelpPage() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('help.html')
    });
  }

  /**
   * 打开反馈页面
   */
  openFeedbackPage() {
    chrome.tabs.create({
              url: 'https://github.com/yangyuwen-bri/HallucinationDetectorForDS/issues'
    });
  }
}

// 初始化弹窗控制器
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});