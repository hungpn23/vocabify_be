# Thiết kế API Upload Ảnh cho Vocabulary App

## Tổng quan

Thay vì dùng 1 API multipart/form-data duy nhất, tách thành **2 API riêng biệt**:

1. `POST /api/images/upload` — upload từng ảnh độc lập, trả về `imageId`
2. `POST /api/vocabulary-sets` — tạo bộ từ vựng bằng JSON thuần, reference ảnh qua `imageId`

---

## Tại sao không dùng 1 API multipart?

| Vấn đề | Mô tả |
|---|---|
| Payload khổng lồ | 50 card × 2MB/ảnh = ~100MB trong 1 request |
| Không retry từng phần | Upload thất bại → gửi lại toàn bộ |
| UX chờ đợi | Phải chờ submit form mới bắt đầu upload |
| Gateway limits | AWS API GW, Nginx mặc định giới hạn 10MB hoặc timeout 30s |
| Lỗi khó xác định | Không biết card nào bị lỗi |

---

## API 1 — Upload ảnh

Upload ngay khi user **chọn ảnh**, không cần chờ submit form.

```http
POST /api/images/upload
Content-Type: multipart/form-data

image: <file.jpg>
```

```json
// Response 200
{
  "imageId": "img_abc123",
  "url": "https://cdn.example.com/images/img_abc123.jpg",
  "thumbnailUrl": "https://cdn.example.com/thumbs/img_abc123.jpg"
}
```

**Đặc điểm:**
- Gọi song song cho nhiều ảnh cùng lúc
- Hiển thị preview ngay sau khi có response
- Retry độc lập nếu 1 ảnh thất bại

---

## API 2 — Tạo vocabulary set

Chỉ gửi JSON, không kèm file. Ảnh được reference qua `imageId` từ bước trên.

```http
POST /api/vocabulary-sets
Content-Type: application/json
```

```json
{
  "title": "Animals",
  "description": "Từ vựng về động vật",
  "cards": [
    {
      "term": "cat",
      "definition": "con mèo",
      "imageId": "img_abc123"
    },
    {
      "term": "dog",
      "definition": "con chó",
      "imageId": "img_def456"
    },
    {
      "term": "bird",
      "definition": "con chim",
      "imageId": null
    }
  ]
}
```

---

## Database — Bảng `images`

```sql
CREATE TABLE images (
  id          UUID PRIMARY KEY,
  url         TEXT NOT NULL,
  user_id     UUID NOT NULL,
  status      VARCHAR(10) NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  attached_at TIMESTAMPTZ
);

CREATE INDEX idx_images_status_created
  ON images(status, created_at);
```

### Chỉ cần 2 status

```
[Chưa tồn tại]
      ↓  POST /images/upload thành công
   PENDING  ←── cleanup job xoá nếu quá hạn
      ↓  POST /vocabulary-sets thành công
   ATTACHED ←── không bao giờ bị cleanup xoá
```

| Status | Ý nghĩa | Cleanup xoá? |
|---|---|---|
| `pending` | Đã upload, chưa được dùng | ✅ Có, sau X giờ |
| `attached` | Đang được dùng bởi ít nhất 1 card | ❌ Không bao giờ |

**Tại sao không cần thêm status khác:**

| Status nghĩ tới | Lý do không cần |
|---|---|
| `uploading` | Client-side state — khi server chưa response thì record chưa tồn tại |
| `failed` | Upload thất bại → record không được tạo, không có gì để track |
| `deleted` | Dùng hard delete hoặc `deleted_at` riêng |
| `processing` | Chỉ cần nếu có async image processing — bài toán khác |
| `expired` | Cleanup job tự xoá record, không cần đánh dấu |

---

## Xử lý Orphan Images

Orphan image là ảnh đã upload nhưng user bỏ cuộc, không tạo set → nằm mãi trên storage.

### Cleanup Job

Chạy định kỳ (ví dụ mỗi 1 giờ), xoá ảnh `pending` quá hạn:

```python
def cleanup_orphan_images():
    deleted = db.execute("""
        DELETE FROM images
        WHERE status = 'pending'
          AND created_at < NOW() - INTERVAL '2 hours'
        RETURNING id, url
    """)

    for row in deleted:
        storage.delete(row.url)   # xoá file trên S3/GCS
```

Query chỉ scan `status = 'pending'` — **không JOIN, không subquery** — rất nhanh dù bảng lớn.

### Attach Image khi tạo set

```python
def attach_image(image_id, card_id):
    # Chạy trong transaction của POST /vocabulary-sets
    updated = db.execute("""
        UPDATE images
        SET status = 'attached',
            attached_at = NOW()
        WHERE id = :image_id
          AND status = 'pending'
        RETURNING id
    """, image_id=image_id)

    if not updated:
        raise ImageNotFoundException("Ảnh không tồn tại hoặc đã bị xoá")
```

---

## Xử lý Race Condition

**Tình huống nguy hiểm:**

```
T+0:00   User upload ảnh → img_abc123, status=pending
T+2:01   Cleanup job chạy → đủ 2 tiếng → ĐANG XOÁ img_abc123...
T+2:01   User nhấn "Tạo" → POST /vocabulary-sets gửi imageId=img_abc123
              → ảnh bị xoá giữa chừng → card trỏ vào ảnh không tồn tại ❌
```

**Giải pháp:** Cả cleanup job lẫn attach operation đều dùng `WHERE status = 'pending'` làm guard. Database đảm bảo chỉ một bên thắng — bên kia nhận về 0 rows affected và xử lý gracefully.

```
Cleanup job:  DELETE WHERE status='pending' → thành công → ảnh bị xoá
Attach logic: UPDATE WHERE status='pending' → 0 rows → ném exception → báo lỗi cho user

hoặc ngược lại:

Attach logic: UPDATE WHERE status='pending' → thành công → status='attached'
Cleanup job:  DELETE WHERE status='pending' → 0 rows → bỏ qua (ảnh đã attached)
```

---

## So sánh tổng kết

| Tiêu chí | 1 API multipart | 2 API riêng |
|---|---|---|
| UX upload | Chờ submit mới upload | Upload ngay khi chọn ảnh |
| Retry khi lỗi | Toàn bộ request | Từng ảnh độc lập |
| Parallel upload | ❌ | ✅ |
| Payload size | Rất lớn | Nhỏ (chỉ JSON) |
| Xử lý lỗi | Khó xác định | Rõ ràng từng bước |
| Tái sử dụng ảnh | ❌ | ✅ Dùng lại `imageId` ở set khác |
| Gateway limits | Dễ vượt | Không bao giờ vượt |
| Draft/offline support | Rất khó | Dễ — lưu `imageId` local |

---

## Nâng cao: Presigned URL

Thay vì upload qua server, dùng S3/GCS presigned URL để client upload **thẳng lên storage** — giảm tải hoàn toàn cho backend:

```
Client → GET /api/images/presigned-url → { uploadUrl, imageId }
Client → PUT <uploadUrl> (thẳng lên S3, không qua server)
Client → dùng imageId như bình thường trong POST /vocabulary-sets
```