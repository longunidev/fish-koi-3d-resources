const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Cấu hình
const CONFIG = {
  // Domain chứa ảnh - thay đổi theo môi trường của bạn
  DOMAIN:
    process.env.DOMAIN || "https://longunidev.github.io/fish-koi-3d-resources",

  // Đường dẫn thư mục
  BACKGROUND_DIR: path.join(__dirname, "background"),
  THUMBNAIL_DIR: path.join(__dirname, "thumbnail"),

  // Kích thước thumbnail (có thể điều chỉnh)
  THUMBNAIL_SIZE: {
    width: 180,
    height: 320,
  },

  // Định dạng file được hỗ trợ
  SUPPORTED_FORMATS: [".png", ".jpg", ".jpeg", ".webp"],
};

/**
 * Tạo thư mục nếu chưa tồn tại
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Đã tạo thư mục: ${dirPath}`);
  }
}

/**
 * Lấy danh sách tất cả file ảnh trong thư mục background
 */
function getAllImageFiles() {
  const imageFiles = [];

  function scanDirectory(dirPath, relativePath = "") {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const relativeItemPath = path.join(relativePath, item);

      if (fs.statSync(fullPath).isDirectory()) {
        // Đệ quy vào thư mục con
        scanDirectory(fullPath, relativeItemPath);
      } else {
        // Kiểm tra định dạng file
        const ext = path.extname(item).toLowerCase();
        if (CONFIG.SUPPORTED_FORMATS.includes(ext)) {
          imageFiles.push({
            fullPath,
            relativePath: relativeItemPath,
            category: relativePath || path.dirname(relativeItemPath),
            filename: item,
            name: path.parse(item).name,
          });
        }
      }
    }
  }

  scanDirectory(CONFIG.BACKGROUND_DIR);
  return imageFiles;
}

/**
 * Tạo thumbnail cho một file ảnh
 */
async function createThumbnail(imageFile) {
  try {
    const thumbnailPath = path.join(
      CONFIG.THUMBNAIL_DIR,
      imageFile.relativePath
    );
    const thumbnailDir = path.dirname(thumbnailPath);

    // Tạo thư mục thumbnail nếu chưa có
    ensureDirectoryExists(thumbnailDir);

    // Bỏ qua nếu thumbnail đã tồn tại
    if (fs.existsSync(thumbnailPath)) {
      console.log(`⏭️  Bỏ qua (đã có): ${imageFile.relativePath}`);
      return "skipped";
    }

    // Tạo thumbnail với sharp
    await sharp(imageFile.fullPath)
      .resize(CONFIG.THUMBNAIL_SIZE.width, CONFIG.THUMBNAIL_SIZE.height, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    console.log(`✅ Đã tạo thumbnail: ${imageFile.relativePath}`);
    return "created";
  } catch (error) {
    console.error(
      `❌ Lỗi khi tạo thumbnail cho ${imageFile.relativePath}:`,
      error.message
    );
    return "error";
  }
}

/**
 * Tạo thumbnail cho tất cả ảnh
 */
async function generateThumbnails() {
  console.log("🖼️  Bắt đầu tạo thumbnail...");

  // Đảm bảo thư mục thumbnail tồn tại
  ensureDirectoryExists(CONFIG.THUMBNAIL_DIR);

  const imageFiles = getAllImageFiles();
  console.log(`📁 Tìm thấy ${imageFiles.length} file ảnh`);

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  for (const imageFile of imageFiles) {
    const status = await createThumbnail(imageFile);
    if (status === "created") {
      successCount++;
    } else if (status === "skipped") {
      skippedCount++;
    } else if (status === "error") {
      errorCount++;
    }
  }

  console.log(`\n📊 Kết quả tạo thumbnail:`);
  console.log(`✅ Thành công: ${successCount}`);
  console.log(`⏭️  Bỏ qua: ${skippedCount}`);
  console.log(`❌ Lỗi: ${errorCount}`);
}

/**
 * Tạo JSON metadata cho tất cả ảnh
 */
function generateJsonMetadata() {
  console.log("📄 Bắt đầu tạo JSON metadata...");

  const imageFiles = getAllImageFiles();
  const metadata = [];

  for (const imageFile of imageFiles) {
    const category = imageFile.category || "default";
    const url = `${CONFIG.DOMAIN}/background/${imageFile.relativePath}`;
    const thumbnail = `${CONFIG.DOMAIN}/thumbnail/${imageFile.relativePath}`;

    metadata.push({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      url: url,
      thumbnail: thumbnail,
      filename: imageFile.filename,
      name: imageFile.name,
    });
  }

  // Ghi file JSON
  const jsonPath = path.join(__dirname, "images-metadata.json");
  fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2), "utf8");

  console.log(`✅ Đã tạo file metadata: ${jsonPath}`);
  console.log(`📊 Tổng số ảnh: ${metadata.length}`);

  // Hiển thị preview của JSON
  console.log("\n📋 Preview JSON (5 items đầu):");
  console.log(JSON.stringify(metadata.slice(0, 5), null, 2));

  return metadata;
}

/**
 * Hiển thị thông tin cấu hình
 */
function showConfig() {
  console.log("⚙️  Cấu hình hiện tại:");
  console.log(`🌐 Domain: ${CONFIG.DOMAIN}`);
  console.log(`📁 Background dir: ${CONFIG.BACKGROUND_DIR}`);
  console.log(`📁 Thumbnail dir: ${CONFIG.THUMBNAIL_DIR}`);
  console.log(
    `📏 Thumbnail size: ${CONFIG.THUMBNAIL_SIZE.width}x${CONFIG.THUMBNAIL_SIZE.height}`
  );
  console.log(`📄 Supported formats: ${CONFIG.SUPPORTED_FORMATS.join(", ")}`);
  console.log("");
}

/**
 * Hàm chính
 */
async function main() {
  const command = process.argv[2];

  console.log("🐟 FishKoi3D Image Processor");
  console.log("================================\n");

  showConfig();

  switch (command) {
    case "thumbnail":
      await generateThumbnails();
      break;

    case "json":
      generateJsonMetadata();
      break;

    case "both":
      await generateThumbnails();
      console.log("\n" + "=".repeat(50) + "\n");
      generateJsonMetadata();
      break;

    default:
      console.log("❌ Lệnh không hợp lệ!");
      console.log("📖 Cách sử dụng:");
      console.log("  node image-processor.js thumbnail  - Tạo thumbnail");
      console.log("  node image-processor.js json       - Tạo JSON metadata");
      console.log("  node image-processor.js both       - Làm cả hai");
      console.log("\n💡 Để thay đổi domain, sử dụng:");
      console.log(
        "  DOMAIN=https://your-domain.com node image-processor.js both"
      );
      process.exit(1);
  }

  console.log("\n🎉 Hoàn thành!");
}

// Chạy script
if (require.main === module) {
  main().catch((error) => {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  });
}

module.exports = {
  generateThumbnails,
  generateJsonMetadata,
  getAllImageFiles,
  CONFIG,
};
