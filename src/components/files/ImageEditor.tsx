import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { FileDropArea } from '@/components/files/DropArea'
import { scn } from '@/components/utils'
import Cropper, { MediaSize, Point } from 'react-easy-crop'
import { Button } from '@/components/ui/button'
import { CropIcon, MaximizeIcon, MinimizeIcon, RotateCcwIcon, RotateCwIcon } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { imageCropRotate } from '@/components/files/crop'
import 'react-easy-crop/react-easy-crop.css'

const CENTER = { x: 0, y: 0 }

// todo : hooox

type ObjectUrlFn = (obj: Blob | MediaSource) => string

interface UseObjectUrlReturn {
	create: ObjectUrlFn
	current?: string
}

export function useObjectUrl(): UseObjectUrlReturn {
	const ref = useRef<string>()
	// Callback function
	const create = useCallback<ObjectUrlFn>((obj) => {
		if (ref.current !== undefined) URL.revokeObjectURL(ref.current)
		ref.current = URL.createObjectURL(obj)
		return ref.current
	}, [])
	// Clear when component is finally unmounted
	useEffect(() => {
		return () => {
			if (ref.current !== undefined) URL.revokeObjectURL(ref.current)
		}
	}, [])
	return { create, current: ref.current }
}

export interface ImageEditorProps {
	aspect: number
	onImageChange?: Dispatch<Blob>
	background?: string
}

export function ImageEditor({ aspect, onImageChange, background = '#000' }: ImageEditorProps) {
	// const image = 'https://img.huffingtonpost.com/asset/5ab4d4ac2000007d06eb2c56.jpeg'
	// https://dsp.stackexchange.com/questions/2010
	// const image = 'https://i.sstatic.net/YG0o3.jpg'
	// const image = '/assets/low_compressibility_1.jpg'
	// const image = '/assets/low_compressibility_3.png'
	// https://www.npmjs.com/package/react-easy-crop
	// Customization of the crop such to snap perfectly to contain, cover
	const ref = useRef<Cropper | null>(null)
	const [crop, setCrop] = useState<Point>(CENTER)
	const [zoom, setZoom] = useState(1)
	const [rotation, setRotation] = useState(0)
	const [flipHorizontal, setFlipHorizontal] = useState(false)
	const [flipVertical, setFlipVertical] = useState(false)
	const [media, setMedia] = useState<MediaSize>({
		width: 1,
		height: 1,
		naturalWidth: 1,
		naturalHeight: 1
	})
	const [image, setImage] = useState<string>()
	const selectUrl = useObjectUrl()

	const naturalAspect = media.naturalWidth / media.naturalHeight
	const containZoom = aspect <= naturalAspect ? aspect / naturalAspect : naturalAspect / aspect

	return (
		<div className='flex flex-col gap-2'>
			<FileDropArea
				className={scn(
					'overflow-hidden rounded-md p-2',
					(slot) => slot.isHover && 'ring-4 ring-inset ring-pink-500'
				)}
				style={{ backgroundColor: background }}
				mimePrefix='image/'
				onDrop={(file) => setImage(selectUrl.create(file))}
			>
				<div className='relative h-96'>
					<Cropper
						ref={ref}
						// https://github.com/ValentinH/react-easy-crop/issues/582
						style={{
							containerStyle: { overflow: 'visible' }
						}}
						image={image}
						crop={crop}
						zoom={zoom}
						rotation={rotation}
						aspect={aspect}
						onMediaLoaded={setMedia}
						onCropChange={setCrop}
						onZoomChange={setZoom}
						// todo : fix this bug
						// https://github.com/ValentinH/react-easy-crop/issues/581
						restrictPosition={false}
						// onCropAreaChange={(c, pixel) => {
						// 	console.log('1', c, pixel)
						// }}
						// this is not emitted when crop is changed programmatically
						// https://github.com/ValentinH/react-easy-crop/blob/main/src/Cropper.tsx#L215
						// onCropComplete={(c, pixel) => {
						// 	console.log('2', c, pixel)
						// }}
						minZoom={containZoom}
						maxZoom={3}
						zoomSpeed={0.1}
						objectFit='contain'
						disableAutomaticStylesInjection={true}
					/>
				</div>
			</FileDropArea>
			<div className='flex items-center'>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => {
						setCrop(CENTER)
						setZoom(1)
					}}
				>
					<MaximizeIcon />
				</Button>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => {
						setCrop(CENTER)
						setZoom(containZoom)
					}}
				>
					<MinimizeIcon />
				</Button>
				{/*<Button*/}
				{/*	variant={flipHorizontal ? 'secondary' : 'ghost'}*/}
				{/*	size='icon'*/}
				{/*	onClick={() => setFlipHorizontal((v) => !v)}*/}
				{/*>*/}
				{/*	<FlipHorizontalIcon />*/}
				{/*</Button>*/}
				{/*<Button*/}
				{/*	variant={flipVertical ? 'secondary' : 'ghost'}*/}
				{/*	size='icon'*/}
				{/*	onClick={() => setFlipVertical((v) => !v)}*/}
				{/*>*/}
				{/*	<FlipVerticalIcon />*/}
				{/*</Button>*/}
				<Button
					variant='ghost'
					size='icon'
					onClick={() => setRotation((r) => (r - 90) % 360)}
				>
					<RotateCcwIcon />
				</Button>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => setRotation((r) => (r + 90) % 360)}
				>
					<RotateCwIcon />
				</Button>
				<Slider
					className='mx-4 w-96'
					value={[rotation]}
					onValueChange={(v) => setRotation(v[0])}
					max={360}
					step={5}
				/>
				<span>{rotation.toFixed()}°</span>
				<div className='flex-1' />
				<Button
					className='ml-2'
					onClick={async () => {
						const pixels = ref.current?.getCropData()
						if (!image || !pixels) return
						// todo : resize
						const blob = await imageCropRotate({
							image,
							crop: pixels.croppedAreaPixels,
							size: { height: 500, width: 500 },
							flip: { horizontal: flipHorizontal, vertical: flipVertical },
							type: 'image/jpeg',
							quality: 1,
							rotation,
							background: background
						})
						console.log(`🌄 ${blob.size}`)
						onImageChange?.(blob)
					}}
				>
					<CropIcon />
					Crop
				</Button>
			</div>
		</div>
	)
}
