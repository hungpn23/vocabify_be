# Sequence Diagram: Tải ảnh cho card

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ tải ảnh cho card trong module `deck`. Ảnh được tải lên kho lưu trữ trước, sau đó hệ thống lưu thông tin media tạm để frontend dùng cho các bước tạo hoặc cập nhật deck.

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
	participant ImageKit as ImageKit

	Note over User,ImageKit: Luồng tải ảnh cho card
	User->>FE: Chọn ảnh cho card
	FE->>BE: Upload card image + access token
	BE->>BE: Verify token, validate image
	BE->>Redis: Check session
	alt Token, session hoặc file không hợp lệ
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>DB: Check user
		BE->>ImageKit: Upload image
		alt User không tồn tại hoặc upload lỗi
			BE-->>FE: Báo tải ảnh thất bại
		else Upload thành công
			BE->>DB: Lưu pending media
			BE-->>FE: Trả url + fileId
			FE-->>User: Nhận ảnh cho card
		end
	end
```
