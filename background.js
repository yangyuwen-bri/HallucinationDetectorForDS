/**
 * DeepSeek AI幻觉检测器 - 后台服务脚本
 * 处理插件的后台逻辑和统计数据
 */

class BackgroundService {
  constructor() {
    this.detectionStats = {
      totalDetections: 0,
      detectionsByRisk: { high: 0, medium: 0, low: 0 },
      detectionsByCategory: {},
      sessionsWithDetections: 0,
      averageDetectionsPerSession: 0,
      lastResetDate: new Date().toISOString()
    };
    
    this.activeSessions = new Map();
    this.init();
  }

  /**
   * 初始化后台服务
   */
  init() {
    console.log('🚀 DeepSeek幻觉检测器后台服务启动');
    
    // 监听插件安装和更新
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstall(details);
    });

    // 监听来自内容脚本的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // 保持消息通道开放
    });

    // 监听标签页更新
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // 监听标签页关闭
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      this.handleTabClose(tabId);
    });

    // 加载统计数据
    this.loadStats();

    // 设置定期保存统计数据
    setInterval(() => {
      this.saveStats();
    }, 30000); // 每30秒保存一次
  }

  /**
   * 处理插件安装
   */
  async handleInstall(details) {
    console.log('📦 插件安装事件:', details);
    
    if (details.reason === 'install') {
      // 首次安装
      await this.handleFirstInstall();
    } else if (details.reason === 'update') {
      // 插件更新
      await this.handleUpdate(details.previousVersion);
    }
  }

  /**
   * 处理首次安装
   */
  async handleFirstInstall() {
    console.log('🎉 欢迎使用DeepSeek幻觉检测器！');
    
    // 设置默认配置
    const defaultSettings = {
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
      detectNumbers: true,
      enabledCategories: ['all'],
      minTextLength: 20,
      debounceDelay: 500
    };

    try {
      await chrome.storage.sync.set({
        hallucinationDetectorSettings: defaultSettings,
        hallucinationDetectorEnabled: true,
        hallucinationDetectorStats: this.detectionStats
      });

      // 显示欢迎页面（如果需要）
      // chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
      
      console.log('✅ 默认设置已保存');
    } catch (error) {
      console.error('❌ 保存默认设置失败:', error);
    }
  }

  /**
   * 处理插件更新
   */
  async handleUpdate(previousVersion) {
    console.log(`🔄 插件从版本 ${previousVersion} 更新到 ${chrome.runtime.getManifest().version}`);
    
    try {
      // 加载现有设置
      const result = await chrome.storage.sync.get([
        'hallucinationDetectorSettings',
        'hallucinationDetectorStats'
      ]);

      // 合并新的默认设置（如果有新选项）
      const existingSettings = result.hallucinationDetectorSettings || {};
      const updatedSettings = {
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
        detectNumbers: true,
        enabledCategories: ['all'],
        minTextLength: 20,
        debounceDelay: 500,
        ...existingSettings // 保留用户现有设置
      };

      await chrome.storage.sync.set({
        hallucinationDetectorSettings: updatedSettings
      });

      console.log('✅ 设置迁移完成');
    } catch (error) {
      console.error('❌ 设置迁移失败:', error);
    }
  }

  /**
   * 处理消息
   */
  handleMessage(request, sender, sendResponse) {
    const { action, data } = request;
    
    console.log('📨 收到消息:', action, data);

    try {
      switch (action) {
        case 'detector_ready':
          this.handleDetectorReady(sender.tab.id);
          sendResponse({ success: true });
          break;

        case 'detection_result':
          this.handleDetectionResult(data, sender.tab.id);
          sendResponse({ success: true });
          break;

        case 'get_stats':
          sendResponse({ 
            success: true, 
            stats: this.getGlobalStats() 
          });
          break;

        case 'reset_stats':
          this.resetStats();
          sendResponse({ success: true });
          break;

        case 'export_stats':
          const exportData = this.exportStats();
          sendResponse({ 
            success: true, 
            data: exportData 
          });
          break;

        default:
          sendResponse({ 
            success: false, 
            error: 'Unknown action' 
          });
      }
    } catch (error) {
      console.error('❌ 处理消息失败:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
  }

  /**
   * 处理检测器就绪
   */
  handleDetectorReady(tabId) {
    if (!this.activeSessions.has(tabId)) {
      this.activeSessions.set(tabId, {
        startTime: Date.now(),
        detectionCount: 0,
        lastActivity: Date.now()
      });
      
      console.log(`✅ 标签页 ${tabId} 检测器已就绪`);
    }
  }

  /**
   * 处理检测结果
   */
  handleDetectionResult(data, tabId) {
    const { riskLevel, issueCount, confidence } = data;
    
    // 更新全局统计
    this.detectionStats.totalDetections += issueCount;
    this.detectionStats.detectionsByRisk[riskLevel] += issueCount;
    
    // 更新会话统计
    if (this.activeSessions.has(tabId)) {
      const session = this.activeSessions.get(tabId);
      session.detectionCount += issueCount;
      session.lastActivity = Date.now();
    }

    // 更新徽章
    this.updateBadge(tabId, this.getSessionDetectionCount(tabId));
    
    console.log(`📊 检测结果记录: 风险=${riskLevel}, 问题数=${issueCount}, 置信度=${confidence}`);
  }

  /**
   * 处理标签页更新
   */
  handleTabUpdate(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('chat.deepseek.com')) {
      // DeepSeek页面加载完成
      console.log(`🔄 DeepSeek页面加载完成: ${tabId}`);
      
      // 重置徽章
      this.updateBadge(tabId, 0);
      
      // 初始化会话（如果不存在）
      if (!this.activeSessions.has(tabId)) {
        this.activeSessions.set(tabId, {
          startTime: Date.now(),
          detectionCount: 0,
          lastActivity: Date.now()
        });
      }
    }
  }

  /**
   * 处理标签页关闭
   */
  handleTabClose(tabId) {
    if (this.activeSessions.has(tabId)) {
      const session = this.activeSessions.get(tabId);
      
      // 记录会话统计
      if (session.detectionCount > 0) {
        this.detectionStats.sessionsWithDetections++;
      }
      
      // 计算平均检测数
      const totalSessions = this.detectionStats.sessionsWithDetections;
      if (totalSessions > 0) {
        this.detectionStats.averageDetectionsPerSession = 
          this.detectionStats.totalDetections / totalSessions;
      }
      
      this.activeSessions.delete(tabId);
      console.log(`📋 会话结束: ${tabId}, 检测数: ${session.detectionCount}`);
    }
  }

  /**
   * 更新徽章
   */
  updateBadge(tabId, count) {
    try {
      if (count > 0) {
        chrome.action.setBadgeText({
          text: count.toString(),
          tabId: tabId
        });
        
        // 根据数量设置颜色
        let color = '#28a745'; // 绿色
        if (count > 5) color = '#dc3545'; // 红色
        else if (count > 2) color = '#ffc107'; // 黄色
        
        chrome.action.setBadgeBackgroundColor({
          color: color,
          tabId: tabId
        });
      } else {
        chrome.action.setBadgeText({
          text: '',
          tabId: tabId
        });
      }
    } catch (error) {
      console.error('❌ 更新徽章失败:', error);
    }
  }

  /**
   * 获取会话检测数量
   */
  getSessionDetectionCount(tabId) {
    const session = this.activeSessions.get(tabId);
    return session ? session.detectionCount : 0;
  }

  /**
   * 获取全局统计数据
   */
  getGlobalStats() {
    return {
      ...this.detectionStats,
      activeSessions: this.activeSessions.size,
      sessionDetails: Array.from(this.activeSessions.entries()).map(([tabId, session]) => ({
        tabId,
        duration: Date.now() - session.startTime,
        detectionCount: session.detectionCount,
        lastActivity: session.lastActivity
      }))
    };
  }

  /**
   * 重置统计数据
   */
  async resetStats() {
    this.detectionStats = {
      totalDetections: 0,
      detectionsByRisk: { high: 0, medium: 0, low: 0 },
      detectionsByCategory: {},
      sessionsWithDetections: 0,
      averageDetectionsPerSession: 0,
      lastResetDate: new Date().toISOString()
    };
    
    // 清除所有会话数据
    this.activeSessions.clear();
    
    // 清除所有标签页的徽章
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        this.updateBadge(tab.id, 0);
      }
    } catch (error) {
      console.error('❌ 清除徽章失败:', error);
    }
    
    await this.saveStats();
    console.log('📊 统计数据已重置');
  }

  /**
   * 导出统计数据
   */
  exportStats() {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: chrome.runtime.getManifest().version,
        totalSessions: this.activeSessions.size
      },
      globalStats: this.detectionStats,
      activeSessionsCount: this.activeSessions.size,
      sessionSummary: Array.from(this.activeSessions.values()).map(session => ({
        duration: Date.now() - session.startTime,
        detectionCount: session.detectionCount,
        detectionsPerMinute: session.detectionCount / ((Date.now() - session.startTime) / 60000)
      }))
    };
    
    console.log('📤 统计数据已导出');
    return exportData;
  }

  /**
   * 加载统计数据
   */
  async loadStats() {
    try {
      const result = await chrome.storage.local.get('hallucinationDetectorStats');
      if (result.hallucinationDetectorStats) {
        this.detectionStats = {
          ...this.detectionStats,
          ...result.hallucinationDetectorStats
        };
        console.log('✅ 统计数据已加载');
      }
    } catch (error) {
      console.error('❌ 加载统计数据失败:', error);
    }
  }

  /**
   * 保存统计数据
   */
  async saveStats() {
    try {
      await chrome.storage.local.set({
        hallucinationDetectorStats: this.detectionStats
      });
      console.log('💾 统计数据已保存');
    } catch (error) {
      console.error('❌ 保存统计数据失败:', error);
    }
  }

  /**
   * 清理过期会话
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    const maxInactiveTime = 30 * 60 * 1000; // 30分钟
    
    for (const [tabId, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity > maxInactiveTime) {
        console.log(`🧹 清理过期会话: ${tabId}`);
        this.activeSessions.delete(tabId);
      }
    }
  }

  /**
   * 生成日报数据
   */
  generateDailyReport() {
    const today = new Date().toDateString();
    const report = {
      date: today,
      totalDetections: this.detectionStats.totalDetections,
      detectionsByRisk: { ...this.detectionStats.detectionsByRisk },
      sessionsCount: this.detectionStats.sessionsWithDetections,
      averageDetections: this.detectionStats.averageDetectionsPerSession.toFixed(2),
      topCategories: Object.entries(this.detectionStats.detectionsByCategory)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
    
    return report;
  }
}

// 创建后台服务实例
const backgroundService = new BackgroundService();

// 定期清理过期会话
setInterval(() => {
  backgroundService.cleanupExpiredSessions();
}, 10 * 60 * 1000); // 每10分钟清理一次

// 每日报告生成（可以根据需要启用）
// setInterval(() => {
//   const report = backgroundService.generateDailyReport();
//   console.log('📊 日报:', report);
// }, 24 * 60 * 60 * 1000); // 每24小时生成一次

console.log('🎉 DeepSeek幻觉检测器后台服务已启动');