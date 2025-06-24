/**
 * 幻觉检测模式库
 * 定义各种类型的幻觉检测规则和模式
 */

class HallucinationPatterns {
  constructor() {
    this.patterns = this.initializePatterns();
    this.whitelist = this.initializeWhitelist();
  }

  initializePatterns() {
    return {
      // 1. 主观经历模式 - AI不应有个人体验
      subjectiveExperience: {
        patterns: [
          // 优化：增加否定上下文检测，避免误报
          /(?<!不是|并非|没有)我记得(?!.*(?:可能|应该|据说))/gi,
          /(?<!假如|如果|比如)我亲自(?!.*(?:建议|推荐))/gi,
          /我曾经(?!.*(?:学习|了解|听说|看到过类似))/gi,
          /我见过(?!.*(?:类似|这样|这种))/gi,
          /我体验过(?!.*(?:类似|相似))/gi,
          /我参与过(?!.*(?:类似|相关))/gi,
          /我的经历(?!.*(?:告诉我|让我))/gi,
          /我的体验(?!.*(?:是|告诉))/gi,
          /我去过(?!.*(?:类似|这样))/gi,
          /我住过(?!.*(?:类似|这样))/gi,
          /我工作过(?!.*(?:类似|相关))/gi,
          /我的朋友(?!.*(?:可能|也许|据说))/gi
        ],
        severity: 'high',
        description: 'AI声称有个人经历或记忆',
        category: 'personal_experience'
      },

      // 2. 时间敏感性模式 - AI可能没有实时信息
      temporalSensitivity: {
        patterns: [
          // 优化：增加限定词，排除合理的时间表达
          /(?<!在|于|从|到)今天(?!.*(?:一般|通常|往往|可能))/gi,
          /(?<!在|于|从|到)昨天(?!.*(?:一般|通常|往往|可能))/gi,
          /(?<!在|于|从|到)明天(?!.*(?:一般|通常|往往|可能))/gi,
          /(?<!在|于|从|到)现在(?!.*(?:一般|通常|通常情况下))/gi,
          /刚刚(?!.*(?:可能|也许|据说|通常))/gi,
          /最近(?!.*(?:几年|一段时间|一般|通常))/gi,
          /今年(?!.*(?:一般|通常|可能|大概))/gi,
          /去年(?!.*(?:一般|通常|可能|大概))/gi,
          /最新消息(?!.*(?:显示|表明|可能|据说))/gi,
          /刚刚发生(?!.*(?:的事|类似))/gi,
          /今天发布(?!.*(?:的|一般))/gi,
          /目前(?!.*(?:一般|通常|的情况|来看|而言))/gi,
          /当前(?!.*(?:一般|通常|的情况|来看|而言))/gi,
          /截至目前(?!.*(?:一般|来说))/gi,
          /实时(?!.*(?:监控|系统|技术|数据|功能))/gi
        ],
        severity: 'medium',
        description: '可能包含过时的时间敏感信息',
        category: 'temporal_info'
      },

      // 3. 过度确定性模式 - AI表现出不当的确定性
      overConfidence: {
        patterns: [
          // 优化：增加上下文限定，避免合理的确定性表达
          /(?<!这|那|几乎|基本上|通常)绝对(?!.*(?:值|路径|优势|劣势))/gi,
          /(?<!我|基本|几乎|通常)肯定(?!.*(?:会|的|是|性|句))/gi,
          /(?<!我|基本|几乎|通常)一定(?!.*(?:程度|意义|条件|时间|要|会))/gi,
          /(?<!接近|约|大约|几乎)100%(?!.*(?:确保|保证|纯))/gi,
          /毫无疑问(?!.*(?:是|的|会|能))/gi,
          /必然(?!.*(?:性|结果|趋势|规律|联系))/gi,
          /永远不会(?!.*(?:是|有|可能))/gi,
          /从来没有(?!.*(?:人|过|见过|听说过))/gi,
          /绝不可能(?!.*(?:是|的|会|发生))/gi,
          /毫无例外(?!.*(?:地|的))/gi,
          /所有.*都(?!.*(?:可能|也许|通常|一般|往往))/gi,
          /每个.*都(?!.*(?:可能|也许|通常|一般|往往))/gi,
          /(?<!这|那)最好的(?!.*(?:方法|方式|选择|之一))/gi,
          /(?<!这|那)最差的(?!.*(?:情况|结果|之一))/gi,
          /唯一的.*方法(?!.*(?:之一|可能|也许))/gi,
          /(?<!这|那|很|非常)显然(?!.*(?:不|并非))/gi,
          /(?<!这|那|很|非常)明显(?!.*(?:不|并非))/gi,
          /(?<!这|那)当然(?!.*(?:不|可以|可能|也))/gi,
          /不用说(?!.*(?:的是|也))/gi,
          /众所周知(?!.*(?:的是|地))/gi
        ],
        severity: 'low',
        description: '使用过度确定的表述',
        category: 'overconfidence'
      },

      // 4. 权威性声明模式 - AI引用可能不存在的权威
      authorityClams: {
        patterns: [
          // 优化：更精确的权威引用检测
          /根据官方(?!.*(?:网站|文档|说明|建议|一般))/gi,
          /官方数据显示(?!.*(?:通常|一般|可能))/gi,
          /官方报告(?!.*(?:通常|一般|显示|指出))/gi,
          /官方统计(?!.*(?:通常|一般|显示|数据))/gi,
          /权威机构(?!.*(?:通常|一般|认为|建议))/gi,
          /专家表示(?!.*(?:通常|一般|认为|建议))/gi,
          /专家认为(?!.*(?:通常|一般|可能|也许))/gi,
          /研究表明(?!.*(?:通常|一般|可能|往往))/gi,
          /调查显示(?!.*(?:通常|一般|可能|往往))/gi,
          /报告指出(?!.*(?:通常|一般|可能|往往))/gi,
          /统计数据表明(?!.*(?:通常|一般|可能))/gi,
          /数据显示(?!.*(?:通常|一般|可能|往往))/gi,
          /政府发布(?!.*(?:的|通常|一般))/gi,
          /政府报告(?!.*(?:通常|一般|显示))/gi,
          /政府统计(?!.*(?:通常|一般|显示|数据))/gi,
          /官方公布(?!.*(?:的|通常|一般))/gi,
          /最新研究(?!.*(?:通常|一般|显示|表明|发现))/gi,
          /最新调查(?!.*(?:通常|一般|显示|发现))/gi,
          /最新统计(?!.*(?:通常|一般|显示|数据))/gi,
          /最新数据(?!.*(?:通常|一般|显示))/gi
        ],
        severity: 'high',
        description: '引用可能不准确的权威来源',
        category: 'authority_reference'
      },

      // 5. 具体数字模式 - 过于精确的数字可能不准确
      preciseNumbers: {
        patterns: [
          // 优化：更精确的数字检测，排除合理用途
          /(?<!约|大约|接近|超过|不到)\d{4}年\d{1,2}月\d{1,2}日(?!.*(?:左右|前后|附近))/g,
          /(?<!约|大约|接近|超过|不到)\d+\.\d{3,}%(?!.*(?:左右|上下|附近))/g,
          /(?<!约|大约|接近|超过|不到)\d{5,}[人户家个台辆](?!.*(?:左右|上下|附近|以上|以下))/g,
          /(?<!约|大约|接近)\d+万\d+千\d+(?!.*(?:左右|上下|附近))/g,
          /价格.*?[￥$€]\d+\.\d{2}(?!.*(?:左右|上下|附近))/g,
          // 新增：检测过于精确的科学数据
          /(?<!约|大约)\d+\.\d{4,}(?!.*(?:左右|附近|米|克|秒))/g,
          /(?<!约|大约)\d+\.\d{2,}倍(?!.*(?:左右|附近))/g
        ],
        severity: 'medium',
        description: '包含可能不准确的精确数字',
        category: 'precise_numbers'
      },

      // 6. 实时能力声明 - AI声称有实时能力
      realtimeCapabilities: {
        patterns: [
          // 优化：更精确检测虚假能力声明
          /我可以帮你查询(?!.*(?:方法|如何|相关信息|这类问题))/gi,
          /我来搜索(?!.*(?:相关|类似|这类))/gi,
          /我去查看(?!.*(?:一下|相关|类似))/gi,
          /我来检查(?!.*(?:一下|这个|相关))/gi,
          /我能够获取(?!.*(?:相关|这类|类似))/gi,
          /我可以访问(?!.*(?:相关|这类|类似))/gi,
          /我来获取(?!.*(?:相关|这类|类似))/gi,
          /我能查到(?!.*(?:相关|这类|类似))/gi,
          /让我搜索(?!.*(?:相关|这类|类似))/gi,
          /让我查询(?!.*(?:相关|这类|类似))/gi,
          /让我获取(?!.*(?:相关|这类|类似))/gi,
          /让我访问(?!.*(?:相关|这类|类似))/gi,
          /我刚刚搜索(?!.*(?:了相关|了类似))/gi,
          /我刚刚查询(?!.*(?:了相关|了类似))/gi,
          /我刚才查看(?!.*(?:了相关|了类似))/gi,
          /我可以实时(?!.*(?:为您|帮您|提供))/gi,
          /我能够实时(?!.*(?:为您|帮您|提供))/gi,
          /实时获取(?!.*(?:这类|相关|类似))/gi,
          /实时查询(?!.*(?:这类|相关|类似))/gi
        ],
        severity: 'high',
        description: 'AI声称有实时搜索或查询能力',
        category: 'capability_claim'
      },

      // 7. 对话记忆模式 - AI声称记住之前的对话
      conversationMemory: {
        patterns: [
          // 优化：区分合理的对话引用和虚假记忆
          /你刚才说(?!.*(?:的|过|如果|假如|比如))/gi,
          /你之前提到(?!.*(?:的|过|如果|类似|这样))/gi,
          /你前面说过(?!.*(?:的|类似|这样))/gi,
          /你刚刚问过(?!.*(?:的|类似|这样))/gi,
          /我们之前聊过(?!.*(?:类似|这样|这类))/gi,
          /我们刚才讨论(?!.*(?:了|过|的|类似))/gi,
          /我们前面谈到(?!.*(?:了|过|的|类似))/gi,
          /你还记得(?!.*(?:吗|我说|我们|刚才|之前))/gi,
          /还记得我们(?!.*(?:刚才|之前|说过))/gi,
          /记得刚才(?!.*(?:我|你|我们))/gi,
          /记得之前(?!.*(?:我|你|我们))/gi,
          /继续我们的对话(?!.*(?:刚才|之前))/gi,
          /回到刚才的话题(?!.*(?:上|中))/gi,
          /接着刚才的(?!.*(?:话题|讨论))/gi,
          /你上次问(?!.*(?:的|过|类似))/gi,
          /上次你说(?!.*(?:的|过|类似))/gi,
          /之前的问题(?!.*(?:类似|相关))/gi,
          /前面的话题(?!.*(?:类似|相关))/gi
        ],
        severity: 'medium',
        description: '声称记住超出当前对话的内容',
        category: 'memory_claim'
      },

      // 8. 地理位置模式 - AI声称知道用户位置
      locationClaims: {
        patterns: [
          // 优化：更精确的位置推测检测
          /你所在的城市(?!.*(?:可能|也许|一般|通常))/gi,
          /你的位置(?!.*(?:可能|也许|一般|信息))/gi,
          /你们那里(?!.*(?:可能|也许|一般|通常))/gi,
          /你当地(?!.*(?:可能|也许|一般|通常))/gi,
          /根据你的位置(?!.*(?:信息|可能|也许))/gi,
          /基于你的地理位置(?!.*(?:信息|可能))/gi,
          /在你的地区(?!.*(?:可能|也许|一般|通常))/gi,
          /你附近的(?!.*(?:可能|也许|一般|应该))/gi,
          /你周围的(?!.*(?:可能|也许|一般|应该))/gi,
          /你当地的(?!.*(?:可能|也许|一般|通常))/gi,
          /你那边的(?!.*(?:可能|也许|一般|通常))/gi,
          /在你的国家(?!.*(?:可能|也许|一般|通常))/gi,
          /在你们国家(?!.*(?:可能|也许|一般|通常))/gi,
          /你们那里的情况(?!.*(?:可能|也许|一般))/gi
        ],
        severity: 'medium',
        description: '声称知道用户的地理位置',
        category: 'location_claim'
      }
    };
  }

  /**
   * 初始化白名单 - 排除已知安全的表达
   */
  initializeWhitelist() {
    return {
      // 常见的安全表达模式
      safeExpressions: [
        /我理解您的意思/gi,
        /我可以帮您分析/gi,
        /我来为您解释/gi,
        /我建议您考虑/gi,
        /我推荐以下方法/gi,
        /我的理解是/gi,
        /我的建议是/gi,
        /我认为您可以/gi,
        /我想这可能是/gi,
        /我觉得这应该/gi,
        /让我来帮您/gi,
        /让我为您说明/gi,
        /根据我的知识/gi,
        /据我了解/gi,
        /在我的训练数据中/gi,
        /我学习到的信息/gi,
        /我的训练包含/gi,
        /我被训练来/gi,
        /作为AI助手/gi,
        /作为人工智能/gi
      ],
      
      // 技术和学术术语
      technicalTerms: [
        /API接口/gi,
        /HTTP协议/gi,
        /数据库/gi,
        /算法/gi,
        /编程语言/gi,
        /操作系统/gi,
        /机器学习/gi,
        /人工智能/gi,
        /深度学习/gi,
        /神经网络/gi
      ],
      
      // 时间表达的安全用法
      timeExpressions: [
        /今天通常/gi,
        /现在一般/gi,
        /目前通常/gi,
        /当前的情况下/gi,
        /最近几年/gi,
        /最近一段时间/gi,
        /近年来/gi
      ],
      
      // 数字的合理用法
      numberExpressions: [
        /约.*%/gi,
        /大约.*%/gi,
        /接近.*%/gi,
        /超过.*%/gi,
        /不到.*%/gi,
        /.*左右/gi,
        /.*附近/gi,
        /.*上下/gi
      ]
    };
  }

  /**
   * 检查文本是否匹配白名单
   */
  isWhitelisted(text, matchedText) {
    const allWhitelistPatterns = [
      ...this.whitelist.safeExpressions,
      ...this.whitelist.technicalTerms,
      ...this.whitelist.timeExpressions,
      ...this.whitelist.numberExpressions
    ];

    for (const pattern of allWhitelistPatterns) {
      if (pattern.test(text) && text.includes(matchedText)) {
        return true;
      }
    }
    return false;
  }

  /**
   * 获取所有检测模式
   */
  getAllPatterns() {
    return this.patterns;
  }

  /**
   * 根据类别获取模式
   */
  getPatternsByCategory(category) {
    return Object.values(this.patterns).filter(pattern => 
      pattern.category === category
    );
  }

  /**
   * 根据严重程度获取模式
   */
  getPatternsBySeverity(severity) {
    return Object.values(this.patterns).filter(pattern => 
      pattern.severity === severity
    );
  }

  /**
   * 添加自定义模式
   */
  addCustomPattern(name, patternConfig) {
    this.patterns[name] = {
      patterns: patternConfig.patterns,
      severity: patternConfig.severity || 'medium',
      description: patternConfig.description || '自定义检测模式',
      category: patternConfig.category || 'custom'
    };
  }

  /**
   * 移除模式
   */
  removePattern(name) {
    delete this.patterns[name];
  }

  /**
   * 获取模式统计信息
   */
  getPatternStats() {
    const patterns = Object.values(this.patterns);
    return {
      total: patterns.length,
      byCategory: patterns.reduce((acc, pattern) => {
        acc[pattern.category] = (acc[pattern.category] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: patterns.reduce((acc, pattern) => {
        acc[pattern.severity] = (acc[pattern.severity] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// 创建全局实例
window.HallucinationPatterns = HallucinationPatterns;