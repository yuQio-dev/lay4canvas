# Lay4Canvas

**Lay4Canvas（レイフォーキャンバス）**は、visual authoringとportable codeの考え方を参考にしつつ、**AI coding agentへ渡せる設計意図（intent）を成果物として残す**ことに焦点を当てたlocal-first page builderです。

既存製品の名称、UI asset、codeは複製しません。

## 現在できること

- blockをclickまたはdragしてpage canvasへ追加
- desktop / tablet / mobile幅の切り替え
- content、alignment、width、corner radius、toneの編集
- layerの並べ替えと削除
- browser内への自動保存
- editable JSONのdownload
- coding agent向けimplementation briefの生成・copy

## 起動

```bash
npm install
npm run dev
```

検証:

```bash
npm test
npm run lint
npm run build
```

## プロダクトの楔

FlutterFlowのようなfull app platformを最初から再現しません。最初の楔は次の一経路です。

1. visual canvasで選択した一つのtarget viewport向けpageを構成する
2. 操作を明示的なlayout constraintへ変換する
3. 現prototypeではJSONとagent brief、MVPではVite React appへexportする
4. 既存repository側で実装・レビューできる

builderがapplication runtimeやhostingを囲い込まず、**design intentをportableにする**ことを独自性とします。

詳細は[`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md)と[`docs/MVP.md`](docs/MVP.md)を参照してください。

## 状態

2026-09-29: public working prototype。GitHub repositoryは`yuQio-dev/lay4canvas`、public demoは未deployです。正典文書とADRが承認されるまで、新機能実装は凍結しています。
