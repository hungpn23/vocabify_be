# Sequence Diagram: Làm mới phiên đăng nhập

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ làm mới phiên đăng nhập bằng refresh token. Hệ thống chỉ chấp nhận refresh token còn hiệu lực và đang gắn với phiên hợp lệ trong Redis.

```mermaid
---
config:
  theme: base
  look: classic
  sequence:
    showSequenceNumbers: false
    mirrorActors: false
    diagramMarginX: 12
    diagramMarginY: 8
    actorMargin: 48
    boxMargin: 6
    boxTextMargin: 4
    noteMargin: 6
    messageMargin: 24
  themeVariables:
    background: "#ffffff"
    mainBkg: "#ffffff"
    actorBkg: "#f8fafc"
    actorBorder: "#475569"
    actorTextColor: "#0f172a"
    signalColor: "#334155"
    signalTextColor: "#0f172a"
    noteBkgColor: "#eef6ff"
    noteTextColor: "#0f172a"
    noteBorderColor: "#93c5fd"
    loopTextColor: "#0f172a"
    activationBkgColor: "#e0f2fe"
    activationBorderColor: "#0284c7"
    labelBoxBkgColor: "#f1f5f9"
    labelBoxBorderColor: "#94a3b8"
    labelTextColor: "#0f172a"
    fontFamily: "Arial"
    fontSize: "12px"
---
sequenceDiagram
	actor User
	participant FE as FE
	participant BE as API
	participant Redis as Redis

	Note over User,Redis: Làm mới phiên đăng nhập
	User->>FE: Access token hết hạn
	FE->>BE: Refresh token
	BE->>BE: Verify refresh token
	BE->>Redis: Check session
	alt Token lỗi hoặc session hết hạn
		BE-->>FE: Báo không được phép làm mới phiên
		FE-->>User: Yêu cầu đăng nhập lại
	else Token hợp lệ
		BE->>BE: Tạo token mới
		BE->>Redis: Cập nhật session
		BE-->>FE: Trả token mới
		FE-->>User: Tiếp tục sử dụng hệ thống
	end
```
