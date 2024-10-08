"use client"

import { fabric } from "fabric"
import { useCallback, useEffect, useRef, useState } from "react"
import { useEditor } from "@/features/editor/hooks/use-editor"
import { Navbar } from "./navbar"
import { Sidebar } from "./sidebar"
import { Toolbar } from "./toolbar"
import { Footer } from "./footer"
import { ActiveTool } from "@/features/editor/types"
import { ShapeSidebar } from "./shape-sidebar"
import { FillColorSidebar } from "./fill-color-sidebar"

/**
 * 画布编辑器组件
 * @returns {JSX.Element} 画布编辑器组件
 */
export function Editor(): JSX.Element {
	const [activeTool, setActiveTool] = useState<ActiveTool>("select")
	const { init, editor } = useEditor()

	const canvasRef = useRef(null)
	const containerRef = useRef(null)

	// 初始化画布
	useEffect(() => {
		const canvas = new fabric.Canvas(canvasRef.current, {
			controlsAboveOverlay: true,
			preserveObjectStacking: true,
		})

		init({
			initialCanvas: canvas,
			initialContainer: containerRef.current!,
		})

		return () => {
			canvas.dispose()
		}
	}, [init])

	/**
	 * 更改当前活动工具
	 * @param {ActiveTool} tool - 要设置为活动的工具
	 */
	const onChangeActiveTool = useCallback(
		(tool: ActiveTool) => {
			if (tool === activeTool) {
				return setActiveTool("select")
			}

			if (tool === "draw") {
				// 处理绘图工具的逻辑
			}

			if (activeTool === "draw") {
				// 处理取消绘图工具的逻辑
			}

			setActiveTool(tool)
		},
		[activeTool]
	)

	return (
		<div className="h-full flex flex-col">
			<Navbar activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
			<div className="absolute h-[calc(100%-68px)] w-full top-[68px] flex">
				<Sidebar
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<ShapeSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<FillColorSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<main className="bg-muted flex-1 overflow-auto relative flex flex-col">
					<Toolbar
						editor={editor}
						activeTool={activeTool}
						onChangeActiveTool={onChangeActiveTool}
						key={JSON.stringify(editor?.canvas.getActiveObject())}
					/>
					<div
						className="h-[calc(100%-124px)] flex-1 bg-muted"
						ref={containerRef}>
						<canvas ref={canvasRef} />
					</div>
					<Footer />
				</main>
			</div>
		</div>
	)
}
