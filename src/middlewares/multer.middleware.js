// // import multer from "multer";

// // const storage = multer.diskStorage({
// //     destination: function (req, file, cb) {
// //       cb(null, "./public/temp")
// //     },
// //     filename: function (req, file, cb) {

// //       cb(null, file.originalname)
// //     }
// //   })

// // export const upload = multer({ 
// //     storage, 
// // })

// // import multer from "multer";

// // export const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: {
// //     fileSize: 5 * 1024 * 1024, // optional
// //   },
// // });


// import multer from "multer";

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 👈 change this anytime

// export const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: MAX_FILE_SIZE,
//   },
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed"));
//     }
//   },
// });

// // export size so error handler can read it
// export { MAX_FILE_SIZE };


import multer from "multer";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});
