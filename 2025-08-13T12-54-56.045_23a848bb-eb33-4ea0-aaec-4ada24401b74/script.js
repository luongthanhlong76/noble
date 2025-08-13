// script.js
    // Node.js script để chọn người thắng MINH BẠCH dựa trên seed và danh sách người tham gia.
    // Người dùng có thể tự tải 3 file: participants.csv, seed.txt, script.js về và chạy lại
    // để xác minh kết quả là KHÔNG thể thay đổi sau khi đã công bố seed.
    
    // Cách chạy:
    //    node script.js participants.csv seed.txt
    
    const fs = require("fs");
    const crypto = require("crypto");
    
    // Lấy tên file danh sách và file seed từ tham số dòng lệnh
    const participantsFile = process.argv[2];
    const seedFile = process.argv[3];
    
    if (!participantsFile || !seedFile) {
      console.error("Cách dùng: node script.js <participants.csv> <seed.txt>");
      process.exit(1);
    }
    
    // ====== 1. Đọc danh sách người tham gia ======
    // Bổ sung: lọc bỏ những người có isWinner = true
    const participantsData = fs
      .readFileSync(participantsFile, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const parts = line.split(",");
        return {
          name: parts[0],
          phone: parts[1],
          isWinner: parts[2]?.trim().toLowerCase(),
        };
      })
      .filter((p) => p.isWinner === "false"); // Chỉ lấy những người chưa trúng thưởng
    
    // Nếu sau khi lọc không còn ai thì dừng
    if (participantsData.length === 0) {
      console.error("Không còn người hợp lệ để quay thưởng.");
      process.exit(1);
    }
    
    // ====== 2. Đọc giá trị seed ======
    // Seed là chuỗi được công bố trước khi quay (là thời gian ISO được tính đến miniseconds)
    const seed = fs.readFileSync(seedFile, "utf8").trim();
    
    // ====== 3. Tạo mã băm (hash) SHA-256 từ seed ======
    // Giải thích: SHA-256 là thuật toán băm (hash function) chuẩn quốc tế,
    // khi nhập cùng một seed thì luôn cho ra cùng một mã hash dài 64 ký tự hex (256 bit).
    // Nếu thay đổi seed dù chỉ 1 ký tự, mã hash sẽ hoàn toàn khác.
    const hash = crypto.createHash("sha256").update(seed).digest("hex");
    
    // ====== 4. Chuyển một phần mã hash sang số nguyên lớn ======
    // Ở đây ta lấy 8 ký tự hex đầu tiên của mã hash => tương ứng 32 bit => chuyển sang số nguyên
    const hashNumber = parseInt(hash.slice(0, 8), 16);
    
    // ====== 5. Lấy phần dư để xác định vị trí người thắng ======
    // Số nguyên hashNumber có thể rất lớn. Để chọn người thắng từ danh sách,
    // ta chia số đó cho số người tham gia và lấy phần dư (%).
    // Kết quả phần dư sẽ nằm trong khoảng 0 đến (tổng số người tham gia - 1),
    // đây chính là chỉ số (index) của người thắng trong danh sách.
    const winnerIndex = hashNumber % participantsData.length;
    
    // ====== 6. Lấy thông tin người thắng ======
    const winner = participantsData[winnerIndex];
    
    // ====== 7. In kết quả ======
    console.log("===== KẾT QUẢ QUAY THƯỞNG =====");
    console.log("Tổng số người tham gia hợp lệ: " + participantsData.length);
    console.log("Seed (đã công bố trước): " + seed);
    console.log("SHA-256 Hash: " + hash);
    console.log("HashNumber (số nguyên từ hash): " + hashNumber);
    console.log("WinnerIndex (chỉ số người thắng): " + winnerIndex);
    console.log("Người thắng:", winner);
    console.log("===============================");
