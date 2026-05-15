import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = (file.originalname || "").toLowerCase();
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/x-pdf" ||
      ext.endsWith(".pdf");
    if (!isPdf) {
      return cb(new Error("Only PDF resume files are allowed"));
    }
    cb(null, true);
  },
});
