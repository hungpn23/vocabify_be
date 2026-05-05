# Sequence Diagram: Xem chi tiết deck chia sẻ

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ xem chi tiết một deck chia sẻ trong module `deck`. Luồng này hỗ trợ guest và user; nếu người dùng đã đăng nhập thì hệ thống không trả về deck của chính họ trong màn hình chia sẻ.

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
	actor Visitor
	participant FE as FE
	participant BE as API
	participant DB as DB
	participant Redis as Redis

	Note over Visitor,Redis: Luồng xem chi tiết deck chia sẻ
	Visitor->>FE: Chọn một deck chia sẻ
	FE->>BE: Get shared deck detail
	opt Có access token
		BE->>BE: Verify token
		BE->>Redis: Check session
	end
	BE->>DB: Find public/protected deck
	Note over BE,DB: Nếu có session, loại deck của chính user
	alt Không tìm thấy deck
		BE-->>FE: Báo không tìm thấy deck
	else Tìm thấy deck
		BE->>DB: Tăng lượt xem deck
		BE-->>FE: Trả detail, owner, cards, total
		FE-->>Visitor: Hiển thị chi tiết deck chia sẻ
	end
```
