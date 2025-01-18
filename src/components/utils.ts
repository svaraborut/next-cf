import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
	ComponentType,
	createElement,
	ElementType,
	HTMLAttributes,
	InputHTMLAttributes,
	isValidElement,
	ReactElement,
	ReactNode
} from 'react'

/**
 * Class composition function twMerge(clsx(...))
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

/**
 * React render utils
 */

export type NodeOrComponent<P = {}> = ReactNode | ElementType<P> | ComponentType<P>

export function renderFromNodeOrComponent<
	N extends NodeOrComponent<P>,
	P = (InputHTMLAttributes<N> & HTMLAttributes<N>) | null
>(noc?: N, props?: P): ReactElement | undefined {
	if (!noc) return undefined
	return isValidElement(noc) ? noc : createElement(noc as any, props as any)
}

export function renderIconFromNodeOrComponent<
	N extends NodeOrComponent,
	P = (InputHTMLAttributes<N> & HTMLAttributes<N>) | null
>(noc?: N, props?: P): ReactElement | undefined {
	if (!noc) {
		return undefined
	} else if (isValidElement(noc)) {
		return noc
	} else {
		return createElement(noc as any, {
			...props,
			className: cn('h-4 w-4 shrink-0 grow-0', (props as any)?.className)
		})
	}
}

/**
 * Extension of cn, that can be used with @headlessui classNames which are slotted,
 * they accept a computation function
 */
export type SlotClassValue<S> = ClassValue | ((slot: S) => ClassValue)

export function scn<Slot>(...inputs: SlotClassValue<Slot>[]): (slot: Slot) => string {
	return (slot) => cn(...inputs.map((cv) => (typeof cv === 'function' ? cv(slot) : cv)))
}

export type SlotChildren<Slot> = ReactNode | (() => ReactNode) | ((slot: Slot) => ReactNode)

export function slotChildren<Slot>(children: SlotChildren<Slot>, slot: Slot): ReactNode {
	return typeof children === 'function' ? children(slot) : children
}
