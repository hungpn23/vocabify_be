# Sequence Diagram: Cập nhật deck

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ cập nhật deck trong module `deck`. Luồng này hỗ trợ cập nhật thông tin deck, thay đổi visibility/passcode và đồng bộ lại danh sách card.

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

	Note over User,Redis: Luồng cập nhật deck
	User->>FE: Chỉnh sửa thông tin deck
	FE->>BE: Update deck + access token
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
			BE->>DB: Check duplicate name
			BE->>BE: Validate visibility/passcode
			alt Tên, visibility hoặc passcode không hợp lệ
				BE-->>FE: Báo cập nhật deck thất bại
			else Dữ liệu hợp lệ
				opt Có gửi danh sách card mới
					BE->>DB: Đồng bộ cards
				end
				BE->>DB: Cập nhật deck
				BE-->>FE: Thành công
				FE-->>User: Cập nhật deck thành công
			end
		end
	end
```
