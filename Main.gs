// ==================================================
// ค่าคงที่และค่าตั้งต้น
// ==================================================
var CHANNEL_TOKEN = "XXXXXXXXXXXXXXXXX"; // ใส่ CHANNEL LINE TOKEN หลัก
var GDRIVE_ROOT_FOLDER_ID = "XXXXXXXXXXXXXX"; // ใส่ ID Folder หลัก
var MAX_FILE_SIZE = 100 * 1024 * 1024; // จำกัดขนาดไฟล์สูงสุด 100 MB
var FILE_RETENTION_DAYS = 60; // จำนวนวันที่เก็บไฟล์ (ถ้าเกินจะลบไฟล์เก่า)

// ==================================================
// ฟังก์ชันย่อยทั่วไป
// ==================================================

// จัดรูปแบบวันที่และเวลา
function formatTimestamp() {
  var now = new Date();
  return Utilities.formatDate(now, "Asia/Bangkok", "ddMMyyyy_HHmmss"); // ตั้งค่าเขตเวลาเป็น Asia/Bangkok
}

// กำหนด MIME type จากนามสกุลไฟล์
function getMimeType(fileType) {
  var mimeTypes = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "tiff": "image/tiff",
    "webp": "image/webp",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "mp4": "video/mp4",
    "mov": "video/quicktime",
    "avi": "video/x-msvideo",
    "mkv": "video/x-matroska",
    "flv": "video/x-flv",
    "wmv": "video/x-ms-wmv",
    "mpeg": "video/mpeg",
    "webm": "video/webm",
    "3gp": "video/3gpp",
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "m4a": "audio/mp4",
    "flac": "audio/flac",
    "aac": "audio/aac",
    "ogg": "audio/ogg",
    "wma": "audio/x-ms-wma",
    "amr": "audio/amr",
    "pdf": "application/pdf",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "txt": "text/plain",
    "csv": "text/csv",
    "json": "application/json",
    "html": "text/html",
    "js": "application/javascript",
    "css": "text/css",
    "xml": "application/xml",
    "rtf": "application/rtf",
    "odt": "application/vnd.oasis.opendocument.text",
    "ods": "application/vnd.oasis.opendocument.spreadsheet",
    "odp": "application/vnd.oasis.opendocument.presentation",
    "md": "text/markdown",
    "log": "text/plain",
    "zip": "application/zip",
    "rar": "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    "tar": "application/x-tar",
    "gz": "application/gzip",
    "bz2": "application/x-bzip2"
  };

  // แปลงนามสกุลไฟล์เป็นตัวพิมพ์เล็กเพื่อตรวจสอบ
  var lowerCaseFileType = fileType.toLowerCase();
  return mimeTypes[lowerCaseFileType] || "application/octet-stream"; // ใช้ MIME type มาตรฐานสำหรับไฟล์ที่ไม่รู้จัก
}

// แยกประเภทไฟล์ตามนามสกุล
function getFileCategory(fileType) {
  var imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp", "svg", "ico"];
  var videoExtensions = ["mp4", "mov", "avi", "mkv", "flv", "wmv", "mpeg", "webm", "3gp"];
  var audioExtensions = ["mp3", "wav", "m4a", "flac", "aac", "ogg", "wma", "amr"];
  var documentExtensions = [
    "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", 
    "txt", "csv", "json", "html", "js", "css", "xml", 
    "rtf", "odt", "ods", "odp", "md", "log"
  ];
  var archiveExtensions = ["zip", "rar", "7z", "tar", "gz", "bz2"];

  // แปลงนามสกุลไฟล์เป็นตัวพิมพ์เล็กเพื่อตรวจสอบ
  var lowerCaseFileType = fileType.toLowerCase();

  // ตรวจสอบประเภทไฟล์
  if (imageExtensions.includes(lowerCaseFileType)) {
    return "📷 Image"; // ประเภทภาพ
  } else if (videoExtensions.includes(lowerCaseFileType)) {
    return "🎥 Video"; // ประเภทวิดีโอ
  } else if (audioExtensions.includes(lowerCaseFileType)) {
    return "🎵 Audio"; // ประเภทเสียง
  } else if (documentExtensions.includes(lowerCaseFileType)) {
    return "📄 Document"; // ประเภทเอกสาร
  } else if (archiveExtensions.includes(lowerCaseFileType)) {
    return "📦 Archive"; // ประเภทไฟล์บีบอัด
  } else {
    return "📂 Other"; // ประเภทอื่นๆ
  }
}

// แสดงคำสั่งช่วยเหลือ
function showHelp() {
  var helpMessage = '📝 คำสั่งทั้งหมด:\n\n' +
    '- 🛠️ SAO ตั้งโควต้า [ขนาด MB]: ตั้งค่าขนาดโควต้าพื้นที่เก็บข้อมูล\n' +
    '- 🔍 SAO ตรวจสอบโควต้า: ตรวจสอบโควต้าพื้นที่ที่ใช้ไปและที่เหลือ\n' +
    '- 📂 SAO เก็บไฟล์ที่ไหน: แสดงลิงก์โฟลเดอร์ที่เก็บไฟล์\n' +
    '- 💾 SAO สำรองข้อมูล: สร้างสำรองข้อมูลไฟล์ทั้งหมด\n' +
    '- 🔎 SAO ค้นหาไฟล์ [ชื่อไฟล์]: ค้นหาไฟล์ตามชื่อ\n' +
    '- 📊 SAO รายงานการใช้พื้นที่: สรุปการใช้พื้นที่\n' +
    '- ❓ SAO ช่วยเหลือ: แสดงคำสั่งทั้งหมด\n\n' +
    '📂 คำสั่งสำหรับอัปโหลดไฟล์:\n' +
    '- ส่งไฟล์ภาพ, วิดีโอ, หรือเอกสารมาที่แชทนี้ เพื่ออัปโหลดไปยัง Google Drive';

  return helpMessage;
}

// ==================================================
// ฟังก์ชันจัดการ Google Drive
// ==================================================

// สร้างหรือดึงโฟลเดอร์สำหรับผู้ใช้งานหรือกลุ่ม
function getOrCreateGroupFolder(folderId) {
  var rootFolder = DriveApp.getFolderById(GDRIVE_ROOT_FOLDER_ID);
  var folders = rootFolder.getFoldersByName(folderId);
  
  if (folders.hasNext()) {
    return folders.next(); // ถ้ามีโฟลเดอร์อยู่แล้ว ให้คืนค่าโฟลเดอร์นั้น
  } else {
    return rootFolder.createFolder(folderId); // ถ้าไม่มี ให้สร้างโฟลเดอร์ใหม่
  }
}

// สร้างหรือดึงโฟลเดอร์ย่อยตามประเภทไฟล์
function getOrCreateSubFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next(); // ถ้ามีโฟลเดอร์อยู่แล้ว ให้คืนค่าโฟลเดอร์นั้น
  } else {
    return parentFolder.createFolder(folderName); // ถ้าไม่มี ให้สร้างโฟลเดอร์ใหม่
  }
}

// ลบไฟล์เก่าที่มีอายุเกินกำหนด
function deleteOldFiles(folder) {
  var now = new Date();
  var files = folder.getFiles();
  
  while (files.hasNext()) {
    var file = files.next();
    var fileDate = file.getLastUpdated(); // ใช้วันที่อัปเดตล่าสุด
    var diffDays = Math.floor((now - fileDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays > FILE_RETENTION_DAYS) {
      file.setTrashed(true); // ย้ายไฟล์ไปถังขยะ
      Logger.log("Deleted old file: " + file.getName());
    }
  }
}

// ==================================================
// ฟังก์ชันจัดการโควต้า
// ==================================================

// ตั้งโควต้า
function setQuota(userId, quotaMB) {
  var properties = PropertiesService.getUserProperties();
  properties.setProperty(userId + "_quota", quotaMB.toString());
  return '🛠️ ตั้งโควต้า ' + quotaMB + ' MB เรียบร้อยแล้ว';
}

// ตรวจสอบโควต้า
function checkQuota(userId, folder) {
  var properties = PropertiesService.getUserProperties();
  var quotaMB = properties.getProperty(userId + "_quota");

  if (!quotaMB) {
    return '⚠️ ไม่มีการตั้งโควต้าสำหรับผู้ใช้หรือกลุ่มนี้';
  }

  // คำนวณพื้นที่ที่ใช้ไป
  var usedBytes = 0;
  var subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    var subFolder = subFolders.next();
    var files = subFolder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      usedBytes += file.getSize();
    }
  }

  var usedMB = (usedBytes / (1024 * 1024)).toFixed(2);
  var quotaBytes = quotaMB * 1024 * 1024;
  var remainingMB = ((quotaBytes - usedBytes) / (1024 * 1024)).toFixed(2);

  return '📊 โควต้าที่ตั้งไว้: ' + quotaMB + ' MB\nพื้นที่ที่ใช้ไป: ' + usedMB + ' MB\nพื้นที่ที่เหลือ: ' + remainingMB + ' MB';
}

// ตรวจสอบโควต้าก่อนอัปโหลดไฟล์
function checkQuotaBeforeUpload(userId, folder, fileSize) {
  var properties = PropertiesService.getUserProperties();
  var quotaMB = properties.getProperty(userId + "_quota");

  if (!quotaMB) {
    return true; // ไม่มีการตั้งโควต้า
  }

  // คำนวณพื้นที่ที่ใช้ไป
  var usedBytes = 0;
  var subFolders = folder.getFolders();
  while (subFolders.hasNext()) {
    var subFolder = subFolders.next();
    var files = subFolder.getFiles();
    while (files.hasNext()) {
      var file = files.next();
      usedBytes += file.getSize();
    }
  }

  var quotaBytes = quotaMB * 1024 * 1024;
  if (usedBytes + fileSize > quotaBytes) {
    return false; // โควต้าเต็ม
  }

  return true; // โควต้ายังเหลือ
}

// ==================================================
// ฟังก์ชันจัดการข้อความจาก LINE
// ==================================================

// ส่งข้อความตอบกลับ
function replyMsg(replyToken, messages) {
  var url = 'https://api.line.me/v2/bot/message/reply';
  var options = {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': messages
    })
  };
  UrlFetchApp.fetch(url, options);
}

// ตรวจสอบไฟล์ที่อัปโหลดผิดพลาด
function checkFileUploadError(blob) {
  try {
    // ตรวจสอบ MIME type ของไฟล์
    var mimeType = blob.getContentType();
    if (!mimeType || mimeType === "application/octet-stream") {
      return '⚠️ ไฟล์นี้ไม่รองรับหรืออาจเสียหาย กรุณาลองอัปโหลดใหม่';
    }

    // ตรวจสอบขนาดไฟล์
    if (blob.getBytes().length === 0) {
      return '⚠️ ไฟล์นี้มีขนาด 0 byte กรุณาลองอัปโหลดใหม่';
    }

    return null; // ไม่พบข้อผิดพลาด
  } catch (error) {
    Logger.log("Error checking file upload: " + error.message);
    return '⚠️ เกิดข้อผิดพลาดในการตรวจสอบไฟล์ กรุณาลองอัปโหลดใหม่';
  }
}

// จัดการข้อความประเภทสื่อ (image, video, audio, file)
function handleMediaMessage(event, userFolder) {
  var userId = event.source.userId;
  var fileName = event.message.fileName || "file";
  var fileType = fileName.split('.').pop() || "";
  var mimeType = getMimeType(fileType);
  var fileCategory = getFileCategory(fileType);

  var messageId = event.message.id;
  var url = "https://api-data.line.me/v2/bot/message/" + messageId + "/content";
  var headers = {
    "headers": { "Authorization": "Bearer " + CHANNEL_TOKEN }
  };

  try {
    var getContent = UrlFetchApp.fetch(url, headers);
    var blob = getContent.getBlob();

    // ตรวจสอบไฟล์ที่อัปโหลดผิดพลาด
    var errorMessage = checkFileUploadError(blob);
    if (errorMessage) {
      return errorMessage;
    }

    if (blob.getBytes().length > MAX_FILE_SIZE) {
      return '⚠️ ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 100 MB)';
    }

    // ตรวจสอบโควต้าก่อนอัปโหลด
    if (!checkQuotaBeforeUpload(userId, userFolder, blob.getBytes().length)) {
      return '⚠️ โควต้าเต็ม ไม่สามารถอัปโหลดไฟล์ได้';
    }

    var detectedMimeType = blob.getContentType();
    Logger.log("Detected MIME type: " + detectedMimeType);
    Logger.log("Original file type: " + fileType);

    if (mimeType !== detectedMimeType) {
      mimeType = detectedMimeType;
      fileType = detectedMimeType.split('/').pop();
      Logger.log("Adjusted file type: " + fileType);
    }

    var categoryFolder = getOrCreateSubFolder(userFolder, fileCategory);
    Logger.log("Category folder: " + categoryFolder.getName());

    var timestamp = formatTimestamp();
    var uniqueFileName = fileName.substring(0, fileName.lastIndexOf('.')) + "_Update_" + timestamp + "." + fileType;

    var fileBlob = Utilities.newBlob(blob.getBytes(), mimeType, uniqueFileName);
    var file = categoryFolder.createFile(fileBlob);

    deleteOldFiles(categoryFolder);

    var fileUrl = file.getUrl();
    var folderUrl = categoryFolder.getUrl();

    //return '✅ ไฟล์ของคุณถูกเก็บเรียบร้อยแล้ว 📂\n\nประเภทไฟล์: ' + fileCategory + '\nPath: ' + categoryFolder.getName() + '/' + uniqueFileName + '\nURL: ' + fileUrl;
  } catch (error) {
    Logger.log("Error uploading to Google Drive: " + error.message);
    return '⚠️ เกิดข้อผิดพลาดในการอัปโหลดไฟล์';
  }
}

// แสดงรายการไฟล์ในสัปดาห์หรือเดือน
function listFilesInPeriod(folder, period) {
  var now = new Date();
  var fileList = [];
  var subFolders = folder.getFolders(); // ดึงโฟลเดอร์ย่อยทั้งหมด

  while (subFolders.hasNext()) {
    var subFolder = subFolders.next();
    var files = subFolder.getFiles();

    while (files.hasNext()) {
      var file = files.next();
      var fileDate = file.getLastUpdated(); // ใช้วันที่อัปเดตล่าสุด
      var diffDays = Math.floor((now - fileDate) / (1000 * 60 * 60 * 24));

      if (period === "week" && diffDays <= 7) {
        fileList.push({ name: file.getName(), url: file.getUrl() });
      } else if (period === "month" && diffDays <= 30) {
        fileList.push({ name: file.getName(), url: file.getUrl() });
      }
    }
  }

  return fileList;
}

// สร้างข้อความรายการไฟล์
function createFileListMessage(fileList, period) {
  if (fileList.length === 0) {
    return '⚠️ ไม่พบไฟล์ใน' + (period === "week" ? 'สัปดาห์' : 'เดือน') + 'นี้';
  }

  var message = '📂 ไฟล์ใน' + (period === "week" ? 'สัปดาห์' : 'เดือน') + 'นี้:\n';
  fileList.forEach(function(file) {
    message += '- ' + file.name + ' URL: ' + file.url + '\n';
  });

  return message;
}

// แปลงวันที่จาก พ.ศ. เป็น ค.ศ.
function convertBuddhistToGregorian(dateString) {
  var parts = dateString.split('/'); // แยกวัน, เดือน, ปี
  var day = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10) - 1; // เดือนใน JavaScript เริ่มจาก 0 (มกราคม = 0)
  var year = parseInt(parts[2], 10) - 543; // แปลง พ.ศ. เป็น ค.ศ.

  // สร้างวันที่ในรูปแบบ Date object
  var date = new Date(year, month, day);
  return Utilities.formatDate(date, "Asia/Bangkok", "dd/MM/yyyy"); // คืนค่าวันที่ในรูปแบบ dd/MM/yyyy
}

// แปลงวันที่จาก ค.ศ. เป็น พ.ศ.
function convertGregorianToBuddhist(dateString) {
  var parts = dateString.split('/'); // แยกวัน, เดือน, ปี
  var day = parts[0];
  var month = parts[1];
  var year = parseInt(parts[2], 10) + 543; // แปลง ค.ศ. เป็น พ.ศ.
  return day + '/' + month + '/' + year; // คืนค่าวันที่ในรูปแบบ dd/MM/yyyy (พ.ศ.)
}

// แสดงรายการไฟล์ในวันที่ระบุ
function listFilesOnDate(folder, targetDate) {
  var fileList = [];
  var subFolders = folder.getFolders(); // ดึงโฟลเดอร์ย่อยทั้งหมด

  while (subFolders.hasNext()) {
    var subFolder = subFolders.next();
    var files = subFolder.getFiles();

    while (files.hasNext()) {
      var file = files.next();
      var fileDate = file.getLastUpdated(); // ใช้วันที่อัปเดตล่าสุด
      var fileDateFormatted = Utilities.formatDate(fileDate, "Asia/Bangkok", "dd/MM/yyyy");

      // ตรวจสอบว่าไฟล์ถูกสร้างในวันที่ระบุหรือไม่
      if (fileDateFormatted === targetDate) {
        fileList.push({ name: file.getName(), url: file.getUrl() });
      }
    }
  }

  return fileList;
}

// สร้างข้อความรายการไฟล์สำหรับวันที่ระบุ
function createFileListMessageForDate(fileList, targetDate) {
  if (fileList.length === 0) {
    return '⚠️ ไม่พบไฟล์ในวันที่ ' + convertGregorianToBuddhist(targetDate); // แสดงวันที่ในรูปแบบ พ.ศ.
  }

  // แปลงวันที่จาก ค.ศ. เป็น พ.ศ.
  var targetDateBuddhist = convertGregorianToBuddhist(targetDate);

  var message = '📂 ไฟล์ในวันที่ ' + targetDateBuddhist + ':\n';
  fileList.forEach(function(file) {
    message += '- ' + file.name + '\nURL: ' + file.url + '\n';
  });

  return message;
}

// ตรวจสอบและดึงวันที่จากข้อความ
function extractDateFromMessage(message) {
  var datePattern = /(\d{2}\/\d{2}\/\d{4})/; // รูปแบบวันที่ dd/MM/yyyy
  var match = message.match(datePattern);
  if (match) {
    return match[0]; // คืนค่าวันที่ที่พบ
  }
  return null; // ถ้าไม่พบวันที่
}

// ค้นหาไฟล์ตามชื่อเอกสาร
function searchFilesByName(folder, fileName) {
  var fileList = [];
  var subFolders = folder.getFolders(); // ดึงโฟลเดอร์ย่อยทั้งหมด

  while (subFolders.hasNext()) {
    var subFolder = subFolders.next();
    var files = subFolder.getFiles();

    while (files.hasNext()) {
      var file = files.next();
      var fileTitle = file.getName();

      // ตรวจสอบว่าไฟล์มีชื่อตรงกับคำค้นหาหรือไม่
      if (fileTitle.toLowerCase().includes(fileName.toLowerCase())) {
        fileList.push({ name: file.getName(), url: file.getUrl() });
      }
    }
  }

  return fileList;
}

// สร้างข้อความรายการไฟล์ที่ค้นพบ
function createSearchResultMessage(fileList, fileName) {
  if (fileList.length === 0) {
    return '⚠️ ไม่พบไฟล์ที่มีชื่อว่า "' + fileName + '"';
  }

  var message = '🔍 ผลการค้นหาไฟล์ "' + fileName + '":\n';
  fileList.forEach(function(file) {
    message += '- ' + file.name + '\nURL: ' + file.url + '\n';
  });

  return message;
}

// ==================================================
// ฟังก์ชันเปิด/ปิดการทำงาน
// ==================================================

// ตั้งค่าสถานะการทำงาน
function setBotStatus(status) {
  var properties = PropertiesService.getScriptProperties();
  properties.setProperty("BOT_STATUS", status);
}

// ตั้งค่าเวลาหยุดการทำงาน
function setBotPause(hours) {
  var properties = PropertiesService.getScriptProperties();
  var now = new Date();
  var pauseUntil = new Date(now.getTime() + hours * 60 * 60 * 1000);
  properties.setProperty("PAUSE_UNTIL", pauseUntil.toISOString());
}

// ตรวจสอบสถานะการทำงาน
function checkBotStatus() {
  var properties = PropertiesService.getScriptProperties();
  var status = properties.getProperty("BOT_STATUS");
  var pauseUntil = properties.getProperty("PAUSE_UNTIL");

  if (pauseUntil) {
    var now = new Date();
    var pauseTime = new Date(pauseUntil);
    if (now < pauseTime) {
      return "PAUSED";
    } else {
      properties.deleteProperty("PAUSE_UNTIL");
    }
  }

  return status || "ACTIVE"; // ค่าเริ่มต้นคือ ACTIVE
}

// ==================================================
// ฟังก์ชันหลักที่รับอีเวนต์จาก LINE
// ==================================================

function doPost(e) {
  try {
    var value = JSON.parse(e.postData.contents);
    Logger.log("Received event: " + JSON.stringify(value));

    var event = value.events[0];
    var type = event.type;
    var replyToken = event.replyToken;

    // ตรวจสอบสถานะการทำงาน
    var botStatus = checkBotStatus();
    if (botStatus === "PAUSED") {
      replyMsg(replyToken, [
        { type: 'text', text: '⚠️ บอทกำลังหยุดการทำงานชั่วคราว' }
      ]);
      return;
    } else if (botStatus === "INACTIVE") {
      replyMsg(replyToken, [
        { type: 'text', text: '⚠️ บอทปิดการทำงานอยู่' }
      ]);
      return;
    }

    if (type === 'message') {
      var messageType = event.message.type;
      var replyMessage;

      var userId = event.source.userId;
      var groupId = event.source.groupId || event.source.roomId || userId;
      var userFolder = getOrCreateGroupFolder(groupId);

      if (event.message.text) {
        var text = event.message.text.trim();

        if (text === "SAO เปิดการทำงาน") {
          setBotStatus("ACTIVE");
          replyMessage = [
            { type: 'text', text: '✅ เปิดการทำงานเรียบร้อยแล้ว' }
          ];
        } else if (text === "SAO ปิดการทำงาน") {
          setBotStatus("INACTIVE");
          replyMessage = [
            { type: 'text', text: '✅ ปิดการทำงานเรียบร้อยแล้ว' }
          ];
        } else if (text.startsWith("SAO หยุดการทำงาน")) {
          var hours = 1; // ค่าเริ่มต้นคือ 1 ชั่วโมง
          var parts = text.split(" ");
          if (parts.length > 2 && !isNaN(parts[2])) {
            hours = parseInt(parts[2]);
          }
          setBotPause(hours);
          replyMessage = [
            { type: 'text', text: '✅ หยุดการทำงานชั่วคราวเป็นเวลา ' + hours + ' ชั่วโมง' }
          ];
        } else if (text.includes("SAO ตั้งโควต้า")) {
          // ดึงขนาดโควต้าจากข้อความ
          var quotaMB = parseInt(text.split("SAO ตั้งโควต้า")[1].trim());
          if (isNaN(quotaMB) || quotaMB <= 0) {
            replyMessage = [
              { type: 'text', text: '⚠️ กรุณาระบุขนาดโควต้าเป็นตัวเลขที่ถูกต้อง (หน่วย MB)' }
            ];
          } else {
            var result = setQuota(userId, quotaMB);
            replyMessage = [
              { type: 'text', text: result }
            ];
          }
        } else if (text.includes("SAO ตรวจสอบโควต้า")) {
          var result = checkQuota(userId, userFolder);
          replyMessage = [
            { type: 'text', text: result }
          ];
        } else if (text.includes("SAO เก็บไฟล์ที่ไหน")) {
          replyMessage = [
            { type: 'text', text: '📂 ไฟล์ของคุณถูกเก็บไว้ที่ URL: ' + userFolder.getUrl() }
          ];
        } else if (text.includes("SAO ช่วยเหลือ")) {
          var helpMessage = showHelp();
          replyMessage = [
            { type: 'text', text: helpMessage }
          ];
        } else if (text.includes("SAO สรุปข้อมูลรายสัปดาห์")) {
          var fileList = listFilesInPeriod(userFolder, "week");
          var message = createFileListMessage(fileList, "week");
          replyMessage = [
            { type: 'text', text: message }
          ];
        } else if (text.includes("SAO สรุปข้อมูลรายเดือน")) {
          var fileList = listFilesInPeriod(userFolder, "month");
          var message = createFileListMessage(fileList, "month");
          replyMessage = [
            { type: 'text', text: message }
          ];
        } else if (text.includes("SAO สรุปข้อมูลรายวัน")) {
          var targetDate = extractDateFromMessage(text);
          if (!targetDate) {
            targetDate = Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy");
          } else {
            targetDate = convertBuddhistToGregorian(targetDate);
          }

          var fileList = listFilesOnDate(userFolder, targetDate);
          var message = createFileListMessageForDate(fileList, targetDate);
          replyMessage = [
            { type: 'text', text: message }
          ];
        } else if (text.includes("SAO ค้นหา")) {
          var searchQuery = text.split("SAO ค้นหา")[1].trim();
          var fileList = searchFilesByName(userFolder, searchQuery);
          var message = createSearchResultMessage(fileList, searchQuery);
          replyMessage = [
            { type: 'text', text: message }
          ];
        } else {
          switch (messageType) {
            case 'file':
            case 'image':
            case 'video':
            case 'audio':
              replyMessage = [
                { type: 'text', text: handleMediaMessage(event, userFolder) }
              ];
              break;

            default:
              //replyMessage = [{ type: 'text', text: '⚠️ ไม่รองรับข้อความประเภทนี้' }];
          }
        }
      }

      if (replyMessage) {
        replyMsg(replyToken, replyMessage);
      }
    }
  } catch (error) {
    Logger.log("Error in doPost: " + error.message);
  }
}
