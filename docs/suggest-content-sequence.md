# Sequence Diagram: Gợi ý nội dung từ từ vựng

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ lấy gợi ý nội dung cho một từ vựng. Hệ thống ưu tiên lấy kết quả từ cache, nếu chưa có thì tìm trong dữ liệu từ vựng và lưu lại để tái sử dụng.

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

	Note over User,Redis: Luồng gợi ý nội dung
	User->>FE: Yêu cầu gợi ý nội dung
	FE->>BE: Suggest content + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>Redis: Check suggestion cache
		alt Cache hit
			BE-->>FE: Trả gợi ý từ cache
		else Chưa có cache
			BE->>DB: Tìm dữ liệu gợi ý
			alt Không có dữ liệu
				BE-->>FE: Báo không tìm thấy gợi ý
			else Có dữ liệu
				BE->>Redis: Cache kết quả + TTL
				BE-->>FE: Trả nội dung gợi ý
			end
		end
		FE-->>User: Hiển thị nội dung gợi ý
	end
```
