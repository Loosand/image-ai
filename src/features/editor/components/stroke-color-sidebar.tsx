import { ActiveTool, Editor, STROKE_COLOR } from "@/features/editor/types"
import { ToolSidebarClose } from "./tool-sidebar-close"
import { ToolSidebarHeader } from "./tool-sidebar-header"

import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ColorPicker } from "./color-picker"

interface StrokeColorSidebarProps {
	editor: Editor | undefined
	activeTool: ActiveTool
	onChangeActiveTool: (tool: ActiveTool) => void
}

export function StrokeColorSidebar({
	editor,
	activeTool,
	onChangeActiveTool,
}: StrokeColorSidebarProps) {
	const value = editor?.getActiveStrokeColor() || STROKE_COLOR

	const onClose = () => {
		onChangeActiveTool("select")
	}

	const onChange = (color: string) => {
		editor?.changeStrokeColor(color)
	}

	return (
		<aside
			className={cn(
				"bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "stroke-color" ? "visible" : "hidden"
			)}>
			<ToolSidebarHeader
				title="Stroke color"
				description="Add Stroke color to your element"
			/>
			<ScrollArea>
				<div className="space-y-6 p-4">
					<ColorPicker value={value} onChange={onChange} />
				</div>
			</ScrollArea>
			<ToolSidebarClose onClick={onClose} />
		</aside>
	)
}
