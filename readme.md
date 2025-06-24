# 🔍 DeepSeek AI幻觉检测器

> 实时检测DeepSeek AI回复中的潜在幻觉内容，帮助用户识别可能不准确的信息

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue.svg)](https://developer.chrome.com/docs/extensions/)

## 📋 项目简介

DeepSeek AI幻觉检测器是一个Chrome浏览器扩展，专门用于检测DeepSeek AI回复中的潜在幻觉内容。通过8种不同的检测模式和智能算法，帮助用户识别可能不准确或不可靠的AI生成内容。

### ✨ 主要特性

- 🎯 **8种检测模式** - 覆盖个人经历、时间敏感、权威引用等幻觉类型
- 🧠 **智能算法** - 多因素置信度计算和上下文感知检测
- 🛡️ **白名单过滤** - 避免对合理表达的误判
- ⚡ **实时检测** - 在AI流式输出过程中进行检测
- 📊 **详细统计** - 提供检测数据和使用分析
- 🎨 **用户友好** - 直观的视觉提示和详细说明

### 🔧 技术特点

- **上下文感知正则表达式** - 减少30-50%误报率
- **多层次分析引擎** - 模式匹配、语义分析、数据验证
- **智能去重机制** - 保留高置信度检测结果
- **文本指标分析** - 5项文本质量指标
- **性能优化** - 缓存机制和防抖处理

## 🚀 快速开始

### 安装依赖

本项目是纯JavaScript Chrome扩展，无需额外依赖。

### 开发环境设置

1. **克隆项目**
   ```bash
   git clone https://github.com/yangyuwen-bri/HallucinationDetectorForDS.git
   cd HallucinationDetectorForDS
   ```

2. **启动本地服务器**（用于测试）
   ```bash
   # 方法1: Python
   python -m http.server 8000
   
   # 方法2: Node.js
   npx http-server
   
   # 方法3: PHP
   php -S localhost:8000
   ```

3. **访问测试页面**
   ```
   http://localhost:8000/test-optimizations.html
   ```

### Chrome扩展安装

1. 打开Chrome浏览器，进入扩展程序页面 (`chrome://extensions/`)
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择项目根目录
5. 扩展程序安装完成

## 📖 使用说明

### 基本使用

1. 访问 [DeepSeek Chat](https://chat.deepseek.com/)
2. 与AI进行对话
3. 插件会自动检测AI回复中的潜在幻觉
4. 在可疑内容旁显示警告图标
5. 点击图标查看详细信息

### 设置配置

- 点击浏览器工具栏中的插件图标
- 调整检测敏感度（低/中/高）
- 选择显示的风险等级
- 配置检测类别和高级选项

### 测试验证

使用 `test-optimizations.html` 页面可以：
- 测试检测算法的效果
- 验证优化改进
- 运行预设测试用例
- 查看详细的分析结果

## 🏗️ 项目结构

```
HallucinationDetectorForDS/
├── 📄 manifest.json              # Chrome扩展配置
├── 📄 background.js              # 后台服务脚本
├── 📄 content.js                 # 内容脚本主控制器
├── 📄 popup.html                 # 弹窗界面
├── 📄 popup.js                   # 弹窗交互脚本
├── 📄 popup.css                  # 弹窗样式
├── 📄 styles.css                 # 内容脚本样式
├── 📁 lib/                       # 核心算法库
│   ├── 📄 hallucination-patterns.js  # 幻觉检测模式库
│   ├── 📄 text-analyzer.js          # 文本分析引擎
│   └── 📄 ui-manager.js             # 界面管理器
├── 📁 icons/                     # 图标资源
│   ├── 📄 icon-16.png
│   ├── 📄 icon-32.png
│   ├── 📄 icon-48.png
│   └── 📄 icon-128.png
├── 📄 test-optimizations.html    # 算法测试页面
├── 📄 README.md                  # 项目文档
├── 📄 OPTIMIZATION_SUMMARY.md    # 优化总结
├── 📄 CHANGELOG.md               # 更新日志
├── 📄 CONTRIBUTING.md            # 贡献指南
└── 📄 LICENSE                    # 开源协议
```

## 🧪 测试

### 运行测试

```bash
# 启动测试服务器
python -m http.server 8000

# 访问测试页面
open http://localhost:8000/test-optimizations.html
```

### 测试用例

项目包含8个核心测试用例：
- ✅ 个人经历声明测试
- ✅ 白名单过滤测试
- ✅ 时间敏感信息测试
- ✅ 过度确定性测试
- ✅ 权威引用测试
- ✅ 实时能力声明测试
- ✅ 矛盾陈述测试
- ✅ 百分比验证测试

### 性能基准

| 指标 | 目标值 | 当前值 |
|------|--------|--------|
| 误报率 | < 20% | ~15% |
| 检测覆盖率 | > 80% | 85% |
| 分析速度 | < 10ms | 5-8ms |
| 功能完整性 | 100% | 100% |

## 🔧 开发指南

### 代码规范

- 使用ES6+语法
- 采用驼峰命名法
- 添加详细的JSDoc注释
- 保持函数单一职责
- 遵循Chrome扩展最佳实践

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
feat: 添加新的检测模式
fix: 修复置信度计算错误
docs: 更新API文档
style: 代码格式调整
refactor: 重构分析引擎
test: 添加单元测试
chore: 更新构建脚本
```

### 分支策略

- `main` - 主分支，稳定版本
- `develop` - 开发分支，最新功能
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

## 🤝 贡献指南

我们欢迎任何形式的贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细信息。

### 如何贡献

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📊 项目状态

### 版本历史

- **v1.0.0** - 初始版本，基础幻觉检测功能
- **v1.1.0** - 算法优化，白名单系统，性能提升
- **v1.2.0** - 新增检测模式，UI改进


## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️ Star！</p>
  <p>Made with ❤️ by the DeepSeek Hallucination Detector Team</p>
</div>