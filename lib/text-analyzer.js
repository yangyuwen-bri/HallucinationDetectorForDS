/**
 * 文本分析核心引擎
 * 负责分析AI回复文本，检测潜在的幻觉内容
 */

class TextAnalyzer {
  constructor(patterns) {
    this.patterns = patterns;
    this.analysisHistory = new Map();
    this.settings = {
      sensitivity: 'medium', // low, medium, high
      enabledCategories: ['all'],
      minConfidence: 0.3,
      contextWindowSize: 100, // 上下文窗口大小
      enableWhitelist: true, // 启用白名单过滤
      considerTextLength: true, // 考虑文本长度影响
      considerWordFrequency: true // 考虑词频影响
    };
  }

  /**
   * 主要分析入口点
   * @param {string} text - 要分析的文本
   * @param {Object} options - 分析选项
   * @returns {Object} 分析结果
   */
  analyzeText(text, options = {}) {
    const analysisId = this.generateAnalysisId(text);
    
    // 检查缓存
    if (this.analysisHistory.has(analysisId) && !options.force) {
      return this.analysisHistory.get(analysisId);
    }

    const startTime = performance.now();
    
    // 预处理文本
    const processedText = this.preprocessText(text);
    
    // 执行多层次分析
    const analysisResult = {
      id: analysisId,
      timestamp: new Date().toISOString(),
      originalText: text,
      processedText: processedText,
      textLength: text.length,
      issues: [],
      confidence: 0,
      riskLevel: 'low',
      summary: {},
      performance: {
        startTime: startTime,
        endTime: 0,
        duration: 0
      },
      textMetrics: this.calculateTextMetrics(processedText) // 新增文本指标
    };

    // 1. 模式匹配分析
    const patternResults = this.performPatternAnalysis(processedText);
    analysisResult.issues.push(...patternResults);

    // 2. 语义分析
    const semanticResults = this.performSemanticAnalysis(processedText);
    analysisResult.issues.push(...semanticResults);

    // 3. 上下文一致性分析
    const contextResults = this.performContextAnalysis(processedText);
    analysisResult.issues.push(...contextResults);

    // 4. 数字和日期验证
    const dataResults = this.performDataValidation(processedText);
    analysisResult.issues.push(...dataResults);

    // 计算置信度和风险等级
    this.calculateConfidenceAndRisk(analysisResult);

    // 生成摘要
    this.generateSummary(analysisResult);

    // 记录性能数据
    analysisResult.performance.endTime = performance.now();
    analysisResult.performance.duration = analysisResult.performance.endTime - startTime;

    // 缓存结果
    this.analysisHistory.set(analysisId, analysisResult);

    return analysisResult;
  }

  /**
   * 文本预处理
   */
  preprocessText(text) {
    return text
      .trim()
      .replace(/\s+/g, ' ') // 标准化空白字符
      .replace(/[""'']/g, '"') // 标准化引号
      .replace(/…/g, '...'); // 标准化省略号
  }

  /**
   * 计算文本指标
   */
  calculateTextMetrics(text) {
    const sentences = text.split(/[.!?。！？]/);
    const words = text.split(/\s+/);
    const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgSentenceLength: avgSentenceLength,
      textComplexity: this.calculateTextComplexity(text),
      keywordDensity: this.calculateKeywordDensity(text)
    };
  }

  /**
   * 计算文本复杂度
   */
  calculateTextComplexity(text) {
    const complexWords = text.match(/\w{6,}/g) || [];
    const totalWords = text.split(/\s+/).length;
    return totalWords > 0 ? complexWords.length / totalWords : 0;
  }

  /**
   * 计算关键词密度
   */
  calculateKeywordDensity(text) {
    const suspiciousKeywords = ['绝对', '肯定', '一定', '完全', '毫无疑问', '专家', '研究', '官方', '最新'];
    const words = text.split(/\s+/);
    const keywordMatches = words.filter(word => 
      suspiciousKeywords.some(keyword => word.includes(keyword))
    );
    return words.length > 0 ? keywordMatches.length / words.length : 0;
  }

  /**
   * 模式匹配分析（优化版）
   */
  performPatternAnalysis(text) {
    const issues = [];
    const patterns = this.patterns.getAllPatterns();

    console.log('🔍 [PATTERN DEBUG] 开始优化模式匹配分析');
    console.log('🔍 [PATTERN DEBUG] 文本长度:', text.length);
    console.log('🔍 [PATTERN DEBUG] 文本内容:', text.substring(0, 200) + '...');

    for (const [patternName, patternConfig] of Object.entries(patterns)) {
      // 检查是否启用此类别
      if (!this.isCategoryEnabled(patternConfig.category)) {
        continue;
      }

      for (const regex of patternConfig.patterns) {
        const matches = [...text.matchAll(regex)];
        
        if (matches.length > 0) {
          console.log(`🔍 [PATTERN DEBUG] 发现匹配 - 模式: ${patternName}, 正则: ${regex}, 匹配数: ${matches.length}`);
        }
        
        for (const match of matches) {
          const matchedText = match[0];
          
          // 白名单检查 - 修复方法调用
          if (this.settings.enableWhitelist && this.isMatchWhitelisted(text, matchedText)) {
            console.log(`🔍 [PATTERN DEBUG] 白名单过滤: ${matchedText}`);
            continue;
          }

          console.log(`🔍 [PATTERN DEBUG] 匹配详情:`, {
            pattern: patternName,
            matchedText: matchedText,
            position: match.index,
            context: text.substring(Math.max(0, match.index - 20), match.index + matchedText.length + 20)
          });

          const issue = {
            type: 'pattern_match',
            category: patternConfig.category,
            severity: patternConfig.severity,
            pattern: patternName,
            description: patternConfig.description,
            matchedText: matchedText,
            position: {
              start: match.index,
              end: match.index + matchedText.length
            },
            context: this.extractContext(text, match.index, matchedText.length),
            confidence: this.calculatePatternConfidence(matchedText, patternConfig, text),
            suggestions: this.generateSuggestions(patternConfig.category)
          };

          issues.push(issue);
        }
      }
    }

    console.log('🔍 [PATTERN DEBUG] 模式匹配完成，共发现', issues.length, '个问题');
    return this.deduplicateIssues(issues);
  }

  /**
   * 检查匹配是否在白名单中
   */
  isMatchWhitelisted(text, matchedText) {
    if (!this.patterns || !this.patterns.whitelist) {
      return false;
    }

    const allWhitelistPatterns = [
      ...(this.patterns.whitelist.safeExpressions || []),
      ...(this.patterns.whitelist.technicalTerms || []),
      ...(this.patterns.whitelist.timeExpressions || []),
      ...(this.patterns.whitelist.numberExpressions || [])
    ];

    for (const pattern of allWhitelistPatterns) {
      // 重置正则表达式状态
      pattern.lastIndex = 0;
      if (pattern.test(text) && text.includes(matchedText)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 语义分析
   */
  performSemanticAnalysis(text) {
    const issues = [];

    // 检测矛盾陈述
    const contradictions = this.detectContradictions(text);
    issues.push(...contradictions);

    // 检测逻辑不一致
    const logicalInconsistencies = this.detectLogicalInconsistencies(text);
    issues.push(...logicalInconsistencies);

    // 检测过度概化
    const overgeneralizations = this.detectOvergeneralizations(text);
    issues.push(...overgeneralizations);

    return issues;
  }

  /**
   * 上下文一致性分析
   */
  performContextAnalysis(text) {
    const issues = [];

    // 检测话题跳跃
    const topicJumps = this.detectTopicJumps(text);
    issues.push(...topicJumps);

    // 检测信息密度异常
    const densityAnomalies = this.detectInformationDensityAnomalies(text);
    issues.push(...densityAnomalies);

    return issues;
  }

  /**
   * 数据验证
   */
  performDataValidation(text) {
    const issues = [];

    // 日期有效性检查
    const dateIssues = this.validateDates(text);
    issues.push(...dateIssues);

    // 数字合理性检查
    const numberIssues = this.validateNumbers(text);
    issues.push(...numberIssues);

    // 统计数据一致性检查
    const statisticsIssues = this.validateStatistics(text);
    issues.push(...statisticsIssues);

    return issues;
  }

  /**
   * 检测矛盾陈述
   */
  detectContradictions(text) {
    const issues = [];
    const sentences = text.split(/[.!?。！？]/);

    const contradictionPairs = [
      { positive: /增加|提高|上升|改善|好转/g, negative: /减少|降低|下降|恶化|变差/g },
      { positive: /支持|赞成|认可|同意/g, negative: /反对|拒绝|否定|不同意/g },
      { positive: /简单|容易|轻松/g, negative: /复杂|困难|艰难/g },
      { positive: /安全|可靠|稳定/g, negative: /危险|不可靠|不稳定/g }
    ];

    for (const pair of contradictionPairs) {
      const positiveMatches = text.match(pair.positive) || [];
      const negativeMatches = text.match(pair.negative) || [];

      if (positiveMatches.length > 0 && negativeMatches.length > 0) {
        issues.push({
          type: 'contradiction',
          category: 'semantic_consistency',
          severity: 'medium',
          description: '检测到可能的矛盾陈述',
          evidence: {
            positive: positiveMatches,
            negative: negativeMatches
          },
          confidence: 0.6,
          suggestions: ['请检查内容的逻辑一致性', '考虑澄清看似矛盾的表述']
        });
      }
    }

    return issues;
  }

  /**
   * 检测逻辑不一致
   */
  detectLogicalInconsistencies(text) {
    const issues = [];

    // 检测因果关系错误
    const causalPatterns = /因为.*所以|由于.*导致|因此.*结果/g;
    const causalMatches = [...text.matchAll(causalPatterns)];

    for (const match of causalMatches) {
      // 简单的逻辑验证（可以扩展）
      if (this.hasSuspiciousCausalRelation(match[0])) {
        issues.push({
          type: 'logical_inconsistency',
          category: 'logical_reasoning',
          severity: 'medium',
          description: '可能存在逻辑错误的因果关系',
          matchedText: match[0],
          confidence: 0.4,
          suggestions: ['请验证因果关系的逻辑性']
        });
      }
    }

    return issues;
  }

  /**
   * 检测过度概化（实现）
   */
  detectOvergeneralizations(text) {
    const issues = [];
    
    const overgeneralizationPatterns = [
      /所有.*都是/gi,
      /每个.*都会/gi,
      /全部.*都/gi,
      /一切.*都/gi,
      /无论.*都/gi,
      /任何.*都/gi
    ];

    for (const pattern of overgeneralizationPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        issues.push({
          type: 'overgeneralization',
          category: 'logical_reasoning',
          severity: 'low',
          description: '可能存在过度概化的表述',
          matchedText: match[0],
          position: {
            start: match.index,
            end: match.index + match[0].length
          },
          confidence: 0.5,
          suggestions: ['考虑使用更谨慎的表达方式', '避免绝对化的陈述']
        });
      }
    }

    return issues;
  }

  /**
   * 检测话题跳跃（实现）
   */
  detectTopicJumps(text) {
    const issues = [];
    const sentences = text.split(/[.!?。！？]/).filter(s => s.trim().length > 10);
    
    if (sentences.length < 3) return issues;

    // 检测突然的话题转换
    const topicTransitionMarkers = [
      /顺便说一下/gi,
      /另外/gi,
      /对了/gi,
      /话说回来/gi,
      /换个话题/gi,
      /说到这里/gi
    ];

    for (let i = 0; i < sentences.length - 1; i++) {
      const currentSentence = sentences[i];
      const nextSentence = sentences[i + 1];
      
      // 检查是否有突然的话题转换标记
      for (const marker of topicTransitionMarkers) {
        if (marker.test(nextSentence)) {
          issues.push({
            type: 'topic_jump',
            category: 'context_consistency',
            severity: 'low',
            description: '检测到可能的话题跳跃',
            matchedText: nextSentence.substring(0, 50) + '...',
            confidence: 0.4,
            suggestions: ['确保内容的连贯性', '避免突然的话题转换']
          });
        }
      }
    }

    return issues;
  }

  /**
   * 检测信息密度异常（实现）
   */
  detectInformationDensityAnomalies(text) {
    const issues = [];
    const sentences = text.split(/[.!?。！？]/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 2) return issues;

    // 计算每句话的信息密度
    const densities = sentences.map(sentence => {
      const words = sentence.split(/\s+/).length;
      const numbers = (sentence.match(/\d+/g) || []).length;
      const specificTerms = (sentence.match(/[A-Z]{2,}|\d{4}年|\d+%|第\d+/g) || []).length;
      
      return words > 0 ? (numbers + specificTerms) / words : 0;
    });

    // 检测异常高的信息密度
    const avgDensity = densities.reduce((sum, d) => sum + d, 0) / densities.length;
    const threshold = avgDensity * 2.5; // 阈值为平均值的2.5倍

    densities.forEach((density, index) => {
      if (density > threshold && density > 0.3) {
        issues.push({
          type: 'high_information_density',
          category: 'context_consistency',
          severity: 'low',
          description: '检测到异常高的信息密度',
          matchedText: sentences[index].substring(0, 50) + '...',
          confidence: 0.4,
          suggestions: ['检查信息的准确性', '过于密集的具体信息可能需要验证']
        });
      }
    });

    return issues;
  }

  /**
   * 验证统计数据（实现）
   */
  validateStatistics(text) {
    const issues = [];
    
    // 检测百分比总和超过100%的情况
    const percentages = [...text.matchAll(/(\d+(?:\.\d+)?)%/g)];
    if (percentages.length >= 2) {
      const values = percentages.map(match => parseFloat(match[1]));
      const sum = values.reduce((total, val) => total + val, 0);
      
      // 如果在同一句话或相近位置出现多个百分比，检查总和
      if (sum > 100 && this.arePercentagesRelated(text, percentages)) {
        issues.push({
          type: 'invalid_percentage_sum',
          category: 'data_validation',
          severity: 'medium',
          description: '百分比总和可能超过100%',
          evidence: values,
          confidence: 0.7,
          suggestions: ['检查百分比数据的准确性']
        });
      }
    }

    return issues;
  }

  /**
   * 检查百分比是否相关
   */
  arePercentagesRelated(text, percentages) {
    if (percentages.length < 2) return false;
    
    // 简单检查：如果两个百分比在50个字符内，认为可能相关
    for (let i = 0; i < percentages.length - 1; i++) {
      const pos1 = percentages[i].index;
      const pos2 = percentages[i + 1].index;
      if (Math.abs(pos1 - pos2) < 50) {
        return true;
      }
    }
    return false;
  }

  /**
   * 验证日期
   */
  validateDates(text) {
    const issues = [];
    const datePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日/g;
    const currentYear = new Date().getFullYear();
    
    const dateMatches = [...text.matchAll(datePattern)];

    for (const match of dateMatches) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);

      // 基本有效性检查
      if (month > 12 || month < 1 || day > 31 || day < 1) {
        issues.push({
          type: 'invalid_date',
          category: 'data_validation',
          severity: 'high',
          description: '无效的日期格式',
          matchedText: match[0],
          confidence: 0.9,
          suggestions: ['请检查日期的准确性']
        });
      }

      // 未来日期检查
      if (year > currentYear + 1) {
        issues.push({
          type: 'future_date',
          category: 'temporal_info',
          severity: 'medium',
          description: '提及未来日期',
          matchedText: match[0],
          confidence: 0.7,
          suggestions: ['AI通常没有未来信息的准确预测']
        });
      }
    }

    return issues;
  }

  /**
   * 验证数字
   */
  validateNumbers(text) {
    const issues = [];

    // 检测过于精确的百分比
    const precisePercentages = text.match(/\d+\.\d{3,}%/g);
    if (precisePercentages) {
      issues.push({
        type: 'overly_precise',
        category: 'precise_numbers',
        severity: 'low',
        description: '包含过于精确的数字',
        evidence: precisePercentages,
        confidence: 0.5,
        suggestions: ['过于精确的数字可能需要验证来源']
      });
    }

    return issues;
  }

  /**
   * 计算模式匹配的置信度（优化版）
   */
  calculatePatternConfidence(matchedText, patternConfig, fullText) {
    let confidence = 0.5; // 基础置信度

    // 1. 根据匹配长度调整
    if (matchedText.length > 10) confidence += 0.1;
    if (matchedText.length > 20) confidence += 0.1;

    // 2. 根据严重程度调整
    switch (patternConfig.severity) {
      case 'high': confidence += 0.3; break;
      case 'medium': confidence += 0.2; break;
      case 'low': confidence += 0.1; break;
    }

    // 3. 根据敏感度设置调整
    switch (this.settings.sensitivity) {
      case 'high': confidence += 0.1; break;
      case 'low': confidence -= 0.1; break;
    }

    // 4. 新增：考虑文本长度影响
    if (this.settings.considerTextLength && fullText) {
      const textLength = fullText.length;
      if (textLength < 100) confidence -= 0.1; // 短文本降低置信度
      if (textLength > 1000) confidence += 0.1; // 长文本提高置信度
    }

    // 5. 新增：考虑词频影响
    if (this.settings.considerWordFrequency && fullText) {
      const wordFreq = (fullText.match(new RegExp(matchedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
      if (wordFreq > 1) confidence += 0.1 * Math.min(wordFreq - 1, 3); // 重复出现提高置信度
    }

    // 6. 新增：上下文相关性调整
    const contextScore = this.calculateContextRelevance(matchedText, fullText);
    confidence += contextScore * 0.2;

    return Math.min(0.95, Math.max(0.1, confidence));
  }

  /**
   * 计算上下文相关性
   */
  calculateContextRelevance(matchedText, fullText) {
    const suspiciousContext = ['可能', '也许', '据说', '听说', '大概', '估计'];
    const supportiveContext = ['确实', '真的', '事实上', '实际上'];
    
    const matchIndex = fullText.indexOf(matchedText);
    const contextWindow = 50;
    const beforeContext = fullText.substring(Math.max(0, matchIndex - contextWindow), matchIndex);
    const afterContext = fullText.substring(matchIndex + matchedText.length, Math.min(fullText.length, matchIndex + matchedText.length + contextWindow));
    
    let score = 0;
    
    // 检查可疑上下文（降低置信度）
    for (const word of suspiciousContext) {
      if (beforeContext.includes(word) || afterContext.includes(word)) {
        score -= 0.2;
      }
    }
    
    // 检查支持性上下文（提高置信度）
    for (const word of supportiveContext) {
      if (beforeContext.includes(word) || afterContext.includes(word)) {
        score += 0.1;
      }
    }
    
    return Math.max(-0.5, Math.min(0.5, score));
  }

  /**
   * 计算总体置信度和风险等级（优化版）
   */
  calculateConfidenceAndRisk(analysisResult) {
    const issues = analysisResult.issues;
    
    if (issues.length === 0) {
      analysisResult.confidence = 0.9;
      analysisResult.riskLevel = 'low';
      return;
    }

    // 加权平均置信度
    const totalWeight = issues.reduce((sum, issue) => {
      return sum + this.getSeverityWeight(issue.severity);
    }, 0);

    const weightedConfidence = issues.reduce((sum, issue) => {
      const weight = this.getSeverityWeight(issue.severity);
      return sum + (issue.confidence * weight);
    }, 0);

    let baseConfidence = weightedConfidence / totalWeight;

    // 新增：基于文本指标调整置信度
    if (analysisResult.textMetrics) {
      const metrics = analysisResult.textMetrics;
      
      // 高关键词密度增加置信度
      if (metrics.keywordDensity > 0.1) {
        baseConfidence += 0.1;
      }
      
      // 文本复杂度影响
      if (metrics.textComplexity > 0.3) {
        baseConfidence += 0.05;
      }
      
      // 文本长度影响
      if (metrics.wordCount < 50) {
        baseConfidence -= 0.1; // 短文本降低置信度
      }
    }

    analysisResult.confidence = Math.min(0.95, Math.max(0.1, baseConfidence));

    // 优化的风险等级评估
    const highSeverityCount = issues.filter(i => i.severity === 'high').length;
    const mediumSeverityCount = issues.filter(i => i.severity === 'medium').length;
    const lowSeverityCount = issues.filter(i => i.severity === 'low').length;

    // 更精细的风险评估
    if (highSeverityCount >= 2 || (highSeverityCount >= 1 && analysisResult.confidence > 0.8)) {
      analysisResult.riskLevel = 'high';
    } else if (highSeverityCount >= 1 || mediumSeverityCount >= 2 || 
               (mediumSeverityCount >= 1 && analysisResult.confidence > 0.7)) {
      analysisResult.riskLevel = 'medium';
    } else {
      analysisResult.riskLevel = 'low';
    }
  }

  /**
   * 生成分析摘要
   */
  generateSummary(analysisResult) {
    const issues = analysisResult.issues;
    
    analysisResult.summary = {
      totalIssues: issues.length,
      byCategory: this.groupIssuesByCategory(issues),
      bySeverity: this.groupIssuesBySeverity(issues),
      topConcerns: this.getTopConcerns(issues),
      recommendation: this.generateRecommendation(analysisResult)
    };
  }

  /**
   * 生成建议
   */
  generateSuggestions(category) {
    const suggestionMap = {
      'personal_experience': ['AI不应有个人经历，请验证信息来源'],
      'temporal_info': ['请验证时间相关信息的准确性'],
      'overconfidence': ['考虑使用更谨慎的表达方式'],
      'authority_reference': ['请验证权威引用的具体来源'],
      'precise_numbers': ['过于精确的数字可能需要验证'],
      'capability_claim': ['AI可能没有声称的实时能力']
    };

    return suggestionMap[category] || ['建议进一步验证此信息'];
  }

  /**
   * 辅助方法
   */
  generateAnalysisId(text) {
    // 简单的基于文本内容的ID生成器
    // 原来错误的行: return btoa(text.substring(0, 50) + text.length);
    // 修复：先将可能包含Unicode字符的字符串进行UTF-8编码，然后再进行Base64编码
    const stringToEncode = text.substring(0, 50) + text.length;
    try {
      // 推荐方法：将字符串编码为UTF-8，然后转换为btoa兼容的格式
      const utf8Bytes = new TextEncoder().encode(stringToEncode);
      const latin1String = String.fromCharCode(...utf8Bytes);
      return btoa(latin1String);
    } catch (e) {
      // 如果TextEncoder不可用或出错，回退到旧的但可能不完全安全的方法
      // console.warn("TextEncoder failed, falling back for btoa prep:", e);
      try {
        return btoa(unescape(encodeURIComponent(stringToEncode)));
      } catch (e2) {
        // 如果所有方法都失败，返回一个基于时间戳的简单ID，并记录错误
        console.error("Failed to generate analysis ID using btoa even with workarounds:", e2);
        return `fallback_id_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      }
    }
  }

  extractContext(text, position, length) {
    const start = Math.max(0, position - this.settings.contextWindowSize);
    const end = Math.min(text.length, position + length + this.settings.contextWindowSize);
    return text.substring(start, end);
  }

  isCategoryEnabled(category) {
    return this.settings.enabledCategories.includes('all') || 
           this.settings.enabledCategories.includes(category);
  }

  getSeverityWeight(severity) {
    switch (severity) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  /**
   * 改进的去重逻辑
   */
  deduplicateIssues(issues) {
    const seen = new Map();
    return issues.filter(issue => {
      // 更精确的去重键
      const key = `${issue.category}-${issue.severity}-${issue.matchedText}-${issue.position?.start}`;
      
      if (seen.has(key)) {
        // 如果重复，保留置信度更高的
        const existing = seen.get(key);
        if (issue.confidence > existing.confidence) {
          seen.set(key, issue);
          return true;
        }
        return false;
      }
      
      seen.set(key, issue);
      return true;
    });
  }

  groupIssuesByCategory(issues) {
    return issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});
  }

  groupIssuesBySeverity(issues) {
    return issues.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {});
  }

  getTopConcerns(issues) {
    return issues
      .filter(issue => issue.severity === 'high' || issue.confidence > 0.8)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  generateRecommendation(analysisResult) {
    const riskLevel = analysisResult.riskLevel;
    const issueCount = analysisResult.issues.length;
    
    if (riskLevel === 'high') {
      return `发现${issueCount}个问题，建议仔细验证此回复中的关键信息`;
    } else if (riskLevel === 'medium') {
      return `发现${issueCount}个问题，建议对部分内容进行验证`;
    } else if (issueCount > 0) {
      return `发现${issueCount}个轻微问题，整体内容相对可靠，但仍建议保持批判性思维`;
    } else {
      return '未发现明显问题，但仍建议保持批判性思维';
    }
  }

  // 实现之前的占位符方法
  hasSuspiciousCausalRelation(text) {
    // 简单的因果关系验证
    const suspiciousPatterns = [
      /因为.*所以.*但是/gi,
      /由于.*导致.*然而/gi
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  /**
   * 更新设置
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * 清理缓存
   */
  clearCache() {
    this.analysisHistory.clear();
  }
}

// 创建全局实例
window.TextAnalyzer = TextAnalyzer;