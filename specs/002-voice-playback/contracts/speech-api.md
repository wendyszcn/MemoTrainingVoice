# Speech Synthesis Service Contract

> 定义前端应用与语音合成模块之间的接口

## 命名空间: SpeechService

### 接口定义

```typescript
interface VoiceConfig {
  enabled: boolean
  rate: number      // 0.1 - 10, 默认 1
  pitch: number     // 0 - 2, 默认 1
  volume: number    // 0 - 1, 默认 1
  voiceLang: string // 默认 "zh-CN"
}

interface SpeechOptions {
  text: string
  rate?: number
  pitch?: number
  volume?: number
  lang?: string
}
```

### 方法签名

```typescript
// 检查浏览器是否支持语音合成
function isSupported(): boolean

// 获取可用语音列表
function getAvailableVoices(): SpeechSynthesisVoice[]

// 播报文本
function speak(options: SpeechOptions): Promise<void>

// 立即停止播报
function stop(): void

// 检查是否正在播报
function isSpeaking(): boolean
```

---

## 错误处理

| 错误码 | 描述 | 处理方式 |
|--------|------|----------|
| NOT_SUPPORTED | 浏览器不支持语音合成 | 显示友好提示 |
| VOICE_NOT_FOUND | 指定语音不存在 | 回退到默认语音 |
| SPEECH_ERROR | 语音合成失败 | 记录日志，不阻塞流程 |
