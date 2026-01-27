import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // optional
  },
});


// import multer from "multer";

// const allowedMimeTypes = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/webp",
// ];

// export const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5 MB
//   },
//   fileFilter: (req, file, cb) => {
//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(
//         new Error(
//           "Only JPG, JPEG, PNG, and WEBP image formats are allowed"
//         ),
//         false
//       );
//     }
//   },
// });
