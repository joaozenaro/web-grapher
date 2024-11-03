import { Matriz } from './matriz';
import { Vertex } from '../types';

export class Transformations {
    static aplicarTransformacao(vertices: Vertex[], matriz: Matriz): Vertex[] {
        return vertices.map(vertex => {
            const matrizPonto = new Matriz(3, 1);
            matrizPonto.preencher([[vertex.x], [vertex.y], [1]]);

            const resultado = matriz.multiplicar(matrizPonto);

            return {
                x: resultado.getValor(0, 0),
                y: resultado.getValor(1, 0)
            };
        });
    }

    static transladar(vertices: Vertex[], dx: number, dy: number): Vertex[] {
        const matrizTranslacao = Matriz.criarMatrizTranslacao(dx, dy);
        return this.aplicarTransformacao(vertices, matrizTranslacao);
    }

    static rotacionar(vertices: Vertex[], angulo: number, centroX: number = 0, centroY: number = 0): Vertex[] {
        // Primeiro translada para origem
        const matrizTranslacaoOrigem = Matriz.criarMatrizTranslacao(-centroX, -centroY);
        // Aplica rotação
        const matrizRotacao = Matriz.criarMatrizRotacao(angulo);
        // Translada de volta
        const matrizTranslacaoVolta = Matriz.criarMatrizTranslacao(centroX, centroY);

        let resultado = this.aplicarTransformacao(vertices, matrizTranslacaoOrigem);
        resultado = this.aplicarTransformacao(resultado, matrizRotacao);
        resultado = this.aplicarTransformacao(resultado, matrizTranslacaoVolta);

        return resultado;
    }

    static escalar(vertices: Vertex[], sx: number, sy: number, centroX: number = 0, centroY: number = 0): Vertex[] {
        const matrizTranslacaoOrigem = Matriz.criarMatrizTranslacao(-centroX, -centroY);
        const matrizEscala = Matriz.criarMatrizEscala(sx, sy);
        const matrizTranslacaoVolta = Matriz.criarMatrizTranslacao(centroX, centroY);

        let resultado = this.aplicarTransformacao(vertices, matrizTranslacaoOrigem);
        resultado = this.aplicarTransformacao(resultado, matrizEscala);
        resultado = this.aplicarTransformacao(resultado, matrizTranslacaoVolta);

        return resultado;
    }
}
