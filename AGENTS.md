# Agent Execution Rules

Before changing admin pages, read and follow these rules:

- Keep table layouts dense and aligned to the provided reference screenshots. Do not add explanatory text that is absent from the reference.
- Every data table must have a selection checkbox column. The header checkbox selects or clears every row on the current page, and selected rows must remain visually checked.
- When rows are selected, show the bottom bulk-action toolbar with the same compact controls and spacing as the account-management page.
- Use the account-management pagination style everywhere: compact square previous/next buttons, numbered page buttons with the active page outlined blue, ellipsis where needed, and a `20 条/页` selector with a CSS-drawn arrow. Do not use text glyph arrows such as `⌄` or `›` inside the page-size selector.
- Pagination controls must be actual interactive controls, not decorative spans.
- Use CSS-drawn chevrons for dropdowns and compact mode controls; avoid Unicode arrow glyphs.
- Preserve one-line labels and prevent table actions from overflowing their column boundaries.
