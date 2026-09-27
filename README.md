# Stock Video Factory Engine 🎬✨

Motor automatizado e determinístico baseado em **Remotion**, **Next.js**, **React Three Fiber (R3F)** e **Rapier.js** para geração e renderização de vídeos em loop para microstock (Shutterstock, Adobe Stock, Freepik, Getty Images), vinhetas e criativos para mídias sociais (TikTok, Reels, Shorts).

---

## 📌 Visão Geral do Projeto

O **Stock Video Factory** transforma arquivos vetoriais (`.svg`) e imagens (`.png`) em composições visuais dinâmicas em alta resolução com loops perfeitos (*seamless loops*).

### Principais Recursos
- **Formatos e Proporções**: Suporte nativo a `16:9` (Paisagem/YouTube), `9:16` (Vertical/Reels/TikTok), `4:3` e `2:3`.
- **Qualidade de Exportação**: `1080p` (Full HD) e `4K` (Ultra HD) a `24`, `30` ou `60` FPS.
- **Camada Física 2D**: Simulação de colisões, gravidade invertida, vórtices e campos de força com **Rapier.js**.
- **Fundos Procedurais e Shaders 3D**: Shaders GLSL reativos via **Three.js** e **React Three Fiber**, com mais de 30 estilos de fundo.
- **Camadas de Efeito (Overlays)**: Efeitos de partículas em profundidade (Z-depth), *plexus*, brasas (*embers*), fluxo de dados, anéis e refração.
- **Auto-desenho de SVG**: Renderização animada de traçado (*path self-drawing*) antes da materialização física.
- **Harmonização de Cores**: Extração e geração de paletas dinâmicas com **Chroma.js** sincronizadas com o asset principal.
- **Ambientes de Trabalho Flexíveis**:
  1. Painel Web com controle total de parâmetros e preview em tempo real.
  2. Remotion Studio para inspeção detalhada de frames.
  3. Linha de comando (CLI) para geração e renderização em lote (*batch rendering*).

---

## 🚀 Instalação e Requisitos

### Pré-requisitos
- **Node.js**: Versão 18 ou superior instalada (Node.js 20+ recomendado).
- **FFmpeg**: Necessário para exportação de vídeo com Remotion (geralmente instalado automaticamente ou disponível no sistema).
- **Git**

### Passo a Passo de Instalação

1. Clone o repositório:
```bash
git clone https://github.com/fabian71/Stock_Video_Factory.git
cd Stock_Video_Factory
```
*(Ou acerte o caminho local caso já esteja na pasta `C:\lab\video_remotion`)*

2. Instale as dependências:
```bash
npm install
```
> [!TIP]
> No Windows PowerShell, caso encontre restrições de script de execução, utilize `npm.cmd` em vez de `npm`:
> ```powershell
> npm.cmd install
> ```

---

## 🎥 Como Iniciar os Servidores

O projeto conta com dois ambientes de servidor disponíveis:

### 1. Painel de Controle Web (Recomendado)
Inicia a interface de produção Next.js com Remotion Player interativo:
```bash
npm run dev
# ou no Windows: npm.cmd run dev
```
Acesse no seu navegador: **[http://localhost:3001](http://localhost:3001)**

### 2. Remotion Studio Nativo
Inicia o estúdio clássico do Remotion para depuração de timeline:
```bash
npm run studio
# ou especificando porta caso a 3000 esteja em uso:
npx remotion studio --port 3002
```

---

## 🎨 Como Criar e Renderizar Vídeos

Existem **3 formas** de gerar e exportar vídeos com o projeto:

### Método 1: Pela Interface Web (Mais Fácil)

1. Inicie o servidor (`npm run dev`) e abra `http://localhost:3001`.
2. Navegue pelos painéis na barra lateral esquerda:
   - **Visual (Style)**:
     - Escolha o estilo de fundo (`auroraFlow`, `liquidMetal`, `neuralPlexus`, `topographic`, etc.).
     - Escolha a camada de overlay (`embers`, `plexus`, `dataFlow`, etc.).
     - Escolha ou randomize a paleta de cores.
     - Ajuste partículas, distorção, glow e simetria.
     - Aplique **Presets** prontos (ex: *Fintech Neural Field*, *Luxury Refraction*, *Medical Topographic*, *AI Aurora Mesh*).
   - **Cena (Scene)**:
     - Defina o formato (`16:9`, `9:16`, `4:3`, `2:3`).
     - Defina a resolução (`1080p` ou `4k`).
     - Defina a taxa de FPS (`24`, `30`, `60`) e duração do loop (em segundos).
     - Altere a **Seed** para gerar variações matemáticas determinísticas.
   - **Movimento (Motion)**:
     - Ajuste o material do asset (`neon`, `glass`, `liquidMetal`).
     - Escolha o campo de força (`vortex`, `inverseGravity`, `orbital`).
     - Ajuste o motion blur e complexidade da física.
   - **Assets**:
     - Faça upload ou selecione um arquivo `.svg` ou `.png` existente.
     - Ajuste a escala, opacidade e efeitos de contorno/glow.
   - **Render**:
     - Clique em **Render Single** para renderizar o vídeo atual.
     - Ou defina uma quantidade (ex: 8) e clique em **Render Batch** para gerar múltiplas variações automaticamente.
3. Os vídeos exportados são salvos em:
   ```text
   out/app/
   ```

---

### Método 2: Em Lote via Linha de Comando (CLI Batch)

Ideal para produzir centenas de vídeos para microstock de uma só vez a partir de uma pasta de ícones:

1. **Adicione os arquivos de imagem/vetor**:
   Coloque seus arquivos `.svg` ou `.png` dentro do diretório:
   ```text
   public/assets/
   ```

2. **Gere o plano de produção**:
   ```bash
   npm run batch:plan
   # ou: npm.cmd run batch:plan
   ```
   *Este comando lê todos os arquivos em `public/assets/`, cria permutações nos formatos `16:9`, `9:16`, `4:3` e `2:3`, variando paletas, shaders e campos de força, e gera o arquivo `src/generated/batch.ts`.*

3. **Inicie a renderização dos vídeos**:
   ```bash
   npm run batch:render
   # ou: npm.cmd run batch:render
   ```
   *Os vídeos finais codificados em H.264 MP4 serão salvos em:*
   ```text
   out/batch/
   ```

---

### Método 3: Renderização Direta de um Único Arquivo via Remotion CLI

Para renderizar diretamente a composição padrão com o Remotion:
```bash
npm run render
# ou: npm.cmd run render
```
O arquivo de saída será salvo em:
```text
out/stock-video.mp4
```

---

## ⚙️ Parâmetros Principais de Customização

| Parâmetro | Valores / Tipo | Descrição |
| :--- | :--- | :--- |
| `format` | `16:9`, `9:16`, `4:3`, `2:3` | Proporção de tela do vídeo |
| `resolution` | `1080p`, `4k` | Resolução do vídeo (Full HD ou Ultra HD) |
| `fps` | `24`, `30`, `60` | Taxa de quadros por segundo |
| `durationSeconds`| `3` a `60` | Duração de cada ciclo de loop (em segundos) |
| `seed` | Número inteiro | Semente determinística para física, partículas e ruído |
| `material` | `neon`, `glass`, `liquidMetal` | Estilo de material aplicado ao asset central |
| `forceField` | `vortex`, `inverseGravity`, `orbital` | Tipo de força física atuando na cena |
| `compositionGrid` | `thirds`, `center`, `radial` | Alinhamento e âncora de enquadramento |
| `bgStyle` | 30+ opções (`auroraFlow`, `plasmaSheet`, etc.) | Shader base de fundo |
| `overlayStyle` | 20+ opções (`embers`, `plexus`, `bokeh`, etc.) | Camada de partículas e efeitos de primeiro plano |
| `particleCount` | `0` a `240` | Densidade de partículas em suspensão |
| `motionBlur` | `0.0` a `1.0` | Intensidade do desfoque de movimento |
| `seamlessLoop` | `true` / `false` | Garante continuidade matemática perfeita do primeiro ao último quadro |

---

## 📁 Estrutura de Pastas

```text
video_remotion/
├── public/
│   └── assets/             # Arquivos SVG e PNG utilizados na renderização
├── scripts/
│   ├── generate-batch.mjs  # Cria o plano de renderização em lote
│   └── render-batch.mjs    # Renderiza em lote a partir do plano gerado
├── src/
│   ├── app/                # Painel Web Next.js (páginas, APIs e controles)
│   │   ├── api/assets/     # Endpoint para upload e listagem de assets
│   │   ├── api/render/     # Endpoint para disparo de renderização sob demanda
│   │   └── page.tsx        # Interface completa com Remotion Player
│   ├── components/         # Camadas visuais (Partículas, Plexus, SelfDrawing)
│   ├── composition/        # Grids e âncoras de enquadramento
│   ├── config/             # Schemas Zod, presets e configurações da fábrica
│   ├── generated/          # Planos gerados para renderização em lote
│   ├── palette/            # Gerador de paletas de cor via Chroma.js
│   ├── physics/            # Linha de tempo física calculada com Rapier.js
│   ├── three/              # Shaders GLSL e componentes Three.js
│   ├── Root.tsx            # Ponto de entrada das composições Remotion
│   ├── StockVideoFactory.tsx # Composição principal do vídeo
│   └── index.ts            # Entrypoint de bundling do Remotion
├── out/                    # Diretório onde os arquivos MP4 são salvos
├── remotion.config.ts      # Configurações de render do Remotion
└── package.json            # Scripts e dependências do projeto
```

---

## 🛠️ Tecnologias Utilizadas

- **[Remotion](https://www.remotion.dev/)**: Criação de vídeos programáticos em React e TypeScript.
- **[Next.js](https://nextjs.org/)** (v16 Turbopack): Interface interativa e APIs de renderização.
- **[Three.js](https://threejs.org/) & [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)**: Efeitos de iluminação, distorção e shaders GLSL.
- **[@dimforge/rapier2d-compat](https://rapier.rs/)**: Motor de física 2D de alta performance baseado em WebAssembly.
- **[Chroma-js](https://gka.github.io/chroma.js/)**: Cálculo e interpolação de paletas cromáticas harmônicas.
- **[Zod](https://zod.dev/)**: Validação tipada de parâmetros de entrada.

---

## 📄 Licença

Uso privado e comercial conforme termos de licenciamento do Remotion e das bibliotecas utilizadas.
