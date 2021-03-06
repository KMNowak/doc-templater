import JsPDF from 'jspdf'
import { CustomImage } from './imageUploader/ImageUploader'

// The dimensions are in millimeters.
const A4_PAPER_DIMENSIONS = {
  width: 210,
  height: 297,
}

const A4_PAPER_RATIO = A4_PAPER_DIMENSIONS.width / A4_PAPER_DIMENSIONS.height

interface ImageDimension {
  width: number;
  height: number;
}

// Calculates the best possible position of an image on the A4 paper format,
// so that the maximal area of A4 is used and the image ratio is preserved.
const imageDimensionsOnA4 = (dimensions: ImageDimension) => {
  const isLandscapeImage = dimensions.width >= dimensions.height

  // If the image is in landscape, the full width of A4 is used.
  if (isLandscapeImage) {
    return {
      width: A4_PAPER_DIMENSIONS.width,
      height:
        A4_PAPER_DIMENSIONS.width / (dimensions.width / dimensions.height),
    }
  }

  // If the image is in portrait and the full height of A4 would skew
  // the image ratio, we scale the image dimensions.
  const imageRatio = dimensions.width / dimensions.height
  if (imageRatio > A4_PAPER_RATIO) {
    const imageScaleFactor =
      (A4_PAPER_RATIO * dimensions.height) / dimensions.width

    const scaledImageHeight = A4_PAPER_DIMENSIONS.height * imageScaleFactor

    return {
      height: scaledImageHeight,
      width: scaledImageHeight * imageRatio,
    }
  }

  // The full height of A4 can be used without skewing the image ratio.
  return {
    width: A4_PAPER_DIMENSIONS.height / (dimensions.height / dimensions.width),
    height: A4_PAPER_DIMENSIONS.height,
  }
}

// Creates a PDF document containing all the uploaded images.
export const generatePdfFromImages = (images: CustomImage[]) => {
  // Default export is A4 paper, portrait, using millimeters for units.
  const doc = new JsPDF()

  // We let the images add all pages,
  // therefore the first default page can be removed.
  doc.deletePage(1)

  images.forEach((image) => {
    const imageDimensions = imageDimensionsOnA4({
      width: image.width,
      height: image.height,
    })

    doc.addPage()
    doc.addImage(
      image.src,
      image.imageType,
      // Images are vertically and horizontally centered on the page.
      (A4_PAPER_DIMENSIONS.width - imageDimensions.width) / 2,
      (A4_PAPER_DIMENSIONS.height - imageDimensions.height) / 2,
      imageDimensions.width,
      imageDimensions.height,
    )
  })

  // Creates a PDF and opens it in a new browser tab.
  const pdfURL = doc.output('bloburl')
  window.open(pdfURL as any, '_blank')
}
