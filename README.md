# Duanix | Tecnologia & Automação

Site de apresentação da Duanix (HTML + CSS + JavaScript puros, sem frameworks).

## Como abrir no VS Code

1. Abra a pasta `duanix-site` no VS Code (Arquivo > Abrir Pasta).
2. Instale a extensão **Live Server** (o VS Code vai sugerir sozinho).
3. Clique com o botão direito em `index.html` > **Open with Live Server**.

> Use o Live Server (ou outro servidor local). Abrindo o `index.html` com duplo clique,
> o brilho que passa pelo logo pode não aparecer, porque o navegador bloqueia imagens usadas como máscara em arquivos locais.

## Estrutura das pastas

```
duanix-site/
├── index.html                  Página principal (textos e estrutura)
├── css/
│   └── style.css               Todo o visual: cores, tamanhos, animações
├── js/
│   └── main.js                 Efeitos: luzes do logo, fundo animado, texto digitado,
│                               menu, cards conectados e linhas de ligação
├── assets/
│   └── img/
│       ├── logo-duanix.webp        Logo do topo (fundo transparente)
│       ├── icone-sites.webp        Ícones dos serviços (topo e cards)
│       ├── icone-landing-pages.webp
│       ├── icone-automacao.webp
│       ├── icone-ecommerce.webp
│       ├── icone-ia.webp
│       ├── logo-quadrado.jpg       Logo quadrado (usado no CSS)
│       ├── favicon.jpg             Ícone da aba do navegador
│       └── originais/              Arquivos de origem e versões antigas (não usados no site)
├── versao-arquivo-unico/
│   └── index.html              Site inteiro em 1 arquivo só (imagens embutidas)
├── .github/
│   └── workflows/
│       └── deploy.yml          Publicação automática no GitHub Pages
└── .vscode/
    └── extensions.json         Extensões recomendadas
```

## Onde mudar as coisas

| O que mudar | Onde |
|---|---|
| Textos do site | `index.html` |
| Número e mensagem do WhatsApp | `index.html` (procure por `wa.me`) |
| E-mail de contato | `index.html` (procure por `mailto:`) |
| Cores | `css/style.css`, bloco `:root` no começo |
| Tamanho do logo | `css/style.css`, regra `.logo-stage` (propriedade `width`) |
| Palavras que o texto digitado troca ("sites profissionais", "landing pages"...) | `js/main.js`, lista `words` |
| Velocidade e brilho do fundo de pontos | `js/main.js`, bloco "FUNDO: REDE DE PONTOS" |
| Efeitos do logo, do título e dos ícones | `css/style.css`, bloco "EFEITOS EXTRAS" |

## Fontes

As fontes (Inter, Orbitron, Montserrat e Kaushan Script) vêm do Google Fonts pelo `<link>` no `<head>` do `index.html`, então é preciso internet para elas aparecerem.

## Publicar

Basta enviar a pasta inteira para a hospedagem (Vercel, Netlify etc.), mantendo as pastas como estão.

### GitHub Pages

O workflow `.github/workflows/deploy.yml` publica o site automaticamente quando há um push para `main` ou `master`.

1. Envie estes arquivos para um repositório no GitHub.
2. No repositório, acesse **Settings > Pages**.
3. Em **Build and deployment > Source**, selecione **GitHub Actions**.
4. Faça um push para `main` ou `master` (ou execute manualmente o workflow **Deploy to GitHub Pages** na aba **Actions**).

Após o primeiro deploy, o endereço do site aparece em **Settings > Pages** e no resultado da execução do workflow.
