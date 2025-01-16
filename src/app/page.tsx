export default function Home() {
	return (
		<div className='p-8'>
			<h1>🔥 CLoudFlare</h1>
			<pre>{process.env.NEXT_PUBLIC_WATERMARK}</pre>
		</div>
	)
}
