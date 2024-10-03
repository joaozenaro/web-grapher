import { Vertex } from "../types";
import { Viewport } from "./viewport";

export class Shape {
    public id: number;
    public name: string;
    public fill: string | null;
    public showProperties: boolean;
    public strokeStyle: string;
    public lineWidth: number;
    public rotation: number;
    public pointRadius: number;
    public scale: Vertex;
    public translate: Vertex;
    public moveStep: number;

    constructor(public vertices: Vertex[], public closed = false) {
        this.id = Date.now() + Math.random();
        this.vertices = vertices;
        this.closed = closed;
        this.name = "Shape";
        this.showProperties = false;
        this.fill = "";
        this.strokeStyle = "black";
        this.lineWidth = 1;
        this.rotation = 0;
        this.pointRadius = 5;
        this.scale = { x: 1, y: 1 };
        this.translate = { x: 0, y: 0 };
        this.moveStep = 0;
    }

    rotate() {
        const radians = (this.rotation * Math.PI) / 180;

        this.vertices = this.vertices.map(({ x, y }) => {
            const rotatedX = x * Math.cos(radians) - y * Math.sin(radians);
            const rotatedY = x * Math.sin(radians) + y * Math.cos(radians);

            return {
                x: rotatedX,
                y: rotatedY,
            };
        });
    }

    move() {
        this.vertices = this.vertices.map(({ x, y }) => {
            return {
                x: Number(x) + Number(this.translate.x),
                y: Number(y) + Number(this.translate.y),
            };
        });
    }

    public changeScale() {
        this.vertices = this.vertices.map(({ x, y }) => {
            return {
                x: x * this.scale.x,
                y: y * this.scale.y,
            };
        });
    }

    draw(ctx: CanvasRenderingContext2D, viewport: Viewport) {
        ctx.save();
        ctx.beginPath();

        if (this.vertices.length === 0) return;

        const screenVertices = this.vertices.map(v => viewport.worldToScreen(v));

        if (this.vertices.length === 1) {
            ctx.arc(screenVertices[0].x, screenVertices[0].y, Math.abs(this.pointRadius), 0, 2 * Math.PI);
        }

        ctx.moveTo(screenVertices[0].x, screenVertices[0].y);
        screenVertices.forEach(({ x, y }) => ctx.lineTo(x, y));

        if (this.closed) ctx.closePath();

        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.fill();
        }

        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = Math.abs(this.lineWidth);
        ctx.stroke();
        ctx.restore();
    }
}