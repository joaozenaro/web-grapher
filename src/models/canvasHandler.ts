import Alpine from 'alpinejs';
import { Shape } from "./shape";
import { Viewport } from "./viewport";
import { Tool, Vertex } from '../types';

export class CanvasHandler {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private viewport: Viewport;
    private selectedTool: Tool | string;
    private isPanning: boolean;
    private lastMousePos: Vertex | null;
    private currentShape: Shape | null;
    private startPoint: Vertex | null;
    private currentPoint: Vertex | null;

    constructor(canvas: HTMLCanvasElement, viewport: Viewport) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.viewport = viewport;

        this.selectedTool = "Cursor";
        this.isPanning = false;
        this.lastMousePos = null;
        this.currentShape = null;
        this.startPoint = null;
        this.currentPoint = null;

        this.initializeCanvas();
    }

    private initializeCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;

        this.viewport.offset = {
            x: -this.canvas.width / (2 * this.viewport.zoom), // Divide by zoom factor
            y: this.canvas.height / (2 * this.viewport.zoom), // Divide by zoom factor
        };

        this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        this.canvas.addEventListener("wheel", this.handleWheel.bind(this));

        window.requestAnimationFrame(this.mainLoop.bind(this));
    }

    public getMousePos(e: MouseEvent): Vertex {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    public handleMouseMove(e: MouseEvent) {
        const mousePos = this.getMousePos(e);
        const worldPos = this.viewport.screenToWorld(mousePos);
        this.currentPoint = worldPos;

        if (this.isPanning && this.lastMousePos) {
            const dx = mousePos.x - this.lastMousePos.x;
            const dy = mousePos.y - this.lastMousePos.y;
            this.viewport.pan(dx, dy);
        }

        this.lastMousePos = mousePos;
    }

    private handleMouseDown(e: MouseEvent) {
        const worldPos = this.viewport.screenToWorld(this.getMousePos(e));

        if (this.selectedTool === Tool.Pan) {
            this.isPanning = true;
            this.canvas.style.cursor = 'grabbing';
        }

        if (this.selectedTool == Tool.Line || this.selectedTool == Tool.Shape) {
            this.startPoint = worldPos;

            if (!this.currentShape) {
                this.currentShape = new Shape([worldPos], this.selectedTool === Tool.Shape);
                Alpine.store("shapes").push(this.currentShape);
            } else {
                this.currentShape.vertices.push(worldPos);
            }
        }
    }

    private handleMouseUp() {
        if (this.selectedTool === Tool.Pan) {
            this.isPanning = false;
            this.canvas.style.cursor = 'grab';
        }
    }

    private handleWheel(e: WheelEvent) {
        e.preventDefault();
        const mousePos = this.getMousePos(e as unknown as MouseEvent);
        const factor = Math.pow(1.001, -e.deltaY);
        this.viewport.zoomTo(factor, mousePos);
    }

    private mainLoop() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.beginPath();

        // Get the visible world bounds (coordinates) based on the canvas size
        const leftWorld = this.viewport.screenToWorld({ x: 0, y: 0 }).x;
        const rightWorld = this.viewport.screenToWorld({ x: this.canvas.width, y: 0 }).x;
        const topWorld = this.viewport.screenToWorld({ x: 0, y: 0 }).y;
        const bottomWorld = this.viewport.screenToWorld({ x: 0, y: this.canvas.height }).y;

        // Draw infinite X-axis
        const xAxis1 = this.viewport.worldToScreen({ x: leftWorld, y: 0 });
        const xAxis2 = this.viewport.worldToScreen({ x: rightWorld, y: 0 });
        this.ctx.moveTo(xAxis1.x, xAxis1.y);
        this.ctx.lineTo(xAxis2.x, xAxis2.y);

        // Draw infinite Y-axis
        const yAxis1 = this.viewport.worldToScreen({ x: 0, y: topWorld });
        const yAxis2 = this.viewport.worldToScreen({ x: 0, y: bottomWorld });
        this.ctx.moveTo(yAxis1.x, yAxis1.y);
        this.ctx.lineTo(yAxis2.x, yAxis2.y);

        this.ctx.strokeStyle = "lightgray";
        this.ctx.stroke();
        this.ctx.restore();

        const shapes = Alpine.store("shapes");
        shapes.slice().reverse().forEach((shape: Shape) => shape.draw(this.ctx, this.viewport));

        if (this.startPoint && this.currentPoint) {
            this.ctx.save();
            this.ctx.beginPath();

            const p1 = this.viewport.worldToScreen(this.startPoint);
            this.ctx.moveTo(p1.x, p1.y);

            const p2 = this.viewport.worldToScreen(this.currentPoint);
            this.ctx.lineTo(p2.x, p2.y);

            this.ctx.stroke();
            this.ctx.restore();
        }

        window.requestAnimationFrame(this.mainLoop.bind(this));
    }

    setSelectedTool(tool: Tool | string) {
        this.selectedTool = tool;
        this.currentShape = null;

        if (this.selectedTool == Tool.Pan) {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    endDrawing() {
        this.startPoint = null;
        this.currentPoint = null;
        this.currentShape = null;
    }
}
