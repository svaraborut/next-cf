import { fileDownload, FileError, fileMove, fileUpload, FileUploadOptions } from '@/lib/r2/files'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const options = {
	maxSize: 1_048_576,
	formats: [
		{ mime: 'image/jpeg', ext: '.jpg' },
		{ mime: 'image/jpeg', ext: '.jpeg' },
		{ mime: 'image/png', ext: '.png' },
		{ mime: 'text/plain', ext: '.txt' },
		{ mime: 'application/pdf', ext: '.pdf' }
	]
} satisfies FileUploadOptions

interface RouteParams {
	params: { slug: string[] }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
	// >> Demo security
	if (req.headers.get('authorization') !== `Bearer ${process.env.FEATURE_SECRET}`) {
		return NextResponse.json({ status: 'unauthorized' }, { status: 401 })
	}
	// << Demo security
	const { slug } = params
	const isAccept = req.nextUrl.searchParams.has('accept')
	const isTemporary = req.nextUrl.searchParams.has('tmp')
	const key = (isTemporary ? 'tmp/' : '') + slug.join('/')
	try {
		// console.log(`${isAccept ? '👍' : '👆'} ${key}`)
		const file = await (isAccept ? fileMove('tmp/' + key, key) : fileUpload(key, req, options))
		return NextResponse.json({
			status: 'ok',
			urls: [
				`${process.env.NEXT_PUBLIC_URL_CDN}/${file.key}`,
				`${process.env.NEXT_PUBLIC_URL}/files/${file.key}`
			].concat(
				isAccept
					? []
					: [`${process.env.NEXT_PUBLIC_URL}/files/${file.key}${(file as any).ext}`]
			)
		})
	} catch (e) {
		if (e instanceof FileError) {
			return NextResponse.json({ status: 'error', message: e.message }, { status: 400 })
		} else {
			console.error(e)
			return NextResponse.json(
				{ status: 'error', message: 'Internal Error' },
				{ status: 500 }
			)
		}
	}
}

export async function GET(req: NextRequest, { params }: RouteParams) {
	req.method
	const { slug } = params
	try {
		// console.log(`👇 ${slug}`)
		const res = await fileDownload(slug.join('/'), {
			...options,
			download: req.nextUrl.searchParams.has('dw'),
			fuzzyExtension: true,
			cacheMaxAge: 300, // 5min
			cachePublic: true,
			headOnly: req.method.toUpperCase() === 'HEAD'
		})
		if (res) {
			return res
		} else {
			return NextResponse.json({ status: 'not found' }, { status: 404 })
		}
	} catch (e) {
		if (e instanceof FileError) {
			return NextResponse.json({ status: 'error', message: e.message }, { status: 400 })
		} else {
			console.error(e)
			return NextResponse.json(
				{ status: 'error', message: 'Internal Error' },
				{ status: 500 }
			)
		}
	}
}

export const HEAD = GET
