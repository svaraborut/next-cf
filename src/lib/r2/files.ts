import { R2ObjectBody, R2PutOptions } from '@cloudflare/workers-types'
import { r2 } from '@/lib/r2/index'
import { toHex } from '@/lib/crypto'

// todo : seems almost impossible to stream upload a file. The process would require manual
//        processing of the data stream with some way to retrieve the instance of the FixedLengthStream
//        that is a CF builtin class.

export class FileError extends Error {}
export class UploadError extends FileError {}
export class DownloadError extends FileError {}

export interface FileFormat {
	mime: string
	ext: string
}

export interface FileUploadOptions {
	maxSize: number
	formats: FileFormat[]
	formData?: boolean
}

export interface FileReturn {
	key: string
	mime?: string
}

export interface FileUploadReturn extends FileReturn {
	ext: string
	mime: string
}

/**
 * Directly upload a file from an incoming Form POST request to R2. The request
 * should be a plain POST/PUT request or a FormData request containing a single
 * record `file` containing a valid file.
 */
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
	// Read input
	let materializedFile: ArrayBuffer, fmt: FileFormat | undefined
	if (!options.formData) {
		// Read plain request
		const reqMime = req.headers.get('content-type')
		fmt = options.formats.find((fmt) => fmt.mime === reqMime)
		if (!fmt) {
			throw new UploadError(`Cannot upload MIME type ${reqMime}`)
		}
		// Ok here we are safe enough to materialize the file and upload it
		// todo : stop materializing, todo arrayBuffer() is not working
		materializedFile = req.body as any
	} else {
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
		fmt = options.formats.find((fmt) => fmt.mime === file.type)
		if (!fmt) {
			throw new UploadError(`Cannot upload MIME type ${file.type}`)
		} else if (file.size > options.maxSize) {
			throw new UploadError(`Too large, maximum allowed size is ${options.maxSize}`)
		}
		// Ok here we are safe enough to materialize the file and upload it
		// todo : stop materializing
		materializedFile = await file.arrayBuffer()
	}
	// https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#r2putoptions
	const putOptions = {
		httpMetadata: {
			contentType: fmt.mime
			// contentDisposition
		}
		// customMetadata: {
		// 	originalName: file.name
		// }
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
	cacheNoStore?: boolean
	cacheMustRevalidate?: boolean
	headOnly?: boolean
	noEtag?: boolean
}

/**
 * Create a file stream response from R2 with optional caching settings. If file
 * is not found will return undefined. By default, Next.js will use the GET request
 * to process incoming HEAD requests, it is recommended to implement a separate HEAD
 * method and use the headOnly flag to perform a more efficient request to R2. To
 * support revalidation caching the system provides the etag by default as returned
 * in the MD5 field of R2
 */
export async function fileDownload(
	slug: string,
	options: FileDownloadOptions
): Promise<Response | undefined> {
	// slug may optionally end with a format suffix
	const fmt = options.formats.find((fmt) => slug.toLowerCase().endsWith(fmt.ext))
	const key = options.fuzzyExtension && fmt ? slug.slice(0, slug.length - fmt.ext.length) : slug
	if (!slug) {
		throw new DownloadError('Key cannot be empty')
	}
	// Download the file
	// https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#bucket-method-definitions
	const res = await (options.headOnly ? r2.head(key) : r2.get(key))
	if (!res) {
		return undefined
	}
	// Define the final format
	const remoteMime = res.httpMetadata?.contentType
	if (fmt && remoteMime && remoteMime !== fmt.mime) {
		throw new DownloadError(
			`File type mismatch. Requested ${fmt.mime} but file is ${remoteMime}`
		)
	}
	const outFmt = fmt ?? options.formats.find((fmt) => fmt.mime === remoteMime)
	// Headers
	const headers: any = {
		'content-disposition': `${options.download ? 'attachment' : 'inline'}; filename="file${outFmt?.ext ?? ''}"`
	}
	// Caching https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
	if (options.cacheNoStore) {
		headers['cache-control'] = 'no-store'
	} else if (options.cacheMustRevalidate) {
		headers['cache-control'] = 'no-cache, must-revalidate'
	} else if (options.cacheMaxAge) {
		headers['cache-control'] =
			`${options.cachePublic ? 'public' : 'private'}, max-age=${options.cacheMaxAge}`
	}
	// https://developers.cloudflare.com/r2/api/workers/workers-api-reference/#checksums
	// Cloudflare internally uses MD5 as the blob etag
	if (!options.noEtag && res.checksums.md5) {
		headers['etag'] = `"${toHex(res.checksums.md5)}"`
	}
	if (outFmt?.mime) {
		headers['content-type'] = outFmt.mime
	}
	// Stream download
	return new Response(options.headOnly ? null : ((res as R2ObjectBody).body as any), {
		status: 200,
		headers
	})
}

/**
 * Copy the file at source key to the destination key
 * todo : check target does not exist
 */
export async function fileCopy(keyFrom: string, keyTo: string): Promise<FileReturn> {
	const res = await r2.get(keyFrom)
	if (!res) {
		throw new FileError('File not found')
	}
	// todo : stop materializing
	await r2.put(keyTo, await res.arrayBuffer(), {
		httpMetadata: res.httpMetadata,
		customMetadata: res.customMetadata
	})
	return {
		key: keyTo,
		mime: res.httpMetadata?.contentType
	}
}

/**
 * Move the file from source key to the destination key
 */
export async function fileMove(keyFrom: string, keyTo: string): Promise<FileReturn> {
	const res = await fileCopy(keyFrom, keyTo)
	await r2.delete(keyFrom)
	return res
}
