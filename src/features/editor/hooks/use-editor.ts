import { fabric } from "fabric"
import { useCallback, useState, useMemo } from "react"
import { useAutoResize } from "./use-auto-resize"
import {
	BuildEditorProps,
	CIRCLE_OPTIONS,
	DIAMOND_OPTIONS,
	Editor,
	EditorHookProps,
	FILL_COLOR,
	RECTANGLE_OPTIONS,
	STROKE_COLOR,
	STROKE_WIDTH,
	TRIANGLE_OPTIONS,
} from "../types"
import { useCanvasEvents } from "./use-canvas-events"
import { isTextType } from "../utils"

/**
 * 构建编辑器对象
 * @param {BuildEditorProps} props - 构建编辑器所需的属性
 * @returns {Editor} 编辑器对象
 */
const buildEditor = ({
	canvas,
	fillColor,
	setFillColor,
	strokeColor,
	setStrokeColor,
	strokeWidth,
	setStrokeWidth,
	selectedObjects,
}: BuildEditorProps): Editor => {
	/**
	 * 获取工作区对象
	 * @returns {fabric.Object | undefined} 工作区对象
	 */
	const getWorkspace = () => {
		return canvas.getObjects().find((object) => object.name === "clip")
	}

	/**
	 * 将对象居中到工作区
	 * @param {fabric.Object} object - 需要居中的对象
	 */
	const center = (object: fabric.Object) => {
		const workspace = getWorkspace()
		const center = workspace?.getCenterPoint()

		if (!center) return
		// @ts-ignore
		canvas._centerObject(object, center)
	}

	/**
	 * 将对象添加到画布并设置为活动对象
	 * @param {fabric.Object} object - 需要添加到画布的对象
	 */
	const addToCanvas = (object: fabric.Object) => {
		center(object)
		canvas.add(object)
		canvas.setActiveObject(object)
	}

	return {
		/**
		 * 更改填充颜色
		 * @param {string} value - 新的填充颜色
		 */
		changeFillColor: (value: string) => {
			setFillColor(value)
			canvas.getActiveObjects().forEach((object) => {
				object.set({ fill: value })
			})
			canvas.renderAll()
		},
		/**
		 * 更改描边颜色
		 * @param {string} value - 新的描边颜色
		 */
		changeStrokeColor: (value: string) => {
			setStrokeColor(value)
			canvas.getActiveObjects().forEach((object) => {
				// Text types don't have stroke
				if (isTextType(object.type)) {
					object.set({ fill: value })
					return
				}

				object.set({ stroke: value })
			})
			canvas.freeDrawingBrush.color = value
			canvas.renderAll()
		},
		/**
		 * 更改描边宽度
		 * @param {number} value - 新的描边宽度
		 */
		changeStrokeWidth: (value: number) => {
			setStrokeWidth(value)
			canvas.getActiveObjects().forEach((object) => {
				object.set({ strokeWidth: value })
			})
		},
		addCircle: () => {
			const object = new fabric.Circle({
				...CIRCLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
			})

			addToCanvas(object)
		},
		addSoftRectangle: () => {
			const object = new fabric.Rect({
				...RECTANGLE_OPTIONS,
				rx: 50,
				ry: 50,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
			})

			addToCanvas(object)
		},
		addRectangle: () => {
			const object = new fabric.Rect({
				...RECTANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
			})

			addToCanvas(object)
		},
		addTriangle: () => {
			const object = new fabric.Triangle({
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
			})

			addToCanvas(object)
		},
		addInverseTriangle: () => {
			const HEIGHT = TRIANGLE_OPTIONS.height
			const WIDTH = TRIANGLE_OPTIONS.width

			const object = new fabric.Polygon(
				[
					{ x: 0, y: 0 },
					{ x: WIDTH, y: 0 },
					{ x: WIDTH / 2, y: HEIGHT },
				],
				{
					...TRIANGLE_OPTIONS,
					fill: fillColor,
					stroke: strokeColor,
					strokeWidth: strokeWidth,
				}
			)

			addToCanvas(object)
		},
		addDiamond: () => {
			const HEIGHT = DIAMOND_OPTIONS.height
			const WIDTH = DIAMOND_OPTIONS.width

			const object = new fabric.Polygon(
				[
					{ x: WIDTH / 2, y: 0 },
					{ x: WIDTH, y: HEIGHT / 2 },
					{ x: WIDTH / 2, y: HEIGHT },
					{ x: 0, y: HEIGHT / 2 },
				],
				{
					...DIAMOND_OPTIONS,
					fill: fillColor,
					stroke: strokeColor,
					strokeWidth: strokeWidth,
				}
			)
			addToCanvas(object)
		},
		canvas,
		getActiveFillColor: () => {
			const selectedObject = selectedObjects[0]

			if (!selectedObject) return fillColor

			const value = selectedObject.get("fill") || fillColor

			return value as string
		},
		getActiveStrokeColor: () => {
			const selectedObject = selectedObjects[0]

			if (!selectedObject) return strokeColor

			const value = selectedObject.get("stroke") || strokeColor

			return value
		},
		fillColor,
		strokeColor,
		strokeWidth,
		selectedObjects,
	}
}

/**
 * 自定义钩子，用于初始化和管理编辑器
 * @returns {{ init: function, editor: Editor | undefined }} 初始化函数和编辑器对象
 */
export const useEditor = ({ clearSelectionCallback }: EditorHookProps) => {
	const [canvas, setCanvas] = useState<fabric.Canvas | null>(null)
	const [container, setContainer] = useState<HTMLDivElement | null>(null)
	const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([])

	const [fillColor, setFillColor] = useState<string>(FILL_COLOR)
	const [strokeColor, setStrokeColor] = useState<string>(STROKE_COLOR)
	const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTH)

	useAutoResize({
		canvas,
		container,
	})

	useCanvasEvents({
		canvas,
		setSelectedObjects,
		clearSelectionCallback,
	})

	const editor = useMemo(() => {
		if (canvas) {
			return buildEditor({
				canvas,
				fillColor,
				strokeColor,
				strokeWidth,
				selectedObjects,
				setFillColor,
				setStrokeColor,
				setStrokeWidth,
			})
		}

		return undefined
	}, [canvas, fillColor, strokeColor, strokeWidth, selectedObjects])

	/**
	 * 初始化画布和容器
	 * @param {{ initialCanvas: fabric.Canvas, initialContainer: HTMLDivElement }} param0 - 初始画布和容器
	 */
	const init = useCallback(
		({
			initialCanvas,
			initialContainer,
		}: {
			initialCanvas: fabric.Canvas
			initialContainer: HTMLDivElement
		}) => {
			const initialWorkspace = new fabric.Rect({
				width: 900,
				height: 1200,
				name: "clip",
				fill: "white",
				selectable: false,
				hasControls: false,
				shadow: new fabric.Shadow({
					color: "rgba(0,0,0,0.8)",
					blur: 5,
				}),
			})

			initialCanvas.setWidth(initialContainer.offsetWidth)
			initialCanvas.setHeight(initialContainer.offsetHeight)
			initialCanvas.add(initialWorkspace)
			initialCanvas.centerObject(initialWorkspace)
			initialCanvas.clipPath = initialWorkspace

			setCanvas(initialCanvas)
			setContainer(initialContainer)
		},
		[]
	)

	return { init, editor }
}
