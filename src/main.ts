import Alpine from 'alpinejs';
import Sortable from 'sortablejs';
import { Viewport } from './models/viewport';
import { CanvasHandler } from './models/canvasHandler';
import { Tool, Vertex } from './types';
import { Shape } from './models/shape';
import { testarMatriz } from './models/matriz';

testarMatriz();

const canvasElement = document.querySelector("canvas")!;
const viewportInstance = new Viewport();

const canvasHandler = new CanvasHandler(canvasElement, viewportInstance);

document.addEventListener("alpine:init", () => {
    Alpine.store("shapes", [new Shape([{ x: 0, y: 0 } as Vertex])]);
    Alpine.data("toolsData", () => ({
        tool: "Cursor",
        mouseCoords: "",
        init() {
            this.$watch('tool', (value: string) => {
                canvasHandler.setSelectedTool(Tool[value]);
            });
        },
        mouseMove(e: MouseEvent) {
            canvasHandler.handleMouseMove(e);
            this.mouseCoords = JSON.stringify(viewportInstance.screenToWorld(canvasHandler.getMousePos(e)));
        },
        endDrawing() {
            canvasHandler.endDrawing();
        }
    }));
    Alpine.data("shapesData", () => ({
        selectedShape: {},
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
            const shape = shapes.find(x => x.id === shapeId);
            if (shape) shape.showProperties = !shape.showProperties;
        },
        addVertex(shapeIndex: number) {
            const shape = Alpine.store("shapes")[shapeIndex];
            if (shape.vertices.length > 0) {
                const lastVertex = shape.vertices[shape.vertices.length - 1];
                shape.vertices.push({ x: lastVertex.x + 10, y: lastVertex.y + 10 });
            } else {
                shape.vertices.push({ x: 0, y: 0 });
            }
        },
        removeVertex(shapeIndex: number, vertexIndex: number) {
            const shape = Alpine.store("shapes")[shapeIndex];
            shape.vertices.splice(vertexIndex, 1);
        },
        removeShape(shapeId: number) {
            const shapes = Alpine.store("shapes");
            Alpine.store("shapes", shapes.filter(x => x.id !== shapeId));
        },
        rotateShape(shapeId: number, degrees: number) {
            const shapes = Alpine.store("shapes");
            const shape = shapes.find(x => x.id === shapeId);

            shape.rotate();
        },
        changeScale(shapeId: number) {
            const shapes = Alpine.store("shapes");
            const shape: Shape = shapes.find(x => x.id === shapeId);

            shape.scale.x = isNaN(Number(shape.scale.x)) ? 0 : Number(shape.scale.x);
            shape.scale.y = isNaN(Number(shape.scale.y)) ? 0 : Number(shape.scale.y);
            shape.changeScale();

            shape.scale = { x: 1, y: 1 };

        },
        moveShape(shapeId: number) {
            const shapes = Alpine.store("shapes");
            const shape: Shape = shapes.find(x => x.id === shapeId);

            shape.translate.x = isNaN(Number(shape.translate.x)) ? 0 : Number(shape.translate.x);
            shape.translate.y = isNaN(Number(shape.translate.y)) ? 0 : Number(shape.translate.y);
            shape.move();

            shape.translate = { x: 0, y: 0 };
        }
    }));
});

Alpine.start();