// =====================================================================
// OSCAR - Exercicios MongoDB (mongosh / Compass)
// Cole BLOCO POR BLOCO no >_MONGOSH do Compass (nao o arquivo inteiro).
// Campos: id_registro, ano_filmagem, ano_cerimonia, cerimonia, categoria,
//         nome_do_indicado, nome_do_filme, vencedor (0/1)
// "NULL" aparece como TEXTO (string), nao como null de verdade.
// =====================================================================

// Antes de colar: selecione o banco que contem o import (ex.: rode sozinho no shell:  use NOME_DO_BANCO)

// Constantes usadas em varias questoes
var PIC   = ["BEST PICTURE","OUTSTANDING PICTURE","BEST MOTION PICTURE","OUTSTANDING MOTION PICTURE","OUTSTANDING PRODUCTION"]; // nomes que "Melhor Filme" teve ao longo dos anos
var LEAD  = ["ACTOR","ACTOR IN A LEADING ROLE"];
var ATUACAO = /^(ACTOR|ACTRESS)/;                       // inclui coadjuvantes
var PRINCIPAIS = /^(ACTOR|ACTRESS)( IN A LEADING ROLE)?$/;
var decada = { $subtract: ["$ano_cerimonia", { $mod: ["$ano_cerimonia", 10] }] };

// =====================================================================
// 0. LIMPEZA (rode ANTES de tudo - o arquivo tem 5 registros "sujos")
// =====================================================================
// 0.1 ano_cerimonia escrito por extenso ("Mil Novecentos e vinte 8")
db.oscar_indicados.updateMany({ ano_cerimonia: "Mil Novecentos e vinte 8" }, { $set: { ano_cerimonia: 1928 } });
// 0.2 campo com nome errado "ven cedor" (registro 7507)
db.oscar_indicados.updateOne({ "ven cedor": { $exists: true } }, { $set: { vencedor: 1 }, $unset: { "ven cedor": "" } });
// 0.3 campos intrusos que nao fazem parte do schema
db.oscar_indicados.updateMany({}, { $unset: { diretor: "", fa: "", personagem_principal: "", botao_pressionado_mais_de_mil_vezes: "" } });
// Conferencia (tudo deve dar 0):
db.oscar_indicados.countDocuments({ ano_cerimonia: { $type: "string" } });
db.oscar_indicados.countDocuments({ vencedor: { $exists: false } });

// =====================================================================
// NIVEL 1
// =====================================================================
db.oscar_indicados.countDocuments();                                   // 1.1 -> 10889
db.oscar_indicados.distinct("categoria").length;                       // 1.2 -> 115 (o enunciado diz 92, mas o arquivo tem 115)
db.oscar_indicados.distinct("categoria");
db.oscar_indicados.find({}, { ano_cerimonia: 1, _id: 0 }).sort({ ano_cerimonia: 1 }).limit(1);    // 1.3 -> 1928 (nao 1500)
db.oscar_indicados.find({}, { ano_cerimonia: 1, _id: 0 }).sort({ ano_cerimonia: -1 }).limit(1);   // 1.4 -> 2024
db.oscar_indicados.distinct("cerimonia").length;                       // 1.5 -> 96

// 1.6 Adicionar 2025 e 2026 (TEMPLATE - complete com a lista oficial)
var prox = (db.oscar_indicados.find().sort({ id_registro: -1 }).limit(1).toArray()[0] || { id_registro: 0 }).id_registro + 1;
db.oscar_indicados.insertMany([
  { id_registro: prox, ano_filmagem: 2024, ano_cerimonia: 2025, cerimonia: 97,
    categoria: "BEST PICTURE", nome_do_indicado: "Producers de Anora", nome_do_filme: "Anora", vencedor: 1 }
  // ... demais indicados de 2025 (cerimonia 97) e de 2026 (cerimonia 98), incrementando id_registro
]);

// =====================================================================
// NIVEL 2
// =====================================================================
db.oscar_indicados.aggregate([{ $group: { _id: "$categoria", total: { $sum: 1 } } }, { $sort: { total: -1 } }]);   // 2.1
db.oscar_indicados.aggregate([{ $group: { _id: "$categoria", total: { $sum: 1 } } }, { $sort: { total: -1 } }, { $limit: 1 }]);  // 2.2 DIRECTING (469)
db.oscar_indicados.aggregate([{ $group: { _id: "$categoria", total: { $sum: 1 } } }, { $sort: { total: 1 } }, { $limit: 5 }]);   // 2.3 varias empatam com 1
db.oscar_indicados.find({ categoria: "ACTRESS" }, { ano_cerimonia: 1, _id: 0 }).sort({ ano_cerimonia: -1 }).limit(1);          // 2.4 ultima = 1976 (deixa de existir em 1977; vira "ACTRESS IN A LEADING ROLE")

var hoje = db.oscar_indicados.distinct("categoria", { cerimonia: 96 });                                                         // 2.5
db.oscar_indicados.distinct("categoria", { cerimonia: 1 }).filter(c => !hoje.includes(c));

db.oscar_indicados.distinct("categoria", { categoria: /DIRECTING/ });                                                           // 2.6

// =====================================================================
// NIVEL 3  (troque o nome para Viola Davis, Amy Adams, Denzel Washington)
// =====================================================================
db.oscar_indicados.countDocuments({ nome_do_indicado: "Natalie Portman" });                       // 3.1 -> 3
db.oscar_indicados.countDocuments({ nome_do_indicado: "Natalie Portman", vencedor: 1 });          // 3.2 -> 1
db.oscar_indicados.find({ nome_do_indicado: "Natalie Portman" }, { ano_cerimonia: 1, nome_do_filme: 1, _id: 0 }).sort({ ano_cerimonia: 1 });  // 3.3
db.oscar_indicados.find({ nome_do_indicado: "Natalie Portman" },                                  // 3.4
       { ano_cerimonia: 1, categoria: 1, nome_do_filme: 1, vencedor: 1, _id: 0 }).sort({ ano_cerimonia: 1 });

// Atalho para todas as perguntas de pessoa:
function resumo(nome) {
  var r = db.oscar_indicados.find({ nome_do_indicado: nome }, { ano_cerimonia: 1, categoria: 1, nome_do_filme: 1, vencedor: 1, _id: 0 })
           .sort({ ano_cerimonia: 1 }).toArray();
  print(nome, "| indicacoes:", r.length, "| oscars:", r.filter(x => x.vencedor === 1).length);
  return r;
}
resumo("Viola Davis");        // 3.5-3.7 -> 4 indicacoes, 1 Oscar (Fences, 2017)
resumo("Amy Adams");          // 3.8-3.9 -> 6 indicacoes, 0 Oscars (6 sem ganhar)
resumo("Denzel Washington");  // 3.10-3.12 -> 9 indicacoes, 2 Oscars (Glory 1990, Training Day 2002)

// =====================================================================
// NIVEL 4
// =====================================================================
db.oscar_indicados.find({ categoria: "ACTRESS", vencedor: 1 }).sort({ ano_cerimonia: 1 }).limit(1);   // 4.1 Janet Gaynor, 1928, 7th Heaven
db.oscar_indicados.find({ categoria: "ACTOR",   vencedor: 1 }).sort({ ano_cerimonia: 1 }).limit(1);   // 4.2 Emil Jannings, 1928, The Last Command
db.oscar_indicados.countDocuments({ vencedor: 1 });                                                   // 4.3 -> 2464
db.oscar_indicados.find({ categoria: { $in: PIC }, vencedor: 1 }, { ano_cerimonia: 1, nome_do_filme: 1, _id: 0 }).sort({ ano_cerimonia: 1 });  // 4.4 -> 85
db.oscar_indicados.distinct("nome_do_filme", { vencedor: 1, nome_do_filme: { $ne: "NULL" } }).length;  // 4.5 -> 1328

// =====================================================================
// NIVEL 5   (atores/atrizes = categorias que comecam com ACTOR/ACTRESS)
// =====================================================================
var porNome = [
  { $match: { categoria: ATUACAO, nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_indicado", indicacoes: { $sum: 1 }, vitorias: { $sum: "$vencedor" } } }
];
db.oscar_indicados.aggregate([...porNome, { $match: { indicacoes: { $gt: 1 } } }, { $sort: { indicacoes: -1 } }]);                  // 5.1
db.oscar_indicados.aggregate([...porNome, { $sort: { indicacoes: -1 } }, { $limit: 3 }]);                                           // 5.2
db.oscar_indicados.aggregate([...porNome, { $match: { indicacoes: { $gt: 3 }, vitorias: 0 } }, { $sort: { indicacoes: -1 } }]);     // 5.3

db.oscar_indicados.aggregate([                                                                                                       // 5.4
  { $match: { nome_do_indicado: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_indicado", categorias: { $addToSet: "$categoria" } } },
  { $match: { "categorias.1": { $exists: true } } },
  { $limit: 20 }
]);
// Obs 5.4: o mesmo ator em "ACTOR" e "ACTOR IN A LEADING ROLE" conta como categorias diferentes (renomeacao).

db.oscar_indicados.aggregate([{ $match: { nome_do_indicado: { $ne: "NULL" } } },                                                     // 5.5 -> 5589
            { $group: { _id: "$nome_do_indicado", n: { $sum: 1 } } },
            { $match: { n: 1 } }, { $count: "indicados_com_1_indicacao" }]);

db.oscar_indicados.aggregate([{ $group: { _id: "$ano_cerimonia", indicacoes: { $sum: 1 } } }, { $sort: { indicacoes: -1 } }, { $limit: 3 }]);  // 5.6 -> 1943 (186)
db.oscar_indicados.aggregate([{ $group: { _id: "$ano_cerimonia", nomes: { $addToSet: "$nome_do_indicado" } } },                      // variante: pessoas distintas
            { $project: { distintos: { $size: "$nomes" } } }, { $sort: { distintos: -1 } }, { $limit: 3 }]);

// =====================================================================
// NIVEL 6
// =====================================================================
var ts = { nome_do_filme: /^Toy Story/ };
db.oscar_indicados.distinct("ano_cerimonia", { ...ts, vencedor: 1 });                       // 6.1 -> [2011, 2020]
db.oscar_indicados.countDocuments(ts);                                                      // 6.2 -> 11
db.oscar_indicados.aggregate([{ $match: ts }, { $group: { _id: { filme: "$nome_do_filme", cat: "$categoria" }, venceu: { $max: "$vencedor" } } }, { $sort: { "_id.filme": 1 } }]);  // 6.3

db.oscar_indicados.distinct("ano_cerimonia", { nome_do_filme: "Crash" });                   // 6.4 -> 2006 (78a cerimonia)
db.oscar_indicados.countDocuments({ nome_do_filme: "Crash" });                              // 6.5 -> 6
db.oscar_indicados.find({ nome_do_filme: "Crash", categoria: { $in: PIC } });               // 6.6 -> vencedor: 1 (sim)

// 6.7/6.8 "Central do Brasil" esta no banco com o titulo em ingles: "Central Station"
db.oscar_indicados.find({ nome_do_filme: /Central Station/ });                              // 2 registros (Fernanda Montenegro/ACTRESS e Brazil/FOREIGN LANGUAGE FILM)
db.oscar_indicados.countDocuments({ nome_do_filme: "Central Station" });                    // -> 2

// =====================================================================
// NIVEL 7  (operacoes de escrita - faca backup antes: Collection > Export)
// =====================================================================
// 7.1 No arquivo, "vencedor" JA e numero (0/1), nao string. Conferencia:
db.oscar_indicados.countDocuments({ vencedor: { $type: "string" } });                       // -> 0
// Se o professor realmente exigir booleano (depois disso, troque vencedor:1 por vencedor:true nas queries
// e $sum:"$vencedor" por $sum:{$cond:["$vencedor",1,0]}):
// db.oscar_indicados.updateMany({}, [{ $set: { vencedor: { $eq: ["$vencedor", 1] } } }]);

// 7.2 Filmes nunca indicados (em colecao separada para nao distorcer as estatisticas)
["Drive", "Paddington 2", "Heat"].map(f => db.oscar_indicados.countDocuments({ nome_do_filme: f }));   // confira: deve dar 0 0 0
db.filmes_nao_indicados.insertMany([
  { nome_do_filme: "Drive",        ano_filmagem: 2011, diretor: "Nicolas Winding Refn", motivo: "Fotografia, trilha e montagem marcantes" },
  { nome_do_filme: "Paddington 2", ano_filmagem: 2017, diretor: "Paul King",            motivo: "Roteiro e direcao impecaveis" },
  { nome_do_filme: "Heat",         ano_filmagem: 1995, diretor: "Michael Mann",         motivo: "Direcao, som e atuacoes" }
]);

// 7.3 Nova categoria (copiando os vencedores 2020-2024 de INTERNATIONAL FEATURE FILM; nominee = pais)
var p = (db.oscar_indicados.find().sort({ id_registro: -1 }).limit(1).toArray()[0] || { id_registro: 0 }).id_registro + 1;
var docs = db.oscar_indicados.find({ categoria: "INTERNATIONAL FEATURE FILM", vencedor: 1, ano_cerimonia: { $gte: 2020, $lte: 2024 } }, { _id: 0 })
            .toArray().map((d, i) => ({ ...d, id_registro: p + i, categoria: "BEST INTERNATIONAL FEATURE FILM" }));
db.oscar_indicados.insertMany(docs);

// 7.4 Espacos extras nos nomes dos filmes (3 registros)
db.oscar_indicados.find({ nome_do_filme: /(^\s|\s$|\s{2,})/ }, { nome_do_filme: 1 });       // veja antes
db.oscar_indicados.updateMany({ nome_do_filme: /(^\s|\s$|\s{2,})/ }, [{ $set: { nome_do_filme: { $trim: { input: {
  $reduce: { input: { $filter: { input: { $split: ["$nome_do_filme", " "] }, cond: { $ne: ["$$this", ""] } } },
             initialValue: "", in: { $cond: [{ $eq: ["$$value", ""] }, "$$this", { $concat: ["$$value", " ", "$$this"] }] } } } } } } }]);

// 7.5 Remover NULL (sao strings "NULL"; 319 registros - quase todos premios honorarios)
db.oscar_indicados.countDocuments({ nome_do_filme: "NULL" });
db.oscar_indicados.deleteMany({ nome_do_filme: "NULL" });

// =====================================================================
// NIVEL 8
// =====================================================================
db.oscar_indicados.aggregate([{ $group: { _id: decada, indicacoes: { $sum: 1 } } }, { $sort: { _id: 1 } }]);                       // 8.1
db.oscar_indicados.aggregate([{ $group: { _id: decada, indicacoes: { $sum: 1 } } }, { $sort: { indicacoes: -1 } }, { $limit: 1 }]); // 8.2 -> 1940s
db.oscar_indicados.aggregate([{ $group: { _id: { d: decada, c: "$categoria" } } },                                                  // 8.3
             { $group: { _id: "$_id.d", categorias_unicas: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
db.oscar_indicados.aggregate([{ $group: { _id: "$ano_cerimonia", n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 1 }]);        // 8.4 -> 1943 (186)

var dec = db.oscar_indicados.aggregate([{ $group: { _id: decada, total: { $sum: 1 }, cer: { $addToSet: "$ano_cerimonia" } } },     // 8.5
  { $project: { total: 1, cerimonias: { $size: "$cer" }, media: { $divide: ["$total", { $size: "$cer" }] } } },
  { $sort: { _id: 1 } }]).toArray();
var a = dec[0], z = dec[dec.length - 1];
print("Bruto: ", ((z.total - a.total) / a.total * 100).toFixed(1) + "%");     // 1920s e 2020s sao decadas INCOMPLETAS
print("Por cerimonia:", ((z.media - a.media) / a.media * 100).toFixed(1) + "%");   // comparacao mais justa

// =====================================================================
// NIVEL 9
// =====================================================================
db.oscar_indicados.find({ nome_do_indicado: "Sidney Poitier" }, { ano_cerimonia: 1, nome_do_filme: 1, vencedor: 1, _id: 0 }).sort({ ano_cerimonia: 1 });
// 9.1 -> 1959, The Defiant Ones | 9.2 -> NAO (venceu so em 1964, Lilies of the Field)

// 9.3 A base NAO tem campo de raca/etnia: e preciso informar a lista de nomes manualmente (confira a lista!)
var negros = ["Hattie McDaniel","Ethel Waters","Dorothy Dandridge","Sidney Poitier","Juanita Moore","Beah Richards"];
db.oscar_indicados.find({ nome_do_indicado: { $in: negros }, categoria: ATUACAO, ano_cerimonia: { $lt: 1970 } },
       { nome_do_indicado: 1, ano_cerimonia: 1, categoria: 1, nome_do_filme: 1, vencedor: 1, _id: 0 }).sort({ ano_cerimonia: 1 });

// 9.4 Mulheres diretoras (lista manual) - 1) filmes que elas dirigiram, 2) desses, os que ganharam algo
var mulheres = ["Lina Wertmüller","Jane Campion","Sofia Coppola","Kathryn Bigelow","Greta Gerwig","Chloé Zhao","Emerald Fennell","Justine Triet"];
var filmesDelas = db.oscar_indicados.distinct("nome_do_filme", { categoria: /^DIRECTING/, nome_do_indicado: { $in: mulheres } });
db.oscar_indicados.aggregate([{ $match: { nome_do_filme: { $in: filmesDelas }, vencedor: 1 } },
             { $group: { _id: "$nome_do_filme", oscars: { $sum: 1 }, categorias: { $addToSet: "$categoria" } } }]);

// 9.5/9.6 Denzel x Jamie Foxx no mesmo ano?
var anosD = db.oscar_indicados.distinct("ano_cerimonia", { nome_do_indicado: "Denzel Washington" });
var anosJ = db.oscar_indicados.distinct("ano_cerimonia", { nome_do_indicado: "Jamie Foxx" });
anosD.filter(x => anosJ.includes(x));       // -> [] : NAO concorreram juntos (Foxx: so 2005; Denzel: 1988...2022, sem 2005). 9.6 nao se aplica.

// 9.7 Filmes com varios Oscars na mesma cerimonia
db.oscar_indicados.aggregate([{ $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" } } },
             { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, oscars: { $sum: 1 } } },
             { $match: { oscars: { $gt: 1 } } }, { $sort: { oscars: -1 } }, { $limit: 20 }]);

// =====================================================================
// NIVEL 10
// =====================================================================
db.oscar_indicados.aggregate([                                                                                                      // 10.1
  { $match: { vencedor: 1, $or: [{ categoria: { $in: PIC } }, { categoria: /^DIRECTING/ }] } },
  { $group: { _id: { c: "$cerimonia", f: "$nome_do_filme" },
              tipos: { $addToSet: { $cond: [{ $in: ["$categoria", PIC] }, "FILME", "DIRETOR"] } } } },
  { $match: { tipos: { $all: ["FILME", "DIRETOR"] } } }, { $sort: { "_id.c": 1 } }]);

db.oscar_indicados.aggregate([{ $match: { nome_do_filme: { $ne: "NULL" } } },                                                       // 10.2 -> All about Eve (1951), Titanic (1998), La La Land (2017): 14
             { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, indicacoes: { $sum: 1 } } },
             { $sort: { indicacoes: -1 } }, { $limit: 5 }]);

db.oscar_indicados.aggregate([{ $match: { nome_do_filme: { $ne: "NULL" } } },                                                       // 10.3 (minimo 5 indicacoes, senao 1/1 = 100% polui)
             { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, n: { $sum: 1 }, v: { $sum: "$vencedor" } } },
             { $match: { n: { $gte: 5 } } },
             { $addFields: { taxa: { $multiply: [{ $divide: ["$v", "$n"] }, 100] } } },
             { $sort: { taxa: -1, n: -1 } }, { $limit: 10 }]);

db.oscar_indicados.aggregate([{ $match: { categoria: ATUACAO, nome_do_indicado: { $ne: "NULL" } } },                                // 10.4 (ordenacao em JS: funciona em qualquer versao)
             { $group: { _id: "$nome_do_indicado", anos: { $addToSet: "$ano_cerimonia" } } },
             { $match: { "anos.1": { $exists: true } } }]).toArray()
  .map(d => ({ nome: d._id, anos: d.anos.sort((x, y) => x - y) }))
  .filter(d => d.anos.some((y, i) => i > 0 && y - d.anos[i - 1] === 1));

db.oscar_indicados.countDocuments() / db.oscar_indicados.distinct("cerimonia").length;                                                                // 10.5 -> ~113,4

db.oscar_indicados.aggregate([{ $match: { nome_do_filme: { $ne: "NULL" } } },                                                       // 10.6
             { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, n: { $sum: 1 }, cats: { $push: "$categoria" } } },
             { $match: { n: 1, $or: [{ cats: PRINCIPAIS }, { cats: { $in: PIC } }] } }, { $limit: 20 }]);

// =====================================================================
// NIVEL 11
// =====================================================================
var filmesPremiados = [{ $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" } } },
                       { $group: { _id: { filme: "$nome_do_filme", ano_filmagem: "$ano_filmagem" }, oscars: { $sum: 1 } } }, { $sort: { oscars: -1 } }];
db.oscar_indicados.aggregate([...filmesPremiados, { $limit: 10 }]);                                                                  // 11.1 (Titanic, Ben-Hur, West Side Story...)

var artistas = [{ $match: { categoria: /^(ACTOR|ACTRESS|DIRECTING)/, nome_do_indicado: { $ne: "NULL" } } },
                { $group: { _id: "$nome_do_indicado", indicacoes: { $sum: 1 }, vitorias: { $sum: "$vencedor" } } }];
db.oscar_indicados.aggregate([...artistas, { $sort: { indicacoes: -1 } }, { $limit: 10 }]);                                          // 11.2
db.oscar_indicados.aggregate([...artistas, { $match: { indicacoes: { $gt: 5 }, vitorias: 0 } }, { $sort: { indicacoes: -1 } }]);     // 11.3

db.oscar_indicados.aggregate([{ $match: { vencedor: 1, nome_do_indicado: { $ne: "NULL" } } },                                        // 11.4 (so categorias com >= 20 premiacoes)
             { $group: { _id: "$categoria", vitorias: { $sum: 1 }, distintos: { $addToSet: "$nome_do_indicado" } } },
             { $match: { vitorias: { $gte: 20 } } },
             { $project: { vitorias: 1, distintos: { $size: "$distintos" }, razao: { $divide: [{ $size: "$distintos" }, "$vitorias"] } } },
             { $sort: { razao: 1 } }, { $limit: 10 }]);

db.oscar_indicados.aggregate([{ $group: { _id: { cat: "$categoria", cer: "$cerimonia" }, indicados: { $sum: 1 } } },                 // 11.5
             { $group: { _id: "$_id.cat", media_por_cerimonia: { $avg: "$indicados" }, cerimonias: { $sum: 1 } } },
             { $sort: { media_por_cerimonia: -1 } }]);

db.oscar_indicados.aggregate([                                                                                                       // 11.6
  { $match: { nome_do_filme: { $ne: "NULL" } } },
  { $group: { _id: "$nome_do_filme", reg: { $push: { ano: "$ano_cerimonia", cat: "$categoria", v: "$vencedor" } } } },
  { $match: { "reg.1": { $exists: true } } },
  { $project: { casos: { $filter: { input: "$reg", as: "w", cond: { $and: [
      { $eq: ["$$w.v", 1] },
      { $gt: [{ $size: { $filter: { input: "$reg", as: "n", cond: { $and: [
          { $ne: ["$$n.ano", "$$w.ano"] }, { $ne: ["$$n.cat", "$$w.cat"] }] } } } }, 0] }] } } } } },
  { $match: { "casos.0": { $exists: true } } }]);

// =====================================================================
// NIVEL 12
// =====================================================================
db.oscar_indicados.aggregate([...filmesPremiados, { $limit: 20 }]);                                                                  // 12.1

db.oscar_indicados.aggregate([                                                                                                       // 12.2
  { $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" }, ano_cerimonia: { $gte: 1930 } } },
  { $group: { _id: { d: decada, f: "$nome_do_filme" }, oscars: { $sum: 1 } } },
  { $sort: { oscars: -1 } },
  { $group: { _id: "$_id.d", filmes: { $push: { filme: "$_id.f", oscars: "$oscars" } } } },
  { $project: { top5: { $slice: ["$filmes", 5] } } }, { $sort: { _id: 1 } }]);

var corte = new Date().getFullYear() - 50;                                                                          // 12.3
db.oscar_indicados.aggregate([{ $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" }, ano_cerimonia: { $lt: corte } } },
             { $group: { _id: "$nome_do_filme", oscars: { $sum: 1 }, ano: { $min: "$ano_cerimonia" } } },
             { $match: { oscars: 1 } }, { $sort: { ano: 1 } }, { $limit: 50 }]);

db.oscar_indicados.aggregate([{ $match: { vencedor: 1 } }, { $group: { _id: "$ano_cerimonia", premiacoes: { $sum: 1 } } },          // 12.4
             { $sort: { premiacoes: -1 } }, { $limit: 5 }]);

// 12.5 Primeiros historicos
db.oscar_indicados.find({ categoria: { $in: PIC }, vencedor: 1 }).sort({ ano_cerimonia: 1 }).limit(1);                               // 1o Melhor Filme: Wings
db.oscar_indicados.find({ categoria: "DIRECTING", vencedor: 1, nome_do_indicado: "Kathryn Bigelow" });                               // 1a mulher a vencer Direcao (2010)
db.oscar_indicados.find({ categoria: "DIRECTING", nome_do_indicado: "Lina Wertmüller" });                                            // 1a mulher indicada (1977)
db.oscar_indicados.find({ nome_do_indicado: "Sidney Poitier", vencedor: 1 });                                                        // 1o ator negro a vencer Melhor Ator (1964)
db.oscar_indicados.find({ nome_do_indicado: "Hattie McDaniel", vencedor: 1 });                                                       // 1a atriz negra a vencer (1940)
db.oscar_indicados.find({ categoria: "ANIMATED FEATURE FILM", vencedor: 1 }).sort({ ano_cerimonia: 1 }).limit(1);                    // 1a animacao (Shrek, 2002)
db.oscar_indicados.find({ categoria: "INTERNATIONAL FEATURE FILM", vencedor: 1, nome_do_filme: "Parasite" });                        // 1o nao-ingles em Melhor Filme: ver categoria PIC em 2020
db.oscar_indicados.find({ categoria: { $in: PIC }, nome_do_filme: "Parasite" });

// 12.6 Injusticas
db.oscar_indicados.aggregate([...porNome, { $match: { indicacoes: { $gte: 6 }, vitorias: 0 } }, { $sort: { indicacoes: -1 } }]);     // atores
db.oscar_indicados.aggregate([{ $match: { nome_do_filme: { $ne: "NULL" } } },                                                       // filmes (>= 7 indicacoes, 0 Oscars)
             { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, n: { $sum: 1 }, v: { $sum: "$vencedor" } } },
             { $match: { n: { $gte: 7 }, v: 0 } }, { $sort: { n: -1 } }]);

// 12.7 P(Melhor Filme | filme com exatamente 10 indicacoes)
db.oscar_indicados.aggregate([{ $match: { nome_do_filme: { $ne: "NULL" } } },
             { $group: { _id: { cer: "$cerimonia", filme: "$nome_do_filme" }, n: { $sum: 1 },
                         ganhouMF: { $max: { $cond: [{ $and: [{ $in: ["$categoria", PIC] }, { $eq: ["$vencedor", 1] }] }, 1, 0] } } } },
             { $match: { n: 10 } },
             { $group: { _id: null, filmes: { $sum: 1 }, ganharam: { $sum: "$ganhouMF" } } },
             { $addFields: { probabilidade: { $divide: ["$ganharam", "$filmes"] } } }]);

// 12.8 Media de indicacoes (a Melhor Ator) ANTES da primeira vitoria
db.oscar_indicados.aggregate([{ $match: { categoria: { $in: LEAD }, nome_do_indicado: { $ne: "NULL" } } },
             { $group: { _id: "$nome_do_indicado", anos: { $push: "$ano_cerimonia" },
                         primeira: { $min: { $cond: [{ $eq: ["$vencedor", 1] }, "$ano_cerimonia", null] } } } },
             { $match: { primeira: { $ne: null } } },
             { $project: { antes: { $size: { $filter: { input: "$anos", cond: { $lt: ["$$this", "$primeira"] } } } } } },
             { $group: { _id: null, atores: { $sum: 1 }, media_antes: { $avg: "$antes" } } }]);

// 12.9 Categorias mais "previsiveis" (mesmo nome vence varias vezes)
db.oscar_indicados.aggregate([{ $match: { vencedor: 1, nome_do_indicado: { $ne: "NULL" } } },
             { $group: { _id: { c: "$categoria", n: "$nome_do_indicado" }, vezes: { $sum: 1 } } },
             { $sort: { vezes: -1 } },
             { $group: { _id: "$_id.c", maior_vencedor: { $first: "$_id.n" }, vezes: { $first: "$vezes" }, total: { $sum: "$vezes" } } },
             { $match: { total: { $gte: 20 } } }, { $sort: { vezes: -1 } }, { $limit: 10 }]);

// =====================================================================
// NIVEL 13
// =====================================================================
db.oscar_indicados.distinct("nome_do_filme", { nome_do_filme: /^The /, vencedor: 1 });                                               // 13.1
db.oscar_indicados.find({ $and: [{ nome_do_indicado: /[A-Za-z]-[A-Za-z]/ }, { nome_do_indicado: /^[^,;&0-9]{3,45}$/ }] },            // 13.2
       { nome_do_indicado: 1, _id: 0 }).limit(30);

db.oscar_indicados.aggregate([{ $match: { vencedor: 1, nome_do_filme: { $ne: "NULL" } } },                                           // 13.3 (empate = filmes DIFERENTES vencendo a mesma categoria na mesma cerimonia)
             { $group: { _id: { cer: "$cerimonia", cat: "$categoria" }, filmes: { $addToSet: "$nome_do_filme" } } },
             { $match: { "filmes.1": { $exists: true } } }, { $sort: { "_id.cer": 1 } }]);
// Obs: categorias honorarias/tecnicas antigas tem varios vencedores por desenho; filtre se quiser so empates "de verdade".

db.oscar_indicados.aggregate([{ $match: { categoria: { $in: PIC }, vencedor: 1 } }, { $sample: { size: 5 } },                        // 13.4
             { $project: { _id: 0, ano_cerimonia: 1, nome_do_filme: 1 } }]);

db.oscar_indicados.aggregate([{ $match: { categoria: { $in: PIC }, vencedor: 1 } },                                                  // 13.5
             { $project: { palavras: { $size: { $split: ["$nome_do_filme", " "] } } } },
             { $group: { _id: "$palavras", filmes: { $sum: 1 } } }, { $sort: { _id: 1 } }]);
