export type TrustDrawerTab = "provenance" | "eval" | "security";

const TAB_ORDER: TrustDrawerTab[] = ["provenance", "eval", "security"];

export function getNextTrustTab(
  current: TrustDrawerTab,
  direction: "next" | "prev",
): TrustDrawerTab {
  const index = TAB_ORDER.indexOf(current);
  if (index === -1) return "provenance";
  const delta = direction === "next" ? 1 : -1;
  const next = (index + delta + TAB_ORDER.length) % TAB_ORDER.length;
  return TAB_ORDER[next]!;
}

export function createDrawerState(initialOpen = false) {
  let open = initialOpen;
  return {
    get isOpen() {
      return open;
    },
    openDrawer() {
      open = true;
    },
    closeDrawer() {
      open = false;
    },
    toggleDrawer() {
      open = !open;
    },
  };
}
