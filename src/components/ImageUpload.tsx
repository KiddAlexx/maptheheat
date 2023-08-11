import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase-config';

function ImageUpload() {
  //File Upload State
  const [imageUpload, setImageUpload] = useState(null);

  const uploadFile = async function () {
    if (!imageUpload) return;
    const filesFolderRef = ref(
      storage,
      `restaurantImages/${city}/${restaurantName}/${imageUpload.name}`
    );
    try {
      await uploadBytes(filesFolderRef, imageUpload);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      <div>
        <input
          type="file"
          onChange={(e) => setImageUpload(e.target.files[0])}
        />
        <button onClick={uploadFile}>Upload File</button>
      </div>
    </div>
  );
}

export default ImageUpload;
