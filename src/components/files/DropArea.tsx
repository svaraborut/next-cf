import { Dispatch, HTMLAttributes, useState } from 'react'
import { scn, SlotChildren, slotChildren, SlotClassValue } from '@/components/utils'

export interface DropAreaSlot {
	isHover: boolean
}

export type DropAreaProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'className' | 'onDrop' | 'onDragOver' | 'onDragEnter' | 'onDragLeave'
> & {
	acceptTransfers: (transfer: DataTransfer) => DataTransferItem[]
	onDrop?: Dispatch<DataTransferItem[]>
	className?: SlotClassValue<DropAreaSlot>
	children?: SlotChildren<DropAreaSlot>
}

export function DropArea({ acceptTransfers, children, className, onDrop, ...rest }: DropAreaProps) {
	// https://react-dnd.github.io/react-dnd/about
	const [isHover, setHover] = useState(false)

	return (
		<div
			{...rest}
			onDrop={(event) => {
				const accepted = acceptTransfers(event.dataTransfer)
				if (!accepted.length) return
				event.preventDefault()
				onDrop?.(accepted)
			}}
			onDragOver={(event) => {
				if (acceptTransfers(event.dataTransfer).length) {
					event.preventDefault()
				}
			}}
			onDragEnter={(event) => {
				setHover(true)
			}}
			onDragLeave={(event) => {
				// Detect a leave to a non-contained element
				if (!event.currentTarget.contains(event.relatedTarget as any)) {
					setHover(false)
				}
			}}
			className={scn(className)({ isHover })}
		>
			{slotChildren(children, { isHover })}
		</div>
	)
}

export type FileDropAreaProps = Omit<DropAreaProps, 'acceptTransfers' | 'onDrop'> & {
	mimePrefix?: string
	mimeTypes?: string[]
} & (
		| {
				multi: true
				onDrop?: Dispatch<File[]>
		  }
		| {
				multi?: false
				onDrop?: Dispatch<File>
		  }
	)

export function FileDropArea({
	mimePrefix,
	mimeTypes,
	multi = false,
	onDrop,
	...rest
}: FileDropAreaProps) {
	return (
		<DropArea
			acceptTransfers={(transfer) => {
				// todo : should we accept transfers that contain other things ?
				const items = Array.from(transfer.items).filter(
					(t) =>
						t.kind === 'file' &&
						(!mimePrefix || t.type.startsWith(mimePrefix)) &&
						(!mimeTypes || mimeTypes.includes(t.type))
				)
				return multi ? items : items.slice(0, 1)
			}}
			onDrop={(items) => {
				const files = items.map((i) => i.getAsFile()).filter((f) => !!f)
				if (!files.length) return
				// @ts-ignore
				onDrop?.(multi ? files : files[0])
			}}
			{...rest}
		/>
	)
}
