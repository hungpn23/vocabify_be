# Sequence Diagram: Đăng nhập bằng email và mật khẩu

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đăng nhập bằng email và mật khẩu. Khi thông tin hợp lệ, hệ thống tạo phiên đăng nhập và trả về bộ token cho frontend.

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
    actorMargin: 42
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
	participant DB as DB
	participant Redis as Redis

	Note over User,Redis: Đăng nhập email/password
	User->>FE: Nhập credentials
	FE->>BE: Login
	BE->>DB: Find user by email
	BE->>BE: Verify password
	alt Credentials không hợp lệ
		BE-->>FE: Báo đăng nhập thất bại
	else Hợp lệ
		BE->>BE: Tạo session + token
		BE->>Redis: Lưu phiên đăng nhập
		BE-->>FE: Trả access + refresh token
		FE-->>User: Đăng nhập thành công
	end
```
