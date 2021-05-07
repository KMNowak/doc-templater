import React, { ChangeEventHandler } from 'react'
import { generatePdfFromImages } from '../image2pdf'
import './styles.css'

// New class with additional fields for Image
export class CustomImage extends Image {
  constructor(public mimeType: string) {
    super()
  }

  // `imageType` is a required input for generating a PDF for an image.
  get imageType(): string {
    return this.mimeType.split('/')[1]
  }
}

// Each image is loaded and an object URL is created.
const fileToImageURL = (file: File): Promise<CustomImage> => {
  return new Promise((resolve, reject) => {
    const image = new CustomImage(file.type)

    image.onload = () => {
      resolve(image)
    }

    image.onerror = () => {
      reject(new Error('Failed to convert File to Image'))
    }

    image.src = URL.createObjectURL(file)
  })
}

export const ImageUploader = () => {
  const [uploadedImages, setUploadedImages] = React.useState<CustomImage[]>([])

  const handleImageUpload = React.useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      // `event.target.files` is of type `FileList`,
      // we convert it to Array for easier manipulation.
      const fileList = event.target.files
      const fileArray = fileList ? Array.from(fileList) : []

      // Uploaded images are read and the app state is updated.
      const fileToImagePromises = fileArray.map(fileToImageURL)
      Promise.all(fileToImagePromises).then(setUploadedImages)
    },
    [setUploadedImages],
  )

  const cleanUpUploadedImages = React.useCallback(() => {
    setUploadedImages([])
    uploadedImages.forEach((image) => {
      // The URL.revokeObjectURL() releases an existing object URL
      // which was previously created by URL.createObjectURL().
      // It lets the browser know not to keep the reference to the file any longer.
      URL.revokeObjectURL(image.src)
    })
  }, [setUploadedImages, uploadedImages])

  const handleGeneratePdfFromImages = React.useCallback(() => {
    generatePdfFromImages(uploadedImages)
    cleanUpUploadedImages()
  }, [uploadedImages, cleanUpUploadedImages])

  return (
    <>
      <h1>Convert images to PDFs</h1>

      {/* Overview of uploaded images */}
      <div className="images-container">
        {uploadedImages.length > 0 ? (
          uploadedImages.map((image) => (
            <img key={image.src} src={image.src} className="uploaded-image" />
          ))
        ) : (
          <p>Upload some images...</p>
        )}
      </div>

      {/* Buttons for uploading images and generating a PDF */}
      <div className="buttons-container">
        {/* Uploads images */}
        <label htmlFor="file-input">
          <span className="button">Upload images</span>
          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            // Native file input is hidden only for styling purposes
            style={{ display: 'none' }}
            multiple
          />
        </label>

        {/* Generates PDF */}
        <button
          onClick={handleGeneratePdfFromImages}
          className="button"
          disabled={uploadedImages.length === 0}
        >
          Generate PDF
        </button>
      </div>
    </>
  )
}

