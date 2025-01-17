import { R2PutOptions } from '@cloudflare/workers-types'
import { r2 } from '@/lib/r2/index'

// todo : seems almost impossible to stream upload a file. The process would require manual
//        processing of the data stream with some way to retrieve the instance of the FixedLengthStream
//        that is a CF builtin class.

export class UploadError extends Error {}

export interface FileUploadOptions {
	maxSize: number
	formats: { mime: string; ext: string }[]
}

export interface FileUploadReturn {
	key: string
	mime: string
	ext: string
}

export async function fileUpload(
	key: string,
	req: Request,
	options: FileUploadOptions
): Promise<FileUploadReturn> {
	if (!key) {
		throw new UploadError('Key cannot be empty')
	}
	// Check request prior to anything else
	const reqSize = req.headers.get('content-length')
	if (!reqSize) {
		throw new UploadError(`Content-Length header is mandatory`)
	} else if (parseInt(reqSize) > options.maxSize) {
		throw new UploadError(`Too large, maximum allowed size is ${options.maxSize}`)
	}
	// Read form data
	let formData: FormData
	try {
		formData = await req.formData()
	} catch (e) {
		throw new UploadError(`Failed to read upload body`)
	}
	// Validate form data
	if (Array.from(formData.keys()).length != 1 || !formData.has('file')) {
		throw new UploadError('Form should only contain a field "file"')
	}
	// Parse file
	const file = formData.get('file') as File
	// @ts-ignore - next uses a special extension of Blob rather than File object
	if (!(file instanceof File) && !(file instanceof Blob)) {
		throw new UploadError('Form field "file" should be a File')
	}
	const fmt = options.formats.find((fmt) => fmt.mime === file.type)
	if (!fmt) {
		throw new UploadError(`Cannot upload MIME type ${file.type}`)
	} else if (file.size > options.maxSize) {
		throw new UploadError(`Too large, maximum allowed size is ${options.maxSize}`)
	}
	// Ok here we are safe enough to materialize the file and upload it
	const materializedFile = await file.arrayBuffer()
	// https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#r2putoptions
	const putOptions = {
		httpMetadata: {
			contentType: file.type
			// contentDisposition
		},
		customMetadata: {
			originalName: file.name
		}
	} satisfies R2PutOptions
	// https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#bucket-method-definitions
	await r2.put(key, materializedFile, putOptions)
	// Produce final key
	return { key, ...fmt }
}

export interface FileDownloadOptions extends FileUploadOptions {
	download?: boolean
	fuzzyExtension?: boolean
	cacheMaxAge?: number
	cachePublic?: boolean
}

export async function fileDownload(
	slug: string,
	options: FileDownloadOptions
): Promise<Response | undefined> {
	// slug may optionally end with a format suffix
	const fmt = options.formats.find((fmt) => slug.toLowerCase().endsWith(fmt.ext))
	const key = options.fuzzyExtension && fmt ? slug.slice(0, slug.length - fmt.ext.length) : slug
	if (!slug) {
		throw new UploadError('Key cannot be empty')
	}
	// Download the file
	// https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#bucket-method-definitions
	const res = await r2.get(key)
	if (!res) {
		return undefined
	}
	// Define the final format
	const remoteMime = res.httpMetadata?.contentType
	if (fmt && remoteMime && remoteMime !== fmt.mime) {
		throw new UploadError(`File type mismatch. Requested ${fmt.mime} but file is ${remoteMime}`)
	}
	const outFmt = fmt ?? options.formats.find((fmt) => fmt.mime === remoteMime)
	// Headers
	const headers: any = {
		'content-disposition': `${options.download ? 'attachment' : 'inline'}; filename="file${outFmt?.ext ?? ''}"`
	}
	// Caching https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
	if (options.cacheMaxAge) {
		headers['cache-control'] =
			`max-age=${options.cacheMaxAge}, ${options.cachePublic ? 'public' : 'private'}`
	}
	if (outFmt?.mime) {
		headers['content-type'] = outFmt.mime
	}
	// Stream download
	return new Response(res.body as any, { status: 200, headers })
}
