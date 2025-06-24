/**
 * DeepSeek幻觉检测器 - 内容脚本
 * 主要控制逻辑，协调各个组件工作
 */

class DeepSeekHallucinationDetector {
  constructor() {
    this.patterns = null;
    this.analyzer = null;
    this.uiManager = null;
    this.isEnabled = true;
    this.processedElements = new WeakSet();
    this.streamingElements = new Map();
    this.settings = {
      realTimeDetection: true,
      batchAnalysis: false,
      debounceDelay: 500,
      minTextLength: 20
    };
    
    this.init();
  }

  /**
   * 初始化检测器
   */
  async init() {
    try {
      console.log('🔍 DeepSeek幻觉检测器启动中...');
      
      // 等待页面加载完成
      if (document.readyState === 'loading') {
        await new Promise(resolve => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // 初始化组件
      this.patterns = new HallucinationPatterns();
      this.analyzer = new TextAnalyzer(this.patterns);
      this.uiManager = new UIManager();

      // 加载用户设置
      await this.loadSettings();

      // 开始监听
      this.startMonitoring();
      
      // 设置URL变化监听
      this.setupURLChangeMonitor();
      
      console.log('✅ DeepSeek幻觉检测器已启动');
      
      // 通知后台脚本
      this.notifyBackground('detector_ready');
      
    } catch (error) {
      console.error('❌ 幻觉检测器初始化失败:', error);
    }
  }

  /**
   * 开始监听页面变化
   */
  startMonitoring() {
    // 设置DOM变化监听器
    this.setupMutationObserver();
    
    // 分析现有内容 - 这行会导致初始加载时分析整个页面，应考虑移除或延迟
    // this.analyzeExistingContent(); // <--- 注释掉或者移除这一行
    
    // 设置周期性检查
    this.setupPeriodicCheck();
  }

  /**
   * 设置DOM变化监听器
   */
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      if (!this.isEnabled) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          // 处理新增的节点
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.handleNewElement(node);
            }
          });
        } else if (mutation.type === 'characterData') {
          // 处理文本变化（流式输出）
          this.handleTextChange(mutation.target.parentElement);
        }
      }
    });

    // 开始观察
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      characterDataOldValue: true
    });

    console.log('🔍 DOM监听器已启动');
  }

  /**
   * 处理新增元素
   */
  handleNewElement(element) {
    // 查找AI回复元素
    const aiMessages = this.findAIMessages(element);
    
    for (const message of aiMessages) {
      if (!this.processedElements.has(message)) {
        this.processAIMessage(message);
      }
    }
  }

  /**
   * 处理文本变化（流式输出）
   */
  handleTextChange(element) {
    if (!element || !this.isAIMessage(element)) return;

    const elementId = this.getElementId(element);
    
    // 防抖处理
    if (this.streamingElements.has(elementId)) {
      clearTimeout(this.streamingElements.get(elementId));
    }

    const timeoutId = setTimeout(() => {
      this.processAIMessage(element, { isStreaming: true });
      this.streamingElements.delete(elementId);
    }, this.settings.debounceDelay);

    this.streamingElements.set(elementId, timeoutId);
  }

  /**
   * 查找AI消息元素
   */
  findAIMessages(container) {
    const aiMessages = [];
    
    // 基于分析结果的准确选择器
    const selectors = [
      'p.ds-markdown-paragraph', // 主要的AI回复文本
      'div.ds-markdown--block',   // AI回复容器
      '[class*="ds-markdown"]'    // 其他markdown相关元素
    ];

    for (const selector of selectors) {
      const elements = container.querySelectorAll ? 
        container.querySelectorAll(selector) : 
        (container.matches && container.matches(selector) ? [container] : []);
      
      for (const element of elements) {
        if (this.isAIMessage(element)) {
          aiMessages.push(element);
        }
      }
    }

    return aiMessages;
  }

  /**
   * 判断是否为AI消息
   */
  isAIMessage(element) {
    if (!element) return false;

    // 1. 排除已知的非AI消息容器或特定文本区域
    if (element.closest('._0fcaa63')) { // "内容由 AI 生成，请仔细甄别" 的容器
      return false;
    }
    // 根据您提供的数据，类名 _9663006 似乎与用户提问相关
    if (element.closest('._9663006')) { 
      return false;
    }
    // 根据您提供的数据，类名 fbb737a4 似乎也与用户提问的头像/图标区域相关
    if (element.closest('.fbb737a4')) {
        return false;
    }

    // 2. 结构性排除 - 如果元素位于常见的非聊天内容区域，则直接排除
    if (element.closest('header, footer, nav, aside')) {
      return false;
    }

    // 3. URL 上下文判断：如果不在一个明确的聊天会话页面，判断更保守
    //   我们假设聊天会话的URL中通常包含类似 '/a/chat/s/' 的路径
    const isChatSessionPage = window.location.href.includes('/a/chat/s/');
    
    const textContent = element.textContent || '';
    
    // 4. 检查最小文本长度
    if (textContent.length < this.settings.minTextLength) {
      return false;
    }

    // 5. 排除用户输入区域
    const inputElement = element.closest('#chat-input, textarea, input');
    if (inputElement) {
      return false;
    }

    // 6. 排除已知的UI界面元素关键词
    const commonUiKeywords = ['登录', '注册', '设置', '菜单', '按钮', '新对话', '开启新对话'];
    if (commonUiKeywords.some(keyword => textContent.includes(keyword) && textContent.length < 50)) {
      return false;
    }
    
    // 7. 核心判断：必须包含特定的AI消息CSS类名
    const currentClassList = element.className || '';
    const hasAIMessageClass = currentClassList.includes('ds-markdown-paragraph') ||
                              currentClassList.includes('ds-markdown--block');

    if (hasAIMessageClass) {
      // 如果在聊天会话页面，有AI消息类名，并且通过了前面的所有排除检查，则认为是AI消息
      if (isChatSessionPage) {
        // 在这里可以进一步增加对父容器类名的判断，例如：
        // const parentWithSpecificAIClass = element.closest('._4f9bf79.d7dc56a8'); // 示例，需要更可靠的父类选择器
        // if (parentWithSpecificAIClass) return true;
        // 暂时先不加过于特定的父类检查，因为类名可能动态变化
        return true; 
      } else {
        // 如果不在聊天会话页面，即使有AI的CSS类，也可能是欢迎语等，返回false
        // 但要小心，有些AI的回复可能在会话开始前就出现（如示例）
        // 除非能更精确判断是欢迎语容器，否则这里返回false可能会漏掉某些情况
        // 暂时先这样，如果发现漏报，再调整这里的逻辑
        // console.log("DEBUG: Not in chat session, but has AI class:", element);
        return false; 
      }
    }

    return false;
  }

  /**
   * 处理AI消息
   */
  async processAIMessage(element, options = {}) {
    try {
      const text = element.textContent || element.innerText || '';
      
      if (text.length < this.settings.minTextLength) {
        return;
      }

      // 避免重复处理相同内容
      if (!options.isStreaming && this.processedElements.has(element)) {
        return;
      }

      console.log('🔍 分析AI回复:', text.substring(0, 100) + '...');

      // 执行分析
      const analysisResult = this.analyzer.analyzeText(text, {
        force: options.isStreaming // 流式输出时强制重新分析
      });

      // 显示结果
      console.log('📊 检测结果:', {
        riskLevel: analysisResult.riskLevel,
        issueCount: analysisResult.issues.length,
        confidence: analysisResult.confidence,
        hasIssues: analysisResult.issues.length > 0
      });

      // 显示检测结果（让UI管理器决定是否显示）
      this.uiManager.showDetectionResult(element, analysisResult);
      
      // 发送统计信息到后台（只有检测到问题时）
      if (analysisResult.issues.length > 0) {
        this.notifyBackground('detection_result', {
          riskLevel: analysisResult.riskLevel,
          issueCount: analysisResult.issues.length,
          confidence: analysisResult.confidence
        });
      }

      // 标记为已处理
      if (!options.isStreaming) {
        this.processedElements.add(element);
      }

    } catch (error) {
      console.error('❌ 分析AI消息时出错:', error);
    }
  }

  /**
   * 分析现有内容
   */
  analyzeExistingContent() {
    console.log('🔍 分析页面现有内容...');
    
    const existingMessages = this.findAIMessages(document.body);
    console.log(`找到 ${existingMessages.length} 个AI消息`);
    
    for (const message of existingMessages) {
      this.processAIMessage(message);
    }
  }

  /**
   * 设置周期性检查
   */
  setupPeriodicCheck() {
    setInterval(() => {
      if (!this.isEnabled) return;
      
      // 清理过期的流式元素跟踪
      const now = Date.now();
      for (const [elementId, timeoutId] of this.streamingElements.entries()) {
        // 如果超时ID还存在，说明可能有问题，清理它
        if (timeoutId && now - timeoutId > 10000) { // 10秒超时
          clearTimeout(timeoutId);
          this.streamingElements.delete(elementId);
        }
      }
      
      // 检查是否有新的AI消息未被处理
      this.checkForMissedMessages();
      
    }, 5000); // 每5秒检查一次
  }

  /**
   * 检查遗漏的消息
   */
  checkForMissedMessages() {
    const allAIMessages = this.findAIMessages(document.body);
    
    for (const message of allAIMessages) {
      if (!this.processedElements.has(message)) {
        const text = message.textContent || '';
        if (text.length >= this.settings.minTextLength) {
          console.log('🔍 发现遗漏的AI消息，开始分析...');
          this.processAIMessage(message);
        }
      }
    }
  }

  /**
   * 获取元素唯一ID
   */
  getElementId(element) {
    if (element.id) return element.id;
    
    // 使用与UI管理器相同的逻辑，基于DOM结构而不是变化的内容
    const classList = element.className || '';
    const parentClasses = element.parentElement ? element.parentElement.className : '';
    
    // 获取元素在父容器中的位置索引
    const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
    const elementIndex = siblings.indexOf(element);
    
    // 生成基于DOM结构的稳定ID
    return `${classList}-${parentClasses}-${elementIndex}-${element.tagName}`;
  }

  /**
   * 加载用户设置
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get('hallucinationDetectorSettings');
      const savedSettings = result.hallucinationDetectorSettings || {};
      
      // 合并设置
      this.settings = { ...this.settings, ...savedSettings };
      
      // 更新组件设置
      if (this.analyzer) {
        this.analyzer.updateSettings(this.settings);
      }
      
      if (this.uiManager) {
        this.uiManager.updateSettings(this.settings);
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
        hallucinationDetectorSettings: this.settings
      });
      console.log('✅ 设置已保存');
    } catch (error) {
      console.error('❌ 保存设置失败:', error);
    }
  }

  /**
   * 通知后台脚本
   */
  notifyBackground(action, data = {}) {
    try {
      chrome.runtime.sendMessage({
        action: action,
        data: data,
        timestamp: Date.now(),
        url: window.location.href
      });
    } catch (error) {
      // 忽略连接错误，后台脚本可能未加载
      console.debug('后台通信失败:', error.message);
    }
  }

  /**
   * 处理来自popup的消息
   */
  handleMessage(request, sender, sendResponse) {
    try {
      console.log('📨 收到消息:', request);
      
      switch (request.action) {
        case 'toggle_detection':
          this.toggleDetection();
          sendResponse({ success: true, enabled: this.isEnabled });
          break;
          
        case 'clear_warnings':
          this.clearAllWarnings();
          sendResponse({ success: true });
          break;
          
        case 'get_stats':
          const stats = this.getDetectionStats();
          sendResponse({ success: true, stats: stats });
          break;
          
        case 'update_settings':
          this.updateSettings(request.settings);
          sendResponse({ success: true });
          break;
          
        case 'force_analyze':
          this.forceAnalyzeAll();
          sendResponse({ success: true });
          break;
          
        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('❌ 处理消息时出错:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * 清除所有警告
   */
  clearAllWarnings(isNewConversation = false) {
    if (this.uiManager) {
      this.uiManager.clearAllWarnings(isNewConversation);
    }
    
    // 只有在新对话时才清除已处理标记
    if (isNewConversation) {
      this.processedElements = new WeakSet();
    }
  }

  /**
   * 切换检测状态
   */
  toggleDetection() {
    this.isEnabled = !this.isEnabled;
    
    if (this.isEnabled) {
      console.log('✅ 幻觉检测已启用');
      this.analyzeExistingContent();
    } else {
      console.log('⏸️ 幻觉检测已暂停');
      this.clearAllWarnings(false); // 不是新对话，只是暂停
    }
    
    // 保存状态
    this.settings.enabled = this.isEnabled;
    this.saveSettings();
  }

  /**
   * 强制分析所有内容
   */
  forceAnalyzeAll() {
    console.log('🔄 强制重新分析所有内容...');
    
    // 清除缓存和标记
    this.processedElements = new WeakSet();
    if (this.analyzer) {
      this.analyzer.clearCache();
    }
    
    // 清除现有警告（不是新对话）
    this.clearAllWarnings(false);
    
    // 重新分析
    this.analyzeExistingContent();
  }

  /**
   * 更新设置
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // 更新组件设置
    if (this.analyzer) {
      this.analyzer.updateSettings(this.settings);
    }
    
    if (this.uiManager) {
      this.uiManager.updateSettings(this.settings);
    }
    
    // 保存设置
    this.saveSettings();
    
    console.log('✅ 设置已更新:', this.settings);
  }

  /**
   * 获取检测统计信息
   */
  getDetectionStats() {
    const uiStats = this.uiManager ? this.uiManager.getStats() : {};
    const analyzerCache = this.analyzer ? this.analyzer.analysisHistory.size : 0;
    
    return {
      isEnabled: this.isEnabled,
      processedMessages: this.processedElements ? 'WeakSet (无法计数)' : 0,
      cachedAnalyses: analyzerCache,
      activeWarnings: uiStats.totalWarnings || 0,
      warningsByRisk: uiStats.byRiskLevel || {},
      averageConfidence: uiStats.averageConfidence || 0,
      streamingElements: this.streamingElements.size,
      settings: this.settings
    };
  }

  /**
   * 销毁检测器
   */
  destroy() {
    console.log('🔥 销毁幻觉检测器...');
    
    // 停用检测
    this.isEnabled = false;
    
    // 清理定时器
    this.streamingElements.forEach(timeoutId => {
      if (timeoutId) clearTimeout(timeoutId);
    });
    this.streamingElements.clear();
    
    // 清理UI
    if (this.uiManager) {
      this.uiManager.destroy();
    }
    
    // 清理分析器缓存
    if (this.analyzer) {
      this.analyzer.clearCache();
    }
  }

  /**
   * 设置URL变化监听器
   */
  setupURLChangeMonitor() {
    let lastUrl = window.location.href;
    
    // 创建一个观察器来监视URL变化
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        const oldUrl = lastUrl;
        lastUrl = window.location.href;
        
        // 从URL中提取会话ID
        const oldSessionId = this.extractSessionId(oldUrl);
        const newSessionId = this.extractSessionId(lastUrl);
        
        // 如果会话ID发生变化，清除所有警告
        if (oldSessionId !== newSessionId) {
          console.log('🔄 检测到新会话，清除所有警告');
          this.clearAllWarnings(true); // 这是新对话
        }
      }
    });
    
    // 开始观察document的子树变化，这可以间接检测到URL的变化
    observer.observe(document, { subtree: true, childList: true });
    
    console.log('🔍 URL监听器已启动');
  }
  
  /**
   * 从URL中提取会话ID
   */
  extractSessionId(url) {
    const match = url.match(/\/a\/chat\/s\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  }
}

// 全局实例
let detector = null;

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDetector);
} else {
  initializeDetector();
}

/**
 * 初始化检测器
 */
function initializeDetector() {
  try {
    // 检查是否在DeepSeek页面
    if (!window.location.href.includes('chat.deepseek.com')) {
      console.log('🚫 不在DeepSeek页面，跳过初始化');
      return;
    }
    
    // 避免重复初始化
    if (detector) {
      console.log('⚠️ 检测器已存在，跳过初始化');
      return;
    }
    
    // 创建检测器实例
    detector = new DeepSeekHallucinationDetector();
    
    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (detector) {
        detector.handleMessage(request, sender, sendResponse);
      }
      return true; // 保持消息通道开放
    });
    
    console.log('🎉 DeepSeek幻觉检测器已初始化');
    
  } catch (error) {
    console.error('❌ 初始化检测器失败:', error);
  }
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  if (detector) {
    detector.destroy();
  }
});

// 导出到全局作用域（用于调试）
window.DeepSeekHallucinationDetector = detector;