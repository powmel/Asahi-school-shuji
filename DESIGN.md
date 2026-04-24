---
colors:
  primary: "#1F1B16"
  onPrimary: "#FAF7F0"
  secondary: "#9C3B3B"
  onSecondary: "#FFFFFF"
  accent: "#7C5524"
  background: "#FAF7F0"
  surface: "#FFFFFF"
  surfaceMuted: "#F0EBE0"
  textPrimary: "#1F1B16"
  textSecondary: "#5B5246"
  textMuted: "#6B6257"
  border: "#E5DED1"
  inputBorder: "#D6CEC0"
  success: "#4A7C59"
  warning: "#C08431"
  error: "#B0403A"
  info: "#3E6A8A"
typography:
  fontFamily:
    heading: "Poppins, 'Noto Sans JP', sans-serif"
    body: "'PT Sans', 'Noto Sans JP', sans-serif"
    mono: "ui-monospace, SFMono-Regular, Menlo, monospace"
  fontSize:
    xs: "12px"
    sm: "14px"
    base: "16px"
    lg: "18px"
    xl: "20px"
    "2xl": "24px"
    "3xl": "30px"
    "4xl": "36px"
  fontWeight:
    regular: "400"
    medium: "500"
    semibold: "600"
    bold: "700"
  lineHeight:
    tight: "1.25"
    normal: "1.5"
    relaxed: "1.65"
  letterSpacing:
    normal: "0"
    wide: "0.02em"
rounded:
  none: "0px"
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
  "3xl": "64px"
components:
  buttonPrimary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  buttonSecondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  buttonGhost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  buttonDestructive:
    backgroundColor: "{colors.error}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  badgeScheduled:
    backgroundColor: "{colors.info}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.full}"
  badgePending:
    backgroundColor: "{colors.warning}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
  badgeApproved:
    backgroundColor: "{colors.success}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.full}"
  badgeRejected:
    backgroundColor: "{colors.error}"
    textColor: "{colors.onPrimary}"
    rounded: "{rounded.full}"
  sidebar:
    backgroundColor: "{colors.background}"
    textColor: "{colors.textPrimary}"
  header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
    rounded: "{rounded.lg}"
  table:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textPrimary}"
  tableHeader:
    backgroundColor: "{colors.surfaceMuted}"
    textColor: "{colors.textSecondary}"
  buttonSeal:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.onSecondary}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  link:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.accent}"
  placeholder:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.textMuted}"
  divider:
    backgroundColor: "{colors.border}"
    textColor: "{colors.textSecondary}"
  inputOutline:
    backgroundColor: "{colors.inputBorder}"
    textColor: "{colors.textSecondary}"
---

# Asahi 書道教室 スケジュール管理システム — Design System

## Overview

本システムは、朝日書道教室の**管理者**と**生徒・保護者**が日々使う業務アプリです。デザインの狙いは次の3点に集約されます。

1. **落ち着き** — 書道という静謐な題材にふさわしい、派手さのない配色と余白。
2. **紙と墨の雰囲気** — 背景はわずかに温かみのある和紙色、主要テキストと主要アクションは墨色。朱印を思わせる赤は「承認」「重要アクション」にごく控えめに使う。
3. **現代的な業務アプリとしての使いやすさ** — 和風ビジュアル (木目・掛け軸・筆文字装飾) に寄せすぎず、保護者が迷わず予約でき、講師が素早く月間スケジュールを調整できる情報密度を保つ。

ターゲット利用者:
- **保護者・生徒**: 月数回の利用。お知らせ確認・授業予定確認・振替申請。**迷わなさ**を最優先。
- **管理者 (講師)**: 毎日の利用。生徒管理・月間割り振り・振替承認。**情報密度と操作効率**を最優先。

---

## Colors

書道教室の象徴色を「墨・和紙・朱」の3つに絞り、業務上の状態色 (success / warning / error / info) を別レイヤーとして持たせています。和風要素は色のみで表現し、装飾パターンや木目テクスチャは使いません。

### Brand tokens

| トークン | 用途 | メモ |
|---------|------|------|
| `primary` | 主要テキスト、Primary CTA ボタン、ヘッダーロゴ | 墨色。純黒ではなく温かみのある茶黒系。 |
| `onPrimary` | `primary` 上の文字色 | 和紙色に近いオフホワイト。 |
| `secondary` | 承認系の強調、朱印的アクセント | 朱印の赤。彩度を抑え、業務アプリで浮かないレベルに調整。 |
| `accent` | リンク・サブ見出し・装飾ライン | 古い和紙の縁取りを思わせる淡いブラウンゴールド。 |

### Surface tokens

| トークン | 用途 |
|---------|------|
| `background` | ページ全体の背景 (和紙色) |
| `surface` | カード・ダイアログ・入力欄の背景 |
| `surfaceMuted` | テーブルヘッダー・非活性領域 |

### Text tokens

| トークン | 用途 |
|---------|------|
| `textPrimary` | 見出し・本文の主要テキスト |
| `textSecondary` | 補助情報・メタ情報 (日時、生徒コード等) |
| `textMuted` | プレースホルダ・非活性テキスト |

### State tokens

| トークン | 用途 |
|---------|------|
| `success` | 承認済み・保存完了 (Badge / Toast) |
| `warning` | 定員超過・上限到達警告 |
| `error` | 却下・削除・バリデーションエラー |
| `info` | 予定・通常状態の Badge |

### 色の使い方ルール

- Primary CTA は 1画面あたり原則 1つまで。
- 朱系 (`secondary`) は「承認」「強調」「重要なお知らせ」にのみ使用。通常の情報配色には使わない。
- 背景の和紙色は**必ずベース**に敷く。カード背景は純白 (`surface`) で一段上に重ねることで「紙の上の紙」のメタファーを表現する。

---

## Typography

### フォントファミリー

- **Heading**: Poppins (欧文) / Noto Sans JP (和文) — 見出し、ページタイトル、数字の強調。
- **Body**: PT Sans (欧文) / Noto Sans JP (和文) — 本文、テーブル、フォーム。
- **Mono**: システムモノスペース — 生徒コード (例: `@std0001`) や連携トークン表示に限定使用。

### サイズスケール

| トークン | px | 主な用途 |
|---------|-----|---------|
| `xs` | 12 | キャプション、Badge、補助ラベル |
| `sm` | 14 | テーブル本文、セカンダリテキスト |
| `base` | 16 | 本文標準 |
| `lg` | 18 | カード見出し |
| `xl` | 20 | セクション見出し |
| `2xl` | 24 | ページ副題 |
| `3xl` | 30 | ページタイトル |
| `4xl` | 36 | ダッシュボードのウェルカム見出し |

### ウェイト・行間

- 本文は `regular` (400)。見出しは `semibold` (600) を基本とし、強調に限って `bold` (700)。
- 和文見出しの字間は `wide` (0.02em) を推奨。漢字が詰まりすぎて「書道」の静謐さが損なわれるのを防ぐ。
- 本文の行間は `relaxed` (1.65) を基本。テーブル内セルのみ `normal` (1.5) で情報密度を優先。

---

## Layout

### 全体構造

- **Sidebar + Content** の 2カラム構造 (shadcn `SidebarProvider` 準拠)。
- Sidebar 幅: デスクトップ 240〜260px、モバイルでは off-canvas。
- Content 最大幅: 1280px を上限とし、左右に `{spacing.lg}` 以上の余白を確保。

### グリッド & 余白

- 基本グリッドは 4px ベース (`spacing.xs`)。
- セクション間は `{spacing.xl}` (32px)、カード内の要素間は `{spacing.md}` (16px)。
- ダッシュボードのクイックリンクカードは 2列 (モバイル) / 4列 (デスクトップ) のレスポンシブグリッド。

### ページタイトル領域

- すべての主要ページの最上段に `PageHeader` (タイトル + 右側アクション) を配置。
- タイトルは `fontSize.3xl` / `fontWeight.semibold` / `fontFamily.heading` を標準とする。

---

## Elevation & Depth

書道教室らしい静けさを保つため、**影は最小限**・**輪郭線との併用**で奥行きを表現します。

| レベル | 用途 | 目安 |
|-------|------|------|
| `shadow-none` | 通常のテーブル行、Sidebar | 影なし、`border` のみ |
| `shadow-sm` | 常設カード、リストアイテム | 2px ぼかしの薄い影 |
| `shadow-md` | ホバー時のカード、Popover | 6〜8px ぼかし |
| `shadow-lg` | Dialog、Sheet、Toast | 16〜24px ぼかし、中央配置 |

奥行きの原則:
- 同一画面内で使う影レベルは**最大2種類**まで。
- Dialog / Sheet 表示時は背景に `rgba(31,27,22,0.4)` のオーバーレイを重ねる (墨が滲むイメージ)。
- カードをホバーで浮かせる場合、影だけでなく `border` の濃度も 1段上げる。

---

## Shapes

角丸は「墨のにじみ」「和紙の手触り」を象徴する要素として、**やや控えめ**に扱います。尖りすぎず、丸すぎず。

| トークン | px | 用途 |
|---------|-----|------|
| `none` | 0 | Divider、テーブルセル |
| `sm` | 4 | Badge、インラインタグ |
| `md` | 8 | Button、Input |
| `lg` | 12 | Card、Dialog |
| `xl` | 16 | 大きなヒーローカード (ダッシュボード) |
| `full` | 9999 | ステータス Badge、アバター |

原則:
- 同一コンポーネント群では同じ角丸を使う (例: フォーム内の Input と Button は `md` で揃える)。
- カードの角丸より大きい角丸を内部コンポーネントに使わない (入れ子の反転禁止)。

---

## Components

### Button

| バリアント | 用途 |
|----------|------|
| `primary` | 主要アクション (保存、登録、承認)。1画面1つ。墨色の背景。 |
| `secondary` | 代替アクション (キャンセル、閉じる)。白背景 + 墨色文字 + 薄い輪郭。 |
| `ghost` | 控えめなアクション (編集、メニュー項目)。背景なし。 |
| `destructive` | 削除・却下。`error` カラーを背景にする。 |

サイズは `sm` / `md` / `lg` の3段階。モバイルのタップ対象は最低 44px 高を保証。

### Card

- 背景は `surface` (白)、角丸 `lg`、パディング `spacing.lg`。
- 見出しを持つ場合、タイトルは `fontSize.lg` / `fontWeight.semibold`。
- ホバー可能なカード (クイックリンク等) は `shadow-sm` → `shadow-md` に遷移。

### Input / Form

- 背景は `surface`、輪郭は `inputBorder`、フォーカス時は `primary` 色の 2px リング。
- エラー時は輪郭を `error` 色に変更し、直下にエラーメッセージを `fontSize.sm` / `error` 色で表示。
- ラベルはフィールドの上に配置し、`fontSize.sm` / `fontWeight.medium` / `textSecondary`。

### Badge (授業ステータス)

| バリアント | 用途 |
|----------|------|
| `badgeScheduled` | `scheduled` 予定通り |
| `badgePending` | `swap_pending` 振替申請中 |
| `badgeApproved` | `approved` / `swapped` 承認済 |
| `badgeRejected` | `canceled` / `rejected` 却下・キャンセル |

形状は `rounded.full` で統一。アイコン併用は任意。

### Sidebar / Header

- Sidebar の背景は和紙色 (`background`)、選択中メニューのみ `primary` 背景に反転。
- Header の背景は `surface`、下端に `border` 1px。

### Dialog / Sheet

- 背景は `surface`、角丸 `lg`、`shadow-lg`。
- タイトルは `fontSize.xl` / `fontWeight.semibold`、ボディは `fontSize.base`。
- 閉じるアイコンは右上に配置、クリック領域 44px 以上。

### Table

- ヘッダ行は `surfaceMuted` 背景、本文行は `surface` 背景。
- 行間は `fontSize.sm` / `lineHeight.normal` で情報密度を確保。
- モバイル幅ではカードビューへフォールバック。

---

## Do's and Don'ts

### Do

- 背景には必ず和紙色 (`background`) を敷き、カードで「紙の上の紙」を表現する。
- Primary CTA は1画面1つに限定し、主要な業務フローの次ステップを明快にする。
- 朱色 (`secondary`) は「承認」「重要なお知らせ」に限定して使い、画面全体のトーンを保つ。
- ページタイトルには Poppins + Noto Sans JP を使い、字間 `wide` でゆとりを持たせる。
- 同一画面内の角丸・影のレベルは最大2種類に抑える。

### Don't

- 筆文字フォント、木目テクスチャ、掛け軸風の装飾背景を**使わない**。和風感は色と余白だけで表現する。
- 朱色を通常のリンクや情報配色に使わない (意味が薄れる)。
- Primary CTA を複数並べない。迷わせる UI は保護者ユーザーの離脱要因になる。
- 影レベル `lg` を常設要素 (カード、テーブル) に使わない。`lg` は Dialog / Toast 専用。
- 角丸 `xl` を小さなボタンや Badge に使わない (全体が甘くなり業務アプリとしての締まりが消える)。
- 状態 Badge を色のみで区別せず、必ずテキストラベル (「予定」「振替中」「承認済」等) を併記する (アクセシビリティ)。
