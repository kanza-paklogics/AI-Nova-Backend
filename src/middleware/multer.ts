const multer = require("multer");
const { memoryStorage } = require("multer");
const path = require("path");

const storage1 = memoryStorage();

export const upload1 = multer({ storage1 });

// const storage2 = multer.diskStorage({
//   destination: function (req: any, file: any, cb: any) {
//     // Set the destination folder where you want to save the file
//     cb(null, "uploads/");
//   },
//   filename: function (req: any, file: any, cb: any) {
//     // Set the filename to be the current timestamp + the original file extension
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

const storage2 = multer.diskStorage({
  destination: function (req: any, file: any, cb: any) {
    cb(null, path.join(__dirname, "../../../Audio/"));
  },
  filename: (req: any, file: any, cb: any) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload2 = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req: any, file: any, cb: any) {
    if (file.mimetype === 'audio/mpeg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
})
