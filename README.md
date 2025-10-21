# FishKoi3D Image Processor

Script Node.js để xử lý ảnh và tạo thumbnail cho ứng dụng FishKoi3D.

## Cài đặt

```bash
npm install
```

## Cách sử dụng

### 1. Tạo thumbnail

```bash
npm run thumbnail
# hoặc
node image-processor.js thumbnail
```

### 2. Tạo JSON metadata

```bash
npm run json
# hoặc
node image-processor.js json
```

### 3. Làm cả hai

```bash
npm run both
# hoặc
node image-processor.js both
```

### 4. Thay đổi domain

```bash
DOMAIN=https://your-domain.com node image-processor.js both
```

## Cấu trúc thư mục

```
resources/
├── background/          # Thư mục chứa ảnh gốc
│   └── pepples/        # Các category ảnh
├── thumbnail/          # Thư mục chứa thumbnail (được tạo tự động)
├── images-metadata.json # File JSON metadata (được tạo tự động)
└── image-processor.js  # Script chính
```

## Cấu hình

Trong file `image-processor.js`, bạn có thể thay đổi:

- `DOMAIN`: Domain chứa ảnh (mặc định: https://your-domain.com)
- `THUMBNAIL_SIZE`: Kích thước thumbnail (mặc định: 200x200)
- `SUPPORTED_FORMATS`: Các định dạng ảnh được hỗ trợ

## Output JSON

File `images-metadata.json` sẽ có định dạng:

```json
[
  {
    "category": "Pepples",
    "url": "https://your-domain.com/background/pepples/1.png",
    "thumbnail": "https://your-domain.com/thumbnail/pepples/1.png",
    "filename": "1.png",
    "name": "1"
  }
]
```

## Tính năng

- ✅ Tự động quét tất cả ảnh trong thư mục background
- ✅ Tạo thumbnail với kích thước chuẩn
- ✅ Hỗ trợ nhiều định dạng ảnh (PNG, JPG, JPEG, WEBP)
- ✅ Tạo JSON metadata với URL và thumbnail
- ✅ Cấu hình domain linh hoạt
- ✅ Xử lý lỗi và báo cáo kết quả
