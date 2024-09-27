import { Vertex } from "../types";
import { Viewport } from "./viewport";

export class Shape {
    public id: number;
    public name: string;
    public fill: string | null;
    public showProperties: boolean;
    public strokeStyle: string;
    public lineWidth: number;

    constructor(public vertices: Vertex[], public closed = false) {
        this.id = Date.now() + Math.random();
        this.vertices = vertices;
        this.closed = closed;
        this.name = "Shape";
        this.showProperties = false;
        this.fill = "";
        this.strokeStyle = "black";
        this.lineWidth = 1;
    }

    draw(ctx: CanvasRenderingContext2D, viewport: Viewport) {
        ctx.save();
        ctx.beginPath();

        if (this.vertices.length === 0) return;

        const screenVertices = this.vertices.map(v => viewport.worldToScreen(v));

        ctx.moveTo(screenVertices[0].x, screenVertices[0].y);
        screenVertices.forEach(({ x, y }) => ctx.lineTo(x, y));

        if (this.closed) ctx.closePath();

        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.fill();
        }

        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();
        ctx.restore();
    }
}