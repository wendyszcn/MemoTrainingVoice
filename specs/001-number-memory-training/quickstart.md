# Quick Start: 数字记忆训练工具

## 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **测试**: Vitest + React Testing Library
- **存储**: 浏览器 localStorage

## 前置要求

- Node.js 18+
- npm 9+

## 安装步骤

```bash
# 1. 创建项目
npm create vite@latest number-memory -- --template react-ts

# 2. 进入项目目录
cd number-memory

# 3. 安装依赖
npm install

# 4. 安装测试相关依赖 (可选)
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

## 项目结构

```
number-memory/
├── src/
│   ├── components/       # React 组件
│   │   ├── Training/    # 训练相关组件
│   │   ├── Stats/       # 统计相关组件
│   │   └── Settings/   # 设置相关组件
│   ├── services/        # 业务逻辑
│   │   └── storage.ts   # localStorage 操作
│   ├── hooks/           # 自定义 Hooks
│   ├── types/           # TypeScript 类型定义
│   ├── App.tsx          # 主应用组件
│   └── main.tsx         # 入口文件
├── tests/               # 测试文件
│   └── ...
└── index.html           # HTML 入口
```

## 开发命令

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 核心功能实现顺序

1. **Phase 1**: 基础训练流程 (FR-001 ~ FR-004)
   - 生成随机数字序列
   - 显示/隐藏数字
   - 输入框提交答案
   - 答案验证反馈

2. **Phase 2**: 难度调节 (FR-005)
   - 连续答对/答错计数
   - 动态调整数字位数

3. **Phase 3**: 数据持久化 (FR-006 ~ FR-008)
   - 保存训练记录
   - 统计页面
   - 历史记录展示

4. **Phase 4**: 配置与导入导出 (FR-011 ~ FR-013)
   - 可调节显示时长
   - JSON 导出/导入功能
