# MVP contract

更新: 2026-09-29

## One-line value

**Visual pageを作り、そのままrepositoryへ渡せるdesign intentに変える。**

## Two-week path

### In scope

- desktop browser editor
- flat block hierarchyから開始し、section / stack nestingへ拡張
- heading、paragraph、button、image、divider
- drag / click追加、layer順序、select、delete
- desktop / tablet / mobile preview
- content、alignment、width、radius、tone
- local persistence
- versioned JSON import / export
- AI coding agent向けbrief
- React + CSS source exportの最小経路

### Out of scope

- user account、cloud sync、hosting
- backend、database、API workflow
- arbitrary Flutter widget support
- arbitrary npm package import
- Figma import
- collaborative editing
- production-ready generated application
- prompt-to-page generation

## Demo path

1. sample pageを開く
2. headingとbuttonをcanvasへdrag
3. mobileへ切り替える
4. widthとalignmentを修正
5. Intent traceでconstraintが変わる
6. Build packを開く
7. agent briefとJSONをcopy / download

## Binary gates

- 初見利用者が3分以内にblockを追加し、mobile previewを調整できる
- 同じdocumentをJSON export / importしてblock順序とpropertyが一致する
- keyboardだけでblock追加、選択、property編集、exportへ到達できる
- browser network logでuser documentが外部送信されない
- generated briefがblock順序、content、alignment、width、viewportを保持する
- `npm test`、`npm run lint`、`npm run build`が成功する

## Current slice

2026-09-29のinitial prototypeでは、block追加、layer順序、property inspector、breakpoint preview、local save、JSON download、agent brief copyまでを実装した。

未実装:

- JSON import
- nested layout
- source code export
- screenshot proof
- undo / redo
- test participant validation
