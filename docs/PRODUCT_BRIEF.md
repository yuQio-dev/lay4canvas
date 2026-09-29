# Product brief

更新: 2026-09-29

## Direction

UI Bug Briefを単独のscreenshot annotation toolとして実装する方針を止め、visual page builderへ転換する。

参考にするのはFlutterFlowの次のproduct mechanics。

- visual component composition
- widget / page hierarchy
- responsive editing
- property inspector
- custom code and source portability
- project-level workflow

FlutterFlow自体を複製せず、対象範囲をpage frontendへ絞る。

## Product promise

**画面を直接組み立てると、人間が見たlayoutとAI coding agentが実装できるconstraintが同時に残る。**

## Target user

- AI coding agentでweb UIを実装する個人開発者
- screenshotや口頭説明ではlayout intentが失われると感じる人
- visual builderの速さは欲しいが、runtime、hosting、subscriptionへprojectをlock-inしたくない人

## Unique flavor

### Intent trace

各visual editを、`alignment`、`width`、`spacing`、`breakpoint behavior`等の読み取り可能なconstraintとして記録する。

### Build pack

一つのdocumentから以下をexportする。

1. editable page JSON
2. AI coding agent向けimplementation brief
3. 将来のReact / CSS source
4. responsive screenshot proof

### Repository-first handoff

builder内でapp全体を運用しない。成果物を既存repositoryへ持ち帰り、通常のGit、test、reviewで完成させる。

## Initial non-goals

- mobile app build
- Firebase / Supabase integration
- authentication
- backend workflow
- deployment hosting
- database schema editor
- marketplace
- real-time collaboration
- AIによる一発page生成
- FlutterFlow project import / export

## Reference boundary

FlutterFlowの公式情報から、visual builder、responsive editing、custom code、GitHub連携を競合benchmarkとして扱う。

- https://www.flutterflow.io/
- https://docs.flutterflow.io/resources/ui/widgets/composing-widgets
- https://docs.flutterflow.io/resources/ui/responsive-design
- https://docs.flutterflow.io/concepts/custom-code/
- https://docs.flutterflow.io/exporting/pushing-to-github
