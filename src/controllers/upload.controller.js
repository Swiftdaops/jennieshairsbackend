const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.uploadProductImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  try {
    const uploads = await Promise.all(
      req.files.map((file) => {
        // If multer stored the file on disk, upload by path
        if (file.path) {
          return cloudinary.uploader.upload(file.path, { folder: 'products' });
        }

        // Otherwise, if multer used memory storage, upload from buffer via stream
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: 'products' }, (error, result) => {
            if (error) return reject(error);
            resolve(result);
          });
          if (file.buffer) {
            stream.end(file.buffer);
          } else {
            reject(new Error('File has no path or buffer'));
          }
        });
      })
    );

    const urls = uploads.map((u) => u.secure_url || u.url);
    res.json(urls);
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ message: 'Image upload failed' });
  } finally {
    // attempt to cleanup any temp files
    req.files.forEach((f) => {
      if (f.path) {
        fs.unlink(f.path, () => {});
      }
    });
  }
};
