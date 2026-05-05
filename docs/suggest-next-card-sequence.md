# Sequence Diagram: Gợi ý thẻ tiếp theo

Sơ đồ dưới đây mô tả ngắn gọn nghiệp vụ gợi ý thẻ tiếp theo dựa trên độ tương đồng nội dung. Hệ thống tìm các mục gần nghĩa trong vector database, sau đó lấy thông tin thẻ tương ứng từ cơ sở dữ liệu.

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
	participant VectorDB as Vector DB

	Note over User,VectorDB: Luồng gợi ý thẻ tiếp theo
	User->>FE: Yêu cầu gợi ý thẻ tiếp theo
	FE->>BE: Suggest next + access token
	BE->>BE: Verify access token
	BE->>Redis: Check session
	alt Token lỗi hoặc session không tồn tại
		BE-->>FE: Báo không được phép truy cập
		FE-->>User: Yêu cầu đăng nhập lại
	else Phiên hợp lệ
		BE->>BE: Build query text
		BE->>VectorDB: Search similar vectors
		BE->>DB: Lấy cards tương ứng
		BE->>BE: Lọc card hiện tại
		BE-->>FE: Trả danh sách gợi ý
		FE-->>User: Hiển thị các thẻ gợi ý tiếp theo
	end
```
