import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";

const upload = async (file, onProgress) => {
    let fileType = 'others';
    if (file.type.startsWith('audio')) {
        fileType = 'audio';
    } else if (file.type.startsWith('video')) {
        fileType = 'video';
    } else if (file.type.startsWith('application')) {
        if (file.name.endsWith('.zip') || file.name.endsWith('.rar') || file.name.endsWith('.jar')) {
            fileType = 'file'; // Store encrypted files in the 'file' folder
        } else {
            fileType = 'document';
        }
    } else if (file.type.startsWith('image')) {
        fileType = 'image';
    }

    const fileName = `${new Date().getTime()}_${file.name}`;
    const storageRef = ref(storage, `${fileType}/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
                console.log(progress)
            },
            (error) => {
                reject("Something went wrong! " + error.code);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

export default upload;
