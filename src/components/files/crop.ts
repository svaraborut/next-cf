import { Area, Size } from 'react-easy-crop'

export interface Flip {
	horizontal: boolean
	vertical: boolean
}

/**
 * Create a new Image object from an url and resolve when the image has loaded
 */
export function createImage(url: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image()
		image.addEventListener('load', () => resolve(image))
		image.addEventListener('error', (error) => reject(error))
		// needed to avoid cross-origin issues on CodeSandbox
		image.setAttribute('crossOrigin', 'anonymous')
		image.src = url
	})
}

/**
 * Converts a canvas to a Blob via the widely supported toBlob function
 */
export function canvasToBlob(
	canvas: HTMLCanvasElement,
	type?: string,
	quality?: number
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(file) => {
				if (file) {
					resolve(file)
				} else {
					// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
					reject(new Error('Image cannot be created'))
				}
			},
			type,
			quality
		)
	})
}

export interface ImageCropRotateOptions {
	// Source image or url
	image: HTMLImageElement | string
	// Crop area
	crop: Area
	// Optional final size of the image
	size?: Size
	// Optional image rotation
	rotation?: number
	// Optional flip axis
	flip?: Flip
	// Optional image mime type (defaults to image/jpeg)
	type?: string
	// Optional image quality
	quality?: number
	// The background used to fill empty areas
	background?: string | CanvasGradient | CanvasPattern
}

/**
 * This function was derived from resources at
 * https://github.com/ValentinH/react-easy-crop
 * https://github.com/DominicTobias/react-image-crop
 */
export async function imageCropRotate({
	image,
	crop,
	size,
	rotation = 0,
	flip,
	type = 'image/jpeg',
	quality,
	background
}: ImageCropRotateOptions) {
	// Process props
	size = size ?? crop
	image = typeof image === 'string' ? await createImage(image) : image

	// Prepare machinery
	const canvas = document.createElement('canvas')
	const ctx = canvas.getContext('2d')
	const croppedCanvas = document.createElement('canvas')
	const croppedCtx = croppedCanvas.getContext('2d')
	if (!ctx || !croppedCtx) {
		throw new Error('Failed to create a 2D context')
	}

	// Calculate bounding box of the rotated image
	const rotRad = (rotation * Math.PI) / 180
	canvas.width =
		Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height)
	canvas.height =
		Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height)

	// Clear canvas
	// ctx.fillStyle = background ?? '#000'
	// ctx.fillRect(0, 0, canvas.width, canvas.height)

	// Translate canvas context to a central location to allow rotating and flipping around the center
	ctx.translate(canvas.width / 2, canvas.height / 2)
	ctx.rotate(rotRad)
	ctx.scale(flip?.horizontal ? -1 : 1, flip?.vertical ? -1 : 1)
	ctx.translate(-image.width / 2, -image.height / 2)

	// Draw rotated image
	ctx.drawImage(image, 0, 0)

	// Set the size of the cropped canvas
	croppedCanvas.width = size.width
	croppedCanvas.height = size.height

	croppedCtx.fillStyle = background ?? '#000'
	croppedCtx.fillRect(0, 0, croppedCanvas.width, croppedCanvas.height)

	// Draw the cropped image onto the new canvas
	croppedCtx.drawImage(
		canvas,
		crop.x,
		crop.y,
		crop.width,
		crop.height,
		0,
		0,
		size.width,
		size.height
	)

	// As a blob
	return canvasToBlob(croppedCanvas, type, quality)
}
