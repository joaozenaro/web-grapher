import Alpine from 'alpinejs';
import Sortable from 'sortablejs';

enum Tool { Cursor, Line, Shape };

let startPoint: Vertex | null = null;
let currentPoint: Vertex | null = null;
let currentShape: Shape | null = null;
let selectedTool: Tool | string = "Cursor";

const mouseCoords = document.querySelector("#mouse-coords") as HTMLSpanElement;
const canvas = document.querySelector("canvas")!;
const ctx = canvas.getContext("2d")!;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

ctx.translate(canvas.width / 2, canvas.height / 2);

type Vertex = { x: number, y: number };

class Shape {
    public id: number;
    public fill: string;
    public showProperties: boolean;
    public strokeStyle: string;
    public lineWidth: number;

    constructor(public vertices: Vertex[], public closed = false) {
        this.id = Date.now() + Math.random();
        this.vertices = vertices;
        this.closed = closed;
        this.showProperties = false;
        this.fill = "";
    }

    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
        this.vertices.forEach(({ x, y }) => ctx.lineTo(x, y));

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

canvas.addEventListener("mousemove", (e) => {
    currentPoint = getCanvasCoordinates(e);
    mouseCoords.innerText = `${currentPoint.x}x${currentPoint.y}`;
});

const getCanvasCoordinates = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) - canvas.width / 2,
        y: (e.clientY - rect.top) - canvas.height / 2,
    };
}

canvas.addEventListener("click", (e) => {
    const coords = getCanvasCoordinates(e);

    if (selectedTool === Tool.Cursor || selectedTool === "Cursor") return;

    if (!currentShape) {
        currentShape = new Shape([coords], selectedTool === Tool.Shape);
        Alpine.store("shapes").push(currentShape);
        startPoint = coords;
    } else {
        Alpine.store("shapes")[Alpine.store("shapes").length - 1].vertices.push(coords);
        startPoint = coords;
    }
});

function mainLoop() {
    ctx.clearRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    const shapes = Alpine.store("shapes");

    shapes.slice().reverse().forEach(shape => shape.draw());

    if (startPoint && currentPoint) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentPoint.x, currentPoint.y);
        ctx.stroke();
        ctx.restore();
    }

    window.requestAnimationFrame(mainLoop);
}

window.requestAnimationFrame(mainLoop);

document.addEventListener("alpine:init", () => {
    Alpine.store("shapes", []);
    Alpine.data("toolsData", () => ({
        tool: selectedTool,
        init() {
            this.$watch('tool', (value: string) => selectedTool = Tool[value]);
        },
        endDrawing() {
            startPoint = null;
            currentPoint = null;
            currentShape = null;
        }
    }));
    Alpine.data("shapesData", () => ({
        init() {
            Sortable.create(this.$refs.shapelist, {
                animation: 150,
                handle: ".shape-handle",
                onEnd: (ev) => {
                    const shapes = Alpine.raw(Alpine.store("shapes"));
                    const [movedShape] = shapes.splice(ev.oldIndex, 1);
                    shapes.splice(ev.newIndex, 0, movedShape);
                    Alpine.store("shapes", shapes);

                    //@ts-ignore
                    document.querySelector("template")._x_prevKeys = shapes.map(
                        (shape) => shape.id
                    );
                },
            });
        },
        toggleEdit(shapeId: number) {
            const shapes = Alpine.store("shapes");
            const shape = shapes.filter(x => x.id !== shapeId);
            shape.showProperties = !shape.showProperties;
        },
        addVertex(shapeIndex: number) {
            Alpine.store("shapes")[shapeIndex].vertices.push({ x: 0, y: 0 });
        },
        removeVertex(shapeIndex: number, vertexIndex: number) {
            const shape = Alpine.store("shapes")[shapeIndex];
            shape.vertices.splice(vertexIndex, 1);
            this.updateShape();
        },
        removeShape(shapeId: number) {
            const shapes = Alpine.store("shapes");
            Alpine.store("shapes", shapes.filter(x => x.id !== shapeId));
        },
        updateShape() {
            window.requestAnimationFrame(mainLoop);
        },
    }));
});

Alpine.start();