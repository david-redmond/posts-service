import * as express from "express";
import * as dotenv from "dotenv";
import * as bodyParser from "body-parser";
import * as multer from "multer";
import * as cors from "cors";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 8012;

app.use(bodyParser.json());
app.use(cors());

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath); // Create the directory if it doesn't exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.static(path.join(__dirname, './uploads')));

// POST /images - Uploads a new image
app.post("/", upload.array("images", 10), (req: any, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least one image file is required" });
    }

    const uploadedFiles = req.files.map((file) => ({
      filename: file.filename,
      path: `${process.env.PUBLIC_URL}/${file.filename}`,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }));

    console.debug("Success POST /images: uploading image", uploadedFiles);
    return res.status(201).json({ message: "Image uploaded successfully", uploadedFiles }) // , imageInfo });
  } catch (error) {
    console.error("Error POST /images: uploading image", error);
    return res.status(500).json({ message: "Error uploading image", error });
  }
});

// DELETE /images/:filename - Deletes an image by filename
app.delete("/:filename", (req: any, res) => {
  try {
    const filePath = path.join(__dirname, "uploads", req.params.filename);

    // Check if the file exists before attempting to delete it
    if (!fs.existsSync(filePath)) {
      console.error("Error DELETE /images/:filename: image not found", req.params.filename);
      return res.status(404).json({ message: "Image not found" });
    }

    // Remove the file
    fs.unlinkSync(filePath);
    console.debug("Success DELETE /images: uploading image", req.params.filename);
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error DELETE /images/:filename: deleting image", error, req.params.filename);
    return res.status(500).json({ message: "Error deleting image", error });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on PORT: ${port}`);
});
