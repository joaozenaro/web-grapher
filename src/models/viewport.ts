import { Vertex } from "../types";

export class Viewport {
    public zoom: number;
    public offset: Vertex;

    constructor() {
        this.zoom = 1;
        this.offset = { x: 0, y: 0 };
    }

    worldToScreen(point: Vertex): Vertex {
        return {
            x: (point.x - this.offset.x) * this.zoom,
            y: -(point.y - this.offset.y) * this.zoom
        };
    }

    screenToWorld(point: Vertex): Vertex {
        return {
            x: point.x / this.zoom + this.offset.x,
            y: -(point.y / this.zoom) + this.offset.y
        };
    }

    pan(dx: number, dy: number) {
        this.offset.x -= dx / this.zoom;
        this.offset.y += dy / this.zoom;
    }

    zoomTo(factor: number, center: Vertex) {
        const worldCenter = this.screenToWorld(center);
        this.zoom *= factor;

        const newScreenCenter = this.worldToScreen(worldCenter);
        this.offset.x += (newScreenCenter.x - center.x) / this.zoom;
        this.offset.y -= (newScreenCenter.y - center.y) / this.zoom;
    }
}