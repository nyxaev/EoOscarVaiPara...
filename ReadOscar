<div align="center">

# 🏆 Oscar · Exercícios de MongoDB

**Quase 100 anos de história do cinema, explorados com consultas em mongosh.**

</div>

---

## 📖 Sobre o projeto

Resolução dos exercícios de MongoDB sobre a base de indicados e vencedores do **Oscar** (cerimônias de 1928 a 2024). São **13 níveis**, indo de contagens simples até pipelines de agregação com análise histórica, estatística e curadoria de dados.

Cada pergunta tem a **resposta** e o **código mongosh** usado para chegar nela.

| | |
|---|---|
| 🎬 **Registros** | 10.889 indicações |
| 🗓️ **Cerimônias** | 96 (1928 a 2024) |
| 🗂️ **Categorias** | 115 |
| 🏅 **Vencedores** | 2.464 |

---

## 📁 Estrutura do repositório

```
.
├── OSCAR.json                      # base de dados (dump em JSON)
├── oscar_respostas_com_codigo.md   # ⭐ respostas + código de cada questão
├── oscar_consultas.js              # todas as queries em um único script
└── README.md
```

---

## 🚀 Como rodar

### 1. Importar os dados no Compass

1. Abra o **MongoDB Compass** e conecte em `mongodb://localhost:27017`.
2. Clique em **Create Database** e crie, por exemplo, o banco `oscar` com a collection `oscar_indicados`.
3. Dentro da collection, clique em **Add Data → Import JSON or CSV file** e escolha o `OSCAR.json`.

### 2. Conferir a importação

Abra o **`>_MONGOSH`** no rodapé do Compass e rode, uma linha por vez:

```js
use oscar
db.oscar_indicados.countDocuments()   // deve retornar 10889
```

> Se a sua collection tiver outro nome, troque `oscar_indicados` nas queries (Localizar e Substituir no editor).

### 3. Limpar os dados

O arquivo tem alguns registros inconsistentes. Rode a seção **"Preparação"** do [`oscar_respostas_com_codigo.md`](oscar_respostas_com_codigo.md) antes de qualquer consulta. Ela também define as variáveis usadas nas queries (`PIC`, `ATUACAO`, `decada`).

### 4. Executar as consultas

Cole as queries **uma seção por vez** no mongosh. Evite colar o arquivo inteiro: algumas questões do **Nível 7** alteram ou apagam dados.

---

## 🧭 Níveis

| Nível | Tema | Exemplo |
|:---:|---|---|
| 1 | Primeiros passos | contar registros, categorias e cerimônias |
| 2 | Explorando categorias | categoria com mais indicações |
| 3 | Atores e atrizes famosos | Natalie Portman, Viola Davis, Amy Adams, Denzel Washington |
| 4 | Vencedores históricos | primeiro Melhor Ator e Melhor Atriz |
| 5 | Análise de indicações | quem tem mais indicações sem nunca ter ganhado |
| 6 | Análise de filmes | Toy Story, Crash, Central do Brasil |
| 7 | Atualização de dados | `updateMany`, `insertMany`, `deleteMany` |
| 8 | Análise temporal | indicações por década |
| 9 | Questões históricas | Sidney Poitier, representatividade, coincidências |
| 10 | Análise avançada | taxa de conversão, anos consecutivos |
| 11 | Desafios complexos | rankings, "azarões", competitividade |
| 12 | Casos práticos | mostra de cinema, documentário, estatísticas |
| 13 | Queries criativas | empates, loteria de vencedores, padrões de nomes |

---

## ✨ Alguns destaques

- 🎭 **Meryl Streep** é a mais indicada em atuação: **21 indicações** e 3 Oscars.
- 🎬 **Ben-Hur**, **Titanic** e **O Senhor dos Anéis: O Retorno do Rei** empatam como os mais premiados, com **11 Oscars** cada.
- 🥈 **Peter O'Toole** e **Glenn Close** têm 8 indicações e nenhuma vitória.
- 📅 **1943** foi o ano com mais registros de indicações: **186**.
- 🎞️ Em **69** cerimônias o filme vencedor de Melhor Filme também levou Melhor Diretor.

---

## 🔎 Observações sobre os dados

Pontos que merecem atenção ao trabalhar com este arquivo:

- **Registros "sujos":** um `ano_cerimonia` escrito por extenso, um campo `ven cedor` (com espaço) e alguns campos intrusos. A seção de preparação corrige tudo.
- **"NULL" é texto:** o valor aparece como a string `"NULL"`, não como `null`. São 319 registros, quase todos prêmios honorários.
- **Melhor Filme mudou de nome** ao longo dos anos (`OUTSTANDING PICTURE`, `OUTSTANDING PRODUCTION`, `BEST MOTION PICTURE`, `BEST PICTURE`, entre outros). As queries consideram todos.
- **Nomes de filmes se repetem** (remakes como *Titanic* e *West Side Story*), então os rankings agrupam por filme **e** ano de filmagem.
- **Sem dados de gênero ou raça:** as questões 9.3 e 9.4 usam listas de nomes informadas manualmente.
- Os exercícios 1.6 (indicados de 2025 e 2026) e 7.x (escrita) trazem os scripts, mas dependem de dados ou decisões do usuário.

---

## 🧰 Técnicas utilizadas

- `find`, `distinct`, `countDocuments` com filtros e projeções
- Pipelines com `$match`, `$group`, `$sort`, `$project`, `$addFields`, `$sample`
- `$addToSet`, `$push`, `$first`, `$min`, `$avg`
- Expressões com `$cond`, `$filter`, `$reduce`, `$split`, `$size`
- Atualizações com pipeline (`updateMany` com `$set` e `$trim`)
- Expressões regulares em filtros de texto

---

## 👤 Autor

**Seu nome** · [@seu-usuario](https://github.com/seu-usuario)

Trabalho acadêmico de MongoDB. Os dados pertencem à base de exercícios fornecida pelo professor.
