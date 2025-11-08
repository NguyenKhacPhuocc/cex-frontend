# Frontend Environment Variables Setup

## 📝 Next.js Environment Variables - Các File Có Thể Dùng

Next.js hỗ trợ nhiều file env, load theo thứ tự ưu tiên:

### Thứ tự ưu tiên (từ cao → thấp):

1. **`.env.local`** ⭐ (Ưu tiên cao nhất)

   - Luôn được load
   - Override tất cả các file khác
   - **KHÔNG commit vào git** (đã có trong `.gitignore`)
   - Dùng cho: local development, secrets

2. **`.env.development`** hoặc **`.env.production`**

   - Load theo `NODE_ENV`
   - Có thể commit vào git (nếu không chứa secrets)
   - Dùng cho: environment-specific configs

3. **`.env`**
   - Base file, luôn được load
   - Có thể commit vào git
   - Dùng cho: default values

### 📋 Cách Setup

#### Option 1: `.env.local` (Khuyến nghị cho Development)

Tạo file `.env.local` trong thư mục `frontend/`:

```env
#   QUAN TRỌNG: KHÔNG dùng dấu ngoặc kép cho giá trị!
NEXT_PUBLIC_URL_BACKEND=https://cex-backend-ey47.onrender.com
```

**Ưu điểm:**

- Không commit vào git (an toàn)
- Override tất cả file khác
- Dễ dàng thay đổi cho mỗi developer

#### Option 2: `.env` (Cho Team)

Tạo file `.env` trong thư mục `frontend/`:

```env
# Default values - có thể commit vào git
NEXT_PUBLIC_URL_BACKEND=http://localhost:8000
```

**Ưu điểm:**

- Có thể commit vào git
- Team có thể share default values
- Mỗi developer vẫn cần `.env.local` để override

#### Option 3: `.env.development` + `.env.production`

Tạo 2 files:

**`.env.development`** (cho `npm run dev`):

```env
NEXT_PUBLIC_URL_BACKEND=http://localhost:8000
```

**`.env.production`** (cho `npm run build`):

```env
NEXT_PUBLIC_URL_BACKEND=https://cex-backend-ey47.onrender.com
```

**Ưu điểm:**

- Tự động switch theo environment
- Có thể commit vào git

### 2. Production (Vercel)

**Vercel tự động load từ Dashboard, KHÔNG cần file `.env.local` trên server!**

1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm biến:
   - **Name**: `NEXT_PUBLIC_URL_BACKEND`
   - **Value**: `https://cex-backend-ey47.onrender.com`
   - ** KHÔNG dùng dấu ngoặc kép!**
   - **Environment**: Production (hoặc Preview/Development nếu cần)
3. Redeploy để áp dụng thay đổi

**Lưu ý:**

- Vercel sẽ tự động inject environment variables vào build process
- Không cần upload file `.env.local` lên Vercel
- Variables trong Vercel dashboard sẽ override file `.env*` trong repo

## Lưu Ý Quan Trọng

1. **KHÔNG dùng dấu ngoặc kép** trong bất kỳ file env nào hoặc Vercel dashboard:

   ```env
   #  ĐÚNG
   NEXT_PUBLIC_URL_BACKEND=https://cex-backend-ey47.onrender.com

   #   SAI - sẽ bị đọc như là string với dấu ngoặc kép
   NEXT_PUBLIC_URL_BACKEND="https://cex-backend-ey47.onrender.com"
   ```

2. **Restart dev server** sau khi thay đổi `.env.local`:

   ```bash
   # Stop server (Ctrl+C)
   # Start lại
   npm run dev
   # hoặc
   yarn dev
   ```

3. **Environment variables được embed vào build**:

   - Next.js sẽ embed `NEXT_PUBLIC_*` variables vào JavaScript bundle khi build
   - Sau khi deploy, phải rebuild để thay đổi có hiệu lực

4. **Debug environment variables**:
   - Kiểm tra console logs trong browser
   - Hoặc thêm `console.log(process.env.NEXT_PUBLIC_URL_BACKEND)` trong code

## 🔍 Troubleshooting

### Vấn đề: Env variable vẫn hiển thị giá trị mặc định

**Nguyên nhân:**

- File `.env.local` không tồn tại hoặc ở sai vị trí
- Format sai (có dấu ngoặc kép)
- Chưa restart dev server
- Đang test production build nhưng chưa set trong Vercel

**Giải pháp:**

1.  Tạo file `frontend/.env.local` (không có dấu ngoặc kép) cho local dev
2.  Hoặc dùng `.env` / `.env.development` nếu muốn share với team
3.  Restart dev server sau khi thay đổi
4.  Kiểm tra console logs để verify
5.  Nếu deploy Vercel: Set trong dashboard (không cần file trên server) và redeploy

## 📊 So Sánh Các Options

| File               | Khi nào dùng       | Commit vào git? | Priority                      |
| ------------------ | ------------------ | --------------- | ----------------------------- |
| `.env.local`       | Local dev, secrets | Không           | ⭐⭐⭐ Cao nhất               |
| `.env.development` | Dev environment    | Có thể          | ⭐⭐                          |
| `.env.production`  | Production build   | Có thể          | ⭐⭐                          |
| `.env`             | Default values     | Có thể          | ⭐ Thấp nhất                  |
| Vercel Dashboard   | Production deploy  | N/A             | ⭐⭐⭐ Cao nhất (trên Vercel) |

## 🎯 Khuyến Nghị

### Cho Development:

- Dùng `.env.local` (không commit)
- Hoặc `.env.development` (có thể commit nếu không có secrets)

### Cho Production:

- Dùng Vercel Dashboard Environment Variables
- Hoặc `.env.production` trong repo (nếu muốn version control)

### Kiểm tra env variable đang dùng

Thêm vào code:

```typescript
console.log("🔌 Env var:", process.env.NEXT_PUBLIC_URL_BACKEND);
console.log("🔌 Full env:", process.env);
```
