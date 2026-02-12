import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

const upload = async (file: File | null): Promise<string> => {
  if (!file) {
    throw new Error("No file provided");
  }

  const date = new Date();
  const storageRef = ref(storage, `images/${date + file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    // Timeout after 10s — catches CORS/network issues where SDK retries forever
    const timeout = setTimeout(() => {
      uploadTask.cancel();
      reject(new Error("Upload timed out"));
    }, 10000);

    uploadTask.on(
      "state_changed",
      () => {},
      (error) => {
        clearTimeout(timeout);
        reject(new Error("Upload failed: " + error.code));
      },
      () => {
        clearTimeout(timeout);
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

export default upload;
