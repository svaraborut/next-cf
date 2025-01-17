import { fileDownload, fileUpload, FileUploadOptions, UploadError } from '@/lib/r2/files'
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

export async function POST(req: NextRequest, { params }: RouteParams) {
	// >> Demo security
	if (req.headers.get('authorization') !== `Bearer ${process.env.FEATURE_SECRET}`) {
		return NextResponse.json({ status: 'unauthorized' }, { status: 401 })
	}
	// << Demo security

	const { slug } = params
	try {
		// console.log(`👆 ${slug}`)
		const file = await fileUpload(slug.join('/'), req, options)
		return NextResponse.json({
			status: 'ok',
			urls: [
				`${process.env.NEXT_PUBLIC_URL_CDN}/${file.key}`,
				`${process.env.NEXT_PUBLIC_URL_CDN}/${file.key}${file.ext}`
			]
		})
	} catch (e) {
		if (e instanceof UploadError) {
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
	const { slug } = params
	try {
		// console.log(`👇 ${slug}`)
		const res = await fileDownload(slug.join('/'), {
			...options,
			download: req.nextUrl.searchParams.has('dw'),
			fuzzyExtension: true,
			cacheMaxAge: 300, // 5min
			cachePublic: true
		})
		if (res) {
			return res
		} else {
			return NextResponse.json({ status: 'not found' }, { status: 404 })
		}
	} catch (e) {
		if (e instanceof UploadError) {
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
