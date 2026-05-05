# Sequence Diagram: Xem chi tiết deck cá nhân

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xem chi tiết một deck cá nhân trong module `deck`. Khi mở deck thành công, hệ thống cập nhật thời điểm mở gần nhất của deck đó.

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
    actorMargin: 34
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

	Note over User,Redis: Luồng xem chi tiết deck cá nhân
	User->>FE: Chọn một deck của mình
	FE->>BE: Get my deck + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Find owned deck + cards
		alt Không tìm thấy deck
			BE-->>FE: Báo không tìm thấy deck
		else Tìm thấy deck
			BE->>DB: Cập nhật thời điểm mở deck
			BE-->>FE: Trả detail + cards
			FE-->>User: Hiển thị chi tiết deck
		end
	end
```
