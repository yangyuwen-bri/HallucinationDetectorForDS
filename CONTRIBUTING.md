# 🤝 贡献指南

感谢您对DeepSeek AI幻觉检测器项目的关注！我们欢迎任何形式的贡献。

## 📋 贡献方式

### 🐛 报告Bug
- 使用清晰的标题描述问题
- 提供详细的复现步骤
- 包含浏览器版本和操作系统信息
- 附上相关的截图或错误日志

### ✨ 功能建议
- 详细描述建议的功能
- 解释该功能的价值和用例
- 考虑是否会影响现有功能
- 提供可能的实现方案

### 🔧 代码贡献
- Fork项目并创建功能分支
- 遵循代码规范和提交规范
- 添加必要的测试用例
- 更新相关文档

## 🌿 分支策略

### 主要分支
- `main` - 稳定的生产版本
- `develop` - 开发集成分支

### 功能分支
- `feature/{功能名称}` - 新功能开发
- `fix/{问题描述}` - Bug修复
- `docs/{文档类型}` - 文档更新
- `refactor/{模块名称}` - 代码重构
- `test/{测试类型}` - 测试相关

### 发布分支
- `release/{版本号}` - 版本发布准备
- `hotfix/{紧急修复}` - 生产环境紧急修复

## 📝 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<类型>[可选 范围]: <描述>

[可选 正文]

[可选 脚注]
```

### 提交类型
- `feat` - 新功能
- `fix` - Bug修复
- `docs` - 文档更改
- `style` - 代码格式（不影响功能）
- `refactor` - 重构代码
- `perf` - 性能优化
- `test` - 测试相关
- `build` - 构建系统或依赖项更改
- `ci` - CI配置文件和脚本更改
- `chore` - 其他不修改src或test文件的更改

### 示例
```bash
feat(patterns): 添加新的幻觉检测模式
fix(analyzer): 修复置信度计算中的边界情况
docs(readme): 更新安装说明
refactor(ui): 重构警告卡片组件
test(analyzer): 添加文本分析器单元测试
```

## 💻 代码规范

### JavaScript规范

#### 基本约定
```javascript
// ✅ 好的示例
const analyzeText = (text, options = {}) => {
  if (!text || typeof text !== 'string') {
    return { issues: [], confidence: 0 };
  }
  
  const results = processText(text, options);
  return formatResults(results);
};

// ❌ 不好的示例
function analyze(t,o){
  var r=process(t);
  return r;
}
```

#### 命名规范
- **变量和函数**：驼峰命名法 (`camelCase`)
- **常量**：大写字母+下划线 (`UPPER_SNAKE_CASE`)
- **类名**：大驼峰命名法 (`PascalCase`)
- **文件名**：短横线分隔 (`kebab-case`)

#### 注释规范
```javascript
/**
 * 分析文本中的幻觉模式
 * @param {string} text - 待分析的文本内容
 * @param {Object} options - 分析选项
 * @param {number} options.sensitivity - 检测敏感度 (1-3)
 * @param {string[]} options.categories - 启用的检测类别
 * @returns {Object} 分析结果对象
 */
function analyzeHallucination(text, options = {}) {
  // 实现...
}
```

### CSS/HTML规范

#### CSS
```css
/* ✅ 好的示例 */
.hallucination-warning {
  position: absolute;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 12px;
  z-index: 10000;
}

.hallucination-warning--high-risk {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}
```

#### HTML
```html
<!-- ✅ 好的示例 -->
<div class="hallucination-warning" data-risk-level="high">
  <div class="warning-content">
    <p class="warning-message">检测到可能的幻觉内容</p>
  </div>
</div>
```

## 🧪 测试规范

### 测试文件组织
```
tests/
├── unit/              # 单元测试
│   ├── patterns.test.js
│   ├── analyzer.test.js
│   └── ui-manager.test.js
├── integration/       # 集成测试
│   └── content-script.test.js
└── e2e/              # 端到端测试
    └── extension.test.js
```

### 测试编写
```javascript
describe('TextAnalyzer', () => {
  describe('analyzeText()', () => {
    it('应该检测到个人经历声明', () => {
      const text = '我记得去年我亲自参观了这个博物馆';
      const result = analyzer.analyzeText(text);
      
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].type).toBe('personal_experience');
      expect(result.issues[0].severity).toBe('high');
    });
    
    it('应该正确处理空输入', () => {
      const result = analyzer.analyzeText('');
      expect(result.issues).toHaveLength(0);
      expect(result.confidence).toBe(0);
    });
  });
});
```

## 📦 发布流程

### 版本号规范
遵循 [Semantic Versioning](https://semver.org/)：

- `MAJOR.MINOR.PATCH` (例如: `1.2.3`)
- `MAJOR` - 不兼容的API更改
- `MINOR` - 向后兼容的功能添加
- `PATCH` - 向后兼容的错误修复

### 发布步骤
1. **创建发布分支**
   ```bash
   git checkout develop
   git checkout -b release/1.2.0
   ```

2. **更新版本信息**
   - 更新 `manifest.json` 中的版本号
   - 更新 `package.json` 中的版本号
   - 更新 `CHANGELOG.md`

3. **测试验证**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **合并到主分支**
   ```bash
   git checkout main
   git merge release/1.2.0
   git tag v1.2.0
   git push origin main --tags
   ```

5. **回合到开发分支**
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

## 🛡️ 安全指南

### 代码安全
- 不要硬编码敏感信息
- 验证所有用户输入
- 使用内容安全策略(CSP)
- 定期更新依赖项

### 数据隐私
- 不收集用户的对话内容
- 本地处理所有数据
- 匿名化统计信息
- 明确说明权限用途

## 📋 Pull Request检查清单

在提交PR之前，请确保：

### 代码质量
- [ ] 代码符合项目规范
- [ ] 已添加必要的注释
- [ ] 通过所有测试用例
- [ ] 无lint错误或警告

### 功能完整性
- [ ] 功能按预期工作
- [ ] 处理了边界情况
- [ ] 不会破坏现有功能
- [ ] 性能没有明显下降

### 文档更新
- [ ] 更新了相关文档
- [ ] 添加了使用示例
- [ ] 更新了CHANGELOG
- [ ] README反映了新变化

### 测试覆盖
- [ ] 添加了新功能的测试
- [ ] 修复的bug有对应测试
- [ ] 测试覆盖率不低于当前水平

## 📞 联系方式

如有任何问题，欢迎通过以下方式联系：

- 📧 提交Issue: [GitHub Issues](https://github.com/your-username/deepseek-hallucination-detector/issues)
- 💬 参与讨论: [GitHub Discussions](https://github.com/your-username/deepseek-hallucination-detector/discussions)
- 📝 提交PR: [Pull Requests](https://github.com/your-username/deepseek-hallucination-detector/pulls)

## 🎯 快速开始贡献

1. **Fork项目** 
   ```bash
   # 点击GitHub页面的Fork按钮
   ```

2. **克隆到本地**
   ```bash
   git clone https://github.com/YOUR_USERNAME/deepseek-hallucination-detector.git
   cd deepseek-hallucination-detector
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/my-new-feature
   ```

4. **开发测试**
   ```bash
   # 加载到Chrome进行测试
   # chrome://extensions/ -> 开发者模式 -> 加载已解压的扩展程序
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   git push origin feature/my-new-feature
   ```

6. **创建Pull Request**
   - 访问你的GitHub仓库
   - 点击"Compare & pull request"
   - 填写PR描述
   - 提交PR

---

感谢您的贡献！🙏 您的每一份付出都会让项目变得更好。 