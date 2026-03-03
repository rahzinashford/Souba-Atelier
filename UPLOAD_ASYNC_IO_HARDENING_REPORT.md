# Upload Async I/O Hardening Report

## Task Summary
Refactored upload validation logic to remove synchronous filesystem calls from the upload endpoint and use fully async file operations.

## Before vs After Snippet

### Before
```js
for (const file of req.files) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const expectedMime = allowedImageMimes[extension];
  const fileBuffer = fs.readFileSync(file.path);
  const detectedMime = detectImageSignature(fileBuffer);

  if (!expectedMime || !detectedMime || detectedMime !== expectedMime) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ error: "Invalid image file content" });
  }
}
```

### After
```js
for (const file of req.files) {
  const extension = path.extname(file.originalname || "").toLowerCase();
  const expectedMime = allowedImageMimes[extension];
  const fileBuffer = await fs.promises.readFile(file.path);
  const detectedMime = detectImageSignature(fileBuffer);

  if (!expectedMime || !detectedMime || detectedMime !== expectedMime) {
    await Promise.allSettled(
      req.files
        .filter((uploadedFile) => isUploadPathSafe(uploadedFile.path))
        .map((uploadedFile) => fs.promises.unlink(uploadedFile.path))
    );
    return res.status(400).json({ error: "Invalid image file content" });
  }
}
```

## Validation Notes
- ✅ `fs.readFileSync` replaced with `await fs.promises.readFile` in upload validation.
- ✅ `fs.unlinkSync` replaced with `await fs.promises.unlink` in upload cleanup path.
- ✅ Magic-byte validation remains intact via `detectImageSignature(fileBuffer)`.
- ✅ Errors are handled within `try/catch` for upload endpoint.
- ✅ Cleanup on validation failure is preserved and strengthened (attempts cleanup for all uploaded files via `Promise.allSettled`).
- ✅ No unhandled promise rejections from cleanup paths (`Promise.allSettled` absorbs per-file unlink failures).

## Confirmation
- ✅ Upload endpoint remains functional with async validation and cleanup behavior.
- ✅ Build passes.
- ✅ No blocking I/O remains in the upload validation flow for `/api/admin/uploads/images`.
