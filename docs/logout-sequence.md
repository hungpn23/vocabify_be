# Sequence Diagram: Đăng xuất

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ đăng xuất. Khi người dùng đăng xuất, hệ thống xóa phiên hiện tại trong Redis để token không còn được chấp nhận.

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

	Note over User,Redis: Luồng đăng xuất
	User->>FE: Chọn đăng xuất
	FE->>BE: Logout + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
	else Phiên hợp lệ
		BE->>Redis: Xóa session
		BE-->>FE: Thành công
		FE-->>User: Đăng xuất thành công
	end
```
