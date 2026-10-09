# Oscar – Exercícios MongoDB: respostas e código

Variáveis usadas nas consultas:

```js
// "Melhor Filme" teve nomes diferentes ao longo dos anos
var PIC = ["BEST PICTURE","OUTSTANDING PICTURE","BEST MOTION PICTURE","OUTSTANDING MOTION PICTURE","OUTSTANDING PRODUCTION"];
var LEAD = ["ACTOR","ACTOR IN A LEADING ROLE"];
var ATUACAO = /^(ACTOR|ACTRESS)/;
var PRINCIPAIS = /^(ACTOR|ACTRESS)( IN A LEADING ROLE)?$/;
var decada = { $subtract: ["$ano_cerimonia", { $mod: ["$ano_cerimonia", 10] }] };
```

---

## Nível 1

**1.1** R: **10889 registros**
```js
db.oscar_indicados.countDocuments();
```

**1.2** R: **115 categorias** (o enunciado diz 92, mas o arquivo tem 115)
```js
db.oscar_indicados.distinct("categoria").length;
db.oscar_indicados.distinct("categoria");
```

**1.3** R: **1928** (o "1500" do exemplo está errado)
```js
db.oscar_indicados.find({}, { ano_cerimonia: 1, _id: 0 }).sort({ ano_cerimonia: 1 }).limit(1);
```

**1.4** R: **2024**
```js
db.oscar_indicados.find({}, { ano_cerimonia: 1, _id: 0 }).sort({ ano_cerimonia: -1 }).limit(1);
```

**1.5** R: **96 cerimônias**
```js
db.oscar_indicados.distinct("cerimonia").length;
```

**1.6** R: inserir 2025 e 2026 (a base termina em 2024). Template, a completar com a lista oficial:
```js
var prox = (db.oscar_indicados.find().sort({ id_registro: -1 }).limit(1).toArray()[0] || { id_registro: 0 }).id_registro + 1;
db.oscar_indicados.insertMany([
  { id_registro: prox, ano_filmagem: 2024, ano_cerimonia: 2025, cerimonia: 97,
    categoria: "BEST PICTURE", nome_do_indicado: "Producers de Anora", nome_do_filme: "Anora", vencedor: 1 }
  // ... demais indicados de 2025 (cerimônia 97) e 2026 (cerimônia 98), incrementando id_registro
]);
```

---

## Nível 2

**2.1** R: 115 categorias. Maiores: DIRECTING 469, FILM EDITING 450, ACTOR IN A SUPPORTING ROLE 440, ACTRESS IN A SUPPORTING ROLE 440, DOCUMENTARY (Short Subject) 378
```js
db.oscar_indicados.aggregate([
  { $group: { _id: "$categoria", total: { $sum: 1 } } },
  { $sort: { total: -1 } }
]);
```

**2.2** R: **DIRECTING (469)**
```js
db.oscar_indicados.aggregate([
  { $group: { _id: "$categoria", total: { $sum: 1 } } },
  { $sort: { total: -1 } }, { $limit: 1 }
]);
```

**2.3** R: quatro empatam com 1 indicação: SPECIAL ACHIEVEMENT AWARD (Sound Effects), SPECIAL ACHIEVEMENT AWARD (Sound Editing), GORDON E. SAWYER AWARD, AWARD OF COMMENDATION
```js
db.oscar_indicados.aggregate([
  { $group: { _id: "$categoria", total: { $sum: 1 } } },
  { $sort: { total: 1 } }, { $limit: 5 }
]);
```

**2.4** R: última cerimônia com "ACTRESS": **1976**. Deixou de existir a partir de **1977** (virou ACTRESS IN A LEADING ROLE)
```js
db.oscar_indicados.find({ categoria: "ACTRESS" }, { ano_cerimonia: 1, _id: 0 }).sort({ ano_cerimonia: -1 }).limit(1);
```

**2.5** R: ACTOR, ACTRESS, ART DIRECTION, DIRECTING (Comedy Picture), DIRECTING (Dramatic Picture), ENGINEERING EFFECTS, OUTSTANDING PICTURE, SPECIAL AWARD, UNIQUE AND ARTISTIC PICTURE, WRITING (Adaptation), WRITING (Original Story), WRITING (Title Writing). (ACTOR, ACTRESS, ART DIRECTION e OUTSTANDING PICTURE só mudaram de nome.)
```js
var hoje = db.oscar_indicados.distinct("categoria", { cerimonia: 96 });
db.oscar_indicados.distinct("categoria", { cerimonia: 1 }).filter(c => !hoje.includes(c));
```

**2.6** R: DIRECTING, DIRECTING (Comedy Picture), DIRECTING (Dramatic Picture)
```js
db.oscar_indicados.distinct("categoria", { categoria: /DIRECTING/ });
```

---

## Nível 3

**3.1** R: **3 indicações**
```js
db.oscar_indicados.countDocuments({ nome_do_indicado: "Natalie Portman" });
```

**3.2** R: **1 Oscar**
```js
db.oscar_indicados.countDocuments({ nome_do_indicado: "Natalie Portman", vencedor: 1 });
```

**3.3** R: 2005 *Closer*; 2011 *Black Swan*; 2017 *Jackie*
```js
db.oscar_indicados.find({ nome_do_indicado: "Natalie Portman" },
  { ano_cerimonia: 1, nome_do_filme: 1, _id: 0 }).sort({ ano_cerimonia: 1 });
```

**3.4** R: 2005, ACTRESS IN A SUPPORTING ROLE, Closer, não · 2011, ACTRESS IN A LEADING ROLE, Black Swan, **sim** · 2017, ACTRESS IN A LEADING ROLE, Jackie, não
```js
db.oscar_indicados.find({ nome_do_indicado: "Natalie Portman" },
  { ano_cerimonia: 1, categoria: 1, nome_do_filme: 1, vencedor: 1, _id: 0 }).sort({ ano_cerimonia: 1 });
```

**3.5** R: **4 indicações**
```js
db.oscar_indicados.countDocuments({ nome_do_indicado: "Viola Davis" });
```

**3.6** R: **1 Oscar** (*Fences*, 2017)
```js
db.oscar_indicados.countDocuments({ nome_do_indicado: "Viola Davis", vencedor: 1 });
```

**3.7** R: *Doubt* (2009), *The Help* (2012), *Fences* (2017), *Ma Rainey's Black Bottom* (2021)
```js
db.oscar_indicados.find({ nome_do_indicado: "Viola Davis" },
  { ano_cerimonia: 1, nome_do_filme: 1, vencedor: 1, _id: 0 }).sort({ ano_cerimonia: 1 });
```

**3.8** R: **Não**
```js
db.oscar_indicados.countDocuments({ nome_do_indicado: "Amy Adams", vencedor: 1 });   // 0
```

**3.9** R: **6 indicações sem ganhar**
```js
db.oscar_indicados.countDocuments({ nome_do_indicado: "Amy Adams", vencedor: 0 });
```

**3.10** R: **Sim**
```js
db.oscar_indicados.countDocuments({ nome_do_indicado: "Denzel Washington", vencedor: 1 });   // 2
```

**3.11** R: **9 indicações**
```js
db.oscar_indicados.countDocuments({ nome_do_indicado: "Denzel Washington" });
```

**3.12** R: 1990, ACTOR IN A SUPPORTING ROLE, *Glory* · 2002, ACTOR IN A LEADING ROLE, *Training Day*
```js
db.oscar_indicados.find({ nome_do_indicado: "Denzel Washington", vencedor: 1 },
  { ano_cerimonia: 1, categoria: 1, nome_do_filme: 1, _id: 0 });
```

---

## Nível 4

**4.1** R: **Janet Gaynor, 1928, *7th Heaven***
```js
db.oscar_indicados.find({ categoria: "ACTRESS", vencedor: 1 }).sort({ ano_cerimonia: 1 }).limit(1);
```

**4.2** R: **Emil Jannings, 1928, *The Last Command***
```js
db.oscar_indicados.find({ categoria: "ACTOR", vencedor: 1 }).sort({ ano_cerimonia: 1 }).limit(1);
```

**4.3** R: **2464 vencedores**
```js
db.oscar_indicados.countDocuments({ vencedor: 1 });
```

**4.4** R: **96 vencedores**, de *Wings* (1928) a *Oppenheimer* (2024); não há registro de 1934. Só com "OUTSTANDING PICTURE" + "BEST PICTURE" seriam 64, porque 1930-1962 usam outros nomes.
```js
db.oscar_indicados.find({ categoria: { $in: PIC }, vencedor: 1 },
  { ano_cerimonia: 1, nome_do_filme: 1, _id: 0 }).sort({ ano_cerimonia: 1 });
```

**4.5** R: **1328 filmes diferentes**
```js
db.oscar_indicados.distinct("nome_do_filme", { vencedor: 1, nome_do_filme: { $ne: "NULL" } }).length;
```

---

## Nível 5 (atores/atrizes = categorias ACTOR/ACTRESS, incluindo coadjuvantes)

```js
var porNome = [
  { $match: { categoria: ATUACAO, nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_indicado", indicacoes: { $sum: 1 }, vitorias: { $sum: "$vencedor" } } }
];
```

**5.1** R: **362 pessoas** com mais de uma indicação (lista completa na saída)
```js
db.oscar_indicados.aggregate([...porNome, { $match: { indicacoes: { $gt: 1 } } }, { $sort: { indicacoes: -1 } }]);
```

**5.2** R: **Meryl Streep, 21 indicações** (3 Oscars)
```js
db.oscar_indicados.aggregate([...porNome, { $sort: { indicacoes: -1 } }, { $limit: 3 }]);
```

**5.3** R: 26 pessoas, entre elas Peter O'Toole (8), Glenn Close (8), Richard Burton (7), Deborah Kerr (6), Thelma Ritter (6), Amy Adams (6), Irene Dunne (5), Arthur Kennedy (5), Albert Finney (5), Annette Bening (5), Michelle Williams (5), Bradley Cooper (5)
```js
db.oscar_indicados.aggregate([...porNome, { $match: { indicacoes: { $gt: 3 }, vitorias: 0 } }, { $sort: { indicacoes: -1 } }]);
```

**5.4** R: **633 nomes** aparecem em mais de uma categoria (parte é só renomeação, ex.: ACTOR → ACTOR IN A LEADING ROLE)
```js
db.oscar_indicados.aggregate([
  { $match: { nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_indicado", categorias: { $addToSet: "$categoria" } } },
  { $match: { "categorias.1": { $exists: true } } }
]);
```

**5.5** R: **5589**
```js
db.oscar_indicados.aggregate([
  { $match: { nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_indicado", n: { $sum: 1 } } },
  { $match: { n: 1 } }, { $count: "indicados_com_1_indicacao" }
]);
```

**5.6** R: **186 registros, em 1943** (depois 1942 com 183 e 1944 com 182). Contando pessoas distintas: 164, em 1944.
```js
db.oscar_indicados.aggregate([
  { $group: { _id: "$ano_cerimonia", indicacoes: { $sum: 1 } } },
  { $sort: { indicacoes: -1 } }, { $limit: 3 }
]);
// variante: pessoas distintas
db.oscar_indicados.aggregate([
  { $group: { _id: "$ano_cerimonia", nomes: { $addToSet: "$nome_do_indicado" } } },
  { $project: { distintos: { $size: "$nomes" } } }, { $sort: { distintos: -1 } }, { $limit: 3 }
]);
```

---

## Nível 6

**6.1** R: **2011** (*Toy Story 3*) e **2020** (*Toy Story 4*)
```js
db.oscar_indicados.distinct("ano_cerimonia", { nome_do_filme: /^Toy Story/, vencedor: 1 });
```

**6.2** R: **11 indicações**
```js
db.oscar_indicados.countDocuments({ nome_do_filme: /^Toy Story/ });
```

**6.3** R: Toy Story: MUSIC (Original Musical or Comedy Score), MUSIC (Original Song), WRITING (Screenplay Written Directly for the Screen) · Toy Story 2: MUSIC (Original Song) · Toy Story 3: ANIMATED FEATURE FILM (ganhou), BEST PICTURE, MUSIC (Original Song) (ganhou), SOUND EDITING, WRITING (Adapted Screenplay) · Toy Story 4: ANIMATED FEATURE FILM (ganhou), MUSIC (Original Song)
```js
db.oscar_indicados.aggregate([
  { $match: { nome_do_filme: /^Toy Story/ } },
  { $group: { _id: { filme: "$nome_do_filme", cat: "$categoria" }, venceu: { $max: "$vencedor" } } },
  { $sort: { "_id.filme": 1 } }
]);
```

**6.4** R: **cerimônia de 2006 (78ª)**
```js
db.oscar_indicados.distinct("ano_cerimonia", { nome_do_filme: "Crash" });
```

**6.5** R: **6 indicações**
```js
db.oscar_indicados.countDocuments({ nome_do_filme: "Crash" });
```

**6.6** R: **Sim** (BEST PICTURE; também ganhou Film Editing e Original Screenplay)
```js
db.oscar_indicados.find({ nome_do_filme: "Crash", categoria: { $in: PIC } });   // vencedor: 1
```

**6.7** R: **Sim**, com o título em inglês: *Central Station*
```js
db.oscar_indicados.find({ nome_do_filme: /Central Station/ });
```

**6.8** R: **2 indicações** (Fernanda Montenegro em ACTRESS e Brazil em FOREIGN LANGUAGE FILM, cerimônia de 1999)
```js
db.oscar_indicados.countDocuments({ nome_do_filme: "Central Station" });
```

---

## Nível 7 (escrita: faça um export/backup antes)

**7.1** R: nada a converter, `vencedor` já é número (0/1). Conferência: 0 registros com string.
```js
db.oscar_indicados.countDocuments({ vencedor: { $type: "string" } });   // 0
// Se o professor exigir booleano:
// db.oscar_indicados.updateMany({}, [{ $set: { vencedor: { $eq: ["$vencedor", 1] } } }]);
```

**7.2** R: inseridos 3 filmes nunca indicados (em collection separada, para não alterar as estatísticas)
```js
["Drive", "Paddington 2", "Heat"].map(f => db.oscar_indicados.countDocuments({ nome_do_filme: f }));   // 0 0 0
db.filmes_nao_indicados.insertMany([
  { nome_do_filme: "Drive",        ano_filmagem: 2011, diretor: "Nicolas Winding Refn", motivo: "Fotografia, trilha e montagem marcantes" },
  { nome_do_filme: "Paddington 2", ano_filmagem: 2017, diretor: "Paul King",            motivo: "Roteiro e direção impecáveis" },
  { nome_do_filme: "Heat",         ano_filmagem: 1995, diretor: "Michael Mann",         motivo: "Direção, som e atuações" }
]);
```

**7.3** R: nova categoria com os vencedores 2020-2024: Parasite (2020), Another Round (2021), Drive My Car (2022), All Quiet on the Western Front (2023), The Zone of Interest (2024)
```js
var p = (db.oscar_indicados.find().sort({ id_registro: -1 }).limit(1).toArray()[0] || { id_registro: 0 }).id_registro + 1;
var docs = db.oscar_indicados.find(
    { categoria: "INTERNATIONAL FEATURE FILM", vencedor: 1, ano_cerimonia: { $gte: 2020, $lte: 2024 } }, { _id: 0 })
  .toArray().map((d, i) => ({ ...d, id_registro: p + i, categoria: "BEST INTERNATIONAL FEATURE FILM" }));
db.oscar_indicados.insertMany(docs);
```

**7.4** R: 3 filmes com espaços duplos corrigidos (*Paramount News Issue #37...*, *Volcano: An Inquiry...*, *You Are Free (Ihr Zent Frei)*)
```js
db.oscar_indicados.find({ nome_do_filme: /(^\s|\s$|\s{2,})/ }, { nome_do_filme: 1 });   // antes
db.oscar_indicados.updateMany({ nome_do_filme: /(^\s|\s$|\s{2,})/ }, [{ $set: { nome_do_filme: { $trim: { input: {
  $reduce: { input: { $filter: { input: { $split: ["$nome_do_filme", " "] }, cond: { $ne: ["$$this", ""] } } },
             initialValue: "", in: { $cond: [{ $eq: ["$$value", ""] }, "$$this", { $concat: ["$$value", " ", "$$this"] }] } } } } } } }]);
```

**7.5** R: remove **319 registros** (o "NULL" é a string "NULL"; quase todos são prêmios honorários)
```js
db.oscar_indicados.countDocuments({ nome_do_filme: "NULL" });   // 319
db.oscar_indicados.deleteMany({ nome_do_filme: "NULL" });
```

---

## Nível 8

**8.1** R: 1920s 73 · 1930s 711 · 1940s 1501 · 1950s 1188 · 1960s 1195 · 1970s 1056 · 1980s 1060 · 1990s 1113 · 2000s 1120 · 2010s 1250 · 2020s 622
```js
db.oscar_indicados.aggregate([{ $group: { _id: decada, indicacoes: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
```

**8.2** R: **década de 1940 (1501)**
```js
db.oscar_indicados.aggregate([{ $group: { _id: decada, indicacoes: { $sum: 1 } } }, { $sort: { indicacoes: -1 } }, { $limit: 1 }]);
```

**8.3** R: 1920s 15 · 1930s 27 · 1940s 38 · 1950s 43 · 1960s 40 · 1970s 50 · 1980s 34 · 1990s 31 · 2000s 31 · 2010s 30 · 2020s 31
```js
db.oscar_indicados.aggregate([
  { $group: { _id: { d: decada, c: "$categoria" } } },
  { $group: { _id: "$_id.d", categorias_unicas: { $sum: 1 } } }, { $sort: { _id: 1 } }
]);
```

**8.4** R: **1943, com 186 indicações**
```js
db.oscar_indicados.aggregate([{ $group: { _id: "$ano_cerimonia", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 1 }]);
```

**8.5** R: bruto, de 73 para 622 = **+752%**. As duas décadas são incompletas (2 e 5 cerimônias); por cerimônia, 36,5 contra 124,4 = **+241%**
```js
var dec = db.oscar_indicados.aggregate([
  { $group: { _id: decada, total: { $sum: 1 }, cer: { $addToSet: "$ano_cerimonia" } } },
  { $project: { total: 1, cerimonias: { $size: "$cer" }, media: { $divide: ["$total", { $size: "$cer" }] } } },
  { $sort: { _id: 1 } }]).toArray();
var a = dec[0], z = dec[dec.length - 1];
print("Bruto:", ((z.total - a.total) / a.total * 100).toFixed(1) + "%");
print("Por cerimônia:", ((z.media - a.media) / a.media * 100).toFixed(1) + "%");
```

---

## Nível 9

**9.1** R: **1959, *The Defiant Ones***
```js
db.oscar_indicados.find({ nome_do_indicado: "Sidney Poitier" },
  { ano_cerimonia: 1, nome_do_filme: 1, vencedor: 1, _id: 0 }).sort({ ano_cerimonia: 1 });
```

**9.2** R: **Não.** Ele ganhou na indicação seguinte, em 1964, por *Lilies of the Field* (mesma query da 9.1: `vencedor: 0` em 1959 e `1` em 1964).

**9.3** R: a base não tem campo de raça. Com a lista abaixo: **7 indicações de 6 pessoas** antes de 1970. Confira a lista antes de entregar.
```js
var negros = ["Hattie McDaniel","Ethel Waters","Dorothy Dandridge","Sidney Poitier","Juanita Moore","Beah Richards"];
db.oscar_indicados.find({ nome_do_indicado: { $in: negros }, categoria: ATUACAO, ano_cerimonia: { $lt: 1970 } },
  { nome_do_indicado: 1, ano_cerimonia: 1, categoria: 1, nome_do_filme: 1, vencedor: 1, _id: 0 }).sort({ ano_cerimonia: 1 });
```

**9.4** R: a base não tem gênero do diretor. Com a lista abaixo, filmes que ganharam Oscar: *The Piano* (3), *The Hurt Locker* (6), *Nomadland* (3), *Lost in Translation* (1), *Promising Young Woman* (1), *The Power of the Dog* (1), *Anatomy of a Fall* (1)
```js
var mulheres = ["Lina Wertmüller","Jane Campion","Sofia Coppola","Kathryn Bigelow","Greta Gerwig","Chloé Zhao","Emerald Fennell","Justine Triet"];
var filmesDelas = db.oscar_indicados.distinct("nome_do_filme", { categoria: /^DIRECTING/, nome_do_indicado: { $in: mulheres } });
db.oscar_indicados.aggregate([
  { $match: { nome_do_filme: { $in: filmesDelas }, vencedor: 1 } },
  { $group: { _id: "$nome_do_filme", oscars: { $sum: 1 }, categorias: { $addToSet: "$categoria" } } }
]);
```

**9.5** R: **Não.** Jamie Foxx só aparece em 2005; Denzel em 1988, 1990, 1993, 2000, 2002, 2013, 2017, 2018 e 2022.
```js
var anosD = db.oscar_indicados.distinct("ano_cerimonia", { nome_do_indicado: "Denzel Washington" });
var anosJ = db.oscar_indicados.distinct("ano_cerimonia", { nome_do_indicado: "Jamie Foxx" });
anosD.filter(x => anosJ.includes(x));   // []
```

**9.6** R: não se aplica (não houve ano em comum).

**9.7** R: **355 casos**. Maiores: *Ben-Hur* (1960, 11), *Titanic* (1998, 11), *O Retorno do Rei* (2004, 11), *West Side Story* (1962, 10), *Gigi* (9), *The Last Emperor* (9)
```js
db.oscar_indicados.aggregate([
  { $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, oscars: { $sum: 1 } } },
  { $match: { oscars: { $gt: 1 } } }, { $sort: { oscars: -1 } }, { $limit: 20 }
]);
```

---

## Nível 10

**10.1** R: **69 filmes** ganharam Melhor Filme e Melhor Diretor na mesma cerimônia (de *All Quiet on the Western Front* a *Oppenheimer*)
```js
db.oscar_indicados.aggregate([
  { $match: { vencedor: 1, $or: [{ categoria: { $in: PIC } }, { categoria: /^DIRECTING/ }] } },
  { $group: { _id: { c: "$cerimonia", f: "$nome_do_filme" },
              tipos: { $addToSet: { $cond: [{ $in: ["$categoria", PIC] }, "FILME", "DIRETOR"] } } } },
  { $match: { tipos: { $all: ["FILME", "DIRETOR"] } } }, { $sort: { "_id.c": 1 } }
]);
```

**10.2** R: empate com **14 indicações**: *All about Eve* (1951), *Titanic* (1998), *La La Land* (2017)
```js
db.oscar_indicados.aggregate([
  { $match: { nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, indicacoes: { $sum: 1 } } },
  { $sort: { indicacoes: -1 } }, { $limit: 5 }
]);
```

**10.3** R: 100% (com no mínimo 5 indicações): *O Retorno do Rei* (11/11), *The Last Emperor* (9/9), *Gigi* (9/9), *It Happened One Night* (5/5); depois *Ben-Hur* com 92%
```js
db.oscar_indicados.aggregate([
  { $match: { nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, n: { $sum: 1 }, v: { $sum: "$vencedor" } } },
  { $match: { n: { $gte: 5 } } },
  { $addFields: { taxa: { $multiply: [{ $divide: ["$v", "$n"] }, 100] } } },
  { $sort: { taxa: -1, n: -1 } }, { $limit: 10 }
]);
```

**10.4** R: **114 atores/atrizes** (ex.: Ruth Chatterton 1929-1930, Marie Dressler 1931-1932)
```js
db.oscar_indicados.aggregate([
  { $match: { categoria: ATUACAO, nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_indicado", anos: { $addToSet: "$ano_cerimonia" } } },
  { $match: { "anos.1": { $exists: true } } }
]).toArray()
  .map(d => ({ nome: d._id, anos: d.anos.sort((x, y) => x - y) }))
  .filter(d => d.anos.some((y, i) => i > 0 && y - d.anos[i - 1] === 1));
```

**10.5** R: 10889 / 96 = **113,4 indicações por cerimônia**
```js
db.oscar_indicados.countDocuments() / db.oscar_indicados.distinct("cerimonia").length;
```

**10.6** R: **176 casos**, dos quais 159 não ganharam (nos anos 1928-29 muitos filmes tiveram uma única indicação, por isso o número é alto)
```js
db.oscar_indicados.aggregate([
  { $match: { nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, n: { $sum: 1 }, cats: { $push: "$categoria" } } },
  { $match: { n: 1, $or: [{ cats: PRINCIPAIS }, { cats: { $in: PIC } }] } }
]);
```

---

## Nível 11

```js
var filmesPremiados = [
  { $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: { filme: "$nome_do_filme", ano_filmagem: "$ano_filmagem" }, oscars: { $sum: 1 } } },
  { $sort: { oscars: -1 } }];
var artistas = [
  { $match: { categoria: /^(ACTOR|ACTRESS|DIRECTING)/, nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_indicado", indicacoes: { $sum: 1 }, vitorias: { $sum: "$vencedor" } } }];
```

**11.1** R: 1 *Ben-Hur* 11 · 2 *Titanic* (1997) 11 · 3 *O Retorno do Rei* 11 · 4 *West Side Story* (1961) 10 · 5 *Gigi* 9 · 6 *The Last Emperor* 9 · 7 *The English Patient* 9 · 8 *Gone with the Wind* 8 · 9 *From Here to Eternity* 8 · 10 *On the Waterfront* 8 (empatados com 8: *My Fair Lady*, *Cabaret*, *Gandhi*, *Amadeus*, *Slumdog Millionaire*)
```js
db.oscar_indicados.aggregate([...filmesPremiados, { $limit: 10 }]);
```

**11.2** R: Meryl Streep 21 · Katharine Hepburn 12 · William Wyler 12 · Jack Nicholson 12 · Bette Davis 11 · Laurence Olivier 10 · Martin Scorsese 10 · Spencer Tracy 9 · Paul Newman 9 · Al Pacino 9 (Steven Spielberg também 9)
```js
db.oscar_indicados.aggregate([...artistas, { $sort: { indicacoes: -1 } }, { $limit: 10 }]);
```

**11.3** R: Peter O'Toole (8), Glenn Close (8), Richard Burton (7), Deborah Kerr (6), Thelma Ritter (6), Amy Adams (6)
```js
db.oscar_indicados.aggregate([...artistas, { $match: { indicacoes: { $gt: 5 }, vitorias: 0 } }, { $sort: { indicacoes: -1 } }]);
```

**11.4** R: FOREIGN LANGUAGE FILM (28 distintos em 63 prêmios), SHORT SUBJECT (Cartoon) (18 em 39), SHORT SUBJECT (Two-reel) (10 em 21), SOUND RECORDING (18 em 28), COSTUME DESIGN (41 em 59) (só categorias com 20+ prêmios)
```js
db.oscar_indicados.aggregate([
  { $match: { vencedor: 1, nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$categoria", vitorias: { $sum: 1 }, distintos: { $addToSet: "$nome_do_indicado" } } },
  { $match: { vitorias: { $gte: 20 } } },
  { $project: { vitorias: 1, distintos: { $size: "$distintos" }, razao: { $divide: [{ $size: "$distintos" }, "$vitorias"] } } },
  { $sort: { razao: 1 } }, { $limit: 10 }
]);
```

**11.5** R: média de indicados por cerimônia em cada categoria (lista completa na saída). Destaques: DOCUMENTARY 25 e MUSIC (Music Score of a Dramatic Picture) 20 (existiram uma única vez); entre as longevas, OUTSTANDING PRODUCTION 9,3 e MUSIC (Music Score of a Dramatic or Comedy Picture) 7,8
```js
db.oscar_indicados.aggregate([
  { $group: { _id: { cat: "$categoria", cer: "$cerimonia" }, indicados: { $sum: 1 } } },
  { $group: { _id: "$_id.cat", media_por_cerimonia: { $avg: "$indicados" }, cerimonias: { $sum: 1 } } },
  { $sort: { media_por_cerimonia: -1 } }
]);
```

**11.6** R: **59 filmes**, por exemplo *The Patriot*, *Cimarron*, *All Quiet on the Western Front*, *The Champ*, *Little Women*, *State Fair* (muitos são refilmagens com o mesmo título)
```js
db.oscar_indicados.aggregate([
  { $match: { nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_filme", reg: { $push: { ano: "$ano_cerimonia", cat: "$categoria", v: "$vencedor" } } } },
  { $match: { "reg.1": { $exists: true } } },
  { $project: { casos: { $filter: { input: "$reg", as: "w", cond: { $and: [
      { $eq: ["$$w.v", 1] },
      { $gt: [{ $size: { $filter: { input: "$reg", as: "n", cond: { $and: [
          { $ne: ["$$n.ano", "$$w.ano"] }, { $ne: ["$$n.cat", "$$w.cat"] }] } } } }, 0] }] } } } } },
  { $match: { "casos.0": { $exists: true } } }
]);
```

---

## Nível 12

**12.1** R: o ranking da 11.1 até 20: depois dos 10 primeiros vêm *My Fair Lady*, *Cabaret*, *Gandhi*, *Amadeus*, *Slumdog Millionaire* (8), *Going My Way*, *The Best Years of Our Lives*, *The Bridge on the River Kwai*, *Lawrence of Arabia*, *Patton*, *The Sting* (7)
```js
db.oscar_indicados.aggregate([...filmesPremiados, { $limit: 20 }]);
```

**12.2** R: os 5 mais premiados por década
- 1930s: It Happened One Night, The Informer, Anthony Adverse, Cimarron, Cavalcade
- 1940s: Gone with the Wind, Going My Way, The Best Years of Our Lives, Mrs. Miniver, How Green Was My Valley
- 1950s: Gigi, From Here to Eternity, On the Waterfront, The Bridge on the River Kwai, All about Eve
- 1960s: Ben-Hur, West Side Story, My Fair Lady, Lawrence of Arabia, A Man for All Seasons
- 1970s: Cabaret, Patton, The Sting, The Godfather Part II, Star Wars
- 1980s: The Last Emperor, Gandhi, Amadeus, Out of Africa, Kramer vs. Kramer
- 1990s: Titanic, The English Patient, Dances With Wolves, Schindler's List, Shakespeare in Love
- 2000s: O Retorno do Rei, Slumdog Millionaire, Chicago, American Beauty, Gladiator
- 2010s: Gravity, The Hurt Locker, Mad Max: Fury Road, La La Land, The Artist
- 2020s: Everything Everywhere All at Once, Oppenheimer, Dune, Parasite, All Quiet on the Western Front
```js
db.oscar_indicados.aggregate([
  { $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" }, ano_cerimonia: { $gte: 1930 } } },
  { $group: { _id: { d: decada, f: "$nome_do_filme" }, oscars: { $sum: 1 } } },
  { $sort: { oscars: -1 } },
  { $group: { _id: "$_id.d", filmes: { $push: { filme: "$_id.f", oscars: "$oscars" } } } },
  { $project: { top5: { $slice: ["$filmes", 5] } } }, { $sort: { _id: 1 } }
]);
```

**12.3** R: **488 filmes** com exatamente 1 Oscar e cerimônia anterior a 1976 (mais de 50 anos). Primeiros: *The Dove*, *The Last Command*, *Two Arabian Knights*, *Underworld*, *Coquette*, *In Old Arizona*, *The Bridge of San Luis Rey*, *The Broadway Melody*
```js
var corte = new Date().getFullYear() - 50;
db.oscar_indicados.aggregate([
  { $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" }, ano_cerimonia: { $lt: corte } } },
  { $group: { _id: "$nome_do_filme", oscars: { $sum: 1 }, ano: { $min: "$ano_cerimonia" } } },
  { $match: { oscars: 1 } }, { $sort: { ano: 1 } }, { $limit: 50 }
]);
```

**12.4** R: cerimônias com mais prêmios: **1953 (33), 1955 (33), 1949 (32), 1950 (32), 1954 (31)**
```js
db.oscar_indicados.aggregate([
  { $match: { vencedor: 1 } }, { $group: { _id: "$ano_cerimonia", premiacoes: { $sum: 1 } } },
  { $sort: { premiacoes: -1 } }, { $limit: 5 }
]);
```

**12.5** R: marcos na base: primeiro Melhor Filme, *Wings* (1928) · primeira animação premiada, *Shrek* (2002) · primeira mulher indicada a Direção, Lina Wertmüller (1977, *Seven Beauties*) · primeira mulher a vencer Direção, Kathryn Bigelow (2010, *The Hurt Locker*) · primeiro ator negro a vencer Melhor Ator, Sidney Poitier (1964) · primeira atriz negra a vencer, Hattie McDaniel (1940, coadjuvante) · primeiro filme não falado em inglês a vencer Melhor Filme, *Parasite* (2020). Os quatro últimos dependem de conhecimento externo (a base não tem esses atributos).
```js
db.oscar_indicados.find({ categoria: { $in: PIC }, vencedor: 1 }).sort({ ano_cerimonia: 1 }).limit(1);            // Wings
db.oscar_indicados.find({ categoria: "ANIMATED FEATURE FILM", vencedor: 1 }).sort({ ano_cerimonia: 1 }).limit(1); // Shrek
db.oscar_indicados.find({ categoria: "DIRECTING", nome_do_indicado: "Lina Wertmüller" });                        // 1977
db.oscar_indicados.find({ categoria: "DIRECTING", nome_do_indicado: "Kathryn Bigelow", vencedor: 1 });           // 2010
db.oscar_indicados.find({ nome_do_indicado: "Sidney Poitier", vencedor: 1 });                                    // 1964
db.oscar_indicados.find({ nome_do_indicado: "Hattie McDaniel", vencedor: 1 });                                   // 1940
db.oscar_indicados.find({ categoria: { $in: PIC }, nome_do_filme: "Parasite" });                                 // 2020
```

**12.6** R: pessoas sem Oscar: Peter O'Toole (8), Glenn Close (8), Richard Burton (7). Filmes com 7+ indicações e 0 Oscars: *The Turning Point* (1978, 11), *The Color Purple* (1986, 11), *Gangs of New York* (10), *True Grit* (10), *American Hustle* (10), *The Irishman* (10), *Killers of the Flower Moon* (10)
```js
db.oscar_indicados.aggregate([...porNome, { $match: { indicacoes: { $gte: 6 }, vitorias: 0 } }, { $sort: { indicacoes: -1 } }]);
db.oscar_indicados.aggregate([
  { $match: { nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, n: { $sum: 1 }, v: { $sum: "$vencedor" } } },
  { $match: { n: { $gte: 7 }, v: 0 } }, { $sort: { n: -1 } }
]);
```

**12.7** R: filmes com exatamente 10 indicações: 44; 13 ganharam Melhor Filme = **29,5%**. Com 10 ou mais: 102 filmes, 42 ganharam (41,2%).
```js
db.oscar_indicados.aggregate([
  { $match: { nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, n: { $sum: 1 },
              ganhouMF: { $max: { $cond: [{ $and: [{ $in: ["$categoria", PIC] }, { $eq: ["$vencedor", 1] }] }, 1, 0] } } } },
  { $match: { n: 10 } },
  { $group: { _id: null, filmes: { $sum: 1 }, ganharam: { $sum: "$ganhouMF" } } },
  { $addFields: { probabilidade: { $divide: ["$ganharam", "$filmes"] } } }
]);
```

**12.8** R: média de **0,85 indicação** antes da primeira vitória (87 vencedores de Melhor Ator): 46 ganharam logo na 1ª indicação, 24 após 1, 6 após 2, 8 após 3, 2 após 4 e 1 após 6
```js
db.oscar_indicados.aggregate([
  { $match: { categoria: { $in: LEAD }, nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_indicado", anos: { $push: "$ano_cerimonia" },
              primeira: { $min: { $cond: [{ $eq: ["$vencedor", 1] }, "$ano_cerimonia", null] } } } },
  { $match: { primeira: { $ne: null } } },
  { $project: { antes: { $size: { $filter: { input: "$anos", cond: { $lt: ["$$this", "$primeira"] } } } } } },
  { $group: { _id: null, atores: { $sum: 1 }, media_antes: { $avg: "$antes" } } }
]);
```

**12.9** R: mais previsível: **SHORT SUBJECT (Cartoon)**, com Walt Disney vencendo 12 de 39. Depois FOREIGN LANGUAGE FILM (Itália 10 de 63), SOUND RECORDING (MGM 5 de 28), MUSIC (Original Score) (John Williams 4 de 49) e DIRECTING (John Ford 4 de 95)
```js
db.oscar_indicados.aggregate([
  { $match: { vencedor: 1, nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: { c: "$categoria", n: "$nome_do_indicado" }, vezes: { $sum: 1 } } },
  { $sort: { vezes: -1 } },
  { $group: { _id: "$_id.c", maior_vencedor: { $first: "$_id.n" }, vezes: { $first: "$vezes" }, total: { $sum: "$vezes" } } },
  { $match: { total: { $gte: 20 } } }, { $sort: { vezes: -1 } }, { $limit: 10 }
]);
```

---

## Nível 13

**13.1** R: **322 filmes** cujo nome começa com "The" e ganharam ao menos um Oscar
```js
db.oscar_indicados.distinct("nome_do_filme", { nome_do_filme: /^The /, vencedor: 1 });
```

**13.2** R: **53 nomes** com hífen, por exemplo Ann-Margret, Alain Robbe-Grillet, Armin Mueller-Stahl, Anne-Marie Marchand
```js
db.oscar_indicados.find({ $and: [{ nome_do_indicado: /[A-Za-z]-[A-Za-z]/ }, { nome_do_indicado: /^[^,;&0-9]{3,45}$/ }] },
  { nome_do_indicado: 1, _id: 0 });
```

**13.3** R: **8 casos**: ACTOR 1932 (*Dr. Jekyll and Mr. Hyde* e *The Champ*), ACTRESS 1969 (*Funny Girl* e *The Lion in Winter*), DOCUMENTARY 1943 (4 filmes), DOCUMENTARY (Short Subject) 1950, SPECIAL ACHIEVEMENT AWARD (Visual Effects) 1977 (*King Kong* e *Logan's Run*), DOCUMENTARY (Feature) 1987, SHORT FILM (Live Action) 1995, SOUND EDITING 2013 (*Skyfall* e *Zero Dark Thirty*)
```js
db.oscar_indicados.aggregate([
  { $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: { cer: "$cerimonia", cat: "$categoria" }, filmes: { $addToSet: "$nome_do_filme" } } },
  { $match: { "filmes.1": { $exists: true } } }, { $sort: { "_id.cer": 1 } }
]);
```

**13.4** R: resultado aleatório a cada execução (5 vencedores de Melhor Filme)
```js
db.oscar_indicados.aggregate([
  { $match: { categoria: { $in: PIC }, vencedor: 1 } }, { $sample: { size: 5 } },
  { $project: { _id: 0, ano_cerimonia: 1, nome_do_filme: 1 } }
]);
```

**13.5** R: vencedores de Melhor Filme por número de palavras: 1 palavra 28 · 2: 18 · 3: 24 · 4: 10 · 5: 7 · 6: 7 · 7: 1 · 10: 1
```js
db.oscar_indicados.aggregate([
  { $match: { categoria: { $in: PIC }, vencedor: 1 } },
  { $project: { palavras: { $size: { $split: ["$nome_do_filme", " "] } } } },
  { $group: { _id: "$palavras", filmes: { $sum: 1 } } }, { $sort: { _id: 1 } }
]);
```
