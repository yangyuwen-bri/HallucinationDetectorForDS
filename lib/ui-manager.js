/**
 * 用户界面管理器
 * 负责在页面上显示检测结果和警告信息
 */

class UIManager {
  constructor() {
    this.warningCounter = 0;
    this.activeWarnings = new Map();
    this.settings = {
      showLowRisk: true,
      showMediumRisk: true,
      showHighRisk: true,
      animationEnabled: true,
      compactMode: false,
      position: 'right' // left, right, top, bottom
    };
    
    this.initializeUI();
  }

  /**
   * 初始化UI组件
   */
  initializeUI() {
    this.createGlobalStyles();
    this.createStatusIndicator();
  }

  /**
   * 创建全局样式
   */
  createGlobalStyles() {
    if (document.getElementById('hallucination-detector-styles')) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'hallucination-detector-styles';
    styleSheet.textContent = `
      /* 内联警告样式 */
      .hd-inline-warning {
        display: inline-block !important;
        position: relative;
        margin-left: 6px;
        margin-right: 4px;
        vertical-align: top;
        z-index: 100;
        line-height: 1;
      }

      .hd-inline-icon {
        cursor: pointer;
        font-size: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        line-height: 1;
        position: relative;
      }

      .hd-inline-number {
        position: absolute;
        top: -6px;
        right: -6px;
        background: rgba(0,0,0,0.8);
        color: white;
        font-size: 9px;
        font-weight: bold;
        width: 14px;
        height: 14px;
        border-radius: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid white;
      }

      .hd-inline-icon--high {
        background-color: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }

      .hd-inline-icon--medium {
        background-color: rgba(255, 152, 0, 0.1);
        color: #ff9800;
      }

      .hd-inline-icon--low {
        background-color: rgba(33, 150, 243, 0.1);
        color: #2196f3;
      }

      .hd-inline-tooltip {
        position: absolute;
        width: 300px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 12px;
        display: none;
        z-index: 10000;
        right: 0;
        top: 100%;
        margin-top: 8px;
        text-align: left;
      }

      .hd-inline-warning:hover .hd-inline-tooltip {
        display: block;
      }

      /* 警告面板样式 */
      .hd-warning-panel {
        position: fixed;
        right: 20px;
        top: 15%;
        transform: translateY(0);
        width: 480px;
        max-height: 65vh;
        overflow: hidden;
        z-index: 10000;
        background: rgba(33, 33, 33, 0.95);
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        color: white;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }

      .hd-warning-panel.hd-collapsed {
        width: 56px;
        height: 56px;
        cursor: pointer;
        top: 15%;
        right: 20px;
      }

      .hd-panel-close {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        color: rgba(255,255,255,0.8);
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        line-height: 1;
        border-radius: 4px;
        transition: all 0.2s ease;
        z-index: 10001;
      }

      .hd-panel-close:hover {
        background: rgba(255,255,255,0.1);
        color: white;
      }

      .hd-panel-toggle {
        width: 56px;
        height: 56px;
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
        color: white;
        gap: 3px;
      }

      .hd-panel-toggle:hover {
        transform: scale(1.05);
      }

      .hd-panel-toggle span {
        font-size: 11px;
        font-weight: bold;
        min-width: 18px;
        height: 18px;
        background: rgba(255,255,255,0.25);
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* 滚动条样式 */
      .hd-warning-panel::-webkit-scrollbar,
      .hd-warning-panel *::-webkit-scrollbar {
        width: 6px;
      }

      .hd-warning-panel::-webkit-scrollbar-track,
      .hd-warning-panel *::-webkit-scrollbar-track {
        background: rgba(255,255,255,0.1);
        border-radius: 3px;
      }

      .hd-warning-panel::-webkit-scrollbar-thumb,
      .hd-warning-panel *::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.3);
        border-radius: 3px;
      }

      .hd-warning-panel::-webkit-scrollbar-thumb:hover,
      .hd-warning-panel *::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.5);
      }

      /* 警告卡片样式 */
      .hd-warning {
        position: relative;
        margin: 8px 0;
        border-radius: 8px;
        background: rgba(255,255,255,0.1);
        box-shadow: none;
        border-left: none;
        overflow: hidden;
        transition: all 0.2s ease;
      }

      .hd-warning:hover {
        background: rgba(255,255,255,0.15);
      }

      .hd-warning--high {
        background: rgba(244, 67, 54, 0.2);
        border-left: 4px solid #f44336;
      }

      .hd-warning--medium {
        background: rgba(255, 152, 0, 0.2);
        border-left: 4px solid #ff9800;
      }

      .hd-warning--low {
        background: rgba(33, 150, 243, 0.2);
        border-left: 4px solid #2196f3;
      }

      .hd-warning + .hd-warning {
        margin-top: 12px;
      }

      .hd-warning-header {
        padding: 12px;
        background: rgba(0,0,0,0.2);
        transition: background 0.2s ease;
      }

      .hd-warning-header:hover {
        background: rgba(0,0,0,0.3);
      }

      .hd-warning-content {
        padding: 12px;
        font-size: 13px;
        color: rgba(255,255,255,0.9);
        border-top: 1px solid rgba(255,255,255,0.1);
      }

      /* 警告标题行布局 */
      .hd-warning-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-height: 24px;
      }

      .hd-warning-title-left {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        min-width: 0;
      }

      .hd-warning-title-right {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }

      .hd-warning-badge {
        background: rgba(255,255,255,0.2);
        color: white;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        min-width: 55px;
        text-align: center;
        display: inline-block;
        line-height: 1.2;
      }

      .hd-warning-time {
        font-size: 10px;
        color: rgba(255,255,255,0.6);
        white-space: nowrap;
        line-height: 1.2;
      }

      .hd-warning-title {
        font-weight: 600;
        color: white;
        flex-shrink: 0;
        font-size: 13px;
        line-height: 1.2;
      }

      .hd-warning-icon {
        font-size: 16px;
        flex-shrink: 0;
        line-height: 1;
      }

      .hd-status-indicator {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      }

      .hd-status-badge {
        display: flex;
        align-items: center;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        backdrop-filter: blur(10px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .hd-status-icon {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 6px;
        animation: hd-pulse 2s infinite;
      }

      .hd-status-icon.hd-active {
        background-color: #4caf50;
      }

      .hd-status-icon.hd-warning {
        background-color: #ff9800;
      }

      .hd-status-icon.hd-error {
        background-color: #f44336;
      }

      .hd-summary {
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(255,255,255,0.1);
        margin-bottom: 12px;
        border-radius: 6px;
        padding: 12px;
      }

      .hd-summary-title {
        font-weight: 600;
        margin-bottom: 8px;
        color: rgba(255,255,255,0.8);
      }

      .hd-summary-stats {
        display: flex;
        gap: 16px;
        font-size: 12px;
      }

      .hd-summary-stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .hd-summary-number {
        font-weight: 700;
        font-size: 16px;
        color: rgba(255,255,255,0.8);
      }

      .hd-summary-label {
        color: rgba(255,255,255,0.6);
        margin-top: 2px;
      }

      .hd-confidence-bar {
        width: 100%;
        height: 8px;
        background: rgba(255,255,255,0.1);
        border-radius: 4px;
        overflow: hidden;
        margin: 8px 0;
      }

      .hd-confidence-fill {
        height: 100%;
        transition: width 0.3s ease;
        border-radius: 4px;
      }

      .hd-confidence-fill.hd-high {
        background: #f44336;
      }

      .hd-confidence-fill.hd-medium {
        background: #ff9800;
      }

      .hd-confidence-fill.hd-low {
        background: #4caf50;
      }

      .hd-issue {
        background: rgba(0,0,0,0.2);
        border-left: 3px solid rgba(255,255,255,0.2);
        margin-bottom: 8px;
        padding: 8px 12px;
        border-radius: 4px;
      }

      .hd-issue + .hd-issue {
        margin-top: 8px;
      }

      .hd-issue-description {
        font-weight: 500;
        margin-bottom: 4px;
        color: rgba(255,255,255,0.8);
      }

      .hd-issue-text {
        background: rgba(0,0,0,0.05);
        padding: 4px 8px;
        border-radius: 3px;
        font-family: monospace;
        font-size: 12px;
        margin: 4px 0;
        word-break: break-word;
      }

      .hd-issue-suggestion {
        font-size: 12px;
        color: rgba(255,255,255,0.6);
        font-style: italic;
      }

      @keyframes hd-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      /* 响应式调整 */
      @media (max-width: 1400px) {
        .hd-warning-panel {
          width: 420px;
          right: 15px;
        }
      }

      @media (max-width: 1200px) {
        .hd-warning-panel {
          width: 380px;
          right: 15px;
        }
      }

      @media (max-width: 768px) {
        .hd-warning-panel {
          width: 320px;
          right: 10px;
          top: 10%;
          max-height: 50vh;
        }
        
        .hd-warning-panel.hd-collapsed {
          width: 48px;
          height: 48px;
          right: 10px;
        }

        .hd-warning-badge {
          font-size: 10px;
          padding: 2px 8px;
          min-width: 50px;
        }
      }

      @media (prefers-color-scheme: dark) {
        .hd-warning--high {
          background: linear-gradient(135deg, #3d2929 0%, #4a2c2c 100%);
          color: #ffcdd2;
        }
        
        .hd-warning--medium {
          background: linear-gradient(135deg, #3d3329 0%, #4a3c2c 100%);
          color: #ffe0b2;
        }
        
        .hd-warning--low {
          background: linear-gradient(135deg, #293d3d 0%, #2c4a4a 100%);
          color: #bbdefb;
        }
        
        .hd-issue {
          background: rgba(0,0,0,0.3);
          color: rgba(255,255,255,0.9);
        }
        
        .hd-issue-text {
          background: rgba(0,0,0,0.2);
          color: rgba(255,255,255,0.8);
        }
      }
    `;
    
    document.head.appendChild(styleSheet);
  }

  /**
   * 创建状态指示器
   */
  createStatusIndicator() {
    if (document.getElementById('hd-status-indicator')) return;

    const indicator = document.createElement('div');
    indicator.id = 'hd-status-indicator';
    indicator.className = 'hd-status-indicator';
    
    indicator.innerHTML = `
      <div class="hd-status-badge">
        <div class="hd-status-icon hd-active"></div>
        <span class="hd-status-text">幻觉检测已启用</span>
      </div>
    `;
    
    document.body.appendChild(indicator);
  }

  /**
   * 获取元素唯一ID（用于防重复）
   */
  getElementId(element) {
    // 如果元素已经有一个我们设置的ID，直接返回
    const existingId = element.getAttribute('data-hd-element-id');
    if (existingId) {
      return existingId;
    }
    
    // 生成一个新的唯一ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const newId = `hd-${timestamp}-${random}`;
    
    // 将ID保存到元素上
    element.setAttribute('data-hd-element-id', newId);
    
    return newId;
  }

  /**
   * 显示检测结果
   */
  showDetectionResult(element, analysisResult) {
    console.log('🎨 [UI DEBUG] showDetectionResult 被调用');
    console.log('🎨 [UI DEBUG] element:', element);
    console.log('🎨 [UI DEBUG] analysisResult:', analysisResult);
    
    // 生成新的警告ID
    const warningId = `warning-${++this.warningCounter}`;
    
    // 为元素生成唯一ID（如果还没有的话）
    const elementId = this.getElementId(element);
    console.log('🎨 [UI DEBUG] elementId:', elementId);
    
    // 不再创建内联警告标记 - 完全禁用
    // const inlineWarning = this.createInlineWarningMarker(element, analysisResult, warningId, this.warningCounter);
    // if (inlineWarning) {
    //   inlineWarning.setAttribute('data-warning-id', warningId);
    //   inlineWarning.setAttribute('data-element-id', elementId);
    // }
    
    // 记录警告
    this.activeWarnings.set(warningId, {
      result: analysisResult,
      timestamp: Date.now(),
      elementId: elementId,
      element: element,
      warningId: warningId,
      text: element.textContent.slice(0, 80) + '...' // 保存更多文本内容用于显示
    });

    console.log('🎨 [UI DEBUG] 警告已添加，warningId:', warningId);
    console.log('🎨 [UI DEBUG] 当前activeWarnings数量:', this.activeWarnings.size);
    
    // 更新警告面板
    this.updateWarningPanel();
    
    // 更新状态
    this.updateStatus(analysisResult);

    return warningId;
  }

  /**
   * 创建内联警告标记
   */
  createInlineWarningMarker(element, analysisResult, warningId, warningNumber) {
    const riskIcons = {
      high: '🚨',
      medium: '⚠️',
      low: 'ℹ️'
    };

    const riskLabels = {
      high: '高风险',
      medium: '中风险',
      low: '低风险'
    };

    // 创建内联警告标记
    const inlineWarning = document.createElement('span');
    inlineWarning.className = 'hd-inline-warning';
    inlineWarning.setAttribute('data-warning-id', warningId);
    
    // 根据是否有问题调整显示内容
    const hasIssues = analysisResult.issues && analysisResult.issues.length > 0;
    
    inlineWarning.innerHTML = `
      <span class="hd-inline-icon hd-inline-icon--${analysisResult.riskLevel}">
        ${riskIcons[analysisResult.riskLevel]}
        <span class="hd-inline-number">${warningNumber}</span>
      </span>
      <div class="hd-inline-tooltip">
        <strong>检测结果 #${warningNumber}</strong>
        <p>${hasIssues 
          ? `此回复中包含 ${analysisResult.issues.length} 个潜在问题` 
          : '未检测到明显问题，内容可能可靠'}</p>
        <div style="margin-top: 4px; padding: 4px 8px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 12px;">
          <span style="color: ${this.getRiskColor(analysisResult.riskLevel)}">●</span> 
          ${riskLabels[analysisResult.riskLevel]}
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 4px;">点击右侧面板查看详情</p>
      </div>
    `;
    
    // 智能插入位置：优先插入到段落末尾，但避免底部区域
    const elementRect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // 如果元素位置太靠近底部（可能靠近输入框），则插入到开头
    if (elementRect.bottom > viewportHeight * 0.75) {
      // 插入到元素开头
      element.insertBefore(inlineWarning, element.firstChild);
    } else {
      // 找到最后一个段落或直接添加到末尾
      const paragraphs = element.querySelectorAll('p');
      if (paragraphs.length > 0) {
        const lastParagraph = paragraphs[paragraphs.length - 1];
        lastParagraph.appendChild(inlineWarning);
      } else {
        element.appendChild(inlineWarning);
      }
    }
    
    return inlineWarning;
  }

  /**
   * 获取风险等级对应的颜色
   */
  getRiskColor(riskLevel) {
    const colors = {
      high: '#ff5252',    // 红色
      medium: '#ffab40',  // 橙色
      low: '#69f0ae'      // 绿色
    };
    return colors[riskLevel] || colors.low;
  }

  /**
   * 更新或创建侧边警告面板
   */
  updateWarningPanel() {
    console.log('🔄 [面板DEBUG] 更新警告面板');
    console.log('🔄 [面板DEBUG] 当前activeWarnings数量:', this.activeWarnings.size);
    console.log('🔄 [面板DEBUG] 所有警告:', Array.from(this.activeWarnings.entries()).map(([id, warning]) => ({
      id,
      riskLevel: warning.result.riskLevel,
      issueCount: warning.result.issues.length,
      text: warning.text
    })));
    
    let panel = document.getElementById('hd-warning-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'hd-warning-panel';
      panel.className = 'hd-warning-panel hd-collapsed';
      document.body.appendChild(panel);
    }

    // 渲染所有警告
    if (!panel.classList.contains('hd-collapsed')) {
      // 清空面板内容
      panel.innerHTML = '';
      
      // 添加关闭按钮
      const closeButton = document.createElement('button');
      closeButton.className = 'hd-panel-close';
      closeButton.innerHTML = '×';
      closeButton.onclick = () => this.togglePanel();
      panel.appendChild(closeButton);
      
      // 添加警告计数标题
      const warningCount = this.activeWarnings.size;
      const titleDiv = document.createElement('div');
      titleDiv.className = 'hd-panel-title';
      titleDiv.style.cssText = 'padding: 12px 16px; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.1); color: white;';
      titleDiv.textContent = `共检测到 ${warningCount} 条结果`;
      panel.appendChild(titleDiv);
      
      // 按时间排序，最新的在上面
      const warnings = Array.from(this.activeWarnings.entries())
        .sort((a, b) => b[1].timestamp - a[1].timestamp);
      
      console.log('🔄 [面板DEBUG] 排序后的警告数量:', warnings.length);
      
      // 创建警告容器
      const warningsContainer = document.createElement('div');
      warningsContainer.style.cssText = 'max-height: calc(80vh - 100px); overflow-y: auto; padding: 8px;';
      
      // 添加每个警告
      warnings.forEach(([warningId, warning], idx) => {
        console.log(`🔄 [面板DEBUG] 创建警告元素 ${idx + 1}:`, {
          warningId,
          riskLevel: warning.result.riskLevel,
          issueCount: warning.result.issues.length
        });
        
        const warningElement = this.createWarningElement(warning, idx);
        warningsContainer.appendChild(warningElement);
      });
      
      panel.appendChild(warningsContainer);
      
      console.log('🔄 [面板DEBUG] 面板更新完成，显示了', warnings.length, '个警告');
    } else {
      // 折叠状态下，显示总数和切换按钮
      panel.innerHTML = '';
      const toggleButton = document.createElement('button');
      toggleButton.className = 'hd-panel-toggle';
      
      // 根据总风险等级设置图标
      const latestWarning = Array.from(this.activeWarnings.values())
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      const riskIcon = latestWarning ? this.getRiskIcon(latestWarning.result.riskLevel) : '⚠️';
      const totalCount = this.activeWarnings.size;
      
      toggleButton.innerHTML = `
        <div style="font-size: 18px;">${riskIcon}</div>
        <span>${totalCount}</span>
      `;
      toggleButton.onclick = () => this.togglePanel();
      panel.appendChild(toggleButton);
    }
  }

  /**
   * 检查是否是重复的检测结果
   */
  isDuplicateResult(analysisResult) {
    if (!this.lastAnalysisResult) return false;
    
    // 简单的去重逻辑：比较风险等级、问题数量和置信度
    const last = this.lastAnalysisResult;
    const current = analysisResult;
    
    return last.riskLevel === current.riskLevel &&
           last.issues.length === current.issues.length &&
           Math.abs(last.confidence - current.confidence) < 0.01;
  }

  /**
   * 切换面板展开/折叠状态
   */
  togglePanel() {
    const panel = document.getElementById('hd-warning-panel');
    if (!panel) return;
    panel.classList.toggle('hd-collapsed');
    this.updateWarningPanel();
  }

  /**
   * 更新折叠状态的指示器
   */
  updateCollapsedIndicator(panel, analysisResult) {
    const toggleButton = panel.querySelector('.hd-panel-toggle');
    if (toggleButton) {
      toggleButton.innerHTML = this.getCollapsedIcon(analysisResult);
    }
  }

  /**
   * 获取折叠状态的图标
   */
  getCollapsedIcon(analysisResult) {
    if (!analysisResult) return '⚠️';
    
    const icons = {
      high: '🚨',
      medium: '⚠️', 
      low: 'ℹ️'
    };
    return icons[analysisResult.riskLevel] || '⚠️';
  }

  /**
   * 显示展开状态的内容
   */
  showExpandedContent(panel, analysisResult) {
    if (!analysisResult) return;
    
    // 清空面板
    panel.innerHTML = '';
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'hd-panel-close';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => this.togglePanel();
    panel.appendChild(closeButton);
    
    // 创建警告内容
    const warningElement = this.createWarningElement(analysisResult);
    panel.appendChild(warningElement);
  }

  /**
   * 创建警告元素
   */
  createWarningElement(warning, idx) {
    const warningElement = document.createElement('div');
    warningElement.className = `hd-warning hd-warning--${warning.result.riskLevel}`;
    warningElement.style.cssText = 'margin-bottom: 12px; border-radius: 8px; overflow: hidden;';
    
    // 生成时间标签
    const timeStr = new Date(warning.timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // 创建Header元素
    const header = document.createElement('div');
    header.className = 'hd-warning-header';
    header.style.cssText = 'padding: 12px; background: rgba(0,0,0,0.3); cursor: pointer;';
    
    // 第一行：图标 + 标题
    const titleRow = document.createElement('div');
    titleRow.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px;';
    titleRow.innerHTML = `
      <span style="font-size: 16px; line-height: 1;">${this.getRiskIcon(warning.result.riskLevel)}</span>
      <span style="font-weight: 600; color: white; font-size: 13px; line-height: 1.2;">检测结果 #${idx + 1}</span>
    `;
    
    // 第二行：徽章 + 时间
    const infoRow = document.createElement('div');
    infoRow.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 12px;';
    infoRow.innerHTML = `
      <span style="background: ${this.getRiskColor(warning.result.riskLevel)}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; white-space: nowrap;">${this.getRiskLabel(warning.result.riskLevel)}</span>
      <span style="font-size: 10px; color: rgba(255,255,255,0.6); white-space: nowrap;">${timeStr}</span>
    `;
    
    // 第三行：文本预览
    const subtitleRow = document.createElement('div');
    subtitleRow.style.cssText = 'font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
    subtitleRow.textContent = warning.text || '';
    
    // 组装Header
    header.appendChild(titleRow);
    header.appendChild(infoRow);
    header.appendChild(subtitleRow);
    
    // 创建Content元素
    const content = document.createElement('div');
    content.className = 'hd-warning-content';
    content.style.cssText = 'padding: 12px; display: none; background: rgba(0,0,0,0.2); color: rgba(255,255,255,0.9);';
    content.innerHTML = this.createWarningContent(warning.result);
    
    // 组装完整元素
    warningElement.appendChild(header);
    warningElement.appendChild(content);
    
    // 添加展开/收起功能
    header.onclick = () => {
      const isExpanded = content.style.display !== 'none';
      content.style.display = isExpanded ? 'none' : 'block';
      header.style.background = isExpanded ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.4)';
    };

    return warningElement;
  }

  /**
   * 获取风险图标
   */
  getRiskIcon(riskLevel) {
    const icons = {
      high: '🚨',
      medium: '⚠️',
      low: 'ℹ️'
    };
    return icons[riskLevel] || icons.low;
  }

  /**
   * 获取风险等级标签
   */
  getRiskLabel(riskLevel) {
    const labels = {
      high: '高风险',
      medium: '中风险',
      low: '低风险'
    };
    return labels[riskLevel] || labels.low;
  }

  /**
   * 创建警告内容
   */
  createWarningContent(analysisResult) {
    const summary = analysisResult.summary || {
      totalIssues: analysisResult.issues ? analysisResult.issues.length : 0,
      recommendation: analysisResult.issues && analysisResult.issues.length > 0
        ? "检测到以下需要注意的内容："
        : "未检测到明显的问题，内容可能是可靠的。"
    };
    
    const issues = analysisResult.issues || [];
    const hasIssues = issues.length > 0;

    // 为不同风险等级设置不同颜色
    const riskColors = {
      high: '#ff5252',   // 红色
      medium: '#ffab40', // 黄色
      low: '#69f0ae'     // 绿色
    };

    let content = `
      <div class="hd-summary">
        <div class="hd-summary-title">检测摘要</div>
        <div class="hd-summary-stats">
          <div class="hd-summary-stat">
            <div class="hd-summary-number">${summary.totalIssues}</div>
            <div class="hd-summary-label">问题数</div>
          </div>
          <div class="hd-summary-stat">
            <div class="hd-summary-number">${Math.round(analysisResult.confidence * 100)}%</div>
            <div class="hd-summary-label">置信度</div>
          </div>
          <div class="hd-summary-stat">
            <div class="hd-summary-number risk-${analysisResult.riskLevel}" style="color: ${riskColors[analysisResult.riskLevel]} !important;">${
              analysisResult.riskLevel === 'high' ? '高' :
              analysisResult.riskLevel === 'medium' ? '中' : '低'
            }</div>
            <div class="hd-summary-label">风险等级</div>
          </div>
        </div>
        <div class="hd-confidence-bar">
          <div class="hd-confidence-fill hd-${analysisResult.riskLevel}" style="width: ${analysisResult.confidence * 100}%; background: ${riskColors[analysisResult.riskLevel]}"></div>
        </div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 8px;">
          ${summary.recommendation}
        </div>
      </div>
    `;

    // 如果没有问题，显示安全提示
    if (!hasIssues) {
      content += `
        <div class="hd-issue hd-issue-safe">
          <div class="hd-issue-description">内容评估结果</div>
          <div style="font-size: 13px; color: rgba(255,255,255,0.9); margin-top: 8px;">
            本次检测未发现明显的问题。这通常表明：
            <ul style="margin: 8px 0; padding-left: 20px;">
              <li>内容陈述基本准确</li>
              <li>数据引用相对可靠</li>
              <li>逻辑推理较为合理</li>
            </ul>
            <div style="font-style: italic; margin-top: 8px; color: rgba(255,255,255,0.7);">
              建议：虽然未检测到明显问题，仍建议对重要信息进行交叉验证。
            </div>
          </div>
        </div>
      `;
      return content;
    }

    // 显示检测到的问题
    const topIssues = issues.slice(0, 5); // 只显示前5个问题
    for (const issue of topIssues) {
      content += `
        <div class="hd-issue">
          <div class="hd-issue-description">${issue.description}</div>
          ${issue.matchedText ? `<div class="hd-issue-text">"${issue.matchedText}"</div>` : ''}
          ${issue.suggestions && issue.suggestions.length > 0 ? 
            `<div class="hd-issue-suggestion">${issue.suggestions[0]}</div>` : ''}
        </div>
      `;
    }

    if (issues.length > 5) {
      content += `
        <div style="text-align: center; padding: 8px; color: rgba(255,255,255,0.8); font-size: 12px;">
          还有 ${issues.length - 5} 个问题未显示
        </div>
      `;
    }

    return content;
  }

  /**
   * 更新状态指示器
   */
  updateStatus(analysisResult) {
    const indicator = document.getElementById('hd-status-indicator');
    if (!indicator) return;

    const statusIcon = indicator.querySelector('.hd-status-icon');
    const statusText = indicator.querySelector('.hd-status-text');

    if (!statusIcon || !statusText) return;

    // 调试：显示当前活跃警告详情
    this.debugActiveWarnings();

    // 计算总的问题数量（而不是警告次数）
    const totalIssues = this.getTotalIssuesCount();
    
    if (totalIssues === 0) {
      statusIcon.className = 'hd-status-icon hd-active';
      statusText.textContent = '幻觉检测已启用';
    } else if (analysisResult.riskLevel === 'high') {
      statusIcon.className = 'hd-status-icon hd-error';
      statusText.textContent = `发现 ${totalIssues} 个问题`;
    } else {
      statusIcon.className = 'hd-status-icon hd-warning';
      statusText.textContent = `发现 ${totalIssues} 个问题`;
    }
  }

  /**
   * 计算所有活跃警告中的总问题数量
   */
  getTotalIssuesCount() {
    let totalIssues = 0;
    let warningCount = 0;
    
    console.log(`🔢 [计数DEBUG] 开始计算总问题数，当前activeWarnings数量: ${this.activeWarnings.size}`);
    
    for (const [warningId, warning] of this.activeWarnings.entries()) {
      warningCount++;
      if (warning.result && warning.result.issues) {
        const issueCount = warning.result.issues.length;
        totalIssues += issueCount;
        console.log(`🔢 [计数DEBUG] ${warningId}: ${issueCount}个问题, elementId: ${warning.elementId}, riskLevel: ${warning.result.riskLevel}`);
      } else {
        console.log(`🔢 [计数DEBUG] ${warningId}: 无效结果`);
      }
    }
    
    console.log(`🔢 [计数DEBUG] 总计: ${warningCount}个警告，${totalIssues}个问题`);
    return totalIssues;
  }

  /**
   * 清除所有警告
   * @param {boolean} isNewConversation - 是否是新对话，如果是则清除所有警告
   */
  clearAllWarnings(isNewConversation = false) {
    console.log('🧹 [清理DEBUG] 开始清除警告');
    console.log('🧹 [清理DEBUG] 是否新对话:', isNewConversation);
    console.log('🧹 [清理DEBUG] 清理前activeWarnings数量:', this.activeWarnings.size);
    
    if (isNewConversation) {
      // 如果是新对话，清除所有警告
      // 不再需要清理内联警告，因为已经禁用了
      // document.querySelectorAll('.hd-inline-warning').forEach(warning => {
      //   warning.remove();
      // });
      
      this.activeWarnings.clear();
      console.log('🧹 [清理DEBUG] 新对话：已清除所有警告');
    } else {
      // 如果不是新对话，只清除无效的警告
      const validWarnings = new Map();
      
      for (const [warningId, warning] of this.activeWarnings.entries()) {
        if (warning && warning.element && document.contains(warning.element)) {
          validWarnings.set(warningId, warning);
        }
        // 不再需要清理内联警告标记，因为已经禁用了
        // else {
        //   const inlineWarning = document.querySelector(`[data-warning-id="${warningId}"]`);
        //   if (inlineWarning) {
        //     inlineWarning.remove();
        //   }
        // }
      }
      
      this.activeWarnings = validWarnings;
      console.log('🧹 [清理DEBUG] 常规清理：只清除无效警告');
    }
    
    // 重置面板到折叠状态
    const panel = document.getElementById('hd-warning-panel');
    if (panel) {
      if (isNewConversation) {
        panel.className = 'hd-warning-panel hd-collapsed';
        panel.innerHTML = '';
        const toggleButton = document.createElement('button');
        toggleButton.className = 'hd-panel-toggle';
        toggleButton.innerHTML = '⚠️';
        toggleButton.onclick = () => this.togglePanel();
        panel.appendChild(toggleButton);
      } else {
        // 如果不是新对话，更新现有面板
        this.updateWarningPanel();
      }
    }
    
    console.log('🧹 [清理DEBUG] 清理后activeWarnings数量:', this.activeWarnings.size);
    this.updateStatus({ riskLevel: 'low' });
  }

  /**
   * 调试方法：显示当前活跃警告的详细信息
   */
  debugActiveWarnings() {
    console.log('🔍 [调试DEBUG] ========== 活跃警告详情 ==========');
    console.log('🔍 [调试DEBUG] activeWarnings总数:', this.activeWarnings.size);
    
    if (this.activeWarnings.size === 0) {
      console.log('🔍 [调试DEBUG] 没有活跃的警告');
      return;
    }
    
    for (const [warningId, warning] of this.activeWarnings.entries()) {
      console.log(`🔍 [调试DEBUG] ${warningId}:`, {
        elementId: warning.elementId,
        issueCount: warning.result?.issues?.length || 0,
        riskLevel: warning.result?.riskLevel,
        timestamp: new Date(warning.timestamp).toISOString()
      });
    }
    console.log('🔍 [调试DEBUG] =====================================');
  }

  /**
   * 判断是否应该显示结果
   */
  shouldShowResult(analysisResult) {
    console.log('🎨 [UI DEBUG] shouldShowResult 检查');
    console.log('🎨 [UI DEBUG] analysisResult:', analysisResult);
    
    // 始终显示检测结果，无论是否有问题
    // 这样用户可以看到所有的检测历史
    return true;
  }

  /**
   * 更新设置
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    // 根据新设置重新显示/隐藏警告
    this.activeWarnings.forEach((warning, warningId) => {
      if (!warning.element) return; // 修复TypeError
      const shouldShow = this.shouldShowResult(warning.result);
      warning.element.style.display = shouldShow ? 'block' : 'none';
    });
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const warnings = Array.from(this.activeWarnings.values());
    
    return {
      totalWarnings: warnings.length,
      byRiskLevel: warnings.reduce((acc, warning) => {
        const level = warning.result.riskLevel;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {}),
      averageConfidence: warnings.length > 0 ? 
        warnings.reduce((sum, w) => sum + w.result.confidence, 0) / warnings.length : 0
    };
  }

  /**
   * 销毁UI管理器
   */
  destroy() {
    this.clearAllWarnings();
    
    const statusIndicator = document.getElementById('hd-status-indicator');
    if (statusIndicator) {
      statusIndicator.remove();
    }
    
    const warningPanel = document.getElementById('hd-warning-panel');
    if (warningPanel) {
      warningPanel.remove();
    }
    
    const styles = document.getElementById('hallucination-detector-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// 创建全局实例
window.UIManager = UIManager;