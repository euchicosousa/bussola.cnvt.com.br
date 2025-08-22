import { useId } from "react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { cn } from "~/lib/ui/utils";

interface DotPatternProps {
	width?: any;
	height?: any;
	x?: any;
	y?: any;
	cx?: any;
	cy?: any;
	cr?: any;
	className?: string;
	[key: string]: any;
}
export function DotPattern({
	width = 16,
	height = 16,
	x = 0,
	y = 0,
	cx = 1,
	cy = 1,
	cr = 1,
	className,
	...props
}: DotPatternProps) {
	const id = useId();

	return (
		<svg
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute inset-0 h-full w-full fill-neutral-400/80",
				className
			)}
			{...props}
		>
			<defs>
				<pattern
					id={id}
					width={width}
					height={height}
					patternUnits="userSpaceOnUse"
					patternContentUnits="userSpaceOnUse"
					x={x}
					y={y}
				>
					<circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
				</pattern>
			</defs>
			<rect
				width="100%"
				height="100%"
				strokeWidth={0}
				fill={`url(#${id})`}
			/>
		</svg>
	);
}

interface FlickeringGridProps {
	squareSize?: number;
	gridGap?: number;
	flickerChance?: number;
	color?: string;
	width?: number;
	height?: number;
	className?: string;

	maxOpacity?: number;
}

export const FlickeringGrid: React.FC<FlickeringGridProps> = ({
	squareSize = 4,
	gridGap = 6,
	flickerChance = 0.3,
	color = "rgb(0, 0, 0)",
	width,
	height,
	className,
	maxOpacity = 0.3,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [isInView, setIsInView] = useState(false);
	const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

	const memoizedColor = useMemo(() => {
		const toRGBA = (color: string) => {
			if (typeof window === "undefined") {
				return `rgba(0, 0, 0,`;
			}
			const canvas = document.createElement("canvas");
			canvas.width = canvas.height = 1;
			const ctx = canvas.getContext("2d");
			if (!ctx) return "rgba(255, 0, 0,";
			ctx.fillStyle = color;
			ctx.fillRect(0, 0, 1, 1);
			const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
			return `rgba(${r}, ${g}, ${b},`;
		};
		return toRGBA(color);
	}, [color]);

	const setupCanvas = useCallback(
		(canvas: HTMLCanvasElement, width: number, height: number) => {
			const dpr = window.devicePixelRatio || 1;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
			const cols = Math.floor(width / (squareSize + gridGap));
			const rows = Math.floor(height / (squareSize + gridGap));

			const squares = new Float32Array(cols * rows);
			for (let i = 0; i < squares.length; i++) {
				squares[i] = Math.random() * maxOpacity;
			}

			return { cols, rows, squares, dpr };
		},
		[squareSize, gridGap, maxOpacity]
	);

	const updateSquares = useCallback(
		(squares: Float32Array, deltaTime: number) => {
			for (let i = 0; i < squares.length; i++) {
				if (Math.random() < flickerChance * deltaTime) {
					squares[i] = Math.random() * maxOpacity;
				}
			}
		},
		[flickerChance, maxOpacity]
	);

	const drawGrid = useCallback(
		(
			ctx: CanvasRenderingContext2D,
			width: number,
			height: number,
			cols: number,
			rows: number,
			squares: Float32Array,
			dpr: number
		) => {
			ctx.clearRect(0, 0, width, height);
			ctx.fillStyle = "transparent";
			ctx.fillRect(0, 0, width, height);

			for (let i = 0; i < cols; i++) {
				for (let j = 0; j < rows; j++) {
					const opacity = squares[i * rows + j];
					ctx.fillStyle = `${memoizedColor}${opacity})`;
					ctx.fillRect(
						i * (squareSize + gridGap) * dpr,
						j * (squareSize + gridGap) * dpr,
						squareSize * dpr,
						squareSize * dpr
					);
				}
			}
		},
		[memoizedColor, squareSize, gridGap]
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let animationFrameId: number;
		let gridParams: ReturnType<typeof setupCanvas>;

		const updateCanvasSize = () => {
			const newWidth = width || container.clientWidth;
			const newHeight = height || container.clientHeight;
			setCanvasSize({ width: newWidth, height: newHeight });
			gridParams = setupCanvas(canvas, newWidth, newHeight);
		};

		updateCanvasSize();

		let lastTime = 0;
		const animate = (time: number) => {
			if (!isInView) return;

			const deltaTime = (time - lastTime) / 1000;
			lastTime = time;

			updateSquares(gridParams.squares, deltaTime);
			drawGrid(
				ctx,
				canvas.width,
				canvas.height,
				gridParams.cols,
				gridParams.rows,
				gridParams.squares,
				gridParams.dpr
			);
			animationFrameId = requestAnimationFrame(animate);
		};

		const resizeObserver = new ResizeObserver(() => {
			updateCanvasSize();
		});

		resizeObserver.observe(container);

		const intersectionObserver = new IntersectionObserver(
			([entry]) => {
				setIsInView(entry.isIntersecting);
			},
			{ threshold: 0 }
		);

		intersectionObserver.observe(canvas);

		if (isInView) {
			animationFrameId = requestAnimationFrame(animate);
		}

		return () => {
			cancelAnimationFrame(animationFrameId);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
		};
	}, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

	return (
		<div ref={containerRef} className={`h-full w-full ${className}`}>
			<canvas
				ref={canvasRef}
				className="pointer-events-none"
				style={{
					width: canvasSize.width,
					height: canvasSize.height,
				}}
			/>
		</div>
	);
};

export function Waves({
	size = 100,
	className,
	speed = 1,
}: {
	size?: number;
	className?: string;
	speed?: number;
}) {
	let radius = size / 2.1;
	speed = 10 * speed;
	return (
		<div
			className={cn(`relative`, className)}
			style={{ width: size + "px", height: size + "px" }}
		>
			<div className="absolute inset-0">
				<div
					className={`absolute inset-0 animate-spin border-4 border-primary`}
					style={{
						borderRadius: radius / 1.05 + "px",
						animationDuration: speed * 1.0278 + "s",
					}}
				></div>
				<div
					className={`absolute inset-0 animate-spin border-2 border-primary`}
					style={{
						borderRadius: radius / 1.1 + "px",
						animationDuration: speed * 1.643 + "s",
					}}
				></div>
				<div
					className={`absolute inset-0 animate-spin border border-primary`}
					style={{
						borderRadius: radius / 1.15 + "px",
						animationDuration: speed * 2.9781 + "s",
					}}
				></div>
			</div>
			<div className="absolute inset-0 blur-lg">
				<div
					className={`absolute inset-0 animate-spin border-[10px] border-primary`}
					style={{
						borderRadius: radius + "px",
						animationDuration: speed * 1.0278 + "s",
					}}
				></div>
				<div
					className={`absolute inset-0 animate-spin border-8 border-primary`}
					style={{
						borderRadius: radius + "px",
						animationDuration: speed * 1.643 + "s",
					}}
				></div>
				<div
					className={`absolute inset-0 animate-spin border-8 border-primary`}
					style={{
						borderRadius: radius + "px",
						animationDuration: speed * 2.9781 + "s",
					}}
				></div>
			</div>
		</div>
	);
}
