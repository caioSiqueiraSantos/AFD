# Simulador de Autômatos Finitos Determinísticos (AFD)
### Demonstração Didática e Formal para Linguagens Formais e Teoria da Computação

---

## 1. Introdução e Propósito

Este projeto constitui uma ferramenta didática e computacional para a simulação, visualização e verificação de **Autômatos Finitos Determinísticos (AFD)**. 

Diferente de demonstrações visuais contemporâneas focadas em efeitos gráficos supérfluos, este trabalho adota uma filosofia de **design científico, minimalista e formal**, inspirada nos softwares clássicos de ensino de computação teórica (como o *JFLAP* e applets acadêmicos dos anos 2000) e na notação dos livros-texto clássicos de **Hopcroft, Motwani & Ullman** e **Michael Sipser**.

A implementação utiliza exclusivamente as tecnologias nativas da plataforma web (**HTML5, CSS3 e JavaScript Vanilla**), sem dependência de bibliotecas ou frameworks externos.

---

## 2. Fundamentação Teórica

### 2.1 Definição Formal da 5-Tupla
Um Autômato Finito Determinístico é definido matematicamente como uma quíntupla:

$$M = (Q, \Sigma, \delta, q_0, F)$$

Onde:
1. **$Q$** é um conjunto finito e não vazio de estados.
2. **$\Sigma$** é um conjunto finito de símbolos, denominado alfabeto de entrada.
3. **$\delta$** é a função de transição total de estados:
   $$\delta: Q \times \Sigma \to Q$$
   Para todo par $(q, a) \in Q \times \Sigma$, existe rigorosamente um único estado de destino $q' \in Q$.
4. **$q_0 \in Q$** é o estado inicial da computação.
5. **$F \subseteq Q$** é o conjunto de estados finais ou de aceitação.

### 2.2 Função de Transição Estendida ($\hat{\delta}$)
O processamento de uma cadeia completa de caracteres $w \in \Sigma^*$ é formalmente definido por indução no comprimento de $w$ através da função de transição estendida $\hat{\delta}: Q \times \Sigma^* \to Q$:

- **Base**: $\hat{\delta}(q, \varepsilon) = q$, onde $\varepsilon$ denota a cadeia vazia.
- **Passo Indutivo**: Para toda cadeia $w = xa$ (com $x \in \Sigma^*$ e $a \in \Sigma$):
  $$\hat{\delta}(q, xa) = \delta(\hat{\delta}(q, x), a)$$

### 2.3 Linguagem Reconhecida e Critério de Aceitação
A linguagem regular $L(M)$ aceita pelo autômato $M$ é o conjunto de todas as cadeias sobre $\Sigma$ que conduzem a máquina de seu estado inicial a algum estado de aceitação:

$$L(M) = \{ w \in \Sigma^* \mid \hat{\delta}(q_0, w) \in F \}$$

Se $\hat{\delta}(q_0, w) \notin F$, a cadeia $w$ é **rejeitada**.

---

## 3. Modelos Formais Implementados

O simulador disponibiliza três autômatos clássicos pré-configurados:

### 3.1 Modelo 1: Reconhecedor de Sufixo Fixo `"01"` ($L_1$)
- **Definição da Linguagem**: $L_1 = \{ w \in \{0, 1\}^* \mid w = x01, \text{ com } x \in \{0, 1\}^* \}$
- **Alfabeto**: $\Sigma = \{0, 1\}$
- **Conjunto de Estados**: $Q = \{q_0, q_1, q_2\}$
- **Estado Inicial**: $q_0$
- **Estados Finais**: $F = \{q_2\}$
- **Tabela de Transição ($\delta$)**:

| Estado ($Q$) | Entrada '0' | Entrada '1' | Semântica do Estado |
| :---: | :---: | :---: | :--- |
| $\to q_0$ | $q_1$ | $q_0$ | Nenhum prefixo relevante de "01" acumulado |
| $q_1$ | $q_1$ | $q_2$ | Último símbolo lido foi '0' |
| $* q_2$ | $q_1$ | $q_0$ | **Aceitação**: Últimos dois símbolos lidos foram "01" |

---

### 3.2 Modelo 2: Reconhecedor de Inteiros Binários Múltiplos de 3 ($L_2$)
- **Definição da Linguagem**: $L_2 = \{ w \in \{0, 1\}^* \mid \text{val}(w) \equiv 0 \pmod 3 \}$
- **Princípio Aritmético**: O autômato calcula o resto da divisão inteira da representação binária processada até o momento via esquema de Horner:
  $$\text{novo\_resto} = (2 \cdot \text{resto\_atual} + \text{bit\_lido}) \pmod 3$$
- **Estados**: $Q = \{R_0, R_1, R_2\}$, onde $R_i$ representa o resto $i$.
- **Estado Inicial e Aceitação**: $q_0 = R_0$, $F = \{R_0\}$.
- **Tabela de Transição ($\delta$)**:

| Estado ($Q$) | Entrada '0' | Entrada '1' | Relação Algébrica |
| :---: | :---: | :---: | :--- |
| $\to * R_0$ | $R_0$ | $R_1$ | $(2 \cdot 0 + 0) \pmod 3 = 0$ / $(2 \cdot 0 + 1) \pmod 3 = 1$ |
| $R_1$ | $R_2$ | $R_0$ | $(2 \cdot 1 + 0) \pmod 3 = 2$ / $(2 \cdot 1 + 1) \pmod 3 = 0$ |
| $R_2$ | $R_1$ | $R_2$ | $(2 \cdot 2 + 0) \pmod 3 = 1$ / $(2 \cdot 2 + 1) \pmod 3 = 2$ |

---

### 3.3 Modelo 3: Reconhecedor de Paridade de Zeros ($L_3$)
- **Definição da Linguagem**: $L_3 = \{ w \in \{0, 1\}^* \mid |w|_0 \equiv 0 \pmod 2 \}$
- **Estados**: $Q = \{q_{\text{par}}, q_{\text{ímp}}\}$, com $q_0 = q_{\text{par}}$ e $F = \{q_{\text{par}}\}$.
- **Transições**:
  - $\delta(q_{\text{par}}, 0) = q_{\text{ímp}}$, $\delta(q_{\text{par}}, 1) = q_{\text{par}}$
  - $\delta(q_{\text{ímp}}, 0) = q_{\text{par}}$, $\delta(q_{\text{ímp}}, 1) = q_{\text{ímp}}$

---

## 4. Arquitetura e Engenharia de Software

O código foi construído com separação estrita de responsabilidades:

```
AFD/
├── index.html   # Estrutura documental semântica e tags SVG nativas
├── style.css    # Apresentação visual científica, sóbria e minimalista
├── app.js       # Máquina de estados determinística e renderização do grafo
└── README.md    # Especificação conceitual e técnica
```

### 4.1 Características Técnicas
1. **Renderização Vetorial SVG Procedural (`app.js`)**:
   - Os estados e as arestas direcionadas são traçados programmaticamente via Document Object Model (DOM) SVG.
   - Padrão gráfico de artigos científicos: nós circulares brancos com bordas pretas finas de 1.8px, estados finais representados por círculos concêntricos duplos e setas com marcadores `<marker>`.
   - As arestas direcionadas duplas utilizam desvio quadrático ortogonal (`curveOffset`) para evitar colisões entre fluxos bidirecionais.
2. **Fita de Leitura Sequencial (Unidade de Controle)**:
   - Estrutura de células contíguas simulando a fita de leitura unidirecional tradicional de um autômato (leitura da esquerda para a direita em tempo $O(n)$ e memória auxiliar $O(1)$).
3. **Sincronismo Tríplice de Execução**:
   - A cada avanço de passo ($\Delta$), o simulador atualiza em tempo real:
     1. O nó do grafo e a aresta transitada.
     2. A célula correspondente na tabela matricial $\delta(q, a)$.
     3. O ponteiro da fita e o registro de rastreamento (log formal).

---

## 5. Instruções de Execução

1. Abra o arquivo **`index.html`** diretamente em qualquer navegador moderno compatível com padrões web (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari). Não há etapas de compilação ou instalação prévia.
2. Selecione o modelo formal desejado na barra de configuração superior.
3. Insira uma cadeia de teste no campo de entrada $w$ ou clique em um dos exemplos rápidos.
4. Utilize o botão **`[ Δ Passo ]`** para demonstrar o autômato operando símbolo por símbolo em apresentação didática, ou **`[ Executar ]`** para simulação contínua temporizada.
