'use client'

import { useState } from 'react'
import 'react-easy-crop/react-easy-crop.css'
import { ImageEditor, useObjectUrl } from '@/components/files/ImageEditor'
import { useAsync } from '@reactit/hooks'
import { Button } from '@/components/ui/button'

export default function HomePage() {
	const [url, setUrl] = useState<string>()
	const resultUrl = useObjectUrl()

	const [key, setKey] = useState('')
	const [code, setCode] = useState('')
	const [blob, setBlob] = useState<Blob>()

	const task = useAsync(async () => {
		if (!key || !code || !blob) throw new Error('Missing data')
		// Use direct post strategy
		const res = await fetch(`/files/${key}`, {
			method: 'PUT',
			body: blob,
			headers: {
				authorization: `Bearer ${code}`
			}
		})
		if (res.status !== 200) throw new Error(`Status ${res.status}`)
		return await res.json<{ urls: string[] }>()
	})

	return (
		<div className='flex flex-col gap-4 p-8'>
			<h1>📷 Image Upload</h1>
			<ImageEditor
				aspect={1}
				onImageChange={(blob) => {
					setBlob(blob)
					setUrl(resultUrl.create(blob))
				}}
			/>
			<div className='grid grid-cols-1 gap-2 md:grid-cols-2'>
				<div>{url && <img className='rounded-md border' src={url} />}</div>
				<div className='flex flex-col gap-2'>
					<input placeholder='key' value={key} onChange={(e) => setKey(e.target.value)} />
					<input
						placeholder='code'
						value={code}
						onChange={(e) => setCode(e.target.value)}
					/>
					<span>
						{task.isLoading && 'Sending...'}
						{task.isSucceed && 'Done'}
						{task.isFailed && (task.error?.message ?? 'Failed')}
					</span>
					<Button onClick={task.run}>Upload</Button>
					{task.result?.urls.map((u) => (
						<div key={u} className='flex gap-4'>
							<img className='rounded' width={100} src={u} />
							<p>{u}</p>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
