export class Matriz {
    private dados: number[][];
    private linhas: number;
    private colunas: number;

    constructor(linhas: number, colunas: number) {
        if (linhas <= 0 || colunas <= 0) {
            throw new Error("Dimensões da matriz devem ser positivas");
        }

        this.linhas = linhas;
        this.colunas = colunas;
        this.dados = Array(linhas).fill(0).map(() => Array(colunas).fill(0));
    }

    setValor(linha: number, coluna: number, valor: number): void {
        this.validarIndices(linha, coluna);
        this.dados[linha][coluna] = valor;
    }

    getValor(linha: number, coluna: number): number {
        this.validarIndices(linha, coluna);
        return this.dados[linha][coluna];
    }

    private validarIndices(linha: number, coluna: number): void {
        if (linha < 0 || linha >= this.linhas || coluna < 0 || coluna >= this.colunas) {
            throw new Error("Índices fora dos limites da matriz");
        }
    }

    multiplicar(outra: Matriz): Matriz {
        if (this.colunas !== outra.linhas) {
            throw new Error(
                "Multiplicação impossível: número de colunas da primeira matriz " +
                "deve ser igual ao número de linhas da segunda matriz"
            );
        }

        const resultado = new Matriz(this.linhas, outra.colunas);

        for (let i = 0; i < this.linhas; i++) {
            for (let j = 0; j < outra.colunas; j++) {
                let soma = 0;
                for (let k = 0; k < this.colunas; k++) {
                    soma += this.dados[i][k] * outra.dados[k][j];
                }
                resultado.dados[i][j] = soma;
            }
        }

        return resultado;
    }

    preencher(valores: number[][]): void {
        if (valores.length !== this.linhas || valores[0].length !== this.colunas) {
            throw new Error("Dimensões dos valores não correspondem às dimensões da matriz");
        }

        for (let i = 0; i < this.linhas; i++) {
            for (let j = 0; j < this.colunas; j++) {
                this.dados[i][j] = valores[i][j];
            }
        }
    }

    static criarMatrizTranslacao(dx: number, dy: number): Matriz {
        const matriz = new Matriz(3, 3);
        matriz.preencher([
            [1, 0, dx],
            [0, 1, dy],
            [0, 0, 1]
        ]);
        return matriz;
    }

    static criarMatrizRotacao(angulo: number): Matriz {
        const rad = (angulo * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const matriz = new Matriz(3, 3);
        matriz.preencher([
            [cos, -sin, 0],
            [sin, cos, 0],
            [0, 0, 1]
        ]);
        return matriz;
    }

    static criarMatrizEscala(sx: number, sy: number): Matriz {
        const matriz = new Matriz(3, 3);
        matriz.preencher([
            [sx, 0, 0],
            [0, sy, 0],
            [0, 0, 1]
        ]);
        return matriz;
    }

    imprimir(): void {
        console.log("Matriz " + this.linhas + "x" + this.colunas + ":");
        for (let i = 0; i < this.linhas; i++) {
            console.log(this.dados[i].map(n => n.toFixed(2)).join("\t"));
        }
        console.log();
    }
}

export function testarMatriz() {
    try {
        const matriz1 = new Matriz(2, 3);
        matriz1.preencher([
            [1, 2, 3],
            [4, 5, 6]
        ]);

        const matriz2 = new Matriz(3, 2);
        matriz2.preencher([
            [7, 8],
            [9, 10],
            [11, 12]
        ]);

        console.log("Matriz 1:");
        matriz1.imprimir();

        console.log("Matriz 2:");
        matriz2.imprimir();

        console.log("Resultado da multiplicação:");
        const resultado = matriz1.multiplicar(matriz2);
        resultado.imprimir();

        console.log("Tentando multiplicação inválida:");
        const matrizInvalida = new Matriz(2, 4);
        matriz1.multiplicar(matrizInvalida); // Deve lançar erro

    } catch (erro) {
        console.error("Erro:", erro.message);
    }
}