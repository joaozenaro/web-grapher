import { TransformationType, Vertex } from "../types";
import { Viewport } from "./viewport";
import { Transformations } from './transformations';

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
    public transformOrigin: TransformationType;
    public customTransformPoint: Vertex;

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
        this.transformOrigin = TransformationType.ShapeCenter;
        this.customTransformPoint = { x: 0, y: 0 };
    }

    getTransformOriginPoint(): Vertex {
        const transformType: TransformationType = Number(this.transformOrigin);

        switch (transformType) {
            case TransformationType.ShapeCenter:
                return this.getCenter();
            case TransformationType.Origin:
                return { x: 0, y: 0 };
            case TransformationType.Custom:
                return this.customTransformPoint;
            default:
                return this.getCenter();
        }
    }

    rotate() {
        const originPoint = this.getTransformOriginPoint();
        this.vertices = Transformations.rotacionar(
            this.vertices,
            this.rotation,
            originPoint.x,
            originPoint.y
        );
    }

    move() {
        this.vertices = Transformations.transladar(
            this.vertices,
            this.translate.x,
            this.translate.y
        );
    }

    changeScale() {
        const originPoint = this.getTransformOriginPoint();
        this.vertices = Transformations.escalar(
            this.vertices,
            this.scale.x,
            this.scale.y,
            originPoint.x,
            originPoint.y
        );
    }

    draw(ctx: CanvasRenderingContext2D, viewport: Viewport) {
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

        // Draw transform origin point
        if (this.showProperties) {
            const originPoint = this.getTransformOriginPoint();
            const screenOrigin = viewport.worldToScreen(originPoint);

            ctx.beginPath();

            ctx.moveTo(screenOrigin.x - 5, screenOrigin.y);
            ctx.lineTo(screenOrigin.x + 5, screenOrigin.y);
            ctx.moveTo(screenOrigin.x, screenOrigin.y - 5);
            ctx.lineTo(screenOrigin.x, screenOrigin.y + 5);

            ctx.stroke();
        }
    }

    private getCenter(): Vertex {
        const sumX = this.vertices.reduce((sum, v) => sum + v.x, 0);
        const sumY = this.vertices.reduce((sum, v) => sum + v.y, 0);
        return {
            x: sumX / this.vertices.length,
            y: sumY / this.vertices.length
        };
    }
}